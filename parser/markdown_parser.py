"""Parser markdown con sintassi custom per corsi interattivi"""
import re
import mistune
import yaml
from pathlib import Path
from parser.preprocessors import process_blanks, process_variables, process_blocks, process_math, process_images, process_checks, process_graphs, process_p5, process_expr, process_formula, process_theorem, process_tables


class CourseParser:
    """Parser per corsi con sintassi markdown custom"""

    def __init__(self, math_backticks=True):
        self.markdown = mistune.create_markdown(
            escape=False,
            plugins=['strikethrough', 'table', 'url']
        )
        # Auto-detect delle espressioni matematiche nei backtick (`x = 5` →
        # $x = 5$). Va spento per i corsi non matematici (flag `math` in
        # site.yaml / metadata.yaml): build_courses.py lo risetta per corso.
        self.math_backticks = math_backticks
        # Teoria del CORSO (id → {nome, enunciato, tipo}): letta da
        # content/<corso>/teoria.yaml e arricchita in corso d'opera dai teoremi
        # dimostrati. Il parser è riusato tra corsi: build_courses.py la risetta
        # per ogni corso con set_course_theory().
        self.teoria = None
        self.course_theorems = set()
        self.blank_counter = 0
        self.variable_counter = 0
        self.check_counter = 0
        self.graph_counter = 0
        self.p5_counter = 0
        self.expr_counter = 0
        self.math_counter = 0
        self.formula_counter = 0
        self.theorem_counter = 0
        self.table_counter = 0

    def set_course_theory(self, teoria, course_theorems=None):
        """
        Imposta la teoria del corso corrente per i blocchi :::theorem.

        Args:
            teoria: Dict id → {nome, enunciato, tipo} da teoria.yaml. Viene
                arricchito durante la build con i teoremi dimostrati, quindi
                va passata una copia per corso.
            course_theorems: Id di TUTTI i teoremi del corso, per distinguere
                una garanzia inesistente da una dimostrata più avanti.
        """
        self.teoria = teoria
        self.course_theorems = set(course_theorems or ())

    def parse_file(self, filepath):
        """
        Parsa un file markdown e restituisce JSON strutturato

        Args:
            filepath: Path al file content.md

        Returns:
            Dict con struttura:
            {
                'steps': [
                    {
                        'id': 'step-id',
                        'html': '<html content>',
                        'goals': ['blank-0', 'var-1'],
                        'metadata': {'title': '...', ...}
                    }
                ],
                'total_steps': 3,
                'lesson_metadata': {'title': '...', ...}  # front-matter lezione (può essere vuoto)
            }
        """
        content = Path(filepath).read_text(encoding='utf-8')

        # Reset counters
        self.blank_counter = 0
        self.variable_counter = 0
        self.check_counter = 0
        self.graph_counter = 0
        self.p5_counter = 0
        self.expr_counter = 0
        self.math_counter = 0
        self.formula_counter = 0
        self.theorem_counter = 0
        self.table_counter = 0

        # Estrai i code fence ``` a livello di FILE, prima dello split degli
        # step: un fence che mostra un esempio contenente '---' non deve generare
        # step spuri (lo split vedrebbe il '---' letterale dentro il fence). I
        # marker sono univoci e sopravvivono allo split; vengono ripristinati
        # per-step dopo il preprocessing.
        content, code_fences = self._extract_code_fences(content)

        # Split in steps (separati da ---)
        steps_raw = re.split(r'\n---\n', content)
        steps = []
        lesson_metadata = {}

        for idx, step_content in enumerate(steps_raw):
            if not step_content.strip():
                continue

            # Parsing metadata YAML (righe che iniziano con >)
            metadata, md_content = self._extract_metadata(step_content)

            # Front-matter di lezione: il PRIMO blocco metadata-only (metadata
            # presente ma senza corpo markdown) descrive la lezione, non uno step.
            if not steps and not lesson_metadata and metadata and not md_content.strip():
                lesson_metadata = metadata
                continue

            # Pre-processing: converti sintassi custom
            md_content, block_replacements, math_spans = self._preprocess(md_content)

            # Ripristina i code fence: mistune li renderizza come blocchi
            # di codice facendo l'escape dell'HTML al loro interno
            for marker, fence in code_fences.items():
                md_content = md_content.replace(marker, fence)

            # Rendering markdown → HTML
            html = self.markdown(md_content)

            # Post-processing: de-escape span con data-var dentro tag <code>
            html = self._unescape_variable_spans(html)

            # Sostituisce marker placeholder con tag div reali
            html = self._apply_block_replacements(html, block_replacements)

            # Le formule tornano al loro posto letterali: `str.replace` e non
            # `re.sub`, perche' il LaTeX e' pieno di backslash che diventerebbero
            # backreference.
            for marker, tex in math_spans.items():
                html = html.replace(marker, tex)

            # Estrai goals (elementi interattivi)
            goals = self._extract_goals(html)

            steps.append({
                'id': metadata.get('id', f'step-{idx}'),
                'title': metadata.get('title', ''),
                'html': html,
                'goals': goals,
                'metadata': metadata
            })

        return {
            'steps': steps,
            'total_steps': len(steps),
            'lesson_metadata': lesson_metadata
        }

    def parse_theorems(self, content, titoli=None):
        """
        Estrae i blocchi :::theorem da un file di CORPUS (vedi TEORIA.md).

        Un corpus non ha lezioni né step: è una sequenza di teoremi. Serve
        quindi la struttura di ognuno (passi, garanzie, distrattori) oltre
        all'HTML, perché è dai `per:` dei passi che si ricava il grafo.

        La teoria va impostata prima con set_course_theory(): per un corpus è
        il registro completo (teoria.yaml), così l'ordine dei file non conta.

        Args:
            content: Testo del file markdown del corpus
            titoli: Dict id → enunciato, usato quando il blocco non ha
                `titolo=`: in un corpus l'enunciato lo possiede il registro,
                e riscriverlo nel .md sarebbe una seconda fonte

        Returns:
            Tuple (teoremi, residuo): `teoremi` è la lista di dict raccolti da
            process_theorem, `residuo` è il testo rimasto fuori dai blocchi —
            che in un corpus è quasi sempre un errore d'autore, e chi chiama
            lo segnala.
        """
        self.blank_counter = 0
        self.variable_counter = 0
        self.check_counter = 0
        self.theorem_counter = 0

        theorems = []
        processed, _replacements, self.theorem_counter = process_theorem(
            content, self.theorem_counter,
            render_text=self._render_inline,
            teoria=self.teoria,
            course_theorems=self.course_theorems,
            collect=theorems,
            titoli=titoli,
        )

        # Il residuo: via i marker dei blocchi e i commenti HTML (l'unico modo
        # sensato di annotare un file che non viene renderizzato).
        residuo = re.sub(r'XTHEOREMBLOCK\d+X', '', processed)
        residuo = re.sub(r'<!--.*?-->', '', residuo, flags=re.DOTALL)
        return theorems, residuo.strip()

    def _extract_metadata(self, content):
        """
        Estrae metadata YAML (righe con >) e restituisce (metadata, contenuto)

        Formato:
            > id: intro
            > title: Introduzione

            Resto del contenuto...

        Args:
            content: Contenuto dello step

        Returns:
            Tuple (metadata dict, contenuto markdown)
        """
        lines = content.split('\n')
        metadata_lines = []
        content_lines = []
        in_metadata = True

        for line in lines:
            if in_metadata:
                if line.strip().startswith('>'):
                    # Rimuovi '>' e aggiungi a metadata
                    metadata_lines.append(line.strip()[1:].strip())
                elif line.strip() == '':
                    # Ignora righe vuote all'inizio (prima del metadata o tra le righe di metadata)
                    # Non aggiungerle ancora al contenuto
                    if metadata_lines:
                        # Se abbiamo già metadata, questa riga vuota potrebbe essere la separazione
                        # tra metadata e contenuto, quindi terminiamo il metadata
                        in_metadata = False
                    # Altrimenti ignora le righe vuote iniziali
                else:
                    # Riga non vuota che non inizia con '>' - fine del metadata
                    in_metadata = False
                    content_lines.append(line)
            else:
                content_lines.append(line)

        metadata = {}
        if metadata_lines:
            try:
                parsed = yaml.safe_load('\n'.join(metadata_lines))
            except yaml.YAMLError as e:
                print(f'Warning: Errore parsing metadata YAML: {e}')
                parsed = None

            if isinstance(parsed, dict):
                metadata = parsed
            else:
                # Le righe '>' non sono metadata YAML validi (es. una citazione
                # markdown "> testo" → safe_load restituisce una stringa/lista):
                # trattale come contenuto blockquote normale invece che come
                # front-matter, altrimenti metadata.get(...) a valle solleverebbe
                # AttributeError e scarterebbe l'intero corso dalla build.
                quote_block = ['> ' + line for line in metadata_lines]
                content_lines = quote_block + [''] + content_lines

        return metadata, '\n'.join(content_lines)

    def _extract_code_fences(self, content):
        """
        Sostituisce i fenced code block (```...```) con marker univoci.

        Permette di mostrare la sintassi custom ([[...]], ${...}, :::graph)
        come testo letterale dentro i blocchi di codice: i preprocessori non
        vedono il contenuto dei fence, che viene ripristinato prima del
        rendering markdown.

        Il delimitatore è di TRE O PIÙ backtick, e la chiusura deve essere
        lunga quanto l'apertura: un esempio che contiene a sua volta un fence
        (documentare la sintassi di :::details.syntax-doc, che di fence ne ha
        uno dentro) si scrive con quattro o cinque backtick, e deve restare
        letterale come tutti gli altri. Con un pattern a tre backtick fissi,
        l'apertura ```` non veniva riconosciuta e i preprocessori vedevano il
        :::theorem dell'esempio come un blocco vero.

        Args:
            content: Contenuto markdown

        Returns:
            Tuple (contenuto con marker, dict marker → fence originale)
        """
        fences = {}
        counter = 0

        def replace_fence(match):
            nonlocal counter
            marker = f'XCODEFENCE{counter}X'
            fences[marker] = match.group(0)
            counter += 1
            return marker

        pattern = re.compile(r'^(`{3,})[^\n]*\n.*?^\1[ \t]*$', re.MULTILINE | re.DOTALL)
        return pattern.sub(replace_fence, content), fences

    def _extract_inline_code(self, content):
        """
        Sostituisce gli span di codice inline (`...`) con marker univoci.

        Da chiamare dopo process_math: i backtick matematici sono già stati
        convertiti in $...$, quelli rimasti sono codice letterale da
        proteggere dai preprocessori successivi.

        Args:
            content: Contenuto markdown

        Returns:
            Tuple (contenuto con marker, dict marker → codice originale)
        """
        codes = {}
        counter = 0

        def replace_code(match):
            nonlocal counter
            marker = f'XINLINECODE{counter}X'
            codes[marker] = match.group(0)
            counter += 1
            return marker

        pattern = re.compile(r'(?<!`)`([^`\n]+)`(?!`)')
        return pattern.sub(replace_code, content), codes

    # Le quattro delimitazioni della matematica, nell'ordine in cui vanno
    # cercate: prima le display, o `$$` verrebbe letto come due `$` vuoti.
    MATH_SPANS = (
        re.compile(r'\$\$.+?\$\$', re.DOTALL),
        re.compile(r'\\\[.+?\\\]', re.DOTALL),
        re.compile(r'\\\(.+?\\\)', re.DOTALL),
        re.compile(r'\$[^$\n]+?\$'),
    )

    def _extract_math(self, content):
        """
        $…$, $$…$$, \\(…\\), \\[…\\] → marker, ripristinati dopo il rendering.

        Il LaTeX e il markdown si contendono gli stessi caratteri, e senza
        questa protezione vince il markdown: in `\\underbrace{-3}_{\\text{…}}`
        i due underscore diventano un `<em>`, e a MathJax arriva una formula
        già rotta — a video resta il sorgente. Stessa fine per `\\;` (letto
        come escape di `;`), per `a*b` (corsivo) e per `\\(` (escape di una
        parentesi). La formula deve arrivare a MathJax **esattamente** come
        l'ha scritta l'autore.

        Va chiamata per ultima, quando blank e variabili sono già diventati
        HTML: gli `${x}` dentro una formula restano quindi vivi. E mentre il
        codice inline è ancora un marker, così un `$…$` citato fra backtick
        resta testo e non diventa una formula.

        Returns:
            Tuple (contenuto con marker, dict marker→sorgente)
        """
        replacements = {}

        def replace(match):
            marker = f'XMATHSPAN{self.math_counter}X'
            replacements[marker] = match.group(0)
            self.math_counter += 1
            return marker

        for pattern in self.MATH_SPANS:
            content = pattern.sub(replace, content)
        return content, replacements

    def _preprocess(self, content):
        """
        Pre-processa sintassi custom prima del markdown rendering

        Args:
            content: Contenuto markdown

        Returns:
            Contenuto processato
        """
        # :::p5 ... ::: → marker (ripristinato a fine render). Va per PRIMO:
        # il corpo è codice JS e non deve essere toccato dagli altri
        # preprocessori né da mistune.
        content, p5_replacements, self.p5_counter = process_p5(content, self.p5_counter)

        # :::expr ... ::: → marker (ripristinato a fine render). Come :::p5, il
        # corpo (un'espressione con `*`, `[`, `]`, `{`, `}`) non deve essere
        # toccato dagli altri preprocessori né da mistune.
        content, expr_replacements, self.expr_counter = process_expr(content, self.expr_counter)

        # :::formula ... ::: → marker (ripristinato a fine render). Il corpo è
        # LaTeX: `\`, `{`, `_`, `*` non devono passare né da process_math né da
        # mistune, che li leggerebbe come enfasi o graffe di variabile.
        content, formula_replacements, self.formula_counter = process_formula(
            content, self.formula_counter
        )

        # :::theorem ... ::: → marker (ripristinato a fine render). Il corpo ha
        # heading, liste e annotazioni tra graffe: va estratto prima che mistune
        # o gli altri preprocessori lo interpretino. Il testo dei singoli passi
        # è markdown inline e viene renderizzato da _render_inline.
        content, theorem_replacements, self.theorem_counter = process_theorem(
            content, self.theorem_counter,
            render_text=self._render_inline,
            teoria=self.teoria,
            course_theorems=self.course_theorems,
        )

        # :::table ... ::: → marker (ripristinato a fine render). Il corpo è una
        # tabella a pipe: non deve arrivare a mistune, che spezzerebbe le scelte
        # multiple `[[a|*b|c]]` sulle pipe e non capirebbe le corsie di frecce.
        # Il contenuto delle celle è markdown e viene reso qui via callback.
        content, table_replacements, self.table_counter = process_tables(
            content, self.table_counter, render_text=self._render_inline
        )

        # ![alt|400](src) → <img style="width:400px">
        content = process_images(content)

        # `x = 5` → $x = 5$ (converte formule matematiche in backtick).
        # Solo per corsi matematici: altrove i backtick sono sempre codice.
        if self.math_backticks:
            content = process_math(content)

        # I backtick rimasti dopo process_math sono codice inline letterale:
        # proteggili così la sintassi custom al loro interno (es. `[[5]]`)
        # non viene convertita in componenti
        content, inline_codes = self._extract_inline_code(content)

        # [Testo]{check: condizione} → <x-check>
        content, self.check_counter = process_checks(content, self.check_counter)

        # [[answer]] → <x-blank>
        content, self.blank_counter = process_blanks(content, self.blank_counter)

        # ${var}{config} → <x-variable>
        content, self.variable_counter = process_variables(content, self.variable_counter)

        # :::graph YAML ::: → <x-graph> (deve precedere process_blocks)
        content, self.graph_counter = process_graphs(content, self.graph_counter)

        # :::div.class → placeholder marker (sostituiti dopo il markdown rendering)
        content, block_replacements = process_blocks(content)

        # $…$ e $$…$$ → marker. Per ULTIMO fra i preprocessori: quello che
        # sta dentro una formula (uno `${x}`, un blank) è già diventato HTML,
        # e da qui in poi il LaTeX non lo tocca più nessuno.
        content, math_replacements = self._extract_math(content)

        # Ripristina il codice inline: mistune lo renderizza come <code>
        # facendo l'escape dell'HTML al suo interno
        for marker, code in inline_codes.items():
            content = content.replace(marker, code)

        # I blocchi p5 ed expr sono ripristinati dopo il rendering markdown, come
        # i blocchi div: i marker (alfanumerici) sopravvivono a mistune intatti.
        block_replacements.update(p5_replacements)
        block_replacements.update(expr_replacements)
        block_replacements.update(formula_replacements)
        block_replacements.update(theorem_replacements)
        block_replacements.update(table_replacements)

        # La matematica torna a parte: `_apply_block_replacements` toglie il
        # <p> attorno a un marker che sta da solo in un paragrafo — giusto per
        # un blocco, sbagliato per una formula, che il <p> se lo tiene.
        return content, block_replacements, math_replacements

    def _render_inline(self, text):
        """
        Renderizza un frammento di markdown inline ($…$, grassetto, [[blank]]).

        Serve ai blocchi che si prendono il proprio corpo prima di mistune e
        devono comunque renderlo: il testo di un passo di :::theorem (che
        finisce in un attributo JSON) e il contenuto di una cella di :::table.
        I contatori sono quelli dell'istanza, quindi gli id restano unici; il
        <p> con cui mistune avvolge il paragrafo va tolto.
        """
        if not text:
            return text

        # Un frammento non è un blocco: un'etichetta come `+ 1` o `- 3` deve
        # restare quello che è, non diventare un elenco puntato (e `# 2` non
        # deve diventare un titolo). Si protegge solo il primo carattere.
        text = re.sub(r'^([-+*>#])(\s)', r'\\\1\2', text, count=1)
        text = re.sub(r'^(\d+)([.)])(\s)', r'\1\\\2\3', text, count=1)

        if self.math_backticks:
            text = process_math(text)
        text, self.check_counter = process_checks(text, self.check_counter)
        text, self.blank_counter = process_blanks(text, self.blank_counter)
        text, self.variable_counter = process_variables(text, self.variable_counter)

        # Anche qui la matematica va sottratta a mistune: una cella di tabella
        # con `x_1` o un passo di dimostrazione con `\overline{AB}_{\text{…}}`
        # si romperebbero esattamente come nel corpo di uno step.
        text, math_spans = self._extract_math(text)

        html = self.markdown(text).strip()
        unwrapped = re.fullmatch(r'<p>(.*)</p>', html, re.DOTALL)
        html = unwrapped.group(1).strip() if unwrapped else html

        for marker, tex in math_spans.items():
            html = html.replace(marker, tex)
        return html

    def _unescape_variable_spans(self, html):
        """
        De-escape span con data-var che sono stati escaped dentro tag <code>

        Args:
            html: HTML renderizzato

        Returns:
            HTML con span de-escaped
        """
        # Pattern per trovare span escaped: &lt;span data-var="..."&gt;...&lt;/span&gt;
        pattern = r'&lt;span data-var=&quot;([^&]+)&quot;&gt;([^&]+)&lt;/span&gt;'
        replacement = r'<span data-var="\1">\2</span>'
        return re.sub(pattern, replacement, html)

    def _apply_block_replacements(self, html, replacements):
        """
        Sostituisce i marker placeholder con i tag HTML dei blocchi div.

        Gestisce sia i marker nudi sia quelli avvolti in <p>...</p> da mistune.
        """
        for marker, tag in replacements.items():
            # Replacement passato via lambda: il tag può contenere backslash
            # (es. il codice JS di uno sketch :::p5 con `\n`, `\d`) che re.sub
            # interpreterebbe come backreference se passato come stringa.
            html = re.sub(r'<p>\s*' + re.escape(marker) + r'\s*</p>', lambda _m: tag, html)
            html = html.replace(marker, tag)
        return html

    def _extract_goals(self, html):
        """
        Estrae ID di elementi interattivi (goals) dall'HTML

        Args:
            html: HTML renderizzato

        Returns:
            Lista di goal IDs
        """
        goals = []

        # Trova tutti <x-blank id="...">
        goals.extend(re.findall(r'<x-blank id="([^"]+)"', html))

        # Trova tutti <x-variable id="...">
        goals.extend(re.findall(r'<x-variable id="([^"]+)"', html))

        # Trova tutti <x-check id="...">
        goals.extend(re.findall(r'<x-check id="([^"]+)"', html))

        # Trova tutti <x-graph id="..."> (solo con almeno un target ha id)
        goals.extend(re.findall(r'<x-graph id="([^"]+)"', html))

        # Trova tutti <x-p5 id="..."> (solo con flag `goal` ha id)
        goals.extend(re.findall(r'<x-p5 id="([^"]+)"', html))

        # Trova tutti <x-expr id="..."> (sempre un goal)
        goals.extend(re.findall(r'<x-expr id="([^"]+)"', html))

        # Trova tutti <x-theorem id="..."> (sempre un goal: in modalità `leggi`
        # il componente si completa alla lettura, altrove alla verifica)
        goals.extend(re.findall(r'<x-theorem id="([^"]+)"', html))

        return goals


if __name__ == '__main__':
    """Script CLI per testing del parser"""
    import sys

    if len(sys.argv) > 1:
        # Test su file specifico
        parser = CourseParser()
        result = parser.parse_file(sys.argv[1])

        import json
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        # Test con esempio
        sample_markdown = """
> id: intro
> title: Introduzione all'Algebra

# Benvenuto all'Algebra!

Risolvi questa semplice equazione: Se `2x = 10`, allora `x =` [[5]].

Ottimo! Ora prova con una scelta multipla: `2 + 2 =` [[3|4|5]]

---

> id: variabili
> title: Variabili Interattive

Muovi lo slider per cambiare il valore di `a`: ${a}{a|2|-5,5,1}

L'equazione diventa: `x^2 + ${a}x + 1 = 0`

:::div.highlight
Questo è un box evidenziato!
:::
"""
        parser = CourseParser()
        result = parser.parse_file.__func__(parser, sample_markdown)

        import json
        print(json.dumps(result, indent=2, ensure_ascii=False))

"""Parser markdown con sintassi custom per corsi interattivi"""
import re
import mistune
import yaml
from pathlib import Path
from parser.preprocessors import process_blanks, process_variables, process_blocks, process_math, process_graphs


class CourseParser:
    """Parser per corsi con sintassi markdown custom"""

    def __init__(self):
        self.markdown = mistune.create_markdown(
            escape=False,
            plugins=['strikethrough', 'table', 'url']
        )
        self.blank_counter = 0
        self.variable_counter = 0

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
                'total_steps': 3
            }
        """
        content = Path(filepath).read_text(encoding='utf-8')

        # Reset counters
        self.blank_counter = 0
        self.variable_counter = 0
        self.graph_counter = 0

        # Split in steps (separati da ---)
        steps_raw = re.split(r'\n---\n', content)
        steps = []

        for idx, step_content in enumerate(steps_raw):
            if not step_content.strip():
                continue

            # Parsing metadata YAML (righe che iniziano con >)
            metadata, md_content = self._extract_metadata(step_content)

            # Pre-processing: converti sintassi custom
            md_content = self._preprocess(md_content)

            # Rendering markdown → HTML
            html = self.markdown(md_content)

            # Post-processing: de-escape span con data-var dentro tag <code>
            html = self._unescape_variable_spans(html)

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
            'total_steps': len(steps)
        }

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
                metadata = yaml.safe_load('\n'.join(metadata_lines)) or {}
            except yaml.YAMLError as e:
                print(f'Warning: Errore parsing metadata YAML: {e}')
                metadata = {}

        return metadata, '\n'.join(content_lines)

    def _preprocess(self, content):
        """
        Pre-processa sintassi custom prima del markdown rendering

        Args:
            content: Contenuto markdown

        Returns:
            Contenuto processato
        """
        # `x = 5` → $x = 5$ (converte formule matematiche in backtick)
        content = process_math(content)

        # [[answer]] → <x-blank>
        content, self.blank_counter = process_blanks(content, self.blank_counter)

        # ${var}{config} → <x-variable>
        content, self.variable_counter = process_variables(content, self.variable_counter)

        # :::graph YAML ::: → <x-graph> (deve precedere process_blocks)
        content, self.graph_counter = process_graphs(content, self.graph_counter)

        # :::div.class → <div class="class">
        content = process_blocks(content)

        return content

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

        # Trova tutti <x-graph id="..."> (solo type=point ha id)
        goals.extend(re.findall(r'<x-graph id="([^"]+)"', html))

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

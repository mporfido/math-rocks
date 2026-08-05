"""Il riepilogo della build, e l'esito che ne consegue.

Un corso che non compila non riscrive il suo JSON: il sito continua a servire
la versione precedente, quindi da fuori sembra semplicemente che la modifica
non sia arrivata. È il modo più facile di perdere mezz'ora, ed è già successo.
Questi test guardano che la build lo dica e che l'esito sia negativo.
"""
import json

from build_courses import build_all_courses, build_single_course

LEZIONE_OK = '> id: uno\n> title: Uno\n\nCiao: [[7]]\n'

# Una freccia che cita un ancoraggio inesistente: errore di validazione del
# blocco :::formula, sollevato in build.
LEZIONE_ROTTA = (
    '> id: uno\n> title: Uno\n\n'
    ':::formula\n'
    '@b1{a}^{@e1{n}}\n'
    '\n'
    'b1 -> zz : boh\n'
    ':::\n'
)


def _corso(content_dir, nome, testo):
    corso = content_dir / nome
    corso.mkdir(parents=True)
    (corso / 'content-1.md').write_text(testo, encoding='utf-8')
    return corso


def test_build_sana_riesce(tmp_path, capsys):
    content = tmp_path / 'content'
    out = tmp_path / 'courses_data'
    _corso(content, 'buono', LEZIONE_OK)

    assert build_all_courses(str(content), str(out)) is True
    assert (out / 'buono.json').exists()
    assert 'Build completata.' in capsys.readouterr().out


def test_un_corso_rotto_fa_fallire_tutta_la_build(tmp_path, capsys):
    content = tmp_path / 'content'
    out = tmp_path / 'courses_data'
    _corso(content, 'buono', LEZIONE_OK)
    _corso(content, 'rotto', LEZIONE_ROTTA)

    # Gli altri corsi si compilano lo stesso (li si vuole vedere tutti in un
    # giro solo), ma l'esito complessivo è negativo.
    assert build_all_courses(str(content), str(out)) is False
    assert (out / 'buono.json').exists()

    stampato = capsys.readouterr().out
    assert 'Build FALLITA.' in stampato
    assert '1 FALLITO' in stampato
    # L'errore è ripetuto nel riepilogo, non solo nella riga che scorre via.
    assert stampato.count('zz') >= 2


def test_il_riepilogo_avvisa_che_il_json_vecchio_e_rimasto(tmp_path, capsys):
    content = tmp_path / 'content'
    out = tmp_path / 'courses_data'
    corso = _corso(content, 'rotto', LEZIONE_OK)

    # Prima build sana: il JSON esiste.
    assert build_all_courses(str(content), str(out)) is True
    prima = json.loads((out / 'rotto.json').read_text(encoding='utf-8'))
    capsys.readouterr()

    # Poi la lezione si rompe: il JSON resta quello di prima, ed è il punto.
    (corso / 'content-1.md').write_text(LEZIONE_ROTTA, encoding='utf-8')
    assert build_all_courses(str(content), str(out)) is False

    assert json.loads((out / 'rotto.json').read_text(encoding='utf-8')) == prima
    assert 'versione PRECEDENTE' in capsys.readouterr().out


def test_corso_mai_compilato_e_segnalato_come_assente(tmp_path, capsys):
    content = tmp_path / 'content'
    out = tmp_path / 'courses_data'
    _corso(content, 'rotto', LEZIONE_ROTTA)

    assert build_all_courses(str(content), str(out)) is False
    assert not (out / 'rotto.json').exists()
    assert 'non comparirà nel sito' in capsys.readouterr().out


def test_cartella_senza_lezioni_e_saltata_non_fallita(tmp_path, capsys):
    content = tmp_path / 'content'
    (content / 'vuota').mkdir(parents=True)
    _corso(content, 'buono', LEZIONE_OK)

    assert build_all_courses(str(content), str(tmp_path / 'courses_data')) is True
    assert 'Saltato vuota' in capsys.readouterr().out


def test_build_di_un_solo_corso_restituisce_l_esito(tmp_path):
    content = tmp_path / 'content'
    out = tmp_path / 'courses_data'
    _corso(content, 'buono', LEZIONE_OK)
    _corso(content, 'rotto', LEZIONE_ROTTA)

    assert build_single_course('buono', str(content), str(out)) is True
    assert build_single_course('rotto', str(content), str(out)) is False
    assert build_single_course('inesistente', str(content), str(out)) is False

"""Lettura del config di istanza `site.yaml` (root del repo).

Modulo volutamente senza dipendenze da Flask: viene usato sia da config.py
(app web / freeze) sia da build_courses.py (build-time), che non deve
importare Flask. Se il file manca il risultato è un dict vuoto: ogni
consumatore applica i propri default neutri.
"""
from pathlib import Path
import yaml


def load_site_config(path='site.yaml'):
    p = Path(path)
    if not p.exists():
        return {}
    with open(p, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f) or {}
    return data if isinstance(data, dict) else {}

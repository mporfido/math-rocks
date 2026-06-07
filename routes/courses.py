"""Blueprint per le routes dei corsi"""
from flask import Blueprint, render_template, redirect, url_for, abort
import json
from pathlib import Path

courses_bp = Blueprint('courses', __name__)

def load_course(course_id):
    """Carica un corso dal file JSON generato"""
    course_file = Path('courses_data') / f'{course_id}.json'

    if not course_file.exists():
        return None

    with open(course_file, 'r', encoding='utf-8') as f:
        return json.load(f)

@courses_bp.route('/course/<course_id>')
def course_index(course_id):
    """Redirect al primo step del corso"""
    course = load_course(course_id)

    if not course or not course.get('steps'):
        abort(404)

    first_step_id = course['steps'][0]['id']
    return redirect(url_for('courses.course_step', course_id=course_id, step_id=first_step_id))

@courses_bp.route('/course/<course_id>/<step_id>')
def course_step(course_id, step_id):
    """Renderizza uno step specifico del corso"""
    course = load_course(course_id)

    if not course:
        abort(404)

    # Trova lo step richiesto
    step = next((s for s in course['steps'] if s['id'] == step_id), None)
    if not step:
        abort(404)

    # Trova l'indice dello step per la navigazione
    step_index = next(i for i, s in enumerate(course['steps']) if s['id'] == step_id)

    return render_template('course.html',
                         course_id=course_id,
                         course=course,
                         step=step,
                         step_index=step_index,
                         total_steps=course['total_steps'])

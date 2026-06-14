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

def find_lesson(course, lesson_id):
    """Trova una lezione del corso per id (None se assente)"""
    return next((l for l in course.get('lessons', []) if l['id'] == lesson_id), None)

def find_step(lesson, step_id):
    """Trova uno step della lezione per id (None se assente)"""
    return next((s for s in lesson.get('steps', []) if s['id'] == step_id), None)

@courses_bp.route('/course/<course_id>')
def course_index(course_id):
    """Panoramica del corso con l'elenco delle lezioni"""
    course = load_course(course_id)

    if not course or not course.get('lessons'):
        abort(404)

    return render_template('course.html',
                         course_id=course_id,
                         course=course)

@courses_bp.route('/course/<course_id>/<lesson_id>')
def lesson_index(course_id, lesson_id):
    """Redirect al primo step della lezione"""
    course = load_course(course_id)
    if not course:
        abort(404)

    lesson = find_lesson(course, lesson_id)
    if not lesson or not lesson.get('steps'):
        abort(404)

    first_step_id = lesson['steps'][0]['id']
    return redirect(url_for('courses.course_step',
                            course_id=course_id,
                            lesson_id=lesson_id,
                            step_id=first_step_id))

@courses_bp.route('/course/<course_id>/<lesson_id>/<step_id>')
def course_step(course_id, lesson_id, step_id):
    """Renderizza uno step specifico di una lezione"""
    course = load_course(course_id)
    if not course:
        abort(404)

    lesson = find_lesson(course, lesson_id)
    if not lesson:
        abort(404)

    step = find_step(lesson, step_id)
    if not step:
        abort(404)

    step_index = next(i for i, s in enumerate(lesson['steps']) if s['id'] == step_id)

    return render_template('lesson.html',
                         course_id=course_id,
                         course=course,
                         lesson=lesson,
                         step=step,
                         step_index=step_index,
                         total_steps=lesson['total_steps'])

/**
 * Persistenza dei progressi del corso in localStorage.
 *
 * Schema (una chiave per corso: "mathrocks:progress:{courseId}"):
 *   {
 *     "v": 1,
 *     "steps": {
 *       "<stepId>": {
 *         "completed": true,
 *         "goals": ["blank-0", "var-1"],
 *         "answers": { "blank-0": "5" },
 *         "model": { "a": 2.5 }
 *       }
 *     }
 *   }
 *
 * Tutte le API degradano a no-op se localStorage non è disponibile o i dati
 * sono corrotti → comportamento identico all'assenza di persistenza.
 */
class CourseProgress {
  constructor() {
    this.VERSION = 1;
    this.PREFIX = 'mathrocks:progress:';
  }

  _key(courseId) {
    return this.PREFIX + courseId;
  }

  // Legge l'intero oggetto corso da storage; null se assente/corrotto.
  _read(courseId) {
    try {
      const raw = localStorage.getItem(this._key(courseId));
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || !data.steps) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  _write(courseId, data) {
    try {
      localStorage.setItem(this._key(courseId), JSON.stringify(data));
    } catch (e) {
      // Storage pieno o non disponibile: no-op.
    }
  }

  // Restituisce (creando se serve) l'oggetto step mutabile dentro `data`.
  _ensureStep(data, stepId) {
    if (!data.steps[stepId]) {
      data.steps[stepId] = { completed: false, goals: [], answers: {}, model: {} };
    }
    const step = data.steps[stepId];
    if (!Array.isArray(step.goals)) step.goals = [];
    if (!step.answers || typeof step.answers !== 'object') step.answers = {};
    if (!step.model || typeof step.model !== 'object') step.model = {};
    return step;
  }

  // Stato salvato di uno step, o null.
  getStep(courseId, stepId) {
    const data = this._read(courseId);
    if (!data) return null;
    return data.steps[stepId] || null;
  }

  // Comodità per i componenti figli: risale a <x-step> e legge lo stato salvato.
  // Funziona anche prima dell'upgrade di x-step (legge gli attributi dal DOM).
  getStepForElement(el) {
    const step = el.closest('x-step');
    if (!step) return null;
    return this.getStep(step.dataset.courseId, step.dataset.stepId);
  }

  // Aggiunge un goal completato e, se presente, salva la risposta associata.
  saveGoal(courseId, stepId, goalId, answer) {
    if (!courseId || !stepId || !goalId) return;
    const data = this._read(courseId) || { v: this.VERSION, steps: {} };
    const step = this._ensureStep(data, stepId);
    if (!step.goals.includes(goalId)) {
      step.goals.push(goalId);
    }
    if (answer !== undefined && answer !== null) {
      step.answers[goalId] = answer;
    }
    this._write(courseId, data);
  }

  // Salva i valori correnti del modello (slider) per lo step.
  saveModel(courseId, stepId, model) {
    if (!courseId || !stepId || !model) return;
    const data = this._read(courseId) || { v: this.VERSION, steps: {} };
    const step = this._ensureStep(data, stepId);
    step.model = { ...step.model, ...model };
    this._write(courseId, data);
  }

  markStepCompleted(courseId, stepId) {
    if (!courseId || !stepId) return;
    const data = this._read(courseId) || { v: this.VERSION, steps: {} };
    const step = this._ensureStep(data, stepId);
    step.completed = true;
    this._write(courseId, data);
  }

  // Array di stepId completati (per i checkmark in sidebar).
  getCompletedSteps(courseId) {
    const data = this._read(courseId);
    if (!data) return [];
    return Object.keys(data.steps).filter(id => data.steps[id] && data.steps[id].completed);
  }

  // Rimuove tutti i progressi del corso (bottone reset).
  clearCourse(courseId) {
    try {
      localStorage.removeItem(this._key(courseId));
    } catch (e) {
      // no-op
    }
  }
}

// Singleton globale (stesso pattern di window.formulaSimplifier).
window.courseProgress = new CourseProgress();

const TOUCHES_BLOQUEES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
  'Escape',
  'KeyA',
  'KeyD',
  'KeyP',
  'KeyR',
]);

export class GestionnaireEntrees {
  constructor() {
    this.touchesAppuyees = new Set();
    this.gestionnairesAppui = new Map();
    this.gererToucheEnfoncee = this.gererToucheEnfoncee.bind(this);
    this.gererToucheRelachee = this.gererToucheRelachee.bind(this);
  }

  attacher() {
    window.addEventListener('keydown', this.gererToucheEnfoncee);
    window.addEventListener('keyup', this.gererToucheRelachee);
  }

  detacher() {
    window.removeEventListener('keydown', this.gererToucheEnfoncee);
    window.removeEventListener('keyup', this.gererToucheRelachee);
  }

  surAppui(code, gestionnaire) {
    const gestionnaires = this.gestionnairesAppui.get(code) || [];
    gestionnaires.push(gestionnaire);
    this.gestionnairesAppui.set(code, gestionnaires);
  }

  estEnfoncee(code) {
    return this.touchesAppuyees.has(code);
  }

  gererToucheEnfoncee(evenement) {
    this.bloquerToucheNavigateur(evenement);

    const etaitDejaEnfoncee = this.touchesAppuyees.has(evenement.code);
    this.touchesAppuyees.add(evenement.code);

    if (!etaitDejaEnfoncee) {
      this.executerGestionnairesAppui(evenement.code);
    }
  }

  gererToucheRelachee(evenement) {
    this.bloquerToucheNavigateur(evenement);
    this.touchesAppuyees.delete(evenement.code);
  }

  bloquerToucheNavigateur(evenement) {
    if (TOUCHES_BLOQUEES.has(evenement.code)) {
      evenement.preventDefault();
    }
  }

  executerGestionnairesAppui(code) {
    const gestionnaires = this.gestionnairesAppui.get(code) || [];

    for (const gestionnaire of gestionnaires) {
      gestionnaire();
    }
  }
}

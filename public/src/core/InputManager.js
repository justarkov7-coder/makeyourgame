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
  // constructor explique une etape dediee du module.
  constructor() {
    this.touchesAppuyees = new Set();
    this.gestionnairesAppui = new Map();
    this.gererToucheEnfoncee = this.gererToucheEnfoncee.bind(this);
    this.gererToucheRelachee = this.gererToucheRelachee.bind(this);
  }

  // attacher explique une etape dediee du module.
  attacher() {
    window.addEventListener('keydown', this.gererToucheEnfoncee);
    window.addEventListener('keyup', this.gererToucheRelachee);
  }

  // detacher explique une etape dediee du module.
  detacher() {
    window.removeEventListener('keydown', this.gererToucheEnfoncee);
    window.removeEventListener('keyup', this.gererToucheRelachee);
  }

  // surAppui explique une etape dediee du module.
  surAppui(code, gestionnaire) {
    const gestionnaires = this.gestionnairesAppui.get(code) || [];
    gestionnaires.push(gestionnaire);
    this.gestionnairesAppui.set(code, gestionnaires);
  }

  // estEnfoncee explique une etape dediee du module.
  estEnfoncee(code) {
    return this.touchesAppuyees.has(code);
  }

  // gererToucheEnfoncee explique une etape dediee du module.
  gererToucheEnfoncee(evenement) {
    this.bloquerToucheNavigateur(evenement);

    const etaitDejaEnfoncee = this.touchesAppuyees.has(evenement.code);
    this.touchesAppuyees.add(evenement.code);

    if (!etaitDejaEnfoncee) {
      this.executerGestionnairesAppui(evenement.code);
    }
  }

  // gererToucheRelachee explique une etape dediee du module.
  gererToucheRelachee(evenement) {
    this.bloquerToucheNavigateur(evenement);
    this.touchesAppuyees.delete(evenement.code);
  }

  // bloquerToucheNavigateur explique une etape dediee du module.
  bloquerToucheNavigateur(evenement) {
    if (TOUCHES_BLOQUEES.has(evenement.code)) {
      evenement.preventDefault();
    }
  }

  // executerGestionnairesAppui explique une etape dediee du module.
  executerGestionnairesAppui(code) {
    const gestionnaires = this.gestionnairesAppui.get(code) || [];

    for (const gestionnaire of gestionnaires) {
      gestionnaire();
    }
  }
}

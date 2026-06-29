export class BoucleDeJeu {
  // constructor explique une etape dediee du module.
  constructor({ surImage }) {
    this.surImage = surImage;
    this.idAnimation = 0;
    this.dernierHorodatage = 0;
    this.estActive = false;
    this.animer = this.animer.bind(this);
  }

  // demarrer explique une etape dediee du module.
  demarrer() {
    if (this.estActive) {
      return;
    }

    this.estActive = true;
    this.dernierHorodatage = 0;
    this.planifierImage();
  }

  // arreter explique une etape dediee du module.
  arreter() {
    this.estActive = false;

    if (this.idAnimation === 0) {
      return;
    }

    window.cancelAnimationFrame(this.idAnimation);
    this.idAnimation = 0;
  }

  // animer explique une etape dediee du module.
  animer(horodatage) {
    if (!this.estActive) {
      return;
    }

    const deltaSecondes = this.calculerDelta(horodatage);
    this.surImage({ horodatage, deltaSecondes });
    this.planifierImage();
  }

  // calculerDelta explique une etape dediee du module.
  calculerDelta(horodatage) {
    if (this.dernierHorodatage === 0) {
      this.dernierHorodatage = horodatage;
    }

    const deltaSecondes = Math.min((horodatage - this.dernierHorodatage) / 1000, 0.05);
    this.dernierHorodatage = horodatage;
    return deltaSecondes;
  }

  // planifierImage explique une etape dediee du module.
  planifierImage() {
    this.idAnimation = window.requestAnimationFrame(this.animer);
  }
}

export class BoucleDeJeu {
  constructor({ surImage }) {
    this.surImage = surImage;
    this.idAnimation = 0;
    this.dernierHorodatage = 0;
    this.estActive = false;
    this.animer = this.animer.bind(this);
  }

  demarrer() {
    if (this.estActive) {
      return;
    }

    this.estActive = true;
    this.dernierHorodatage = 0;
    this.planifierImage();
  }

  arreter() {
    this.estActive = false;

    if (this.idAnimation === 0) {
      return;
    }

    window.cancelAnimationFrame(this.idAnimation);
    this.idAnimation = 0;
  }

  animer(horodatage) {
    if (!this.estActive) {
      return;
    }

    const deltaSecondes = this.calculerDelta(horodatage);
    this.surImage({ horodatage, deltaSecondes });
    this.planifierImage();
  }

  calculerDelta(horodatage) {
    if (this.dernierHorodatage === 0) {
      this.dernierHorodatage = horodatage;
    }

    const deltaSecondes = Math.min((horodatage - this.dernierHorodatage) / 1000, 0.05);
    this.dernierHorodatage = horodatage;
    return deltaSecondes;
  }

  planifierImage() {
    this.idAnimation = window.requestAnimationFrame(this.animer);
  }
}

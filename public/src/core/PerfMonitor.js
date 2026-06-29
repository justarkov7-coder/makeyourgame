export class MoniteurPerformance {
  // constructor explique une etape dediee du module.
  constructor() {
    this.fps = 60;
    this.imagesLentes = 0;
    this.imageLaPlusLenteMs = 0;
    this.compteurImages = 0;
    this.tempsCumuleMs = 0;
  }

  // mesurer explique une etape dediee du module.
  mesurer(deltaSecondes) {
    const dureeImageMs = deltaSecondes * 1000;
    this.mettreAJourStatistiques(dureeImageMs);

    if (this.tempsCumuleMs >= 250) {
      this.fps = Math.round((this.compteurImages * 1000) / this.tempsCumuleMs);
      this.reinitialiserFenetreMesure(dureeImageMs);
    }
  }

  // instantane explique une etape dediee du module.
  instantane() {
    return {
      fps: this.fps,
      imagesLentes: this.imagesLentes,
      imageLaPlusLenteMs: Math.round(this.imageLaPlusLenteMs * 10) / 10,
    };
  }

  // mettreAJourStatistiques explique une etape dediee du module.
  mettreAJourStatistiques(dureeImageMs) {
    this.compteurImages += 1;
    this.tempsCumuleMs += dureeImageMs;
    this.imageLaPlusLenteMs = Math.max(this.imageLaPlusLenteMs, dureeImageMs);

    if (dureeImageMs > 20) {
      this.imagesLentes += 1;
    }
  }

  // reinitialiserFenetreMesure explique une etape dediee du module.
  reinitialiserFenetreMesure(dureeImageMs) {
    this.compteurImages = 0;
    this.tempsCumuleMs = 0;
    this.imageLaPlusLenteMs = dureeImageMs;
  }
}

export const HISTOIRE = {
  introduction: {
    tag: 'Boot Menu',
    titre: 'Selection du pilote / secteur',
    texte:
      [
        'Status : READY',
        'Threat : HOSTILE CONTACT',
        'Select sector and start mission.',
      ].join('\n'),
  },
  conclusions: {
    victory: {
      tag: 'Conclusion',
      titre: 'Victoire orbitale',
      texte:
        "Le ciel est nettoye. Les convois quittent la station et la colonie tient encore une nuit de plus grace a ta manoeuvre.",
    },
    defeat: {
      tag: 'Conclusion',
      titre: 'Dernier signal',
      texte:
        "La ligne de defense s'effondre. Les balises tombent une a une, mais ton rapport permettra peut-etre aux survivants de preparer la riposte.",
    },
  },
};

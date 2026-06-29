// formaterTemps explique une etape dediee du module.
export function formaterTemps(totalSecondesBrutes) {
  const totalSecondes = Math.max(0, Math.ceil(totalSecondesBrutes));
  const minutes = String(Math.floor(totalSecondes / 60)).padStart(2, '0');
  const secondes = String(totalSecondes % 60).padStart(2, '0');
  return `${minutes}:${secondes}`;
}

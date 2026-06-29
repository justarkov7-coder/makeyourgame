package main

import "strings"

// construireReponseListe prepare la page visible du classement.
func construireReponseListe(scores []scoreBrut, page int, taillePage int) reponseListe {
	pageValide := borner(page, 1, calculerTotalPages(len(scores), taillePage))
	debut, fin := calculerBornesPage(pageValide, taillePage, len(scores))
	return reponseListe{
		Page: pageValide, TaillePage: taillePage,
		TotalPages:  calculerTotalPages(len(scores), taillePage),
		TotalScores: len(scores), Scores: construireScoresReponse(scores[debut:fin], debut),
	}
}

// construireScoresReponse convertit les scores stockes en lignes d'API.
func construireScoresReponse(scores []scoreBrut, decalage int) []scoreReponse {
	reponse := make([]scoreReponse, 0, len(scores))
	for index, score := range scores {
		reponse = append(reponse, scoreReponse{
			Nom: score.Nom, Rang: decalage + index + 1, Points: score.Points, Temps: score.Temps,
		})
	}
	return reponse
}

// trouverResumeSoumission retrouve le rang du score qui vient d'etre cree.
func trouverResumeSoumission(scores []scoreBrut, cible scoreBrut) (scoreReponse, int) {
	for index, score := range scores {
		if score.Nom == cible.Nom && score.Points == cible.Points && score.TempsSecondes == cible.TempsSecondes {
			rang := index + 1
			return scoreReponse{Nom: score.Nom, Rang: rang, Points: score.Points, Temps: score.Temps},
				calculerPercentile(rang, len(scores))
		}
	}
	return scoreReponse{Nom: cible.Nom, Rang: len(scores), Points: cible.Points, Temps: cible.Temps}, 100
}

// validerChargeScore controle la charge envoyee par le navigateur.
func validerChargeScore(charge chargeScore) error {
	if strings.TrimSpace(charge.Nom) == "" {
		return erreurTexte("Le nom du pilote est requis")
	}
	if charge.Points < 0 {
		return erreurTexte("Le score doit etre positif")
	}
	if charge.TempsSecondes < 0 {
		return erreurTexte("Le temps doit etre positif")
	}
	return nil
}

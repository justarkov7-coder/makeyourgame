package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

// gererListeScores charge et renvoie une page de classement.
func gererListeScores(ecriture http.ResponseWriter, requete *http.Request) {
	scores, erreur := lireScores()
	if erreur != nil {
		ecrireErreur(ecriture, http.StatusInternalServerError, erreur.Error())
		return
	}

	page := lireEntierQuery(requete, "page", 1)
	taillePage := lireEntierQuery(requete, "pageSize", 5)
	reponse := construireReponseListe(scores, page, taillePage)
	ecrireJSON(ecriture, http.StatusOK, reponse)
}

// gererCreationScore valide et enregistre un nouveau score.
func gererCreationScore(ecriture http.ResponseWriter, requete *http.Request) {
	var charge chargeScore

	if erreur := json.NewDecoder(requete.Body).Decode(&charge); erreur != nil {
		ecrireErreur(ecriture, http.StatusBadRequest, "Charge JSON invalide")
		return
	}

	if erreur := validerChargeScore(charge); erreur != nil {
		ecrireErreur(ecriture, http.StatusBadRequest, erreur.Error())
		return
	}

	scores, erreur := lireScores()
	if erreur != nil {
		ecrireErreur(ecriture, http.StatusInternalServerError, erreur.Error())
		return
	}

	nouveauScore := scoreBrut{
		Nom:           strings.TrimSpace(charge.Nom),
		Points:        charge.Points,
		TempsSecondes: charge.TempsSecondes,
		Temps:         formaterTemps(charge.TempsSecondes),
	}

	scores = append(scores, nouveauScore)
	trierScores(scores)

	if erreur := ecrireScores(scores); erreur != nil {
		ecrireErreur(ecriture, http.StatusInternalServerError, erreur.Error())
		return
	}

	entree, percentile := trouverResumeSoumission(scores, nouveauScore)
	totalPages := calculerTotalPages(len(scores), 5)
	page := calculerPagePourRang(entree.Rang, 5)
	ecrireJSON(ecriture, http.StatusCreated, reponseCreation{
		Entree: entree, Page: page, TotalPages: totalPages, Percentile: percentile,
	})
}

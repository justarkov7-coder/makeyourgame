package main

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

// erreurTexte construit une erreur simple en francais.
func erreurTexte(message string) error {
	return errors.New(message)
}

// formaterTemps convertit des secondes en affichage mm:ss.
func formaterTemps(totalSecondes int) string {
	minutes := totalSecondes / 60
	secondes := totalSecondes % 60
	return fmt.Sprintf("%02d:%02d", minutes, secondes)
}

// lireEntierQuery lit un entier positif depuis la query string.
func lireEntierQuery(requete *http.Request, cle string, defaut int) int {
	valeurBrute := requete.URL.Query().Get(cle)
	if valeurBrute == "" {
		return defaut
	}

	valeur, erreur := strconv.Atoi(valeurBrute)
	if erreur != nil || valeur <= 0 {
		return defaut
	}
	return valeur
}

// calculerBornesPage donne les index inclusifs/exclusifs d'une page.
func calculerBornesPage(page int, taillePage int, total int) (int, int) {
	debut := (page - 1) * taillePage
	if debut > total {
		debut = total
	}

	fin := debut + taillePage
	if fin > total {
		fin = total
	}
	return debut, fin
}

// calculerTotalPages compte les pages necessaires au classement.
func calculerTotalPages(total int, taillePage int) int {
	if total == 0 {
		return 1
	}

	pages := total / taillePage
	if total%taillePage != 0 {
		pages += 1
	}
	return pages
}

// calculerPagePourRang retrouve la page contenant un rang.
func calculerPagePourRang(rang int, taillePage int) int {
	if rang <= 0 {
		return 1
	}
	return ((rang - 1) / taillePage) + 1
}

// calculerPercentile transforme le rang en percentile.
func calculerPercentile(rang int, total int) int {
	if total <= 0 {
		return 100
	}

	percentile := int(float64(rang) / float64(total) * 100)
	if percentile < 1 {
		return 1
	}
	return percentile
}

// borner ramene une valeur dans un intervalle ferme.
func borner(valeur int, minimum int, maximum int) int {
	if maximum < minimum || valeur < minimum {
		return minimum
	}
	if valeur > maximum {
		return maximum
	}
	return valeur
}

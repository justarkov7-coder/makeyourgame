package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sort"
)

// lireScores charge les scores persistants depuis le disque.
func lireScores() ([]scoreBrut, error) {
	if erreur := assurerFichierScores(); erreur != nil {
		return nil, erreur
	}

	contenu, erreur := os.ReadFile(fichierScores)
	if erreur != nil {
		return nil, erreur
	}

	var scores []scoreBrut
	if len(contenu) == 0 {
		return []scoreBrut{}, nil
	}
	if erreur := json.Unmarshal(contenu, &scores); erreur != nil {
		return nil, erreur
	}

	trierScores(scores)
	return scores, nil
}

// ecrireScores persiste le classement complet au format JSON.
func ecrireScores(scores []scoreBrut) error {
	if erreur := assurerFichierScores(); erreur != nil {
		return erreur
	}

	donnees, erreur := json.MarshalIndent(scores, "", "  ")
	if erreur != nil {
		return erreur
	}
	return os.WriteFile(fichierScores, donnees, 0o644)
}

// assurerFichierScores cree le fichier de score quand il manque.
func assurerFichierScores() error {
	dossier := filepath.Dir(fichierScores)
	if erreur := os.MkdirAll(dossier, 0o755); erreur != nil {
		return erreur
	}
	if _, erreur := os.Stat(fichierScores); errors.Is(erreur, os.ErrNotExist) {
		return os.WriteFile(fichierScores, []byte("[]"), 0o644)
	}
	return nil
}

// trierScores ordonne les scores par points puis par temps.
func trierScores(scores []scoreBrut) {
	sort.Slice(scores, func(indexA int, indexB int) bool {
		if scores[indexA].Points == scores[indexB].Points {
			return scores[indexA].TempsSecondes < scores[indexB].TempsSecondes
		}
		return scores[indexA].Points > scores[indexB].Points
	})
}

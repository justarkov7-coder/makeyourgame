package main

import (
	"fmt"
	"net/http"
	"os"
)

// demarrerApi lance le serveur HTTP de classement.
func main() {
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "3001"
	}

	multiplexeur := http.NewServeMux()
	multiplexeur.HandleFunc("/api/scores", gererScores)
	multiplexeur.HandleFunc("/scores", gererScores)
	multiplexeur.HandleFunc("/health", gererSante)

	fmt.Printf("Score API listening on http://localhost:%s/api/scores\n", port)
	if erreur := http.ListenAndServe(":"+port, appliquerCORS(multiplexeur)); erreur != nil {
		panic(erreur)
	}
}

// gererSante renvoie un etat minimal pour verifier le service.
func gererSante(ecriture http.ResponseWriter, requete *http.Request) {
	ecrireJSON(ecriture, http.StatusOK, map[string]string{"status": "ok"})
}

// gererScores dirige chaque methode HTTP vers le traitement adapte.
func gererScores(ecriture http.ResponseWriter, requete *http.Request) {
	switch requete.Method {
	case http.MethodGet:
		gererListeScores(ecriture, requete)
	case http.MethodPost:
		gererCreationScore(ecriture, requete)
	case http.MethodOptions:
		ecriture.WriteHeader(http.StatusNoContent)
	default:
		ecrireErreur(ecriture, http.StatusMethodNotAllowed, "Methode non autorisee")
	}
}

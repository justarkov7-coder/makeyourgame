package main

import (
	"encoding/json"
	"net/http"
)

// appliquerCORS autorise le navigateur local a appeler l'API.
func appliquerCORS(suivant http.Handler) http.Handler {
	return http.HandlerFunc(func(ecriture http.ResponseWriter, requete *http.Request) {
		ecriture.Header().Set("Access-Control-Allow-Origin", "*")
		ecriture.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		ecriture.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if requete.Method == http.MethodOptions {
			ecriture.WriteHeader(http.StatusNoContent)
			return
		}

		suivant.ServeHTTP(ecriture, requete)
	})
}

// ecrireErreur renvoie une erreur JSON standardisee.
func ecrireErreur(ecriture http.ResponseWriter, code int, message string) {
	ecrireJSON(ecriture, code, map[string]string{"error": message})
}

// ecrireJSON encode une charge HTTP au format JSON.
func ecrireJSON(ecriture http.ResponseWriter, code int, charge interface{}) {
	ecriture.Header().Set("Content-Type", "application/json; charset=utf-8")
	ecriture.WriteHeader(code)
	_ = json.NewEncoder(ecriture).Encode(charge)
}

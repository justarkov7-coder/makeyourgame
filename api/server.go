package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

const fichierScores = "api/scores.json"

type scoreBrut struct {
	Name        string `json:"name"`
	Score       int    `json:"score"`
	Time        string `json:"time"`
	TimeSeconds int    `json:"timeSeconds"`
}

type scoreReponse struct {
	Name  string `json:"name"`
	Rank  int    `json:"rank"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

type reponseListe struct {
	Page        int            `json:"page"`
	PageSize    int            `json:"pageSize"`
	TotalPages  int            `json:"totalPages"`
	TotalScores int            `json:"totalScores"`
	Scores      []scoreReponse `json:"scores"`
}

type chargeScore struct {
	Name        string `json:"name"`
	Score       int    `json:"score"`
	TimeSeconds int    `json:"timeSeconds"`
}

type reponseCreation struct {
	Entry      scoreReponse `json:"entry"`
	Page       int          `json:"page"`
	TotalPages int          `json:"totalPages"`
	Percentile int          `json:"percentile"`
}

func main() {
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "3001"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/scores", gererScores)
	mux.HandleFunc("/scores", gererScores)
	mux.HandleFunc("/health", gererHealth)

	fmt.Printf("Score API listening on http://localhost:%s/api/scores\n", port)
	if err := http.ListenAndServe(":"+port, appliquerCORS(mux)); err != nil {
		panic(err)
	}
}

func gererHealth(writer http.ResponseWriter, request *http.Request) {
	ecrireJSON(writer, http.StatusOK, map[string]string{"status": "ok"})
}

func gererScores(writer http.ResponseWriter, request *http.Request) {
	switch request.Method {
	case http.MethodGet:
		gererListeScores(writer, request)
	case http.MethodPost:
		gererCreationScore(writer, request)
	case http.MethodOptions:
		writer.WriteHeader(http.StatusNoContent)
	default:
		ecrireErreur(writer, http.StatusMethodNotAllowed, "Methode non autorisee")
	}
}

func gererListeScores(writer http.ResponseWriter, request *http.Request) {
	scores, err := lireScores()
	if err != nil {
		ecrireErreur(writer, http.StatusInternalServerError, err.Error())
		return
	}

	page := lireEntierQuery(request, "page", 1)
	pageSize := lireEntierQuery(request, "pageSize", 5)
	reponse := construireReponseListe(scores, page, pageSize)
	ecrireJSON(writer, http.StatusOK, reponse)
}

func gererCreationScore(writer http.ResponseWriter, request *http.Request) {
	var charge chargeScore

	if err := json.NewDecoder(request.Body).Decode(&charge); err != nil {
		ecrireErreur(writer, http.StatusBadRequest, "Charge JSON invalide")
		return
	}

	if err := validerChargeScore(charge); err != nil {
		ecrireErreur(writer, http.StatusBadRequest, err.Error())
		return
	}

	scores, err := lireScores()
	if err != nil {
		ecrireErreur(writer, http.StatusInternalServerError, err.Error())
		return
	}

	nouveauScore := scoreBrut{
		Name:        strings.TrimSpace(charge.Name),
		Score:       charge.Score,
		TimeSeconds: charge.TimeSeconds,
		Time:        formaterTemps(charge.TimeSeconds),
	}

	scores = append(scores, nouveauScore)
	trierScores(scores)

	if err := ecrireScores(scores); err != nil {
		ecrireErreur(writer, http.StatusInternalServerError, err.Error())
		return
	}

	entry, percentile := trouverResumeSoumission(scores, nouveauScore)
	totalPages := calculerTotalPages(len(scores), 5)
	page := calculerPagePourRang(entry.Rank, 5)
	reponse := reponseCreation{
		Entry:      entry,
		Page:       page,
		TotalPages: totalPages,
		Percentile: percentile,
	}
	ecrireJSON(writer, http.StatusCreated, reponse)
}

func construireReponseListe(scores []scoreBrut, page int, pageSize int) reponseListe {
	pageValide := borner(page, 1, calculerTotalPages(len(scores), pageSize))
	debut, fin := calculerBornesPage(pageValide, pageSize, len(scores))
	scoresPage := construireScoresReponse(scores[debut:fin], debut)

	return reponseListe{
		Page:        pageValide,
		PageSize:    pageSize,
		TotalPages:  calculerTotalPages(len(scores), pageSize),
		TotalScores: len(scores),
		Scores:      scoresPage,
	}
}

func construireScoresReponse(scores []scoreBrut, decalage int) []scoreReponse {
	reponse := make([]scoreReponse, 0, len(scores))

	for index, score := range scores {
		reponse = append(reponse, scoreReponse{
			Name:  score.Name,
			Rank:  decalage + index + 1,
			Score: score.Score,
			Time:  score.Time,
		})
	}

	return reponse
}

func trouverResumeSoumission(scores []scoreBrut, cible scoreBrut) (scoreReponse, int) {
	for index, score := range scores {
		if score.Name == cible.Name && score.Score == cible.Score && score.TimeSeconds == cible.TimeSeconds {
			rang := index + 1
			return scoreReponse{
				Name:  score.Name,
				Rank:  rang,
				Score: score.Score,
				Time:  score.Time,
			}, calculerPercentile(rang, len(scores))
		}
	}

	return scoreReponse{Name: cible.Name, Rank: len(scores), Score: cible.Score, Time: cible.Time}, 100
}

func validerChargeScore(charge chargeScore) error {
	if strings.TrimSpace(charge.Name) == "" {
		return errors.New("Le nom du pilote est requis")
	}

	if charge.Score < 0 {
		return errors.New("Le score doit etre positif")
	}

	if charge.TimeSeconds < 0 {
		return errors.New("Le temps doit etre positif")
	}

	return nil
}

func lireScores() ([]scoreBrut, error) {
	if err := assurerFichierScores(); err != nil {
		return nil, err
	}

	contenu, err := os.ReadFile(fichierScores)
	if err != nil {
		return nil, err
	}

	var scores []scoreBrut
	if len(contenu) == 0 {
		return []scoreBrut{}, nil
	}

	if err := json.Unmarshal(contenu, &scores); err != nil {
		return nil, err
	}

	trierScores(scores)
	return scores, nil
}

func ecrireScores(scores []scoreBrut) error {
	if err := assurerFichierScores(); err != nil {
		return err
	}

	donnees, err := json.MarshalIndent(scores, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(fichierScores, donnees, 0o644)
}

func assurerFichierScores() error {
	dossier := filepath.Dir(fichierScores)
	if err := os.MkdirAll(dossier, 0o755); err != nil {
		return err
	}

	if _, err := os.Stat(fichierScores); errors.Is(err, os.ErrNotExist) {
		return os.WriteFile(fichierScores, []byte("[]"), 0o644)
	}

	return nil
}

func trierScores(scores []scoreBrut) {
	sort.Slice(scores, func(indexA int, indexB int) bool {
		if scores[indexA].Score == scores[indexB].Score {
			return scores[indexA].TimeSeconds < scores[indexB].TimeSeconds
		}

		return scores[indexA].Score > scores[indexB].Score
	})
}

func formaterTemps(totalSecondes int) string {
	minutes := totalSecondes / 60
	secondes := totalSecondes % 60
	return fmt.Sprintf("%02d:%02d", minutes, secondes)
}

func lireEntierQuery(request *http.Request, cle string, fallback int) int {
	valeurBrute := request.URL.Query().Get(cle)
	if valeurBrute == "" {
		return fallback
	}

	valeur, err := strconv.Atoi(valeurBrute)
	if err != nil || valeur <= 0 {
		return fallback
	}

	return valeur
}

func calculerBornesPage(page int, pageSize int, total int) (int, int) {
	debut := (page - 1) * pageSize
	if debut > total {
		debut = total
	}

	fin := debut + pageSize
	if fin > total {
		fin = total
	}

	return debut, fin
}

func calculerTotalPages(total int, pageSize int) int {
	if total == 0 {
		return 1
	}

	pages := total / pageSize
	if total%pageSize != 0 {
		pages += 1
	}

	return pages
}

func calculerPagePourRang(rang int, pageSize int) int {
	if rang <= 0 {
		return 1
	}

	return ((rang - 1) / pageSize) + 1
}

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

func borner(valeur int, minimum int, maximum int) int {
	if maximum < minimum {
		return minimum
	}

	if valeur < minimum {
		return minimum
	}

	if valeur > maximum {
		return maximum
	}

	return valeur
}

func appliquerCORS(suivant http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Access-Control-Allow-Origin", "*")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if request.Method == http.MethodOptions {
			writer.WriteHeader(http.StatusNoContent)
			return
		}

		suivant.ServeHTTP(writer, request)
	})
}

func ecrireErreur(writer http.ResponseWriter, code int, message string) {
	ecrireJSON(writer, code, map[string]string{"error": message})
}

func ecrireJSON(writer http.ResponseWriter, code int, charge interface{}) {
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(code)
	_ = json.NewEncoder(writer).Encode(charge)
}

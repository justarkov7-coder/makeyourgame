package main

const fichierScores = "api/scores.json"

type scoreBrut struct {
	Nom           string `json:"name"`
	Points        int    `json:"score"`
	Temps         string `json:"time"`
	TempsSecondes int    `json:"timeSeconds"`
}

type scoreReponse struct {
	Nom    string `json:"name"`
	Rang   int    `json:"rank"`
	Points int    `json:"score"`
	Temps  string `json:"time"`
}

type reponseListe struct {
	Page        int            `json:"page"`
	TaillePage  int            `json:"pageSize"`
	TotalPages  int            `json:"totalPages"`
	TotalScores int            `json:"totalScores"`
	Scores      []scoreReponse `json:"scores"`
}

type chargeScore struct {
	Nom           string `json:"name"`
	Points        int    `json:"score"`
	TempsSecondes int    `json:"timeSeconds"`
}

type reponseCreation struct {
	Entree     scoreReponse `json:"entry"`
	Page       int          `json:"page"`
	TotalPages int          `json:"totalPages"`
	Percentile int          `json:"percentile"`
}

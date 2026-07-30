package router

import (
	"net/http"

	"calculator/backend/internal/controller"
)

func New() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/calculator/addition", controller.AdditionHandler)
	mux.HandleFunc("/api/v1/calculator/subtraction", controller.SubtractionHandler)
	mux.HandleFunc("/api/v1/calculator/multiplication", controller.MultiplicationHandler)
	mux.HandleFunc("/api/v1/calculator/division", controller.DivisionHandler)

	mux.HandleFunc("/", controller.NotFoundHandler)

	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

package router

import (
	"net/http"

	"calculator/backend/internal/controller"
)

// New builds the HTTP handler that routes calculator API requests to their
// controllers. It performs route-level wiring only: HTTP method
// validation and business logic live in internal/controller.
func New() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/calculator/addition", controller.AdditionHandler)
	mux.HandleFunc("/api/v1/calculator/subtraction", controller.SubtractionHandler)
	mux.HandleFunc("/api/v1/calculator/multiplication", controller.MultiplicationHandler)
	mux.HandleFunc("/api/v1/calculator/division", controller.DivisionHandler)

	// Catch-all: anything not matched above (including truly unknown
	// paths) falls through to a JSON 404 instead of ServeMux's default
	// plain-text response.
	mux.HandleFunc("/", controller.NotFoundHandler)

	return withCORS(mux)
}

// withCORS lets browser-based clients on a different origin (e.g. the
// Vite dev server) call the API despite the JSON Content-Type header
// triggering a CORS preflight. It sets Access-Control-Allow-* headers on
// every response and short-circuits the OPTIONS preflight with a 204
// before it reaches routing/controllers. It does not change any existing
// route, request/response contract, or status code for real requests.
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

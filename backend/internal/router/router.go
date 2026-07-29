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

	return mux
}

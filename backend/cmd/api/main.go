package main

import (
	"log"
	"net/http"
	"os"

	"calculator/backend/internal/router"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	log.Printf("calculator API listening on %s", addr)
	if err := http.ListenAndServe(addr, router.New()); err != nil {
		log.Fatal(err)
	}
}

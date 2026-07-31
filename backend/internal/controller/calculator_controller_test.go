package controller

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"calculator/backend/internal/dto"
)

func TestCalculatorHandlers_Success(t *testing.T) {
	tests := []struct {
		name       string
		handler    http.HandlerFunc
		path       string
		body       string
		wantResult float64
	}{
		{"addition", AdditionHandler, "/api/v1/calculator/addition", `{"firstOperand":10,"secondOperand":5}`, 15},
		{"subtraction", SubtractionHandler, "/api/v1/calculator/subtraction", `{"firstOperand":10,"secondOperand":5}`, 5},
		{"multiplication", MultiplicationHandler, "/api/v1/calculator/multiplication", `{"firstOperand":10,"secondOperand":5}`, 50},
		{"division", DivisionHandler, "/api/v1/calculator/division", `{"firstOperand":10,"secondOperand":5}`, 2},
		{"zero operand is accepted", AdditionHandler, "/api/v1/calculator/addition", `{"firstOperand":0,"secondOperand":5}`, 5},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, tt.path, strings.NewReader(tt.body))
			rec := httptest.NewRecorder()
			tt.handler(rec, req)

			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
			}
			if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
				t.Errorf("Content-Type = %q, want %q", ct, "application/json")
			}
			var got dto.CalculatorResponse
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if got.Result != tt.wantResult {
				t.Errorf("result = %v, want %v", got.Result, tt.wantResult)
			}
		})
	}
}

func TestCalculatorHandlers_Errors(t *testing.T) {
	tests := []struct {
		name       string
		handler    http.HandlerFunc
		method     string
		body       string
		wantStatus int
		wantError  string
	}{
		{"invalid JSON", AdditionHandler, http.MethodPost, `{not-json`, http.StatusBadRequest, "invalid request body"},
		{"empty body", AdditionHandler, http.MethodPost, ``, http.StatusBadRequest, "invalid request body"},
		{"missing firstOperand", AdditionHandler, http.MethodPost, `{"secondOperand":5}`, http.StatusBadRequest, "firstOperand is required"},
		{"missing secondOperand", AdditionHandler, http.MethodPost, `{"firstOperand":5}`, http.StatusBadRequest, "secondOperand is required"},
		{"invalid operand type", AdditionHandler, http.MethodPost, `{"firstOperand":"abc","secondOperand":5}`, http.StatusBadRequest, "invalid operand value"},
		{"division by zero", DivisionHandler, http.MethodPost, `{"firstOperand":10,"secondOperand":0}`, http.StatusBadRequest, "division by zero is not allowed"},
		{"method not allowed", AdditionHandler, http.MethodGet, ``, http.StatusMethodNotAllowed, "method not allowed"},
		{"result overflow", AdditionHandler, http.MethodPost, `{"firstOperand":1e308,"secondOperand":1e308}`, http.StatusBadRequest, "result is not a finite number"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, "/api/v1/calculator/addition", strings.NewReader(tt.body))
			rec := httptest.NewRecorder()
			tt.handler(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
				t.Errorf("Content-Type = %q, want %q", ct, "application/json")
			}
			var got dto.ErrorResponse
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if got.Error != tt.wantError {
				t.Errorf("error = %q, want %q", got.Error, tt.wantError)
			}
		})
	}
}

func TestNotFoundHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/calculator/unknown", nil)
	rec := httptest.NewRecorder()
	NotFoundHandler(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, want %q", ct, "application/json")
	}
	var got dto.ErrorResponse
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if got.Error != "route not found" {
		t.Errorf("error = %q, want %q", got.Error, "route not found")
	}
}

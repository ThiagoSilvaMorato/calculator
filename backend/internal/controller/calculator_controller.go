package controller

import (
	"encoding/json"
	"errors"
	"net/http"

	"calculator/backend/internal/dto"
	"calculator/backend/internal/usecase"
)

var (
	errInvalidBody           = errors.New("invalid request body")
	errInvalidOperandValue   = errors.New("invalid operand value")
	errFirstOperandRequired  = errors.New("firstOperand is required")
	errSecondOperandRequired = errors.New("secondOperand is required")
)

type operation func(first, second float64) (float64, error)

func AdditionHandler(w http.ResponseWriter, r *http.Request) {
	handleCalculation(w, r, usecase.Add)
}

func SubtractionHandler(w http.ResponseWriter, r *http.Request) {
	handleCalculation(w, r, usecase.Subtract)
}

func MultiplicationHandler(w http.ResponseWriter, r *http.Request) {
	handleCalculation(w, r, usecase.Multiply)
}

func DivisionHandler(w http.ResponseWriter, r *http.Request) {
	handleCalculation(w, r, usecase.Divide)
}

func NotFoundHandler(w http.ResponseWriter, _ *http.Request) {
	writeError(w, http.StatusNotFound, "route not found")
}

func handleCalculation(w http.ResponseWriter, r *http.Request, op operation) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", http.MethodPost)
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	req, err := decodeRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	first, second, err := requiredOperands(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	result, err := op(first, second)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, dto.CalculatorResponse{Result: result})
}

func decodeRequest(r *http.Request) (dto.CalculatorRequest, error) {
	var req dto.CalculatorRequest
	defer r.Body.Close()

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		var typeErr *json.UnmarshalTypeError
		if errors.As(err, &typeErr) {
			return dto.CalculatorRequest{}, errInvalidOperandValue
		}
		return dto.CalculatorRequest{}, errInvalidBody
	}
	return req, nil
}

func requiredOperands(req dto.CalculatorRequest) (float64, float64, error) {
	if req.FirstOperand == nil {
		return 0, 0, errFirstOperandRequired
	}
	if req.SecondOperand == nil {
		return 0, 0, errSecondOperandRequired
	}
	return *req.FirstOperand, *req.SecondOperand, nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, dto.ErrorResponse{Error: message})
}

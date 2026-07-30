package dto

type CalculatorRequest struct {
	FirstOperand  *float64 `json:"firstOperand"`
	SecondOperand *float64 `json:"secondOperand"`
}

type CalculatorResponse struct {
	Result float64 `json:"result"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

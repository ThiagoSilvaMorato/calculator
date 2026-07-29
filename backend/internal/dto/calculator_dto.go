package dto

// CalculatorRequest is the JSON body accepted by all calculator endpoints.
//
// FirstOperand and SecondOperand are pointers so a handler can distinguish
// an operand that was omitted from the request body (nil) from one that
// was explicitly set to zero (non-nil, pointing at 0). A plain float64
// cannot make that distinction because Go's JSON decoder leaves it at its
// zero value either way.
type CalculatorRequest struct {
	FirstOperand  *float64 `json:"firstOperand"`
	SecondOperand *float64 `json:"secondOperand"`
}

// CalculatorResponse is the JSON body returned on a successful calculation.
type CalculatorResponse struct {
	Result float64 `json:"result"`
}

// ErrorResponse is the JSON body returned for any error condition.
type ErrorResponse struct {
	Error string `json:"error"`
}

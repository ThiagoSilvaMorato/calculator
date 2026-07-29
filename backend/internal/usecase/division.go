package usecase

import "errors"

// Divide returns first divided by second. It returns an error when second
// is zero, since division by zero is not a valid arithmetic operation.
func Divide(first, second float64) (float64, error) {
	if second == 0 {
		return 0, errors.New("division by zero is not allowed")
	}
	return first / second, nil
}

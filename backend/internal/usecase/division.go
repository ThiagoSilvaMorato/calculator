package usecase

import "errors"

func Divide(first, second float64) (float64, error) {
	if second == 0 {
		return 0, errors.New("division by zero is not allowed")
	}
	return first / second, nil
}

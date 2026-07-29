package usecase

// Subtract returns first minus second. It always succeeds; the error
// return keeps its signature consistent with the other arithmetic
// operations so the controller can dispatch all four uniformly.
func Subtract(first, second float64) (float64, error) {
	return first - second, nil
}

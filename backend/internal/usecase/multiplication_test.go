package usecase

import "testing"

func TestMultiply(t *testing.T) {
	tests := []struct {
		name          string
		first, second float64
		want          float64
	}{
		{"positive operands", 3, 4, 12},
		{"negative operands", -3, 4, -12},
		{"decimal operands", 2.5, 4, 10},
		{"multiply by zero", 5, 0, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Multiply(tt.first, tt.second)
			if err != nil {
				t.Fatalf("Multiply(%v, %v) returned unexpected error: %v", tt.first, tt.second, err)
			}
			if got != tt.want {
				t.Errorf("Multiply(%v, %v) = %v, want %v", tt.first, tt.second, got, tt.want)
			}
		})
	}
}

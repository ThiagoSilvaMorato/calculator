package usecase

import "testing"

func TestSubtract(t *testing.T) {
	tests := []struct {
		name          string
		first, second float64
		want          float64
	}{
		{"positive operands", 5, 2, 3},
		{"negative result", 2, 5, -3},
		{"negative operands", -5, -2, -3},
		{"decimal operands", 5.5, 2.25, 3.25},
		{"zero operands", 5, 5, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Subtract(tt.first, tt.second)
			if err != nil {
				t.Fatalf("Subtract(%v, %v) returned unexpected error: %v", tt.first, tt.second, err)
			}
			if got != tt.want {
				t.Errorf("Subtract(%v, %v) = %v, want %v", tt.first, tt.second, got, tt.want)
			}
		})
	}
}

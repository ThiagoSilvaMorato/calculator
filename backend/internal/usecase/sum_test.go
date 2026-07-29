package usecase

import "testing"

func TestAdd(t *testing.T) {
	tests := []struct {
		name          string
		first, second float64
		want          float64
	}{
		{"positive operands", 2, 3, 5},
		{"negative operands", -2, -3, -5},
		{"decimal operands", 1.5, 2.25, 3.75},
		{"zero operands", 0, 0, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Add(tt.first, tt.second)
			if err != nil {
				t.Fatalf("Add(%v, %v) returned unexpected error: %v", tt.first, tt.second, err)
			}
			if got != tt.want {
				t.Errorf("Add(%v, %v) = %v, want %v", tt.first, tt.second, got, tt.want)
			}
		})
	}
}

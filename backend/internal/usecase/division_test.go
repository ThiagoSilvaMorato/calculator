package usecase

import "testing"

func TestDivide(t *testing.T) {
	tests := []struct {
		name          string
		first, second float64
		want          float64
		wantErr       bool
	}{
		{"positive operands", 10, 2, 5, false},
		{"negative operands", -10, 2, -5, false},
		{"decimal operands", 5, 2, 2.5, false},
		{"negative result", 10, -2, -5, false},
		{"division by zero", 10, 0, 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Divide(tt.first, tt.second)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("Divide(%v, %v) expected an error, got nil", tt.first, tt.second)
				}
				return
			}
			if err != nil {
				t.Fatalf("Divide(%v, %v) returned unexpected error: %v", tt.first, tt.second, err)
			}
			if got != tt.want {
				t.Errorf("Divide(%v, %v) = %v, want %v", tt.first, tt.second, got, tt.want)
			}
		})
	}
}

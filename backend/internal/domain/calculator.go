// Package domain intentionally contains no calculator-specific domain
// types for this scope. Request/response contracts live in internal/dto
// and arithmetic behavior lives in internal/usecase; there is no shared
// domain concept (e.g. an "Operation" aggregate) that earns its keep as
// an abstraction here, per backend/CLAUDE.md's guidance to avoid
// unnecessary interfaces/abstractions. This file is kept so the package
// remains available if genuine shared domain logic emerges later.
package domain

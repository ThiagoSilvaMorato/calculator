# Calculator

Full-stack calculator technical assignment: a React + TypeScript frontend consuming a Go REST API backend to perform basic arithmetic operations (addition, subtraction, multiplication, division).

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Go (standard library only — no framework, no database)

Frontend setup and usage instructions will be added once frontend implementation begins. The backend is fully implemented; see below.

## Backend

### Prerequisites

- Go 1.22+ (developed and tested with Go 1.26.5). Version 1.22+ is required because routing relies on the standard library's enhanced `net/http.ServeMux`.

### Setup

```bash
cd backend
go build ./...
```

No external dependencies are required — the backend uses only the Go standard library, so there is no `go.sum` to install.

### Run the backend

```bash
cd backend
go run ./cmd/api
```

The server listens on `:8080` by default. Set `PORT` to use a different port:

```bash
PORT=8081 go run ./cmd/api
```

### Run tests

```bash
cd backend
go test ./...
```

### Run tests with coverage

```bash
cd backend
go test -cover ./...
```

### Format and vet

```bash
cd backend
gofmt -l .   # lists any unformatted files; empty output means everything is formatted
go vet ./...
```

## API documentation

Base URL: `http://localhost:8080`

All four endpoints accept `POST` requests with the same JSON body shape and return the same success/error shapes. The operation is determined solely by the URL path — there is no `operation` field in the request body.

| Endpoint | Operation |
|---|---|
| `POST /api/v1/calculator/addition` | Addition |
| `POST /api/v1/calculator/subtraction` | Subtraction |
| `POST /api/v1/calculator/multiplication` | Multiplication |
| `POST /api/v1/calculator/division` | Division |

### Request body

```json
{
  "firstOperand": 10,
  "secondOperand": 5
}
```

Both operands are numbers (integers or decimals). `0` is a valid operand value.

### Successful response

`200 OK`, `Content-Type: application/json`:

```json
{
  "result": 15
}
```

### Error response

Any error condition returns `Content-Type: application/json` with:

```json
{
  "error": "descriptive error message"
}
```

### Examples

**Addition — success**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/addition \
  -d '{"firstOperand":10,"secondOperand":5}'
# 200 OK
# {"result":15}
```

**Subtraction — success**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/subtraction \
  -d '{"firstOperand":10,"secondOperand":5}'
# 200 OK
# {"result":5}
```

**Multiplication — success**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/multiplication \
  -d '{"firstOperand":10,"secondOperand":5}'
# 200 OK
# {"result":50}
```

**Division — success**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/division \
  -d '{"firstOperand":10,"secondOperand":5}'
# 200 OK
# {"result":2}
```

**Malformed JSON**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/addition -d '{not-json'
# 400 Bad Request
# {"error":"invalid request body"}
```

**Missing operand**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/addition -d '{"secondOperand":5}'
# 400 Bad Request
# {"error":"firstOperand is required"}
```

**Invalid operand type**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/addition \
  -d '{"firstOperand":"abc","secondOperand":5}'
# 400 Bad Request
# {"error":"invalid operand value"}
```

**Division by zero**

```bash
curl -s -X POST http://localhost:8080/api/v1/calculator/division \
  -d '{"firstOperand":10,"secondOperand":0}'
# 400 Bad Request
# {"error":"division by zero is not allowed"}
```

**Unsupported HTTP method**

```bash
curl -s -X GET http://localhost:8080/api/v1/calculator/addition
# 405 Method Not Allowed
# {"error":"method not allowed"}
```

**Unknown route**

```bash
curl -s -X POST http://localhost:8080/api/v1/unknown
# 404 Not Found
# {"error":"route not found"}
```

## Backend design decisions

- **Standard library only.** `net/http` for the server and routing, `encoding/json` for (de)serialization, `testing` + `net/http/httptest` for tests. No web framework, database, or external dependency — appropriate for the scope of this assignment.
- **One endpoint per operation, no generic `operation` field.** The route path alone determines which arithmetic operation runs, per the assignment's explicit constraint.
- **Missing vs. zero operand.** `CalculatorRequest` uses `*float64` pointer fields for `firstOperand`/`secondOperand`. A `nil` pointer means the field was omitted (or `null`), producing a "required" error; a non-nil pointer — including one pointing at `0` — means the value was explicitly provided and is used as-is. A plain `float64` field can't make this distinction, since Go's JSON decoder leaves it at its zero value either way.
- **JSON error responses on every error path, including routing errors.** Go 1.22+'s enhanced `http.ServeMux` supports method-in-pattern routes (e.g. `"POST /path"`), but its built-in 404/405 responses are plain text, not JSON. To guarantee a consistent `{"error": "..."}` JSON shape everywhere, routes are registered as plain paths (no method verb), each handler checks `r.Method` itself and writes a JSON 405 on mismatch, and a catch-all `"/"` pattern is registered to a `NotFoundHandler` that writes a JSON 404 for any unmatched path.
- **Layering.** `cmd/api` only starts the server; `internal/router` only registers routes; `internal/controller` handles HTTP concerns (method/JSON validation, calling the use case, shaping the response) and stays thin; `internal/usecase` holds pure arithmetic logic with no `net/http` dependency and one file per operation, independently unit-tested; `internal/dto` holds the request/response/error structs. `internal/domain` is left intentionally minimal — there's no shared domain concept beyond what `dto` and `usecase` already express at this scope.
- **Uniform use-case signature.** All four use cases share `func(first, second float64) (float64, error)`, even though only `Divide` can actually fail. This lets the controller dispatch all four operations through one shared handler function instead of duplicating the request-handling flow four times.
- **Status codes.** `200` on success; `400` for all input/validation errors including division by zero; `405` for an unsupported method on a known route; `404` for an unknown route.
- **Not implemented (by design, out of scope for this task):** Swagger/OpenAPI, Docker, a database, authentication, and optional operations (exponentiation, square root, percentage). The architecture (one file per use case, thin controllers) is structured so those operations could be added later without restructuring existing code.

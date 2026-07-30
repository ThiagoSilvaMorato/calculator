# Calculator

Full-stack calculator technical assignment: a React + TypeScript frontend consuming a Go REST API
backend to perform basic arithmetic operations (addition, subtraction, multiplication, division).

- **Frontend:** React + TypeScript (Vite), Tailwind CSS
- **Backend:** Go (standard library only — no framework, no database)

## Backend

### Prerequisites

- Go 1.22+ (developed and tested with Go 1.26.5). Version 1.22+ is required because routing relies
  on the standard library's enhanced `net/http.ServeMux`.

### Setup

```bash
cd backend
go build ./...
```

No external dependencies are required — the backend uses only the Go standard library, so there is
no `go.sum` to install.

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

All four endpoints accept `POST` requests with the same JSON body shape and return the same
success/error shapes. The operation is determined solely by the URL path — there is no `operation`
field in the request body.

| Endpoint                                 | Operation      |
| ---------------------------------------- | -------------- |
| `POST /api/v1/calculator/addition`       | Addition       |
| `POST /api/v1/calculator/subtraction`    | Subtraction    |
| `POST /api/v1/calculator/multiplication` | Multiplication |
| `POST /api/v1/calculator/division`       | Division       |

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

## OpenAPI / Swagger documentation

The full API contract is documented as an OpenAPI 3.0.3 spec at
[`backend/docs/openapi.yaml`](backend/docs/openapi.yaml). It covers all four endpoints, the shared
request/response/error schemas, and examples for every success and error case (including division by
zero).

To view it as interactive Swagger-style documentation, either:

- **Paste/upload it into the [Swagger Editor](https://editor.swagger.io/)** (no install required),
  or
- **Generate a static HTML preview with Redocly** (no project dependency added — run via `npx`),
  from the repo root:

  ```bash
  npx @redocly/cli build-docs backend/docs/openapi.yaml -o backend/docs/openapi.html
  open backend/docs/openapi.html
  ```

  (`open` is macOS-specific; on Linux use `xdg-open`, on Windows use `start`.) This generates a
  self-contained HTML page and is not committed to the repo — regenerate it whenever `openapi.yaml`
  changes.

To lint/validate the spec itself:

```bash
npx @redocly/cli lint backend/docs/openapi.yaml
```

## Backend design decisions

- **Standard library only.** `net/http` for the server and routing, `encoding/json` for
  (de)serialization, `testing` + `net/http/httptest` for tests. No web framework, database, or
  external dependency — appropriate for the scope of this assignment.
- **One endpoint per operation, no generic `operation` field.** The route path alone determines
  which arithmetic operation runs, per the assignment's explicit constraint.
- **Missing vs. zero operand.** `CalculatorRequest` uses `*float64` pointer fields for
  `firstOperand`/`secondOperand`. A `nil` pointer means the field was omitted (or `null`), producing
  a "required" error; a non-nil pointer — including one pointing at `0` — means the value was
  explicitly provided and is used as-is. A plain `float64` field can't make this distinction, since
  Go's JSON decoder leaves it at its zero value either way.
- **JSON error responses on every error path, including routing errors.** Go 1.22+'s enhanced
  `http.ServeMux` supports method-in-pattern routes (e.g. `"POST /path"`), but its built-in 404/405
  responses are plain text, not JSON. To guarantee a consistent `{"error": "..."}` JSON shape
  everywhere, routes are registered as plain paths (no method verb), each handler checks `r.Method`
  itself and writes a JSON 405 on mismatch, and a catch-all `"/"` pattern is registered to a
  `NotFoundHandler` that writes a JSON 404 for any unmatched path.
- **Layering.** `cmd/api` only starts the server; `internal/router` only registers routes;
  `internal/controller` handles HTTP concerns (method/JSON validation, calling the use case, shaping
  the response) and stays thin; `internal/usecase` holds pure arithmetic logic with no `net/http`
  dependency and one file per operation, independently unit-tested; `internal/dto` holds the
  request/response/error structs. `internal/domain` is left intentionally minimal — there's no
  shared domain concept beyond what `dto` and `usecase` already express at this scope.
- **Uniform use-case signature.** All four use cases share
  `func(first, second float64) (float64, error)`, even though only `Divide` can actually fail. This
  lets the controller dispatch all four operations through one shared handler function instead of
  duplicating the request-handling flow four times.
- **Status codes.** `200` on success; `400` for all input/validation errors including division by
  zero; `405` for an unsupported method on a known route; `404` for an unknown route.
- **Not implemented (by design, out of scope for this task):** Docker, a database, authentication,
  and optional operations (exponentiation, square root, percentage). The architecture (one file per
  use case, thin controllers) is structured so those operations could be added later without
  restructuring existing code.
- **OpenAPI documentation.** The spec in `backend/docs/openapi.yaml` documents the existing API
  exactly as implemented — it does not change any route, status code, or JSON field. Reusable
  `CalculatorRequest`/`CalculatorResponse`/`ErrorResponse` schemas and named examples (via
  `components/examples`) are shared across all four operations to avoid repeating the same content
  four times.
- **CORS middleware.** The frontend dev server (`http://localhost:5173`) and the backend
  (`http://localhost:8080`) run on different origins, and a JSON `POST` triggers a browser CORS
  preflight. `internal/router/router.go` wraps the mux with a small stdlib-only `withCORS`
  middleware that sets `Access-Control-Allow-*` headers on every response and answers `OPTIONS`
  preflight requests with `204 No Content`, so the frontend can call the API at all.
  `Access-Control-Allow-Origin` is set to `*` — there's no authentication or cookies in play, so a
  wildcard carries no real security downside for this assignment. It doesn't change any route,
  status code, or JSON contract for real requests.

## Frontend

### Prerequisites

- Node.js 20+ (developed and tested with Node v22.14.0) and npm.

### Setup

```bash
cd frontend
npm install
```

### Environment configuration

```bash
cp .env.example .env
```

`VITE_API_BASE_URL` controls which backend the frontend calls. It defaults to
`http://localhost:8080` if unset, so `.env` is optional for local development against the default
backend port. A real `.env` file is git-ignored; only `.env.example` is committed.

### Run the frontend

```bash
cd frontend
npm run dev
```

Opens on `http://localhost:5173` by default. The backend must be running (`go run ./cmd/api` from
`backend/`, see above) for calculations to work.

### Run tests

```bash
cd frontend
npm test
```

### Build for production

```bash
cd frontend
npm run build     # runs `tsc` then `vite build`
npm run preview   # serve the production build locally
```

### How the frontend talks to the backend

`src/services/calculatorApi.ts` is the only module that calls the backend — it maps each of the four
operations to its REST endpoint and POSTs `{firstOperand, secondOperand}` as JSON, using
`VITE_API_BASE_URL` (falling back to `http://localhost:8080`) as the base URL. It translates every
failure mode (backend validation errors, unparseable responses, network failures) into a single
`{ ok: false, error }` shape so the rest of the app never has to branch on _why_ a call failed, only
on `ok`. Because the frontend and backend run on different origins in development, the backend
includes a small CORS middleware (see "Backend design decisions" above) so these cross-origin
requests succeed.

## Frontend design decisions

- **No state-management or HTTP library.** Native `fetch` (in `services/calculatorApi.ts`) and
  React's built-in `useState` (in `pages/Calculator/hooks/useCalculator.ts`) are sufficient for a
  single-page form with one piece of shared state — Redux/Zustand/Axios/React Hook Form would be
  unjustified complexity here.
- **Page owns state, form is presentational.** `Calculator.tsx` calls `useCalculator()` and passes
  the result straight to `CalculatorForm` as props. `CalculatorForm` never calls the API or touches
  validation itself — it only renders what it's given and calls the callbacks it's given. This keeps
  `CalculatorForm` testable with plain mock props (no network mocking) and `useCalculator` testable
  in isolation with the API module mocked.
- **`CalculationOutcome` discriminated union.** `calculatorApi.calculate` returns
  `{ ok: true; result } | { ok: false; error }` instead of throwing, so the hook never needs
  `try/catch` — it just branches on `.ok`.
- **Client-side validation before any network call.** `utils/validation.ts` distinguishes an empty
  operand from a non-numeric one (`Number(trimmed)`, not `parseFloat`, so `"12abc"` is correctly
  rejected while negatives/decimals/`"0"` are accepted) and short-circuits `onSubmit` before calling
  the backend.
- **Tailwind CSS, no CSS Modules/CSS-in-JS.** Utility classes are applied directly in each component
  (no `tailwind.config.js`/`postcss.config.js` needed — Tailwind v4's Vite plugin handles content
  detection and the default theme is used as-is). A grey palette (Tailwind's built-in `gray` scale)
  is used throughout, with semantic red (`red-600`) kept for validation/error states for
  scannability.
- **Not implemented (by design):** React Router (single page), Redux/Zustand, React Hook Form,
  Axios, a UI component framework.

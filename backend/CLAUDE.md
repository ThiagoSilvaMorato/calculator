# Backend — Guidelines

- Use idiomatic Go.
- Keep controllers thin.
- Keep business logic inside use cases.
- Keep use cases independent from HTTP.
- Keep each arithmetic operation in its own use-case file.
- Prefer simple functions and explicit error handling.
- Write tests alongside the code they validate.
- Do not introduce databases, repositories, ORMs, authentication, or unnecessary infrastructure.
- Avoid unnecessary interfaces and abstractions.
- Do not add dependencies without a clear need.

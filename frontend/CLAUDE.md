# Frontend — Guidelines

- Use React and TypeScript.
- Use functional components and hooks.
- Keep components focused and reusable.
- Do not place Calculator-specific components in the global `components` directory — they belong in `src/pages/Calculator/components`.
- Keep business and state logic outside presentational components when appropriate.
- Keep API communication inside the `services` directory.
- Prefer explicit and readable TypeScript types.
- Avoid `any`.
- Write tests alongside the code they validate.
- Do not add React Router — the project has only one page.
- Avoid unnecessary dependencies and abstractions.

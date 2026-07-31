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
- Use Tailwind CSS utility classes for styling — no CSS Modules, no CSS-in-JS, no `tailwind.config.js`/`postcss.config.js` (Tailwind v4's Vite plugin handles this).
- Place constants and models/types close to what uses them: component-specific in `components/<Name>/{constants,models}.ts`, Calculator feature-wide in `pages/Calculator/{constants,models}/calculator.ts`. Only create a global `src/constants/` or `src/models/` if something is genuinely shared beyond the Calculator feature — don't create one by default.

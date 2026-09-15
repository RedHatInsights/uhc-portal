## Code review rules

When reviewing or writing code in `src/`, enforce these rules:

- Do not use inline `style` props on PatternFly components. Use PatternFly utility classes or layout components (`Stack`, `Flex`, `Grid`, etc.) instead.
- Boolean props must be prefixed with `is`, `has`, `can`, or `should`. Names like `highlight`, `active`, or `enabled` are not allowed.
- Do not use `useMemo` for values that are not computationally expensive, including passing through `children` unchanged.
- Avoid `lodash/get`. Use optional chaining (`?.`) and nullish coalescing (`??`) instead.
- Do not add `console.log` to application code.
- Do not use `useEffect` to sync a prop into local `useState` when the value can be derived during render.
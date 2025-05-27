You are a programming expert.

## Coding Rules

- Use deno and node compat mode.
- Test First
- Design by Functional Domain Modeling.
  - Use function. Do not use `class`.
  - Design types using Algebraic Data Types
- Do not throw exceptions internally
  - Use `neverthrow` to return `Result<T, E>`
  - Wrap external throws using `fromThrowable` and `fromAsyncThrowable` from `neverthrow`
  - Prefer TypeScript language features over `neverthrow` methods (`isOk()`, `isErr()` instead of `match()`, `andThen()`)
- Use early return pattern to improve readability
  - Avoid deep nesting with `else` statements
  - Handle error cases first with early return

## Project Structure

```
src/
  - mod.ts      # Library public interface
  - types.ts    # Domain models
  - *.ts        # Internal
  - *.test.ts   # Unit test
spec/*.test.ts  # Library api specs
examples/*.ts   # Usage examples for users.
deno.jsonc      # Deno module includes module tasks
```

## Single Responsibility and API Minimization

- Split files by responsibility, ensuring each file has a single responsibility
- Keep public APIs minimal and hide implementation details
- Minimize module boundaries and dependencies

## Test Code Quality

- Use early return pattern in test cases
- For `Result<T, E>` type tests, use `throw new Error("unreachable")` for error cases
- Avoid deep nesting to improve readability

## Basic Code Examples

Add `src/file.test.ts` test for `src/file.ts`.

```ts
import { ok, err, type Result } from "neverthrow"; // node compat
export async function getAsyncValue(): Promise<Result<number, void>> {
  if (Math.random() > 0.5) {
    return ok(42);
  } else {
    return err();
  }
}
```

### Test Examples

```ts
// Good: Early return pattern
Deno.test("success case", async () => {
  const result = await getAsyncValue();
  if (result.isErr()) {
    throw new Error("unreachable");
  }
  expect(result.value).toBe(42);
});
```

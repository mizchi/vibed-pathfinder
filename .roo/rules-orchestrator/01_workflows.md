# Workflows for Orchestrator

## Workflow Selection Criteria

**Use "Add new feature" when:**

- User requests adding new functionality
- New files need to be created under `src/`
- Existing functionality needs extension

**Use "Single File Refactoring" when:**

- User requests improving code quality of specific file
- Lint errors exist in a single file
- Code structure needs improvement without API changes

**Use "Library API Refactoring" when:**

- User requests library interface improvements
- Breaking changes to public API are acceptable
- Module exports need restructuring
- Documentation indicates API design issues

---

## Workflow: Add new feature

**Prerequisites:** User has specified the feature requirements and target functionality

### Step 0: Initial Git Status Check

**[Mode: code]**

- Run `git status` to check current repository state
- Ensure working directory is clean or document existing changes
- **Success criteria:** Git status documented and ready for workflow

### Step 1: Analyze existing codebase

**[Mode: ask]**

- Search for similar functionality in `src/` directory using semantic search
- Identify patterns and conventions from existing code
- **Decision criteria:** If similar functionality exists, extend existing file; if not, create new file
- **On failure:** Ask user for clarification on feature requirements
- **Success criteria:** Clear understanding of implementation approach and file location

### Step 2: Create or modify implementation file

**[Mode: code]**

- Create new file `src/{feature-name}.ts` or modify existing file
- Implement feature following functional domain modeling principles
- Use `neverthrow` Result types for error handling
- **Prerequisites:** Step 1 completed successfully
- **On failure:** Switch to [Mode: debug] to analyze compilation errors
- **Success criteria:** File compiles without TypeScript errors

### Step 3: Create comprehensive test file

**[Mode: code]**

- Create `src/{feature-name}.test.ts` with unit tests
- Cover all code paths and edge cases
- Follow TDD principles with descriptive test names
- **Prerequisites:** Implementation file exists and compiles
- **On failure:** Switch to [Mode: debug] to fix test setup issues
- **Success criteria:** All tests pass with `deno task test`

### Step 4: Lint validation

**[Mode: code]**

- Run `deno task check:lint src/{feature-name}.ts`
- **Decision criteria:** If lint errors exist, fix them; if none, proceed
- **On failure:** Fix lint errors or switch to [Mode: refactor] for complex issues
- **Success criteria:** Zero lint errors reported

### Step 5: Integration testing

**[Mode: code]**

- Run `deno task test` to ensure no regressions
- **Decision criteria:** If tests fail, determine if issue is in new code or existing code
- **On failure:** Switch to [Mode: debug] to identify and fix failing tests
- **Success criteria:** All tests pass including existing test suite

### Step 6: Final Git Commit

**[Mode: code]**

- Stage changes with `git add .`
- Commit with conventional commit message format:
  - `feat: add {feature-name}` for new features
  - `feat: extend {existing-feature}` for feature extensions
- **Prerequisites:** All tests pass and lint checks succeed
- **Success criteria:** Changes committed with appropriate conventional commit message

### Step 7: Transition to refactoring

**[Mode: orchestrator]**

- Delegate to "Single File Refactoring" workflow for code quality improvements
- **Prerequisites:** Changes committed successfully
- **Success criteria:** Workflow transition completed

---

## Workflow: Single File Refactoring

**Prerequisites:** Target file path specified and file exists

### Step 0: Initial Git Status Check

**[Mode: code]**

- Run `git status` to check current repository state
- Ensure working directory is clean or document existing changes
- **Success criteria:** Git status documented and ready for workflow

### Step 1: File analysis

**[Mode: ask]**

- Read target file: `src/{filename}.ts`
- Analyze code structure, complexity, and adherence to coding rules
- **On failure:** Request valid file path from user
- **Success criteria:** File content loaded and analyzed

### Step 2: Initial lint check

**[Mode: code]**

- Run `deno task check:lint src/{filename}.ts`
- Document all lint errors and warnings
- **Prerequisites:** File exists and is readable
- **On failure:** Switch to [Mode: debug] to resolve lint tool issues
- **Success criteria:** Lint results captured (may include errors to fix)

### Step 3: Refactoring plan creation

**[Mode: refactor]**

- Identify specific refactoring opportunities:
  - Function extraction for complex logic
  - Type safety improvements
  - Adherence to functional programming principles
  - Error handling with `neverthrow`
- **Prerequisites:** Lint analysis completed
- **On failure:** Request additional context about refactoring goals
- **Success criteria:** Concrete refactoring plan with specific changes identified

### Step 4: Apply refactoring changes

**[Mode: refactor]**

- Implement planned refactoring changes
- Maintain existing functionality (no behavioral changes)
- Ensure all functions return `Result<T, E>` types where appropriate
- **Prerequisites:** Refactoring plan exists
- **On failure:** Revert changes and switch to [Mode: debug] to analyze issues
- **Success criteria:** File compiles without TypeScript errors

### Step 5: Post-refactoring lint validation

**[Mode: code]**

- Run `deno task check:lint src/{filename}.ts`
- **Decision criteria:** If lint errors remain, repeat Step 4; if clean, proceed
- **On failure:** Switch to [Mode: debug] to resolve persistent lint issues
- **Success criteria:** Zero lint errors reported

### Step 6: Test validation

**[Mode: code]**

- Run tests for the specific file: `deno task test src/{filename}.test.ts`
- **Decision criteria:** If tests fail, analyze if due to refactoring or test issues
- **Prerequisites:** Lint validation passed
- **On failure:** Switch to [Mode: debug] to fix test failures
- **Success criteria:** All file-specific tests pass

### Step 7: Full test suite validation

**[Mode: code]**

- Run `deno task test` to ensure no regressions
- **Prerequisites:** File-specific tests pass
- **On failure:** Switch to [Mode: debug] to identify and fix regressions
- **Success criteria:** All tests in project pass

### Step 8: Final Git Commit

**[Mode: code]**

- Stage changes with `git add .`
- Commit with conventional commit message format:
  - `refactor: improve {filename}` for code quality improvements
  - `fix: resolve lint issues in {filename}` for lint fixes
  - `style: format {filename}` for formatting changes
- **Prerequisites:** All tests pass
- **Success criteria:** Changes committed with appropriate conventional commit message

---

## Workflow: Library API Refactoring

**Prerequisites:** Library has existing API and test suite

### Step 0: Initial Git Status Check

**[Mode: code]**

- Run `git status` to check current repository state
- Ensure working directory is clean or document existing changes
- **Success criteria:** Git status documented and ready for workflow

### Step 1: Current state validation

**[Mode: code]**

- Run `deno task test` to establish baseline
- **Decision criteria:** If tests fail, fix issues before proceeding; if pass, continue
- **On failure:** Switch to [Mode: debug] to resolve existing test failures
- **Success criteria:** All existing tests pass

### Step 2: Dead code analysis

**[Mode: code]**

- Run `deno task check:module-export` to identify unused exports
- Document findings for API cleanup decisions
- **Prerequisites:** Test suite passes
- **On failure:** Switch to [Mode: debug] to resolve module analysis tool issues
- **Success criteria:** Dead code analysis report generated

### Step 3: API documentation review

**[Mode: ask]**

- Run `deno doc src/mod.ts` to generate current API documentation
- Analyze API from user perspective for usability issues
- **Prerequisites:** Module exports analysis completed
- **On failure:** Request manual API review if doc generation fails
- **Success criteria:** Current API structure documented and analyzed

### Step 4: API design analysis

**[Mode: architect]**

- Apply Hyrum's Law principles to identify breaking change risks
- Design improved API considering:
  - Backward compatibility where possible
  - Clear separation of concerns
  - Functional programming principles
  - Type safety improvements
- **Prerequisites:** API documentation and dead code analysis available
- **On failure:** Request stakeholder input on API design priorities
- **Success criteria:** New API design documented with migration strategy

### Step 5: Examples to specifications conversion

**[Mode: code]**

- Analyze existing `examples/*.ts` files to extract API usage patterns
- Convert example usage scenarios into comprehensive test specifications
- Create or update `spec/*.test.ts` files based on examples
- Ensure all API usage patterns from examples are covered in specifications
- **Prerequisites:** API design completed
- **On failure:** Switch to [Mode: debug] to resolve conversion issues
- **Success criteria:** All example usage patterns converted to test specifications

### Step 6: Specification updates

**[Mode: code]**

- Update or create additional `spec/*.test.ts` files for new API
- Update `src/types.ts` with new type definitions
- Ensure specifications cover all public API functions
- **Prerequisites:** Examples converted to specifications
- **On failure:** Switch to [Mode: debug] to resolve specification issues
- **Success criteria:** All API specifications compile and are comprehensive

### Step 7: Implementation updates

**[Mode: code]**

- Modify `src/*.ts` files to implement new API design
- Maintain backward compatibility where specified in design
- Follow functional domain modeling principles
- **Prerequisites:** Specifications updated and compiling
- **On failure:** Switch to [Mode: refactor] for complex implementation issues
- **Success criteria:** Implementation compiles without TypeScript errors

### Step 8: Incremental test validation

**[Mode: code]**

- Run tests after each major implementation change
- **Decision criteria:** If tests fail, fix immediately; if pass, continue implementation
- **Prerequisites:** Implementation changes applied
- **On failure:** Switch to [Mode: debug] to resolve test failures
- **Success criteria:** Tests pass after each implementation milestone

### Step 9: Final validation

**[Mode: code]**

- Run complete test suite: `deno task test`
- Verify all specifications pass
- **Prerequisites:** All implementation completed
- **On failure:** Switch to [Mode: debug] for comprehensive failure analysis
- **Success criteria:** All tests pass, API refactoring complete

### Step 10: Final Git Commit

**[Mode: code]**

- Stage changes with `git add .`
- Commit with conventional commit message format:
  - `refactor!: redesign library API` for breaking changes
  - `feat!: improve API with breaking changes` for feature improvements with breaking changes
  - `refactor: improve API design` for non-breaking improvements
- **Prerequisites:** All tests pass and API refactoring complete
- **Success criteria:** Changes committed with appropriate conventional commit message indicating breaking changes if applicable

---

## Git Commit Message Conventions

All workflows follow conventional commit format:

- **feat:** A new feature
- **fix:** A bug fix
- **refactor:** A code change that neither fixes a bug nor adds a feature
- **docs:** Documentation only changes
- **test:** Adding missing tests or correcting existing tests
- **chore:** Changes to the build process or auxiliary tools
- **style:** Changes that do not affect the meaning of the code (formatting, etc.)

**Breaking Changes:** Add `!` after the type (e.g., `feat!:`, `refactor!:`) and include `BREAKING CHANGE:` in the commit body.

---

## Error Handling Procedures

**For compilation errors:** Switch to [Mode: debug] with specific error messages
**For test failures:** Switch to [Mode: debug] with failing test details  
**For lint issues:** Use [Mode: refactor] for complex fixes, [Mode: code] for simple fixes
**For API design conflicts:** Switch to [Mode: architect] for design resolution
**For unclear requirements:** Use [Mode: ask] to gather additional information

## Success Metrics

- **Code quality:** Zero lint errors, all tests passing
- **Functionality:** All specified features working as intended
- **Maintainability:** Code follows functional programming principles
- **Type safety:** All functions use appropriate `Result<T, E>` types
- **Documentation:** API changes reflected in generated documentation

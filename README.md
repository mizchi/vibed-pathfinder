# Vibed Pathfinder

A **vibe coding practice repository** focused on **public API organization workflow**. This project demonstrates clean architecture principles, functional programming patterns, and systematic API refinement through iterative development.

## 🎯 Project Purpose

This repository serves as a **vibe coding practice environment** with primary emphasis on:

- **Public API organization workflow** - The main focus of this project
- Clean architecture implementation using functional domain modeling
- Test-driven development (TDD) practices
- Dead code elimination and API minimization
- Type-safe error handling with Result patterns

## 🏗️ Organized API Structure

The project has been systematically refined to provide a **minimal, clean public API**:

### Core Functions (3 Main Functions)

```typescript
import { buildGraph, findPaths, analyzeGraph } from "./src/mod.ts";
```

#### 1. `buildGraph(edges: Edge[]): Result<Graph, GraphError>`

Constructs a validated graph from edge definitions with automatic validation.

#### 2. `findPaths(graph: Graph, start: string, target: string): Result<ShortestPath, PathError>`

Finds the shortest path between two nodes using Dijkstra's algorithm.

#### 3. `analyzeGraph(graph: Graph): Result<GraphAnalysis, GraphError>`

Analyzes graph properties including connectivity, density, and connected components.

### Type Definitions

```typescript
// Core domain types
export type { Edge, Graph, Node, ShortestPath, Weight } from "./types.ts";

// Error types (Algebraic Data Types)
export type { GraphError, PathError } from "./types.ts";

// Analysis results
export type { GraphAnalysis } from "./types.ts";

// Type guard functions
export { isValidNode, isValidWeight } from "./types.ts";
```

## 📋 API Organization Achievements

### ✅ Dead Code Elimination

- **Removed unused exports**: 4 unused exports eliminated
- **Deleted unused files**: `src/graph-utils.ts` completely removed
- **Hidden internal implementation**: PriorityQueue-related types made private

### ✅ Internal Implementation Hiding

- Priority queue implementation details are now internal-only
- Graph building utilities are encapsulated within core functions
- Validation logic is integrated into the main API functions

### ✅ New Features Added

- **GraphAnalysis functionality**: Density calculation and connected component analysis
- **Enhanced error types**: Clear separation between GraphError and PathError
- **Type-safe operations**: Full Result<T, E> pattern implementation

## 🚀 Usage Examples

### Basic Usage

```typescript
import { buildGraph, findPaths, type Edge } from "./src/mod.ts";

// Define graph edges
const edges: Edge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
];

// Build graph with automatic validation
const graphResult = buildGraph(edges);
if (graphResult.isErr()) {
  console.error("Graph construction failed:", graphResult.error);
  Deno.exit(1);
}

// Find shortest path
const pathResult = findPaths(graphResult.value, "A", "E");
if (pathResult.isErr()) {
  console.error("Path finding failed:", pathResult.error);
  Deno.exit(1);
}

const shortestPath = pathResult.value;
console.log(`Path: ${shortestPath.path.join(" -> ")}`);
console.log(`Distance: ${shortestPath.distance}`);
```

### Graph Analysis

```typescript
import { analyzeGraph } from "./src/mod.ts";

const analysisResult = analyzeGraph(graph);
if (analysisResult.isOk()) {
  const analysis = analysisResult.value;
  console.log(`Nodes: ${analysis.nodeCount}`);
  console.log(`Edges: ${analysis.edgeCount}`);
  console.log(`Connected: ${analysis.isConnected}`);
  console.log(`Density: ${analysis.density.toFixed(3)}`);
  console.log(`Components: ${analysis.components.length}`);
}
```

### Error Handling with Early Return Pattern

```typescript
function findShortestAmongMultiple(
  edges: Edge[],
  start: string,
  targets: string[]
): ShortestPath | null {
  // Early return: Graph construction error
  const graphResult = buildGraph(edges);
  if (graphResult.isErr()) {
    console.log(`Graph construction error: ${graphResult.error.type}`);
    return null;
  }

  const graph = graphResult.value;
  let shortestPath: ShortestPath | null = null;

  for (const target of targets) {
    const pathResult = findPaths(graph, start, target);

    // Early return: Skip on error
    if (pathResult.isErr()) {
      console.log(`${start} -> ${target}: ${pathResult.error.type}`);
      continue;
    }

    const path = pathResult.value;
    if (!shortestPath || path.distance < shortestPath.distance) {
      shortestPath = path;
    }
  }

  return shortestPath;
}
```

## 🛠️ Installation & Setup

### Prerequisites

- [Deno](https://deno.land/) runtime

### Running Examples

```bash
# Run the comprehensive usage example
deno run examples/usage-example.ts

# Run tests
deno task test

# Run tests with coverage
deno task test:cov

# Lint code
deno task test:lint

# Check for dead code
deno task check:module-export
```

## 🧪 Development Workflow

### Test-Driven Development (TDD)

- **Test-first approach**: Write tests before implementation
- **Early return pattern**: Simplified error handling in tests
- **Result type testing**: Use `throw new Error("unreachable")` for error cases

### Functional Programming Principles

- **No classes**: Pure function-based design
- **Algebraic Data Types**: Type-safe error handling
- **No internal exceptions**: All errors returned as Result<T, E>
- **Immutable data structures**: Functional approach throughout

### API Design Philosophy

- **Minimal public surface**: Only 3 core functions exposed
- **Single responsibility**: Each function has one clear purpose
- **Type safety**: Full TypeScript coverage with strict types
- **Clean architecture**: Clear separation of concerns

## 📁 Project Structure

```
src/
├── mod.ts              # Public API interface (3 main functions)
├── types.ts            # Domain models and type definitions
├── graph-builder.ts    # Graph construction logic
├── path-finder.ts      # Shortest path algorithms
├── graph-analyzer.ts   # Graph analysis functionality
├── priority-queue.ts   # Internal priority queue (hidden)
├── graph-validator.ts  # Internal validation logic
└── *.test.ts          # Unit tests for each module

spec/
└── api.test.ts        # Public API integration tests

examples/
└── usage-example.ts   # Comprehensive usage examples

docs/
├── dead-code-analysis-report.md  # Dead code elimination report
└── path-algorithm.md             # Algorithm documentation
```

## 🎯 API Organization Workflow Results

### Before Refactoring

- **Multiple scattered functions**: Complex multi-step API
- **Exposed internal details**: PriorityQueue types in public API
- **Dead code present**: Unused exports and files
- **Inconsistent error handling**: Mixed error types

### After Refactoring

- **3 clean functions**: `buildGraph`, `findPaths`, `analyzeGraph`
- **Hidden implementation**: Internal details properly encapsulated
- **Zero dead code**: All unused exports and files removed
- **Consistent error handling**: Clear GraphError and PathError types
- **Enhanced functionality**: New graph analysis capabilities

## 🏆 Key Achievements

1. **API Minimization**: Reduced public API to 3 essential functions
2. **Dead Code Elimination**: Removed 4 unused exports and 1 unused file
3. **Internal Implementation Hiding**: Encapsulated all implementation details
4. **Enhanced Type Safety**: Full Result<T, E> pattern implementation
5. **New Feature Addition**: GraphAnalysis functionality with density and connectivity analysis
6. **Clean Architecture**: Functional domain modeling with clear separation of concerns

---

**This project demonstrates the complete workflow of organizing and refining a public API through systematic analysis, dead code elimination, and clean architecture principles.**

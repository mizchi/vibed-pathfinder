import { expect } from "@std/expect";
import { buildGraph } from "./graph-builder.ts";
import { findPaths } from "./path-finder.ts";
import type { Edge, PathError } from "./types.ts";

// テスト用のデータセット
const basicEdges: Edge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
];

const singleNodeEdges: Edge[] = [
  { from: "A", to: "A", weight: 0 },
];

const disconnectedGraphEdges: Edge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: "C", to: "D", weight: 2 },
];

Deno.test("findPaths", async (t) => {
  await t.step("基本的な最短経路計算が正しく動作する", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "E");
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const { path, distance } = result.value;
        expect(path).toEqual(["A", "B", "D", "E"]);
        expect(distance).toBe(11);
      }
    }
  });

  await t.step("スタートノード自身への経路を正しく取得する", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "A");
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const { path, distance } = result.value;
        expect(path).toEqual(["A"]);
        expect(distance).toBe(0);
      }
    }
  });

  await t.step("中間ノードへの経路を正しく取得する", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "C");
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const { path, distance } = result.value;
        expect(path).toEqual(["A", "C"]);
        expect(distance).toBe(2);
      }
    }
  });

  await t.step("存在しない開始ノードでNodeNotFoundエラーを返す", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "Z", "A");
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error: PathError = result.error;
        expect(error.type).toBe("NodeNotFound");
        if (error.type === "NodeNotFound") {
          expect(error.node).toBe("Z");
        }
      }
    }
  });

  await t.step("存在しないターゲットノードでNodeNotFoundエラーを返す", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "Z");
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error: PathError = result.error;
        expect(error.type).toBe("NodeNotFound");
        if (error.type === "NodeNotFound") {
          expect(error.node).toBe("Z");
        }
      }
    }
  });

  await t.step("到達不可能なノードでNoPathエラーを返す", () => {
    const graphResult = buildGraph(disconnectedGraphEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "C");
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error: PathError = result.error;
        expect(error.type).toBe("NoPath");
        if (error.type === "NoPath") {
          expect(error.from).toBe("A");
          expect(error.to).toBe("C");
        }
      }
    }
  });

  await t.step("空グラフでNodeNotFoundエラーを返す", () => {
    const emptyGraph = new Map();
    const result = findPaths(emptyGraph, "A", "B");
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      const error: PathError = result.error;
      expect(error.type).toBe("NodeNotFound");
      if (error.type === "NodeNotFound") {
        expect(error.node).toBe("A");
      }
    }
  });

  await t.step("数値ノードでも正しく動作する", () => {
    const numericEdges: Edge[] = [
      { from: 1, to: 2, weight: 5 },
      { from: 2, to: 3, weight: 3 },
    ];

    const graphResult = buildGraph(numericEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, 1, 3);
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const { path, distance } = result.value;
        expect(path).toEqual([1, 2, 3]);
        expect(distance).toBe(8);
      }
    }
  });

  await t.step("単一ノードグラフで正しく動作する", () => {
    const graphResult = buildGraph(singleNodeEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "A");
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const { path, distance } = result.value;
        expect(path).toEqual(["A"]);
        expect(distance).toBe(0);
      }
    }
  });
});

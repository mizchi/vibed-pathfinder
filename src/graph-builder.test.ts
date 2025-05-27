import { expect } from "@std/expect";
import { buildGraph } from "./graph-builder.ts";
import type { Edge, GraphError } from "./types.ts";

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

const invalidNodeEdges: Edge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: null as unknown as string, to: "C", weight: 2 }, // テスト用の無効なノード型
];

const invalidWeightEdges: Edge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: "B", to: "C", weight: -1 }, // 負の重み
];

const nanWeightEdges: Edge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: "B", to: "C", weight: NaN }, // NaN重み
];

Deno.test("buildGraph", async (t) => {
  await t.step("正常なエッジリストからグラフを作成できる", () => {
    const result = buildGraph(basicEdges);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const graph = result.value;
      expect(graph.size).toBe(5); // A, B, C, D, E の5つのノード
      expect(graph.has("A")).toBe(true);
      expect(graph.has("B")).toBe(true);
      expect(graph.has("C")).toBe(true);
      expect(graph.has("D")).toBe(true);
      expect(graph.has("E")).toBe(true);

      // Aからの隣接エッジを確認
      const aEdges = graph.get("A");
      expect(aEdges).toBeDefined();
      expect(aEdges!.length).toBe(2);
      expect(aEdges!.some((e: Edge) => e.to === "B" && e.weight === 4)).toBe(
        true,
      );
      expect(aEdges!.some((e: Edge) => e.to === "C" && e.weight === 2)).toBe(
        true,
      );
    }
  });

  await t.step("空のエッジリストでEmptyGraphエラーを返す", () => {
    const result = buildGraph([]);
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      const error: GraphError = result.error;
      expect(error.type).toBe("EmptyGraph");
    }
  });

  await t.step("無効なノード型でInvalidGraphエラーを返す", () => {
    const result = buildGraph(invalidNodeEdges);
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      const error: GraphError = result.error;
      expect(error.type).toBe("InvalidGraph");
      if (error.type === "InvalidGraph") {
        expect(error.reason).toBe("Invalid node type");
      }
    }
  });

  await t.step("負の重みでInvalidGraphエラーを返す", () => {
    const result = buildGraph(invalidWeightEdges);
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      const error: GraphError = result.error;
      expect(error.type).toBe("InvalidGraph");
      if (error.type === "InvalidGraph") {
        expect(error.reason).toBe("Invalid weight: negative value");
      }
    }
  });

  await t.step("NaN重みでInvalidGraphエラーを返す", () => {
    const result = buildGraph(nanWeightEdges);
    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      const error: GraphError = result.error;
      expect(error.type).toBe("InvalidGraph");
      if (error.type === "InvalidGraph") {
        expect(error.reason).toBe("Invalid weight: NaN or Infinity");
      }
    }
  });

  await t.step("数値ノードでも正常に動作する", () => {
    const numericEdges: Edge[] = [
      { from: 1, to: 2, weight: 5 },
      { from: 2, to: 3, weight: 3 },
    ];

    const result = buildGraph(numericEdges);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const graph = result.value;
      expect(graph.has(1)).toBe(true);
      expect(graph.has(2)).toBe(true);
      expect(graph.has(3)).toBe(true);
    }
  });

  await t.step("重複エッジを正しく処理する", () => {
    const duplicateEdges: Edge[] = [
      { from: "A", to: "B", weight: 1 },
      { from: "A", to: "B", weight: 2 },
    ];

    const result = buildGraph(duplicateEdges);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const graph = result.value;
      const aEdges = graph.get("A");
      expect(aEdges!.length).toBe(2);
    }
  });

  await t.step("単一ノードグラフを正しく作成する", () => {
    const result = buildGraph(singleNodeEdges);
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const graph = result.value;
      expect(graph.size).toBe(1);
      expect(graph.has("A")).toBe(true);
    }
  });
});

import { expect } from "@std/expect";
import { analyzeGraph } from "./graph-analyzer.ts";
import { buildGraph } from "./graph-builder.ts";
import type { Edge } from "./types.ts";

// =============================================================================
// テスト用データセット
// =============================================================================

const basicEdges: Edge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
];

const disconnectedEdges: Edge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: "C", to: "D", weight: 1 },
];

const simpleEdges: Edge[] = [
  { from: "X", to: "Y", weight: 5 },
];

// =============================================================================
// グラフ分析機能テスト
// =============================================================================

Deno.test("analyzeGraph - 基本的なグラフ分析", async (t) => {
  await t.step("連結グラフの分析", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const analysisResult = analyzeGraph(graph);

      expect(analysisResult.isOk()).toBe(true);

      if (analysisResult.isOk()) {
        const analysis = analysisResult.value;

        // ノード数の検証（A, B, C, D, E = 5ノード）
        expect(analysis.nodeCount).toBe(5);

        // エッジ数の検証
        expect(analysis.edgeCount).toBe(7);

        // 連結性の検証
        expect(analysis.isConnected).toBe(true);

        // 連結成分の検証（1つの成分）
        expect(analysis.components.length).toBe(1);
        expect(analysis.components[0].length).toBe(5);

        // 密度の検証（0 < density < 1）
        expect(analysis.density).toBeGreaterThan(0);
        expect(analysis.density).toBeLessThan(1);
      }
    }
  });

  await t.step("非連結グラフの分析", () => {
    const graphResult = buildGraph(disconnectedEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const analysisResult = analyzeGraph(graph);

      expect(analysisResult.isOk()).toBe(true);

      if (analysisResult.isOk()) {
        const analysis = analysisResult.value;

        // ノード数の検証（A, B, C, D = 4ノード）
        expect(analysis.nodeCount).toBe(4);

        // エッジ数の検証
        expect(analysis.edgeCount).toBe(2);

        // 非連結性の検証
        expect(analysis.isConnected).toBe(false);

        // 連結成分の検証（2つの成分）
        expect(analysis.components.length).toBe(2);
        expect(analysis.components[0].length).toBe(2);
        expect(analysis.components[1].length).toBe(2);
      }
    }
  });

  await t.step("単純グラフの分析", () => {
    const graphResult = buildGraph(simpleEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const analysisResult = analyzeGraph(graph);

      expect(analysisResult.isOk()).toBe(true);

      if (analysisResult.isOk()) {
        const analysis = analysisResult.value;

        // ノード数の検証（X, Y = 2ノード）
        expect(analysis.nodeCount).toBe(2);

        // エッジ数の検証
        expect(analysis.edgeCount).toBe(1);

        // 連結性の検証
        expect(analysis.isConnected).toBe(true);

        // 連結成分の検証（1つの成分）
        expect(analysis.components.length).toBe(1);
        expect(analysis.components[0].length).toBe(2);

        // 密度の検証（1エッジ / 2ノード = 0.5）
        expect(analysis.density).toBe(0.5);
      }
    }
  });
});

// =============================================================================
// エラーハンドリングテスト
// =============================================================================

Deno.test("analyzeGraph - エラーハンドリング", async (t) => {
  await t.step("空のグラフでエラーを返す", () => {
    const emptyGraph = new Map();
    const result = analyzeGraph(emptyGraph);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error.type).toBe("EmptyGraph");
    }
  });
});

// =============================================================================
// 密度計算の詳細テスト
// =============================================================================

Deno.test("analyzeGraph - 密度計算", async (t) => {
  await t.step("完全グラフの密度", () => {
    // 3ノードの完全グラフ（すべてのノードが相互接続）
    const completeEdges: Edge[] = [
      { from: "A", to: "B", weight: 1 },
      { from: "A", to: "C", weight: 1 },
      { from: "B", to: "A", weight: 1 },
      { from: "B", to: "C", weight: 1 },
      { from: "C", to: "A", weight: 1 },
      { from: "C", to: "B", weight: 1 },
    ];

    const graphResult = buildGraph(completeEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const analysisResult = analyzeGraph(graph);

      expect(analysisResult.isOk()).toBe(true);

      if (analysisResult.isOk()) {
        const analysis = analysisResult.value;

        // 完全グラフの密度は1.0
        expect(analysis.density).toBe(1.0);
      }
    }
  });

  await t.step("単一ノードグラフの密度", () => {
    // 自己ループのみのグラフ
    const selfLoopEdges: Edge[] = [
      { from: "A", to: "A", weight: 1 },
    ];

    const graphResult = buildGraph(selfLoopEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const analysisResult = analyzeGraph(graph);

      expect(analysisResult.isOk()).toBe(true);

      if (analysisResult.isOk()) {
        const analysis = analysisResult.value;

        // 単一ノードの密度は0（分母が0になるため）
        expect(analysis.density).toBe(0);
      }
    }
  });
});

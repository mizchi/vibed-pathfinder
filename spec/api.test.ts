/**
 * 公開API仕様テスト - ユーザー視点での使用方法を説明
 *
 * このファイルは、ライブラリの公開APIの仕様をユーザー視点で記述します。
 * 主な目的：
 * - 公開APIの正しい使用方法を示す
 * - 実用的なシナリオでの動作を検証
 * - エラーハンドリングの仕様を明確化
 * - 新しいAPIの特徴（2ステップワークフロー）を説明
 */

import { expect } from "@std/expect";
import {
  buildGraph,
  type Edge,
  findPaths,
  type GraphError,
  type PathError,
} from "../src/mod.ts";

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

const cityEdges: Edge[] = [
  { from: "東京", to: "横浜", weight: 30 },
  { from: "東京", to: "千葉", weight: 40 },
  { from: "東京", to: "大宮", weight: 35 },
  { from: "横浜", to: "千葉", weight: 60 },
  { from: "大宮", to: "千葉", weight: 50 },
  { from: "東京", to: "名古屋", weight: 350 },
  { from: "名古屋", to: "大阪", weight: 180 },
  { from: "大阪", to: "京都", weight: 50 },
  { from: "京都", to: "名古屋", weight: 140 },
  { from: "東京", to: "大阪", weight: 500 },
];

// =============================================================================
// 公開API仕様テスト: buildGraph
// =============================================================================

Deno.test("公開API仕様 - buildGraph", async (t) => {
  await t.step("エッジリストからグラフを作成する", () => {
    const result = buildGraph(basicEdges);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const graph = result.value;
      // グラフが正しく作成されることを検証（隣接リスト形式では from ノードのみが含まれる）
      expect(graph.size).toBeGreaterThan(0);
      expect(graph.has("A")).toBe(true);
      expect(graph.has("B")).toBe(true);
      expect(graph.has("C")).toBe(true);
      expect(graph.has("D")).toBe(true);
      // "E" は終点にしか現れないため、隣接リストには含まれない
    }
  });

  await t.step("自動バリデーション - 空のエッジリストでエラーを返す", () => {
    const result = buildGraph([]);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error.type).toBe("EmptyGraph");
    }
  });

  await t.step("日本語ノード名でも正常に動作する", () => {
    const result = buildGraph(cityEdges);

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const graph = result.value;
      expect(graph.has("東京")).toBe(true);
      expect(graph.has("横浜")).toBe(true);
      expect(graph.has("大阪")).toBe(true);
    }
  });
});

// =============================================================================
// 公開API仕様テスト: findPaths
// =============================================================================

Deno.test("公開API仕様 - findPaths", async (t) => {
  await t.step("最短経路と距離を正しく取得する", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;

      // A -> C への最短経路
      const pathToCResult = findPaths(graph, "A", "C");
      expect(pathToCResult.isOk()).toBe(true);

      if (pathToCResult.isOk()) {
        const { path, distance } = pathToCResult.value;
        expect(path).toEqual(["A", "C"]);
        expect(distance).toBe(2);
      }

      // A -> E への最短経路
      const pathToEResult = findPaths(graph, "A", "E");
      expect(pathToEResult.isOk()).toBe(true);

      if (pathToEResult.isOk()) {
        const { path, distance } = pathToEResult.value;
        expect(path).toEqual(["A", "B", "D", "E"]);
        expect(distance).toBe(11);
      }
    }
  });

  await t.step("存在しないスタートノードでエラーを返す", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "Z", "A");

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.type).toBe("NodeNotFound");
        if (result.error.type === "NodeNotFound") {
          expect(result.error.node).toBe("Z");
        }
      }
    }
  });

  await t.step("存在しないターゲットノードでエラーを返す", () => {
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, "A", "Z");

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.type).toBe("NodeNotFound");
        if (result.error.type === "NodeNotFound") {
          expect(result.error.node).toBe("Z");
        }
      }
    }
  });

  await t.step("スタートノード自身への経路を取得する", () => {
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

  await t.step("数値ノードでも正常に動作する", () => {
    const numericEdges: Edge[] = [
      { from: 1, to: 2, weight: 10 },
      { from: 2, to: 3, weight: 20 },
      { from: 1, to: 3, weight: 25 },
    ];

    const graphResult = buildGraph(numericEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;
      const result = findPaths(graph, 1, 3);

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const { path, distance } = result.value;
        expect(path).toEqual([1, 3]); // 1->3 直接ルートの方が短い
        expect(distance).toBe(25);
      }
    }
  });
});

// =============================================================================
// 実用的なシナリオテスト
// =============================================================================

Deno.test("実用的なシナリオ - 都市間経路探索", async (t) => {
  await t.step("都市間の最短経路を計算する", () => {
    const graphResult = buildGraph(cityEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;

      // 東京から横浜への最短経路
      const toYokohamaResult = findPaths(graph, "東京", "横浜");
      expect(toYokohamaResult.isOk()).toBe(true);

      if (toYokohamaResult.isOk()) {
        const { path, distance } = toYokohamaResult.value;
        expect(path).toEqual(["東京", "横浜"]);
        expect(distance).toBe(30);
      }

      // 東京から大阪への最短経路
      const toOsakaResult = findPaths(graph, "東京", "大阪");
      expect(toOsakaResult.isOk()).toBe(true);

      if (toOsakaResult.isOk()) {
        const { path, distance } = toOsakaResult.value;
        // 東京->大阪 直接(500km) vs 東京->名古屋->大阪(530km)
        expect(distance).toBe(500);
        expect(path).toEqual(["東京", "大阪"]);
      }
    }
  });

  await t.step("複数の経路を同時に計算する", () => {
    const graphResult = buildGraph(cityEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;

      // 複数の目的地への経路を一度に計算
      const destinations = ["横浜", "千葉", "大宮", "名古屋"];
      const paths = destinations.map((dest) => {
        const pathResult = findPaths(graph, "東京", dest);
        expect(pathResult.isOk()).toBe(true);
        return pathResult.isOk() ? pathResult.value : null;
      }).filter((path) => path !== null);

      expect(paths.length).toBe(destinations.length);

      // 各経路が正しく計算されていることを検証
      const yokohamaPath = paths.find((p) =>
        p!.path[p!.path.length - 1] === "横浜"
      );
      expect(yokohamaPath).toBeDefined();
      expect(yokohamaPath!.distance).toBe(30);
    }
  });
});

// =============================================================================
// 統合テスト - 完全なワークフロー
// =============================================================================

Deno.test("統合テスト - 完全なAPIワークフロー", async (t) => {
  await t.step("グラフ作成 → 経路探索の完全なフロー", () => {
    // ステップ1: グラフ作成
    const graphResult = buildGraph(basicEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;

      // ステップ2: 複数の経路を取得
      const allTargets = ["B", "C", "D", "E"];
      const allPaths = allTargets.map((target) => {
        const pathResult = findPaths(graph, "A", target);
        expect(pathResult.isOk()).toBe(true);
        return pathResult.isOk() ? pathResult.value : null;
      }).filter((path) => path !== null);

      expect(allPaths.length).toBe(allTargets.length);

      // 各経路の妥当性を検証
      allPaths.forEach((path) => {
        expect(path!.path.length).toBeGreaterThan(0);
        expect(path!.path[0]).toBe("A"); // すべての経路がAから始まる
        expect(path!.distance).toBeGreaterThanOrEqual(0);
      });

      // 具体的な経路の検証
      const pathToB = allPaths.find((p) => p!.path[p!.path.length - 1] === "B");
      expect(pathToB!.distance).toBe(4);
      expect(pathToB!.path).toEqual(["A", "B"]);

      const pathToE = allPaths.find((p) => p!.path[p!.path.length - 1] === "E");
      expect(pathToE!.distance).toBe(11);
      expect(pathToE!.path).toEqual(["A", "B", "D", "E"]);
    }
  });

  await t.step("エラーハンドリングの統合テスト", () => {
    // 空のグラフでのエラー
    const emptyResult = buildGraph([]);
    expect(emptyResult.isErr()).toBe(true);

    if (emptyResult.isErr()) {
      expect(emptyResult.error.type).toBe("EmptyGraph");
    }

    // 正常なグラフでの存在しないノードエラー
    const validGraphResult = buildGraph([{ from: "A", to: "B", weight: 1 }]);
    expect(validGraphResult.isOk()).toBe(true);

    if (validGraphResult.isOk()) {
      const graph = validGraphResult.value;

      // 存在しないスタートノード
      const invalidStartResult = findPaths(graph, "Z", "B");
      expect(invalidStartResult.isErr()).toBe(true);

      if (invalidStartResult.isErr()) {
        expect(invalidStartResult.error.type).toBe("NodeNotFound");
        if (invalidStartResult.error.type === "NodeNotFound") {
          expect(invalidStartResult.error.node).toBe("Z");
        }
      }

      // 存在しないターゲットノード
      const invalidTargetResult = findPaths(graph, "A", "Z");
      expect(invalidTargetResult.isErr()).toBe(true);

      if (invalidTargetResult.isErr()) {
        expect(invalidTargetResult.error.type).toBe("NodeNotFound");
        if (invalidTargetResult.error.type === "NodeNotFound") {
          expect(invalidTargetResult.error.node).toBe("Z");
        }
      }
    }
  });
});

// =============================================================================
// パフォーマンステスト
// =============================================================================

Deno.test("パフォーマンステスト - 大きなグラフでの動作", async (t) => {
  await t.step("中規模グラフでの性能検証", () => {
    // 10ノードの完全グラフを作成
    const largeEdges: Edge[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = i + 1; j < 10; j++) {
        largeEdges.push({
          from: `node${i}`,
          to: `node${j}`,
          weight: Math.random() * 100,
        });
      }
    }

    const startTime = performance.now();

    const graphResult = buildGraph(largeEdges);
    expect(graphResult.isOk()).toBe(true);

    if (graphResult.isOk()) {
      const graph = graphResult.value;

      // すべてのノードへの経路を計算
      for (let i = 1; i < 10; i++) {
        const pathResult = findPaths(graph, "node0", `node${i}`);
        expect(pathResult.isOk()).toBe(true);
      }
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // 実行時間が合理的な範囲内であることを確認（1秒以内）
    expect(executionTime).toBeLessThan(1000);
  });
});

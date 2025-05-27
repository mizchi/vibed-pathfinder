/**
 * 新しいAPI（buildGraph + findPaths）による最短経路探索の使用例
 *
 * このファイルでは、新しいAPIの使用方法を示します。
 * 主な特徴：
 * - 2つの関数のみ（buildGraph, findPaths）
 * - 明確なエラー型（GraphError, PathError）
 * - 早期リターンパターンによる読みやすいエラーハンドリング
 * - 関数型プログラミングとResult型の一貫した使用
 *
 * 実行方法: deno run examples/usage-example.ts
 */

import {
  analyzeGraph,
  buildGraph,
  type Edge,
  findPaths,
  type GraphAnalysis,
  type GraphError,
  type PathError,
  type ShortestPath,
} from "../src/mod.ts";

// =============================================================================
// 1. 基本的な使用例: 新しいAPIでの最短経路計算
// =============================================================================

console.log("=== 新しいAPI（buildGraph + findPaths）による基本的な使用例 ===");

// グラフのエッジを定義
const basicEdges: Edge[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
];

// 新しいAPI: グラフを構築（自動バリデーション付き）
const graphResult = buildGraph(basicEdges);

// 早期リターンパターンによるエラーハンドリング
if (graphResult.isErr()) {
  console.error("❌ グラフの構築に失敗:", graphResult.error);
  Deno.exit(1);
}

const graph = graphResult.value;
console.log("✅ グラフの構築に成功しました");

// 新しいAPI: 最短経路を検索
const pathResult = findPaths(graph, "A", "E");

if (pathResult.isErr()) {
  console.error("❌ 経路探索に失敗:", pathResult.error);
  Deno.exit(1);
}

const shortestPath = pathResult.value;
console.log("✅ 経路探索に成功しました");
console.log(`経路: ${shortestPath.path.join(" -> ")}`);
console.log(`距離: ${shortestPath.distance}`);

// =============================================================================
// 2. 複数経路の計算例
// =============================================================================

console.log("\n=== 複数経路の計算例 ===");

const targets = ["B", "C", "D", "E"];

for (const target of targets) {
  const result = findPaths(graph, "A", target);

  if (result.isOk()) {
    const path = result.value;
    console.log(
      `A -> ${target}: ${path.path.join(" -> ")} (距離: ${path.distance})`,
    );
  } else {
    console.log(`A -> ${target}: 経路が見つかりません (${result.error.type})`);
  }
}

// =============================================================================
// 3. 実用的なシナリオ: 都市間の経路探索
// =============================================================================

console.log("\n=== 都市間の経路探索 ===");

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
  { from: "東京", to: "大阪", weight: 500 }, // 直行ルート
];

const cityGraphResult = buildGraph(cityEdges);

if (cityGraphResult.isErr()) {
  console.error("❌ 都市グラフの構築に失敗:", cityGraphResult.error);
} else {
  const cityGraph = cityGraphResult.value;

  // 東京から各都市への最短経路を計算
  const cities = ["横浜", "千葉", "大宮", "名古屋", "大阪", "京都"];

  console.log("東京から各都市への最短経路:");
  for (const city of cities) {
    const result = findPaths(cityGraph, "東京", city);

    if (result.isOk()) {
      const path = result.value;
      console.log(`  ${path.path.join(" -> ")}: ${path.distance}km`);
    } else {
      console.log(`  東京 -> ${city}: 経路なし`);
    }
  }
}

// =============================================================================
// 4. エラーハンドリングの例
// =============================================================================

console.log("\n=== エラーハンドリングの例 ===");

// GraphError の例

// 1. EmptyGraph エラー
console.log("1. 空のグラフエラーの例:");
const emptyResult = buildGraph([]);
if (emptyResult.isErr()) {
  const error: GraphError = emptyResult.error;
  console.log(`  ✅ 期待通りのエラー: ${error.type}`);
}

// 2. InvalidGraph エラー（負の重み）
console.log("\n2. 無効なグラフエラーの例:");
const invalidEdges: Edge[] = [
  { from: "A", to: "B", weight: -1 }, // 負の重み
];
const invalidResult = buildGraph(invalidEdges);
if (invalidResult.isErr()) {
  const error: GraphError = invalidResult.error;
  console.log(`  ✅ 期待通りのエラー: ${error.type}`);
  if (error.type === "InvalidGraph") {
    console.log(`  理由: ${error.reason}`);
  }
}

// PathError の例

// 3. NodeNotFound エラー
console.log("\n3. ノードが見つからないエラーの例:");
const validGraphResult = buildGraph([{ from: "A", to: "B", weight: 1 }]);
if (validGraphResult.isOk()) {
  const nodeNotFoundResult = findPaths(validGraphResult.value, "Z", "A");
  if (nodeNotFoundResult.isErr()) {
    const error: PathError = nodeNotFoundResult.error;
    console.log(`  ✅ 期待通りのエラー: ${error.type}`);
    if (error.type === "NodeNotFound") {
      console.log(`  見つからないノード: ${error.node}`);
    }
  }
}

// 4. NoPath エラー（到達不可能）
console.log("\n4. 経路が存在しないエラーの例:");
const disconnectedEdges: Edge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: "C", to: "D", weight: 1 }, // 分離されたコンポーネント
];
const disconnectedResult = buildGraph(disconnectedEdges);
if (disconnectedResult.isOk()) {
  const noPathResult = findPaths(disconnectedResult.value, "A", "C");
  if (noPathResult.isErr()) {
    const error: PathError = noPathResult.error;
    console.log(`  ✅ 期待通りのエラー: ${error.type}`);
    if (error.type === "NoPath") {
      console.log(`  経路なし: ${error.from} -> ${error.to}`);
    }
  }
}

// =============================================================================
// 5. 早期リターンパターンの実例
// =============================================================================

console.log("\n=== 早期リターンパターンの実例 ===");

/**
 * 複数の経路を計算し、最も短い経路を返す関数
 * 早期リターンパターンを使用してエラーハンドリングを簡潔に記述
 */
function findShortestAmongMultiple(
  edges: Edge[],
  start: string,
  targets: string[],
): ShortestPath | null {
  // 早期リターン: グラフ構築エラー
  const graphResult = buildGraph(edges);
  if (graphResult.isErr()) {
    console.log(`グラフ構築エラー: ${graphResult.error.type}`);
    return null;
  }

  const graph = graphResult.value;
  let shortestPath: ShortestPath | null = null;

  for (const target of targets) {
    const pathResult = findPaths(graph, start, target);

    // 早期リターン: エラーの場合はスキップ
    if (pathResult.isErr()) {
      console.log(`${start} -> ${target}: ${pathResult.error.type}`);
      continue;
    }

    const path = pathResult.value;

    // より短い経路が見つかった場合は更新
    if (!shortestPath || path.distance < shortestPath.distance) {
      shortestPath = path;
    }
  }

  return shortestPath;
}

// 実例の実行
const testEdges: Edge[] = [
  { from: "S", to: "A", weight: 10 },
  { from: "S", to: "B", weight: 5 },
  { from: "A", to: "T1", weight: 1 },
  { from: "B", to: "T2", weight: 8 },
  { from: "B", to: "T3", weight: 3 },
];

const result = findShortestAmongMultiple(testEdges, "S", ["T1", "T2", "T3"]);
if (result) {
  console.log(
    `最短経路: ${result.path.join(" -> ")} (距離: ${result.distance})`,
  );
} else {
  console.log("有効な経路が見つかりませんでした");
}

// =============================================================================
// 6. 新旧API比較
// =============================================================================

console.log("\n=== 新旧API比較 ===");

console.log("【旧API（非推奨）】");
console.log("  - 3つの関数: createGraph, dijkstra, getShortestPath");
console.log("  - 複数ステップの処理が必要");
console.log("  - 中間結果（EnhancedDijkstraResult）の管理が必要");
console.log("  - DijkstraError型（統一されていないエラー型）");

console.log("\n【新API（推奨）】");
console.log("  - 2つの関数: buildGraph, findPaths");
console.log("  - シンプルな2ステップ処理");
console.log("  - 直接的な結果取得");
console.log("  - 明確なエラー型（GraphError, PathError）");
console.log("  - 早期リターンパターンによる読みやすいコード");

console.log("\n【コード比較例】");
console.log("// 旧API（3ステップ）");
console.log("// const graph = createGraph(edges);");
console.log("// const dijkstraResult = dijkstra(graph, start);");
console.log("// const path = getShortestPath(dijkstraResult, target);");

console.log("\n// 新API（2ステップ）");
console.log("// const graph = buildGraph(edges);");
console.log("// const path = findPaths(graph, start, target);");

console.log("\n=== 新しいAPI設計の実行が完了しました ===");
console.log("💡 新しいAPIの利点:");
console.log("  - シンプルで直感的なAPI設計");
console.log("  - 明確で型安全なエラーハンドリング");
console.log("  - 早期リターンパターンによる読みやすいコード");
console.log("  - 関数型プログラミングの一貫した適用");
console.log("  - Result型による安全な非同期処理");

// =============================================================================
// 7. 新機能: グラフ分析機能の使用例
// =============================================================================

console.log("\n=== 新機能: グラフ分析機能 ===");

// 基本グラフの分析
const analysisResult = analyzeGraph(graph);
if (analysisResult.isOk()) {
  const analysis = analysisResult.value;
  console.log("✅ グラフ分析結果:");
  console.log(`  ノード数: ${analysis.nodeCount}`);
  console.log(`  エッジ数: ${analysis.edgeCount}`);
  console.log(`  連結性: ${analysis.isConnected ? "連結" : "非連結"}`);
  console.log(`  連結成分数: ${analysis.components.length}`);
  console.log(`  グラフ密度: ${analysis.density.toFixed(3)}`);

  console.log("\n  連結成分の詳細:");
  analysis.components.forEach((component, index) => {
    console.log(`    成分${index + 1}: [${component.join(", ")}]`);
  });
} else {
  console.error("❌ グラフ分析に失敗:", analysisResult.error);
}

// 都市グラフの分析
console.log("\n=== 都市グラフの分析 ===");
if (cityGraphResult.isOk()) {
  const cityAnalysisResult = analyzeGraph(cityGraphResult.value);
  if (cityAnalysisResult.isOk()) {
    const cityAnalysis = cityAnalysisResult.value;
    console.log("都市ネットワーク分析:");
    console.log(`  都市数: ${cityAnalysis.nodeCount}`);
    console.log(`  路線数: ${cityAnalysis.edgeCount}`);
    console.log(`  ネットワーク密度: ${cityAnalysis.density.toFixed(3)}`);
    console.log(
      `  連結性: ${cityAnalysis.isConnected ? "すべて接続" : "分離あり"}`,
    );
  }
}

// 非連結グラフの分析例
console.log("\n=== 非連結グラフの分析例 ===");
const separatedEdges: Edge[] = [
  { from: "Group1_A", to: "Group1_B", weight: 1 },
  { from: "Group1_B", to: "Group1_C", weight: 2 },
  { from: "Group2_X", to: "Group2_Y", weight: 3 },
  { from: "Group3_P", to: "Group3_Q", weight: 4 },
];

const separatedGraphResult = buildGraph(separatedEdges);
if (separatedGraphResult.isOk()) {
  const separatedAnalysisResult = analyzeGraph(separatedGraphResult.value);
  if (separatedAnalysisResult.isOk()) {
    const separatedAnalysis = separatedAnalysisResult.value;
    console.log("分離グラフ分析:");
    console.log(`  総ノード数: ${separatedAnalysis.nodeCount}`);
    console.log(`  連結成分数: ${separatedAnalysis.components.length}`);
    console.log(
      `  各成分のサイズ: [${
        separatedAnalysis.components.map((c) => c.length).join(", ")
      }]`,
    );
    console.log(
      `  連結性: ${separatedAnalysis.isConnected ? "連結" : "非連結"}`,
    );
  }
}

console.log("\n=== 新しいAPI設計の完全デモンストレーション完了 ===");
console.log("🎉 Hyrum's Lawを適用したクリーンなAPI設計:");
console.log("  ✅ 内部実装の完全隠蔽");
console.log("  ✅ 最小限の公開API（3つの主要関数）");
console.log("  ✅ 型安全な関数型プログラミング");
console.log("  ✅ 明確な関心の分離");
console.log("  ✅ 後方互換性の維持");
console.log("  ✅ 新機能（GraphAnalysis）の追加");

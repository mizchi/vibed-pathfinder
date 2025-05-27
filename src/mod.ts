// ===================================================================
// 公開API - クリーンアーキテクチャ設計
// ===================================================================

// 主要機能（最小限のAPI）
export { buildGraph } from "./graph-builder.ts";
export { findPaths } from "./path-finder.ts";
export { analyzeGraph } from "./graph-analyzer.ts";

// ===================================================================
// ドメインモデル型定義
// ===================================================================

// 基本型
export type { Edge, Graph, Node, ShortestPath, Weight } from "./types.ts";

// エラー型（代数的データ型）
export type { GraphError, PathError } from "./types.ts";

// 結果型
export type { GraphAnalysis } from "./types.ts";

// ===================================================================
// ユーティリティ関数
// ===================================================================

// 型ガード関数
export { isValidNode, isValidWeight } from "./types.ts";

// ===================================================================
// 基本型定義
// ===================================================================

// ノードの型定義（文字列または数値）
export type Node = string | number;

// 重みの型定義（正の数値）
export type Weight = number;

// エッジの型定義
export interface Edge {
  from: Node;
  to: Node;
  weight: Weight;
}

// グラフの型定義（隣接リスト形式）
export type Graph = Map<Node, Edge[]>;

// ===================================================================
// 新しいエラー型定義（代数的データ型）
// ===================================================================

// グラフ構築時のエラー型定義
export type GraphError =
  | { type: "EmptyGraph" }
  | { type: "InvalidGraph"; reason: string };

// パス検索時のエラー型定義
export type PathError =
  | { type: "NodeNotFound"; node: Node }
  | { type: "NoPath"; from: Node; to: Node };

// ===================================================================
// 結果型定義
// ===================================================================

// 最短経路の結果型定義
export interface ShortestPath {
  path: Node[];
  distance: number;
}

// グラフ分析の結果型定義
export interface GraphAnalysis {
  nodeCount: number;
  edgeCount: number;
  isConnected: boolean;
  components: Node[][];
  density: number;
}

// ===================================================================
// 型ガード関数
// ===================================================================

export function isValidWeight(weight: Weight): boolean {
  return typeof weight === "number" && !isNaN(weight) && isFinite(weight) &&
    weight >= 0;
}

export function isValidNode(node: Node): boolean {
  return typeof node === "string" || typeof node === "number";
}

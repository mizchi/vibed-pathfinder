import { err, ok, type Result } from "neverthrow";
import type { Edge, Graph, GraphError } from "./types.ts";
import { validateEdges } from "./graph-validator.ts";

/**
 * エッジから隣接リストを構築する純粋関数（内部実装）
 */
function buildAdjacencyList(edges: Edge[]): Graph {
  const graph = new Map<string | number, Edge[]>();
  for (const edge of edges) {
    // fromノードを追加
    if (!graph.has(edge.from)) {
      graph.set(edge.from, []);
    }
    graph.get(edge.from)!.push(edge);

    // toノードも追加（エッジがない場合は空配列）
    if (!graph.has(edge.to)) {
      graph.set(edge.to, []);
    }
  }
  return graph;
}

/**
 * エッジリストからグラフを構築する関数
 * 自動バリデーション機能付き
 */
export function buildGraph(edges: Edge[]): Result<Graph, GraphError> {
  // 早期リターン: 空グラフのチェック
  if (edges.length === 0) {
    return err({ type: "EmptyGraph" });
  }

  // エッジのバリデーション
  const validationResult = validateEdges(edges);
  if (validationResult.isErr()) {
    return err(validationResult.error);
  }

  // グラフ構築
  const graph = buildAdjacencyList(edges);
  return ok(graph);
}

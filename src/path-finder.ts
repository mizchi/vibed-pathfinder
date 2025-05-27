import { err, ok, type Result } from "neverthrow";
import type { Graph, Node, PathError, ShortestPath } from "./types.ts";
import {
  createPriorityQueue,
  dequeuePriorityQueue,
  enqueuePriorityQueue,
  isPriorityQueueEmpty,
} from "./priority-queue.ts";

/**
 * ダイクストラ法の結果型定義
 */
type DijkstraResult = {
  distances: Map<Node, number>;
  previous: Map<Node, Node | null>;
};

/**
 * ダイクストラ法の内部実装
 */
function executeDijkstraInternal(
  graph: Graph,
  start: Node,
): DijkstraResult {
  const distances = new Map<Node, number>();
  const previous = new Map<Node, Node | null>();
  const visited = new Set<Node>();

  // 全ノードを初期化
  for (const node of graph.keys()) {
    distances.set(node, node === start ? 0 : Infinity);
    previous.set(node, null);
  }

  // エッジの終点ノードも初期化
  for (const edges of graph.values()) {
    for (const edge of edges) {
      if (!distances.has(edge.to)) {
        distances.set(edge.to, Infinity);
        previous.set(edge.to, null);
      }
    }
  }

  let queue = enqueuePriorityQueue(createPriorityQueue<Node>(), start, 0);

  while (!isPriorityQueueEmpty(queue)) {
    const { item: current, newQueue } = dequeuePriorityQueue(queue);
    queue = newQueue;

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const currentDistance = distances.get(current) ?? Infinity;
    const neighbors = graph.get(current) ?? [];

    for (const edge of neighbors) {
      if (visited.has(edge.to)) {
        continue;
      }

      const newDistance = currentDistance + edge.weight;
      const existingDistance = distances.get(edge.to) ?? Infinity;

      if (newDistance < existingDistance) {
        distances.set(edge.to, newDistance);
        previous.set(edge.to, current);
        queue = enqueuePriorityQueue(queue, edge.to, newDistance);
      }
    }
  }

  return { distances, previous };
}

/**
 * 経路を再構築する内部関数
 */
function reconstructPathInternal(
  previous: Map<Node, Node | null>,
  distances: Map<Node, number>,
  target: Node,
): Result<ShortestPath, PathError> {
  if (!distances.has(target)) {
    return err({ type: "NodeNotFound", node: target });
  }

  const distance = distances.get(target)!;

  // 到達不可能な場合
  if (distance === Infinity) {
    return err({ type: "NodeNotFound", node: target });
  }

  // 経路を逆順で構築
  const path: Node[] = [];
  let current: Node | null = target;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  return ok({
    path,
    distance,
  });
}

/**
 * 特定の開始・終了ノード間の最短経路を取得する関数
 */
export function findPaths(
  graph: Graph,
  start: Node,
  target: Node,
): Result<ShortestPath, PathError> {
  // 早期リターン: 空グラフのチェック
  if (graph.size === 0) {
    return err({ type: "NodeNotFound", node: start });
  }

  // 早期リターン: 開始ノードの存在チェック
  if (!graph.has(start)) {
    return err({ type: "NodeNotFound", node: start });
  }

  // ダイクストラ法の実行
  const { distances, previous } = executeDijkstraInternal(graph, start);

  // 経路の再構築
  const pathResult = reconstructPathInternal(previous, distances, target);
  if (pathResult.isErr()) {
    const error = pathResult.error;
    if (error.type === "NodeNotFound") {
      // ターゲットノードが存在しないか、到達不可能
      const targetExists = distances.has(target);
      if (!targetExists) {
        return err({ type: "NodeNotFound", node: target });
      }
      // ノードは存在するが到達不可能
      return err({ type: "NoPath", from: start, to: target });
    }
    return err(error);
  }

  return ok(pathResult.value);
}

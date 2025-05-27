import { err, ok, type Result } from "neverthrow";
import type { Graph, GraphAnalysis, GraphError, Node } from "./types.ts";

// ===================================================================
// グラフ分析の内部実装関数
// ===================================================================

/**
 * グラフ内の全ノードを取得する純粋関数
 */
function extractAllNodes(graph: Graph): Node[] {
  const nodes = new Set<Node>();

  // 開始ノードを追加
  for (const node of graph.keys()) {
    nodes.add(node);
  }

  // 終点ノードを追加
  for (const edges of graph.values()) {
    for (const edge of edges) {
      nodes.add(edge.to);
    }
  }

  return Array.from(nodes);
}

/**
 * エッジ数を計算する純粋関数
 */
function calculateEdgeCount(graph: Graph): number {
  let edgeCount = 0;
  for (const edges of graph.values()) {
    edgeCount += edges.length;
  }
  return edgeCount;
}

/**
 * グラフの密度を計算する純粋関数
 */
function calculateDensity(nodeCount: number, edgeCount: number): number {
  if (nodeCount <= 1) {
    return 0;
  }
  const maxEdges = nodeCount * (nodeCount - 1);
  return edgeCount / maxEdges;
}

/**
 * 直接隣接ノードをスタックに追加する純粋関数
 */
function addDirectAdjacentNodes(
  graph: Graph,
  current: Node,
  visited: Set<Node>,
  stack: Node[],
): void {
  const edges = graph.get(current) || [];
  for (const edge of edges) {
    if (!visited.has(edge.to)) {
      stack.push(edge.to);
    }
  }
}

/**
 * 逆方向の隣接ノードをスタックに追加する純粋関数
 */
function addReverseAdjacentNodes(
  graph: Graph,
  current: Node,
  visited: Set<Node>,
  stack: Node[],
): void {
  for (const [node, nodeEdges] of graph.entries()) {
    for (const edge of nodeEdges) {
      if (edge.to === current && !visited.has(node)) {
        stack.push(node);
      }
    }
  }
}

/**
 * 隣接ノードをスタックに追加する純粋関数
 */
function addAdjacentNodes(
  graph: Graph,
  current: Node,
  visited: Set<Node>,
  stack: Node[],
): void {
  addDirectAdjacentNodes(graph, current, visited, stack);
  addReverseAdjacentNodes(graph, current, visited, stack);
}

/**
 * 単一の連結成分を探索する純粋関数
 */
function exploreComponent(
  graph: Graph,
  startNode: Node,
  visited: Set<Node>,
): Node[] {
  const component: Node[] = [];
  const stack: Node[] = [startNode];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    component.push(current);
    addAdjacentNodes(graph, current, visited, stack);
  }

  return component;
}

/**
 * 連結成分を計算する純粋関数
 */
function findConnectedComponents(graph: Graph, allNodes: Node[]): Node[][] {
  const visited = new Set<Node>();
  const components: Node[][] = [];

  for (const startNode of allNodes) {
    if (visited.has(startNode)) {
      continue;
    }

    const component = exploreComponent(graph, startNode, visited);
    components.push(component);
  }

  return components;
}

// ===================================================================
// 公開API
// ===================================================================

/**
 * グラフの構造を分析する
 *
 * @param graph - 分析対象のグラフ
 * @returns グラフ分析結果またはエラー
 */
export function analyzeGraph(graph: Graph): Result<GraphAnalysis, GraphError> {
  if (graph.size === 0) {
    return err({ type: "EmptyGraph" });
  }

  const allNodes = extractAllNodes(graph);
  const nodeCount = allNodes.length;
  const edgeCount = calculateEdgeCount(graph);
  const components = findConnectedComponents(graph, allNodes);
  const isConnected = components.length <= 1;
  const density = calculateDensity(nodeCount, edgeCount);

  const analysis: GraphAnalysis = {
    nodeCount,
    edgeCount,
    isConnected,
    components,
    density,
  };

  return ok(analysis);
}

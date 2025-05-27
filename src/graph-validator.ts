import { err, ok, type Result } from "neverthrow";
import type { Edge, Graph, GraphError, Node } from "./types.ts";
import { isValidNode, isValidWeight } from "./types.ts";

/**
 * エッジの妥当性を検証する純粋関数
 */
export function validateEdges(edges: Edge[]): Result<void, GraphError> {
  for (const edge of edges) {
    if (!isValidNode(edge.from) || !isValidNode(edge.to)) {
      return err({ type: "InvalidGraph", reason: "Invalid node type" });
    }
    if (
      typeof edge.weight !== "number" || isNaN(edge.weight) ||
      !isFinite(edge.weight)
    ) {
      return err({
        type: "InvalidGraph",
        reason: "Invalid weight: NaN or Infinity",
      });
    }
    if (edge.weight < 0) {
      return err({
        type: "InvalidGraph",
        reason: "Invalid weight: negative value",
      });
    }
  }
  return ok(undefined);
}

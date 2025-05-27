import { expect } from "@std/expect";
import { isValidNode, isValidWeight } from "./types.ts";

Deno.test("型ガード関数", async (t) => {
  await t.step("isValidWeight - 有効な重みを正しく判定する", () => {
    expect(isValidWeight(1)).toBe(true);
    expect(isValidWeight(0)).toBe(true);
    expect(isValidWeight(10.5)).toBe(true);
  });

  await t.step("isValidWeight - 無効な重みを正しく判定する", () => {
    expect(isValidWeight(NaN)).toBe(false);
    expect(isValidWeight(Infinity)).toBe(false);
    expect(isValidWeight(-Infinity)).toBe(false);
  });

  await t.step("isValidNode - 有効なノードを正しく判定する", () => {
    expect(isValidNode("A")).toBe(true);
    expect(isValidNode(1)).toBe(true);
    expect(isValidNode("")).toBe(true);
    expect(isValidNode(0)).toBe(true);
  });

  await t.step("isValidNode - 無効なノードを正しく判定する", () => {
    // @ts-expect-error - テスト用の無効な型
    expect(isValidNode(null)).toBe(false);
    // @ts-expect-error - テスト用の無効な型
    expect(isValidNode(undefined)).toBe(false);
    // @ts-expect-error - テスト用の無効な型
    expect(isValidNode({})).toBe(false);
    // @ts-expect-error - テスト用の無効な型
    expect(isValidNode([])).toBe(false);
  });
});

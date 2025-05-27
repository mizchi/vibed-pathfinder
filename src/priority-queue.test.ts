import { expect } from "@std/expect";
import {
  createPriorityQueue,
  dequeuePriorityQueue,
  enqueuePriorityQueue,
  isPriorityQueueEmpty,
} from "./priority-queue.ts";

Deno.test("priority-queue", async (t) => {
  await t.step("空のキューを作成できる", () => {
    const queue = createPriorityQueue<string>();
    expect(queue.items.length).toBe(0);
    expect(isPriorityQueueEmpty(queue)).toBe(true);
  });

  await t.step("アイテムを追加できる", () => {
    const queue = createPriorityQueue<string>();
    const newQueue = enqueuePriorityQueue(queue, "A", 5);

    expect(newQueue.items.length).toBe(1);
    expect(newQueue.items[0].item).toBe("A");
    expect(newQueue.items[0].priority).toBe(5);
    expect(isPriorityQueueEmpty(newQueue)).toBe(false);
  });

  await t.step("優先度順にソートされる", () => {
    let queue = createPriorityQueue<string>();
    queue = enqueuePriorityQueue(queue, "C", 10);
    queue = enqueuePriorityQueue(queue, "A", 5);
    queue = enqueuePriorityQueue(queue, "B", 7);

    expect(queue.items.length).toBe(3);
    expect(queue.items[0].item).toBe("A"); // 優先度5
    expect(queue.items[1].item).toBe("B"); // 優先度7
    expect(queue.items[2].item).toBe("C"); // 優先度10
  });

  await t.step("最小優先度のアイテムを取り出せる", () => {
    let queue = createPriorityQueue<string>();
    queue = enqueuePriorityQueue(queue, "C", 10);
    queue = enqueuePriorityQueue(queue, "A", 5);
    queue = enqueuePriorityQueue(queue, "B", 7);

    const { item, newQueue } = dequeuePriorityQueue(queue);
    expect(item).toBe("A"); // 最小優先度
    expect(newQueue.items.length).toBe(2);
    expect(newQueue.items[0].item).toBe("B");
  });

  await t.step("空のキューから取り出すとundefinedを返す", () => {
    const queue = createPriorityQueue<string>();
    const { item, newQueue } = dequeuePriorityQueue(queue);

    expect(item).toBe(undefined);
    expect(newQueue.items.length).toBe(0);
  });

  await t.step("数値型でも正しく動作する", () => {
    let queue = createPriorityQueue<number>();
    queue = enqueuePriorityQueue(queue, 100, 3);
    queue = enqueuePriorityQueue(queue, 200, 1);
    queue = enqueuePriorityQueue(queue, 300, 2);

    const { item: first } = dequeuePriorityQueue(queue);
    expect(first).toBe(200); // 優先度1が最小
  });
});

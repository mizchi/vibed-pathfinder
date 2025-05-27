// ===================================================================
// 内部実装型定義（非公開）
// ===================================================================

// 優先度付きキューのアイテム型定義（内部使用のみ）
interface PriorityQueueItem<T> {
  item: T;
  priority: number;
}

// 優先度付きキューの状態型定義（内部使用のみ）
interface PriorityQueueState<T> {
  items: PriorityQueueItem<T>[];
}

// ===================================================================
// 内部実装関数（非公開）
// ===================================================================

/**
 * 空の優先度付きキューを作成する純粋関数
 */
function createPriorityQueue<T>(): PriorityQueueState<T> {
  return { items: [] };
}

/**
 * 優先度付きキューにアイテムを追加する純粋関数
 */
function enqueuePriorityQueue<T>(
  queue: PriorityQueueState<T>,
  item: T,
  priority: number,
): PriorityQueueState<T> {
  const newItems = [...queue.items, { item, priority }];
  newItems.sort((a, b) => a.priority - b.priority);
  return { items: newItems };
}

/**
 * 優先度付きキューから最小優先度のアイテムを取り出す純粋関数
 */
function dequeuePriorityQueue<T>(
  queue: PriorityQueueState<T>,
): { item: T | undefined; newQueue: PriorityQueueState<T> } {
  if (queue.items.length === 0) {
    return { item: undefined, newQueue: queue };
  }
  const [first, ...rest] = queue.items;
  return { item: first.item, newQueue: { items: rest } };
}

/**
 * 優先度付きキューが空かどうかを判定する純粋関数
 */
function isPriorityQueueEmpty<T>(queue: PriorityQueueState<T>): boolean {
  return queue.items.length === 0;
}

// ===================================================================
// 公開API（内部使用のみ）
// ===================================================================

export {
  createPriorityQueue,
  dequeuePriorityQueue,
  enqueuePriorityQueue,
  isPriorityQueueEmpty,
  type PriorityQueueState,
};

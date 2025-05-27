# デッドコード分析レポート

## 実行日時

2025/05/27 23:05:01 (JST)

## 実行コマンド

```bash
deno task check:module-export
```

## 分析結果

### プロジェクト概要

- **総ファイル数**: 14 ファイル
- **エントリーポイントファイル数**: 8 ファイル

### 未使用エクスポート（削除候補）

#### 1. `src/graph-builder.ts`

- **行 7**: `buildAdjacencyList` 関数
- **行 48**: `validateAndBuildGraph` 関数

#### 2. `src/types.ts`

- **行 53**: `PriorityQueueItem` 型

#### 3. `src/graph-validator.ts`

- **行 82**: `validateGraphStructure` 関数

### 完全未使用ファイル（削除候補）

- **`src/graph-utils.ts`**: ファイル全体が未使用

## 推奨アクション

### 削除対象

- **ファイル削除**: 1 ファイル (`src/graph-utils.ts`)
- **エクスポート削除**: 4 つのエクスポート

### API 整理の判断材料

1. **内部実装の隠蔽**: 未使用のエクスポートは内部実装として扱い、publicAPI から除外することを検討
2. **モジュール境界の最適化**: `graph-utils.ts`の完全削除により、モジュール構造を簡素化可能
3. **API 最小化**: 4 つの未使用エクスポートを削除することで、よりクリーンな public API を実現

## 次のステップ

- 各未使用エクスポートの削除可否を個別に検討
- `src/graph-utils.ts`の削除前に、他のファイルでの間接的な依存関係を確認
- API 整理後のテストスイートの実行を推奨

# @t3g/lexorank

Package TypeScript framework-agnostic để sinh rank dạng chuỗi cho danh sách cần sắp xếp thủ công.

## Cài đặt

```bash
yarn add @t3g/lexorank
```

## Dùng nhanh

```ts
import { compareRanks, rankBetween } from '@t3g/lexorank';

const first = rankBetween(null, null);
const second = rankBetween(first, null);
const between = rankBetween(first, second);

const sorted = [second, first, between].sort(compareRanks);
```

## API

- `rankBetween(before, after)` — sinh rank nằm giữa hai bound.
- `compareRanks(left, right)` — comparator không dùng `localeCompare`.
- `validateRank(rank)` / `assertValidRank(rank)` — kiểm tra rank hợp lệ.
- `generateInitialRanks(count)` — sinh một dải rank unique, sorted.
- `rebalanceRanks(items)` — trả về bản sao item với rank mới, không mutate input.
- `shouldRebalanceRank(ranks)` — báo hiệu khi rank invalid, duplicate, unsorted hoặc quá dài.

## Lưu ý database

Nếu sort trực tiếp bằng SQL, dùng collation ASCII-compatible để thứ tự DB khớp với `compareRanks`. Package không tự xử lý DB/job rebalance.

# @t3gteam/lexorank

Package TypeScript framework-agnostic để sinh rank dạng chuỗi cho danh sách cần sắp xếp thủ công.

## Cài đặt

Từ GitHub Packages:

```bash
yarn add @t3gteam/lexorank
```

Nếu copy riêng package này sang project khác, chạy trực tiếp trong thư mục package:

```bash
yarn install
yarn typecheck
yarn test
yarn build
```

## Dùng nhanh

```ts
import { compareRanks, rankBetween } from '@t3gteam/lexorank';

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

## Pack local

```bash
yarn pack
```

Hoặc từ root workspace:

```bash
yarn workspace @t3gteam/lexorank pack:local
```

## Publish GitHub Packages

Package đã cấu hình `publishConfig.registry` trỏ tới GitHub Packages.

Yêu cầu trước khi publish:

1. Repo đã được push lên GitHub owner/org `t3gteam`.
2. Scope package `@t3gteam` khớp với owner/org trên GitHub.
3. Đã login Yarn với GitHub Packages:

```bash
yarn npm login --scope t3gteam --publish
```

Publish:

```bash
yarn publish:github
```

Từ root workspace:

```bash
yarn workspace @t3gteam/lexorank publish:github
```

Không lưu token vào repo. Dùng login/token cục bộ hoặc secret của CI.

## Lưu ý database

Nếu sort trực tiếp bằng SQL, dùng collation ASCII-compatible để thứ tự DB khớp với `compareRanks`. Package không tự xử lý DB/job rebalance.

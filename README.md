# T3G Workspace

Monorepo tối giản để lưu các package TypeScript tái sử dụng cho nhiều dự án.

## Packages

- [@t3gteam/lexorank](packages/lexorank/README.md) — sinh và so sánh rank dạng chuỗi để sắp xếp thủ công.

## Lệnh workspace

```bash
yarn install
yarn typecheck
yarn test
yarn build
```

## Cách dùng package cho dự án khác

Ưu tiên dùng theo thứ tự:

1. Publish lên GitHub Packages rồi cài bằng `yarn add @t3gteam/<package>`.
2. Pack local bằng `yarn workspace @t3gteam/<package> pack:local` rồi cài file `.tgz`.
3. Copy riêng thư mục `packages/<package>` sang project khác khi cần vendor package nhanh.

Mỗi package nên tự đủ config build/test để copy riêng vẫn chạy được.

## GitHub Packages

Root workspace dùng Yarn 4 và cấu hình scope `@t3gteam` trong [.yarnrc.yml](.yarnrc.yml).

Để publish một package:

```bash
yarn npm login --scope t3gteam --publish
yarn workspace @t3gteam/lexorank publish:github
```

Không commit token vào repo. Nếu dùng CI, lưu token trong GitHub Secrets.

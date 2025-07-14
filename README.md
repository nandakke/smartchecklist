# Smart Checklist

モダンなReact + TypeScript + Viteで構築されたスマートチェックリストアプリケーション。

## 🚀 機能

- ⚡ Viteによる高速な開発体験
- 📝 TypeScriptによる型安全性
- 🎨 モダンなReactパターンとHooks
- 🔥 ホットモジュールリロード（HMR）
- 📏 ESLintによるコード品質管理
- 📋 **テンプレート管理**（作成・編集・削除・一覧）
- ✅ **チェックリスト管理**（作成・編集・削除・一覧）
- 🔄 **テンプレートからチェックリスト生成**
- 📁 **ディレクトリパス連携**（項目にパスを設定してワンクリックでフォルダを開く）

### 📁 ディレクトリパス機能

各チェック項目には、オプションでディレクトリパスを設定できます：

- **パス入力**: チェック項目作成時にディレクトリパスを入力可能
- **パス検証**: 入力されたパス形式を自動検証
- **テスト機能**: 📁ボタンでパスの有効性をテスト
- **ワンクリック**: チェックリスト表示時にパスリンクをクリックしてフォルダを開く

**対応パス形式**:
- Windows: `C:\Users\username\Documents`
- macOS/Linux: `/home/username/documents`
- 相対パス: `./project/src`

## 🛠️ 開発環境のセットアップ

### 必要な環境
- Node.js 20.19.0以上または22.12.0以上
- npm

### インストールと起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# Lintの実行
npm run lint
```

開発サーバーは通常 `http://localhost:5173` で起動します。

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

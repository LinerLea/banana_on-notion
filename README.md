# banana_on-notion
Google extension : To create an image on Notion by banana
# Banana on Notion

Notionで選択したテキストをもとに、  
**Nano Bananaで図解画像を生成**し、  
Notionに貼り付けて使える **Chrome拡張機能**です。

---

## できること
1. Notion上でテキストを選択
2. 右クリック → **図解を生成**
3. AIが内容を理解して図解画像を生成
4. 画像URLをクリップボードにコピー
5. Notionに貼り付け → **Embed / Image** を選択
6. 図解画像としてNotionに表示 

---

## システム構成（概要）

- **Chrome拡張**
  - Notionでのテキスト選択
  - 右クリックメニュー
  - クリップボード操作
- **Cloud Run API**
  - Gemini（Nano Banana）で画像生成
  - Google Cloud Storage に保存
  - 署名付きURLを返却

---

## インストール方法（開発版 / 社内共有）

### 1. リポジトリを取得
```bash
git clone https://github.com/LinerLea/banana_on-notion.git
cd banana_on-notion
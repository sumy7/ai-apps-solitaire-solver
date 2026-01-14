# ai-apps-solitaire-solver

纸牌（Solitaire）游戏求解工具 / Solitaire Game Solving Tool

一个现代化的纸牌求解器，使用 React + TailwindCSS 构建。

## 功能特性 / Features

- 🃏 完整的纸牌游戏界面 / Complete solitaire game interface
- 🎯 点击未知牌来填充对局信息 / Click unknown cards to fill in game information
- 🔄 支持翻 1 张牌和翻 3 张牌两种模式 / Support for drawing 1 card and 3 cards modes
- 💡 自动求解和提示功能 / Auto-solve and hint features
- 🎨 现代化的 UI 设计 / Modern UI design with TailwindCSS
- ⚛️ 使用 React 构建 / Built with React
- 📦 模块化代码结构 / Modular code structure

## 项目结构 / Project Structure

```
src/
├── components/          # React 组件
│   ├── Card.jsx        # 卡牌组件
│   ├── Pile.jsx        # 牌堆组件
│   ├── TableauColumn.jsx # 画面列组件
│   ├── GameBoard.jsx   # 游戏面板组件
│   └── Controls.jsx    # 控制面板组件
├── hooks/              # 自定义 React Hooks
│   └── useGameState.js # 游戏状态管理
├── utils/              # 工具函数
│   └── gameLogic.js    # 游戏逻辑
├── constants/          # 常量定义
│   └── gameConstants.js # 游戏常量
├── App.jsx            # 主应用组件
├── main.jsx           # 应用入口
└── index.css          # 全局样式
```

## 安装和运行 / Installation and Usage

### 安装依赖 / Install Dependencies

```bash
npm install
```

### 开发模式 / Development Mode

```bash
npm run dev
```

### 构建生产版本 / Build for Production

```bash
npm run build
```

### 预览生产版本 / Preview Production Build

```bash
npm run preview
```

## 使用方法 / Usage

1. 点击"新游戏"开始 / Click "New Game" to start
2. 点击未知牌（显示"?"的牌）来填充对局信息 / Click unknown cards (showing "?") to fill in game information
3. 选择抽牌模式（抽 1 张或抽 3 张）/ Choose draw mode (Draw 1 or Draw 3)
4. 点击库存堆来抽牌 / Click stock pile to draw cards
5. 使用"求解"或"提示"按钮获取建议 / Use "Solve" or "Hint" buttons to get suggestions

## 游戏规则 / Game Rules

- 标准 Klondike 纸牌规则 / Standard Klondike Solitaire rules
- 目标是将所有牌按花色和顺序放到基础堆 / Goal is to move all cards to foundation piles by suit in ascending order
- 在画面堆中，牌必须交替颜色且降序排列 / In tableau, cards must alternate colors and be in descending order
- K（国王）可以放到空列 / Kings can be placed in empty columns

## 技术栈 / Tech Stack

- ⚛️ React 18 - UI 框架
- 🎨 TailwindCSS - CSS 框架
- ⚡ Vite - 构建工具
- 📦 模块化架构 - 清晰的代码组织
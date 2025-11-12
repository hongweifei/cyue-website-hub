---
name: Qwen Code 文档
url: https://qwenlm.github.io/qwen-code-docs/zh/
info: 基于 Qwen3-Coder 模型优化的命令行 AI 工作流工具官方文档
tags:
  - AI编程
  - 开发工具
  - 命令行工具
  - 开源项目
---

Qwen Code 文档网站是 Qwen Code 命令行 AI 工作流工具的官方中文文档平台。该工具基于 Gemini CLI 改造，专为 Qwen3-Coder 模型优化，旨在通过 AI 能力提升开发者工作流效率。

### 工具核心特性
- **模型优化**：深度适配 Qwen3-Coder 模型，提供专业代码理解与生成能力
- **免费使用**：QwenChat 账户支持每分钟 60 次请求、每日 2000 次请求的免费额度
- **全功能套件**：包含 subagents 子代理系统、Plan Mode 规划模式、TodoWrite 任务生成等高级功能
- **多工具集成**：支持文件系统操作、shell 命令执行、网络抓取等开发必备工具
- **视觉模型支持**：可自动检测图像输入并切换至视觉模型进行多模态分析
- **OpenAI 兼容**：完整支持 OpenAI API 协议，可对接多种大模型服务

### 安装与使用
#### 环境要求
- Node.js 20 或更高版本

#### 快速安装方式
```bash
# npm 全局安装
npm install -g @qwen-code/qwen-code@latest

# 源码安装
git clone https://github.com/QwenLM/qwen-code.git
cd qwen-code && npm install && npm install -g .

# Homebrew 安装 (macOS/Linux)
brew install qwen-code

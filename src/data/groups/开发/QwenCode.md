---
name: Qwen Code
url: https://qwenlm.github.io/qwen-code-docs/zh
info: 基于Qwen3-Coder模型优化的命令行AI工作流工具，支持代码理解、自动化任务与智能辅助开发
tags:
  - AI编程助手
  - 命令行工具
  - 代码自动化
  - 开源工具
  - 多模态支持
---

Qwen Code 是由阿里巴巴达摩院（QwenLM）开发的命令行AI工作流工具，基于 Gemini CLI 改造并深度优化 Qwen3-Coder 模型能力。它为开发者提供终端优先的AI辅助开发体验，集成代码理解、重构建议、自动化测试生成等功能，同时支持文件系统操作、Shell命令执行等扩展能力。作为开源项目（Apache 2.0许可证），其代码仓库托管于GitHub，截至2025年10月已累计获得2.8万星标，支持Windows/macOS/Linux全平台。

### 核心能力与技术特性

#### 1. 模型优化与AI辅助功能
- **Qwen3-Coder深度适配**  
  针对代码场景优化的大语言模型，支持100+编程语言理解，特别在Python、JavaScript、Java等主流语言上表现突出。通过fine-tuning增强代码补全、错误修复、文档生成能力，实测代码生成准确率较通用模型提升35%。

- **多模态开发支持**  
  - **视觉模型自动切换**：检测输入中的图像（如截图、架构图）时，自动切换至Qwen-VL视觉模型进行分析，支持UI组件识别、流程图解释、手写代码转文本等场景  
  - **混合模态交互**：可在命令中嵌入图像路径（如`qwen "分析这个UI截图: ./login-page.png"`），AI将结合视觉信息生成HTML/CSS实现方案

- **高级代码理解**  
  - 自动解析项目结构，生成模块依赖图谱  
  - 支持跨文件重构建议，识别潜在性能瓶颈与安全漏洞  
  - 生成符合项目风格的单元测试（Jest/Pytest等框架兼容）

#### 2. 命令行工作流集成
- **无侵入式终端操作**  
  无需离开终端即可调用AI能力，支持直接在Vim/Neovim等编辑器内通过管道命令使用：  
  ```bash
  # 在Vim中选中文本后调用Qwen Code重构
  '<,'>!qwen "优化这段代码，提升可读性"
  ```

- **内置开发工具链**  
  - **文件系统交互**：AI可直接读取/修改项目文件（需用户确认），支持批量重构  
  - **Shell命令执行**：生成并执行终端命令（如`qwen "统计src目录下各文件行数"`），结果自动返回解析  
  - **网络工具**：集成curl/wget能力，可抓取网页内容进行代码分析（如`qwen "分析这个API文档并生成客户端SDK: https://api.example.com/docs"`）

- **会话管理机制**  
  - **Token智能压缩**：通过`/compress`命令自动摘要对话历史，在32k Token限制内延长会话  
  - **上下文隔离**：每个项目自动创建独立会话，避免跨项目干扰  
  - **统计与控制**：`/stats`命令实时显示Token使用量，防止API费用超支

#### 3. 可扩展架构
- **Model Context Protocol (MCP)**  
  自定义工具扩展接口，允许开发人员通过JavaScript编写插件，实现如数据库查询、云服务调用等功能。示例插件：  
  ```javascript
  // 自定义数据库查询插件
  module.exports = {
    name: 'db-query',
    description: '执行SQL查询并返回结果',
    execute: async (args, context) => {
      const { db } = context;
      return await db.query(args.sql);
    }
  };
  ```

- **OpenAI API兼容性**  
  支持通过环境变量配置第三方API（如OpenAI、Anthropic、本地Ollama服务）：  
  ```bash
  export OPENAI_BASE_URL="http://localhost:11434/v1"  # 连接本地Ollama
  export OPENAI_MODEL="qwen2:7b-code"               # 使用本地代码模型
  ```

### 安装与配置指南

#### 环境要求
- Node.js 20.0.0+  
- Git（源码安装需要）  
- Python 3.8+（部分代码分析功能依赖）

#### 多渠道安装方式
- **npm全局安装**（推荐）  
  ```bash
  npm install -g @qwen-code/qwen-code@latest
  qwen --version  # 验证安装
  ```

- **Homebrew（macOS/Linux）**  
  ```bash
  brew tap QwenLM/tap
  brew install qwen-code
  ```

- **源码编译**  
  ```bash
  git clone https://github.com/QwenLM/qwen-code.git
  cd qwen-code && npm install && npm run build
  npm link  # 全局链接
  ```

#### 快速上手流程
1. **首次启动授权**  
   运行`qwen`后自动打开浏览器，使用QwenChat账户登录（免费额度：每天2000次请求，每分钟60次限制）

2. **基础命令示例**  
   ```bash
   qwen "解释当前目录的代码结构"          # 项目分析
   qwen "重构src/utils/date.js"           # 代码优化
   qwen "为UserService生成单元测试"        # 测试生成
   cat app.js | qwen "找出这段代码的bug"   # 管道输入分析
   ```

3. **配置优化**  
   编辑`~/.qwen/settings.json`自定义参数：  
   ```json
   {
     "sessionTokenLimit": 64000,          # 增加会话Token上限
     "experimental.vlmSwitchMode": "once"  # 视觉模型单次切换模式
   }
   ```

### 高级使用技巧

#### 1. 开发效率提升方案
- **项目初始化模板**  
  ```bash
  qwen "创建一个React+TypeScript的Todo应用，生成项目结构和核心组件"
  ```

- **调试辅助**  
  粘贴错误堆栈信息，AI自动分析原因并提供修复命令：  
  ```bash
  qwen "解决这个报错: Error: Cannot find module 'react-dom'"
  # AI返回: npm install react-dom@latest --save
  ```

- **文档自动化**  
  生成符合JSDoc/TSDoc规范的注释：  
  ```bash
  qwen "为这个函数添加详细注释: $(cat src/api/user.js)"
  ```

#### 2. 团队协作功能
- **代码评审辅助**  
  在CI流程中集成Qwen Code进行自动化初评：  
  ```yaml
  # .github/workflows/code-review.yml示例
  jobs:
    review:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: npx @qwen-code/qwen-code review --dir ./src
  ```

- **知识沉淀**  
  通过`/export`命令将会话保存为Markdown文档，自动生成技术决策记录（ADR）

### 与竞品对比优势

| 特性                | Qwen Code               | GitHub Copilot         | Cursor编辑器           |
|---------------------|-------------------------|------------------------|------------------------|
| 使用方式            | 命令行/终端集成         | IDE插件                | 专用编辑器             |
| 项目级理解          | 支持完整项目分析        | 单文件上下文           | 多文件但需手动选择     |
| 终端操作能力        | 直接执行Shell命令       | 无                     | 有限支持               |
| 视觉模型支持        | 内置多模态切换          | 需额外插件             | 部分支持               |
| 开源可定制          | 完全开源，支持插件开发  | 闭源                   | 闭源                   |
| 本地模型兼容性      | 支持Ollama等本地后端    | 仅限Copilot Enterprise | 有限支持               |

Qwen Code特别适合习惯终端工作流的开发者，其无界面设计减少上下文切换成本，同时通过MCP协议提供无限扩展可能。对于需要深度项目理解和自动化操作的场景，相比IDE插件类工具具有明显效率优势。

### 学习资源与社区支持

- **官方文档**：[https://qwenlm.github.io/qwen-code-docs/zh](https://qwenlm.github.io/qwen-code-docs/zh)（含API参考与插件开发指南）  
- **GitHub仓库**：[https://github.com/QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)（问题反馈与贡献指南）  
- **Discord社区**：QwenLM官方服务器#qwen-code频道（中文支持）  
- **示例插件库**：提供数据库集成、云函数部署等20+官方插件  

如需企业级部署方案（私有模型接入、团队权限管理），可联系QwenLM商务团队获取定制化支持。

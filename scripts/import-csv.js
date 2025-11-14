/**
 * CSV 批量导入脚本
 * 使用方法: node scripts/import-csv.js data.csv
 * 或: npm run import:csv data.csv
 * 
 * CSV 格式:
 * id,name,url,icon,info,group,tags,description
 * 
 * 字段说明:
 * - id: 唯一标识符（必需），将作为文件名
 * - name: 网站名称（必需）
 * - url: 网站地址（必需）
 * - icon: 图标路径（可选，如: /assets/icons/baidu.ico）
 * - info: 简要信息（可选）
 * - group: 分组路径（必需，支持子分组，如: search 或 AI/工具）
 *   * 分组基于文件路径自动推断，此字段仅用于确定文件存放位置
 *   * 子分组使用斜杠分隔，如: AI/工具 表示 AI 分组下的 工具 子分组
 * - tags: 标签，多个标签用逗号分隔（可选，如: "搜索,工具"）
 * - description: Markdown 描述内容（可选）
 * 
 * CSV 示例:
 * id,name,url,icon,info,group,tags,description
 * baidu,百度,https://www.baidu.com,/assets/icons/baidu.ico,中国最大的搜索引擎,search,"搜索,工具","百度一下，你就知道。"
 * chatgpt,ChatGPT,https://chat.openai.com,,AI对话工具,AI/工具,"AI,对话","OpenAI 开发的 AI 对话工具"
 * 
 * 注意: 导入的文件将使用 Markdown frontmatter 格式，不再创建单独的 JSON 文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(csvContent) {
	const lines = csvContent.split('\n').filter(line => line.trim());
	if (lines.length < 2) {
		throw new Error('CSV 文件至少需要包含标题行和一行数据');
	}
	
	const headers = lines[0].split(',').map(h => h.trim());
	const rows = lines.slice(1).map(line => {
		const values = [];
		let current = '';
		let inQuotes = false;
		
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === ',' && !inQuotes) {
				values.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}
		values.push(current.trim());
		
		const obj = {};
		headers.forEach((header, index) => {
			obj[header] = values[index] || '';
		});
		return obj;
	});
	
	return rows;
}

function validateRow(row, index) {
	const errors = [];
	
	if (!row.id || !row.id.trim()) {
		errors.push('id 字段不能为空');
	}
	if (!row.name || !row.name.trim()) {
		errors.push('name 字段不能为空');
	}
	if (!row.url || !row.url.trim()) {
		errors.push('url 字段不能为空');
	}
	if (!row.group || !row.group.trim()) {
		errors.push('group 字段不能为空');
	}
	
	if (errors.length > 0) {
		throw new Error(`第 ${index + 2} 行数据错误: ${errors.join(', ')}`);
	}
	
	return true;
}

function escapeYamlString(str) {
	if (!str) return '';
	// 如果包含特殊字符，需要用引号包裹
	if (str.includes(':') || str.includes('"') || str.includes("'") || str.includes('\n')) {
		return `"${str.replace(/"/g, '\\"')}"`;
	}
	return str;
}

function formatYamlValue(value) {
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		return value.map(v => `  - ${escapeYamlString(v)}`).join('\n');
	}
	return escapeYamlString(value);
}

function createMarkdownFile(row, index) {
	// 验证必需字段
	validateRow(row, index);
	
	// 构建分组目录路径（支持子分组）
	const groupPath = row.group.trim();
	const groupDir = path.join(__dirname, '../src/data/groups', groupPath);
	
	// 确保分组目录存在
	if (!fs.existsSync(groupDir)) {
		fs.mkdirSync(groupDir, { recursive: true });
		console.log(`  → 创建分组目录: ${groupPath}`);
	}
	
	// 解析标签
	const tags = row.tags 
		? row.tags.split(',').map(t => t.trim()).filter(t => t)
		: [];
	
	// 构建 frontmatter 对象
	const frontmatter = {
		name: row.name.trim(),
		url: row.url.trim(),
	};
	
	// 添加可选字段
	if (row.icon && row.icon.trim()) {
		frontmatter.icon = row.icon.trim();
	}
	if (row.info && row.info.trim()) {
		frontmatter.info = row.info.trim();
	}
	if (tags.length > 0) {
		frontmatter.tags = tags;
	}
	
	// 构建 YAML frontmatter 字符串
	const yamlLines = [];
	yamlLines.push('---');
	Object.entries(frontmatter).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			yamlLines.push(`${key}:`);
			value.forEach(item => {
				yamlLines.push(`  - ${escapeYamlString(item)}`);
			});
		} else {
			yamlLines.push(`${key}: ${formatYamlValue(value)}`);
		}
	});
	yamlLines.push('---');
	
	// 构建 Markdown 内容
	const markdownContent = row.description 
		? row.description.trim() 
		: row.info 
			? `# ${row.name.trim()}\n\n${row.info.trim()}`
			: `# ${row.name.trim()}`;
	
	// 组合完整内容
	const fullContent = yamlLines.join('\n') + '\n\n' + markdownContent + '\n';
	
	// 创建 Markdown 文件
	const fileName = `${row.id.trim()}.md`;
	const mdPath = path.join(groupDir, fileName);
	
	// 检查文件是否已存在
	if (fs.existsSync(mdPath)) {
		console.warn(`  ⚠ 文件已存在，将覆盖: ${groupPath}/${fileName}`);
	}
	
	fs.writeFileSync(mdPath, fullContent, 'utf-8');
	
	console.log(`  ✓ ${groupPath}/${fileName}`);
}

// 主函数
const csvFile = process.argv[2];
if (!csvFile) {
	console.error('❌ 错误: 请提供 CSV 文件路径');
	console.log('\n使用方法:');
	console.log('  node scripts/import-csv.js data.csv');
	console.log('  或: npm run import:csv data.csv');
	console.log('\nCSV 格式请参考脚本文件顶部的注释说明。');
	process.exit(1);
}

// 检查文件是否存在
if (!fs.existsSync(csvFile)) {
	console.error(`❌ 错误: 文件不存在: ${csvFile}`);
	process.exit(1);
}

try {
	const csvContent = fs.readFileSync(csvFile, 'utf-8');
	const rows = parseCSV(csvContent);
	
	if (rows.length === 0) {
		console.error('❌ 错误: CSV 文件中没有数据行');
		process.exit(1);
	}
	
	console.log(`\n开始导入 ${rows.length} 条数据...\n`);
	
	let successCount = 0;
	let errorCount = 0;
	
	rows.forEach((row, index) => {
		try {
			createMarkdownFile(row, index);
			successCount++;
		} catch (error) {
			console.error(`  ❌ 第 ${index + 2} 行导入失败: ${error.message}`);
			errorCount++;
		}
	});
	
	console.log(`\n${'='.repeat(50)}`);
	if (errorCount === 0) {
		console.log(`✓ 导入完成！成功导入 ${successCount} 条数据`);
		console.log(`  所有文件已保存为 Markdown frontmatter 格式`);
	} else {
		console.log(`⚠ 导入完成，成功 ${successCount} 条，失败 ${errorCount} 条`);
	}
	console.log(`${'='.repeat(50)}\n`);
	
	if (errorCount > 0) {
		process.exit(1);
	}
} catch (error) {
	console.error(`\n❌ 导入失败: ${error.message}`);
	console.error('\n错误详情:', error);
	process.exit(1);
}

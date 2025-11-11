/**
 * CSV 批量导入脚本示例
 * 使用方法: node scripts/import-csv.js data.csv
 * 
 * CSV 格式:
 * id,name,url,icon,info,group,tags,description
 * baidu,百度,https://www.baidu.com,/assets/icons/baidu.ico,中国最大的搜索引擎,search,"搜索,工具","百度一下，你就知道。"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(csvContent) {
	const lines = csvContent.split('\n').filter(line => line.trim());
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

function createNavItem(row) {
	const groupDir = path.join(__dirname, '../src/data/groups', row.group);
	
	// 确保分组目录存在
	if (!fs.existsSync(groupDir)) {
		fs.mkdirSync(groupDir, { recursive: true });
	}
	
	// 创建 JSON 文件
	const jsonData = {
		id: row.id,
		name: row.name,
		url: row.url,
		icon: row.icon || '',
		info: row.info || '',
		desc_md: `${row.id}.md`,
		group: row.group,
		tags: row.tags ? row.tags.split(',').map(t => t.trim()) : []
	};
	
	const jsonPath = path.join(groupDir, `${row.id}.json`);
	fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, '\t') + '\n');
	
	// 创建 Markdown 文件
	const mdPath = path.join(groupDir, `${row.id}.md`);
	const mdContent = row.description || `# ${row.name}\n\n${row.info || ''}`;
	fs.writeFileSync(mdPath, mdContent);
	
	console.log(`✓ 已创建: ${row.group}/${row.id}`);
}

// 主函数
const csvFile = process.argv[2];
if (!csvFile) {
	console.error('请提供 CSV 文件路径');
	console.log('使用方法: node scripts/import-csv.js data.csv');
	process.exit(1);
}

try {
	const csvContent = fs.readFileSync(csvFile, 'utf-8');
	const rows = parseCSV(csvContent);
	
	console.log(`开始导入 ${rows.length} 条数据...\n`);
	
	rows.forEach(createNavItem);
	
	console.log(`\n✓ 导入完成！共导入 ${rows.length} 条数据`);
} catch (error) {
	console.error('导入失败:', error.message);
	process.exit(1);
}


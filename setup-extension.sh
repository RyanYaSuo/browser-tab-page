#!/bin/bash
# Chrome Extension 安装助手
# 构建并打开 Chrome 扩展管理页面

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
echo "📦 构建扩展..."
cd "$DIR" && npm run build

echo ""
echo "========================"
echo "✅ 扩展已构建完成"
echo "========================"
echo ""
echo "请手动完成以下步骤："
echo ""
echo "1. 打开 Chrome 浏览器，访问："
echo "   chrome://extensions"
echo ""
echo "2. 开启右上角的【开发者模式】"
echo ""
echo "3. 点击左上角【加载已解压的扩展程序】"
echo ""
echo "4. 选择以下文件夹："
echo "   $DIR/dist"
echo ""
echo "5. 完成！扩展已替换新标签页"
echo ""
echo "也可一键打开扩展管理页面："

# Try to open Chrome extensions page
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS_SCRIPT='tell application "Google Chrome" to open location "chrome://extensions"'
  osascript -e "$OS_SCRIPT" 2>/dev/null && echo "✅ 已打开 Chrome 扩展页面" || echo "⚠️  自动打开失败，请手动访问 chrome://extensions"
fi

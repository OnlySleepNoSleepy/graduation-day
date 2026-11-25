/* 把 src 下的脚本全部内联，生成单文件游戏 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = ['data_core', 'data_windows', 'extra_items', 'scenes', 'reacts', 'events_main', 'events_campus', 'events_people', 'events_more', 'events_month', 'endings', 'engine', 'ui'];
const OUT = path.join(ROOT, '毕业那天你会去哪.html');

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let inline = '';
for (const f of FILES) {
  const code = fs.readFileSync(path.join(ROOT, 'src', f + '.js'), 'utf8');
  if (code.indexOf('</scr' + 'ipt>') >= 0) {
    throw new Error(f + '.js 含有 </script>，会截断 HTML');
  }
  inline += '<script>\n' + code + '\n</script>\n';
}

// 去掉外链脚本标签
html = html.replace(/<script src="src\/[^"]+"><\/script>\s*/g, '');

if (html.indexOf('</body>') < 0) throw new Error('缺少 </body>');
html = html.replace('</body>', inline + '</body>');

fs.writeFileSync(OUT, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log('已生成: ' + path.basename(OUT) + '  (' + kb + ' KB)');
console.log('内联脚本: ' + FILES.length + ' 个');
console.log('外部依赖: ' + (/(src|href)\s*=\s*"http/.test(html) ? '有（需检查）' : '无'));

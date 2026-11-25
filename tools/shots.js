/* 生成「自动点击」的临时页面，用来给不同界面截图 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const base = fs.readFileSync(path.join(ROOT, '毕业那天你会去哪.html'), 'utf8');

const ORDER = '[\'[data-act="new"]\',\'[data-act="toCollege"]\',\'[data-act="pick"]\',\'[data-act="cont"]\',\'[data-act="next"]\',\'[data-act="go"]\']';

/* 一直点，直到点够 limit 次 */
function driver(limit) {
  return [
    '<script>',
    '(function(){',
    '  var LIMIT=' + limit + ', clicks=0, didCol=false, didMaj=false;',
    '  var order=' + ORDER + ';',
    '  function first(sel){ return document.querySelector(sel); }',
    '  var t=setInterval(function(){',
    '    if(clicks>=LIMIT){ clearInterval(t); return; }',
    '    if(first(".cert")){ clearInterval(t); return; }',
    '    if(first(".mask")){ var dy=first(".dyes"); if(dy){ dy.click(); } return; }',
    '    if(!didCol && first(".col")){ first(".col").click(); didCol=true; clicks++; return; }',
    '    if(!didMaj && first(".major")){ first(".major").click(); didMaj=true; clicks++; return; }',
    '    for(var i=0;i<order.length;i++){ var el=first(order[i]); if(el){ el.click(); clicks++; return; } }',
    '    clearInterval(t);',
    '  }, 20);',
    '})();',
    '</' + 'script>'
  ].join('\n');
}

/* 2022 年入学 + 医学中心：展示「该年份还没开设」的专业 */
function gateDriver() {
  return [
    '<script>',
    '(function(){',
    '  var step=0;',
    '  function q(s){ return document.querySelector(s); }',
    '  var t=setInterval(function(){',
    '    if(step===0 && q(\'[data-act="new"]\')){ q(\'[data-act="new"]\').click(); step=1; return; }',
    '    if(step===1 && q(\'[data-group="y"][data-v="2022"]\')){ q(\'[data-group="y"][data-v="2022"]\').click(); step=2; return; }',
    '    if(step===2 && q(\'[data-act="toCollege"]\')){ q(\'[data-act="toCollege"]\').click(); step=3; return; }',
    '    if(step===3){',
    '      var all=document.querySelectorAll(".col");',
    '      for(var i=0;i<all.length;i++){ if(all[i].textContent.indexOf("医学中心")>=0){ all[i].click(); step=4; return; } }',
    '      step=4; return;',
    '    }',
    '    clearInterval(t);',
    '  }, 20);',
    '})();',
    '</' + 'script>'
  ].join('\n');
}

/* 广东生源 → 社交 → 老乡会 → 聚一次 → 4 小时：验证省份专属文案 */
function hometownDriver() {
  return [
    '<script>',
    '(function(){',
    '  var step=0;',
    '  function q(s){ return document.querySelector(s); }',
    '  function clickText(sel, txt){',
    '    var all=document.querySelectorAll(sel);',
    '    for(var i=0;i<all.length;i++){ if(all[i].textContent.indexOf(txt)>=0){ all[i].click(); return true; } }',
    '    return false;',
    '  }',
    '  var t=setInterval(function(){',
    '    if(q(".g-crumb") && q(".g-crumb").textContent.indexOf("聚一次")>=0 && q(".deltas")){ clearInterval(t); return; }',
    '    if(step===0 && q(\'[data-act="new"]\')){ q(\'[data-act="new"]\').click(); step=1; return; }',
    '    if(step===1 && q(\'[data-group="p"][data-v="gd"]\')){ q(\'[data-group="p"][data-v="gd"]\').click(); step=2; return; }',
    '    if(step===2 && q(\'[data-act="toCollege"]\')){ q(\'[data-act="toCollege"]\').click(); step=3; return; }',
    '    if(step===3 && q(".col")){ q(".col").click(); step=4; return; }',
    '    if(step===4 && q(".major")){ q(".major").click(); step=5; return; }',
    '    if(step===5 && q(\'[data-act="go"]\')){ q(\'[data-act="go"]\').click(); step=6; return; }',
    '    if(step===6 && !q(".rail")){',
    '      var p=q(\'[data-act="pick"]\'); if(p){ p.click(); return; }',
    '      var c=q(\'[data-act="cont"]\'); if(c){ c.click(); return; }',
    '      return;',
    '    }',
    '    if(step===6 && q(".rail")){ clickText(".rbtn","社交"); step=7; return; }',
    '    if(step===7 && q(".rail")){ clickText(".rbtn","老乡会"); step=8; return; }',
    '    if(step===8 && q(".rail")){ clickText(".rbtn","聚一次"); step=9; return; }',
    '    if(step===9 && q(".rail")){ var r=q(".rbtn"); if(r){ r.click(); step=10; } return; }',
    '    clearInterval(t);',
    '  }, 20);',
    '})();',
    '</' + 'script>'
  ].join('\n');
}

/* 走到主界面后点某个按钮（竞赛 / 进入下个月） */
function afterHub(sel) {
  return [
    '<script>',
    '(function(){',
    '  var step=0;',
    '  function q(s){ return document.querySelector(s); }',
    '  var t=setInterval(function(){',
    '    if(step===0){ var n=q(\'[data-act="new"]\'); if(n){ n.click(); step=1; } return; }',
    '    if(step===1){ var c=q(\'[data-act="toCollege"]\'); if(c){ c.click(); step=2; } return; }',
    '    if(step===2){ var c2=q(".col"); if(c2){ c2.click(); step=3; } return; }',
    '    if(step===3){ var m=q(".major"); if(m){ m.click(); step=4; } return; }',
    '    if(step===4){ var g=q(\'[data-act="go"]\'); if(g){ g.click(); step=5; } return; }',
    '    if(step===5){',
    '      if(q(".rail")){ step=6; return; }',
    '      var p=q(\'[data-act="pick"]\'); if(p){ p.click(); return; }',
    '      var c3=q(\'[data-act="cont"]\'); if(c3){ c3.click(); return; }',
    '      return;',
    '    }',
    '    if(step===6){ var b=q(\'' + sel + '\'); if(b){ b.click(); step=7; } return; }',
    '    clearInterval(t);',
    '  }, 20);',
    '})();',
    '</' + 'script>'
  ].join('\n');
}

const files = {
  _shot_form: driver(1),
  _shot_college: driver(2),
  _shot_major: driver(4),
  _shot_hub: driver(7),
  _shot_place: driver(8),
  _shot_item: driver(9),
  _shot_dur: driver(10),
  _shot_effect: driver(11),
  _shot_end: driver(9999),
  _shot_gate: gateDriver(),
  _shot_hometown: hometownDriver(),
  _shot_comp: afterHub('[data-act="comp"]'),
  _shot_confirm: afterHub('[data-act="nextmonth"]')
};

Object.keys(files).forEach(function (k) {
  fs.writeFileSync(path.join(__dirname, k + '.html'), base.replace('</body>', files[k] + '</body>'), 'utf8');
});
console.log('临时页面已生成: ' + Object.keys(files).join(', '));

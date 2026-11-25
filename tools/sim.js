/* 平衡模拟器：在 Node 里把游戏跑几千遍，看结局分布是否合理 */
'use strict';

require('../src/data_core.js');
require('../src/data_windows.js');
require('../src/events_main.js');
require('../src/events_campus.js');
require('../src/events_people.js');
require('../src/events_more.js');
require('../src/events_month.js');
require('../src/scenes.js');
require('../src/reacts.js');
require('../src/endings.js');
require('../src/engine.js');

var GD = globalThis.GD;
var R = globalThis.RCU;
var MAJORS = Object.keys(GD.MAJORS);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ---------- 窗口导航：按偏好找到能到达它的那条路 ---------- */

function windowHasItem(winId, itemId) {
  var w = GD.WIN[winId];
  for (var i = 0; i < w.places.length; i++) if (w.places[i].itemMap[itemId]) return true;
  return false;
}
function placeHasItem(winId, placeId, itemId) {
  var p = GD.WIN[winId].placeMap[placeId];
  return !!(p && p.itemMap[itemId]);
}

function chooseHub(sc, pref) {
  if (!pref || !pref.length) return Math.floor(Math.random() * sc.windows.length);
  for (var i = 0; i < pref.length; i++) {
    for (var j = 0; j < sc.windows.length; j++) {
      if (windowHasItem(sc.windows[j].id, pref[i])) return j;
    }
  }
  return Math.floor(Math.random() * sc.windows.length);
}
function choosePlace(sc, pref) {
  if (!pref || !pref.length) return Math.floor(Math.random() * sc.places.length);
  for (var i = 0; i < pref.length; i++) {
    for (var j = 0; j < sc.places.length; j++) {
      if (placeHasItem(sc.winId, sc.places[j].id, pref[i])) return j;
    }
  }
  return Math.floor(Math.random() * sc.places.length);
}
function chooseItem(sc, pref) {
  if (!pref || !pref.length) return Math.floor(Math.random() * sc.items.length);
  for (var i = 0; i < pref.length; i++) {
    for (var j = 0; j < sc.items.length; j++) {
      if (sc.items[j].id === pref[i]) return j;
    }
  }
  return Math.floor(Math.random() * sc.items.length);
}

/* ---------- 时长选择 ---------- */
function pickDur(s, policy) {
  if (policy.randomDur) return Math.floor(Math.random() * 3);
  if (s.energy < 32) return 0;          /* 没力气就 2 小时 */
  if (policy.long) return 2;            /* 极限党拉满 6 小时 */
  return 1;                             /* 正常 4 小时 */
}

/* 本月有没有能做的比赛：返回在开放列表里的下标 */
function compIndex(s) {
  var mm = R.naturalMonth(s), taken = {};
  s.comps.forEach(function (c) { taken[c.id] = 1; });
  var list = GD.COMPS.filter(function (c) { return c.months.indexOf(mm) >= 0 && !taken[c.id]; });
  for (var i = 0; i < list.length; i++) {
    var need = list[i].level === 1 ? 1 : list[i].level === 2 ? 2 : 3;
    if (need <= s.slots && list[i].energy <= s.energy) return i;
  }
  return -1;
}

/* ---------- 策略 ---------- */

var REST = ['sleep', 'ball', 'bbq', 'tea'];

function prefOf(s, base) {
  return s.mood < 32 ? REST.concat(base) : base;
}

var POLICIES = {
  random: {
    story: function (s, n) { return Math.floor(Math.random() * n); },
    pref: null,
    randomDur: true
  },
  /* 考研党 */
  kaoyan: {
    story: function (s, n, sc) {
      if (sc.tag === 'main' && s.ch === 5) return 0;
      return Math.random() < 0.5 ? 0 : Math.floor(Math.random() * n);
    },
    pref: function (s) { return prefOf(s, ['ky', 'major', 'eng', 'sl']); }
  },
  /* 考公党 */
  kaogong: {
    story: function (s, n, sc) {
      if (sc.tag === 'main' && s.ch === 5) return 1;
      return Math.random() < 0.4 ? 1 : Math.floor(Math.random() * n);
    },
    pref: function (s) { return prefOf(s, ['xg', 'sl', 'major', 'eng']); }
  },
  /* 就业党 */
  job: {
    story: function (s, n, sc) {
      if (sc.tag === 'main' && s.ch === 5) return 2;
      return 0;
    },
    pref: function (s) { return prefOf(s, ['go', 'join', 'major']); }
  },
  /* 保研党 */
  baoyan: {
    story: function (s, n, sc) {
      if (sc.tag === 'main' && s.ch === 5) return 3;
      return 1;
    },
    pref: function (s) {
      return prefOf(s, Math.random() < 0.45 ? ['do', 'lead', 'team'] : ['major', 'eng', 'lead']);
    },
    wantsComp: true
  },
  /* 普通学生：七成半出勤，学习生活五五开 */
  typical: {
    story: function (s, n) { return Math.floor(Math.random() * n); },
    pref: function (s) {
      return s.mood < 30 ? ['sleep', 'bbq'] : (Math.random() < 0.5 ? ['major', 'read'] : ['bbq', 'join', 'ball']);
    },
    skipClass: 0.15
  },
  /* 参军党：大二去当兵，复学后继续学 */
  veteran: {
    story: function (s, n) { return Math.floor(Math.random() * n); },
    pref: function (s) { return prefOf(s, ['major', 'eng', 'go', 'join']); },
    enlist: true
  },
  /* 摆烂党 */
  slacker: {
    story: function (s, n) { return n - 1; },
    pref: function () { return ['duo', 'sleep', 'bbq', 'tea', 'duo']; }
  },
  /* 极限党：只学习，从不休息 */
  extreme: {
    story: function (s, n, sc) {
      if (sc.tag === 'main' && s.ch === 5) return 0;
      return 0;
    },
    pref: function (s) { return s.energy < 20 ? ['sleep', 'nap'] : ['ky', 'major', 'eng']; }
  }
};

/* ---------- 跑一局 ---------- */

function play(policy, provKey) {
  var year = pick(GD.YEARS);
  var avail = MAJORS.filter(function (k) { return GD.MAJORS[k].since <= year; });
  var prov = provKey
    ? GD.PROVINCES.filter(function (p) { return p[0] === provKey; })[0]
    : pick(GD.PROVINCES);
  var s = R.newGame({
    name: '测试',
    major: pick(avail),
    year: year,
    prov: prov[0],
    allow: 800 + Math.floor(Math.random() * 4200),
    gender: pick(GD.GENDERS).k
  });
  R.beginMonth(s);
  var guard = 0;
  while (s.scene.kind !== 'end' && guard++ < 1500) {
    var sc = s.scene;
    if (guard > 8800) {
      globalThis.__DBG = globalThis.__DBG || [];
      globalThis.__DBG.push(s.month + ' ' + sc.kind + ' slots=' + s.slots + ' e=' + Math.round(s.energy) +
        (sc.kind === 'hub' ? ' att=' + sc.attended + ' cslot=' + sc.classSlots + ' win=' + sc.windows.length : '') +
        (sc.kind === 'comp' ? ' list=' + sc.list.length : '') +
        (sc.kind === 'dur' ? ' opts=' + sc.opts.length + ' item=' + sc.itemId : ''));
      if (globalThis.__DBG.length > 60) globalThis.__DBG.shift();
    }
    var pref = policy.pref ? policy.pref(s) : null;
    if (sc.kind === 'story') {
      if (sc.tag === 'enlist') R.pick(s, policy.enlist ? 0 : 1);
      else R.pick(s, policy.story(s, sc.choices.length, sc));
    }
    else if (sc.kind === 'result') R.pick(s, 0);
    else if (sc.kind === 'hub') {
      var ci = policy.wantsComp ? compIndex(s) : -1;
      if (!sc.attended && sc.slots >= sc.classSlots && Math.random() > (policy.skipClass || 0)) R.attendClass(s);
      else if (!sc.attended && sc.slots >= sc.classSlots) R.endMonth(s);
      else if (ci >= 0) { R.compScene(s); R.pick(s, ci); }
      else if (sc.slots >= 2) R.pick(s, chooseHub(sc, pref));
      else R.endMonth(s);
    }
    else if (sc.kind === 'place') R.pick(s, choosePlace(sc, pref));
    else if (sc.kind === 'item') R.pick(s, chooseItem(sc, pref));
    else if (sc.kind === 'dur') R.pick(s, pickDur(s, policy));
    else if (sc.kind === 'comp') R.pick(s, 0);
    else if (sc.kind === 'effect') R.pick(s, 0);
    else if (sc.kind === 'summary') R.pick(s, 0);
    else if (sc.kind === 'vet') R.pick(s, 0);
    else if (sc.kind === 'remajor') R.pick(s, Math.floor(Math.random() * sc.list.length));
    else if (sc.kind === 'settle') R.pick(s, 0);
    else { s.ended = '__STUCK__'; break; }
  }
  if (!s.ended) s.ended = R.evaluate(s);
  if (guard >= 9000) {
    s.ended = '__STUCK__';
    if (globalThis.__DBG) console.log(globalThis.__DBG.join('\n'));
  }
  return s;
}

/* ---------- 统计 ---------- */

function run(name, policy, n, provKey) {
  var tally = {}, sums = { gpa: 0, mood: 0, prep: 0, skill: 0, resume: 0, money: 0, network: 0, english: 0 };
  var sc3 = { kaoyan: 0, kaogong: 0, job: 0 };
  var stuck = 0, failedRuns = 0;
  for (var i = 0; i < n; i++) {
    var s = play(policy, provKey);
    if (s.ended === '__STUCK__') { stuck++; continue; }
    tally[s.ended] = (tally[s.ended] || 0) + 1;
    if (s.fails > 0) failedRuns++;
    for (var k in sums) sums[k] += s[k];
    var q = R.scores(s);
    sc3.kaoyan += q.kaoyan; sc3.kaogong += q.kaogong; sc3.job += q.job;
    sums.aw = (sums.aw || 0) + s.awards.length;
    sums.zc = (sums.zc || 0) + R.zongce(s);
  }
  var keys = Object.keys(GD.ENDINGS).concat(Object.keys(tally).filter(function (k) { return !GD.ENDINGS[k]; }));
  keys.sort(function (a, b) { return (tally[b] || 0) - (tally[a] || 0); });
  var line = keys.map(function (k) {
    var pct = ((tally[k] || 0) / (n - stuck) * 100).toFixed(1);
    var nm = GD.ENDINGS[k] ? GD.ENDINGS[k].title : k;
    return nm + ' ' + pct + '%';
  }).join(' | ');
  console.log('\n[' + name + ']  n=' + n + (stuck ? '  卡死 ' + stuck : ''));
  console.log('  ' + line);
  console.log('  挂过科的比例: ' + (failedRuns / n * 100).toFixed(1) + '%');
  console.log('  均值: 绩点 ' + (sums.gpa / n).toFixed(2) +
    ' 心情 ' + (sums.mood / n).toFixed(0) +
    ' 备考 ' + (sums.prep / n).toFixed(0) +
    ' 技能 ' + (sums.skill / n).toFixed(0) +
    ' 履历 ' + (sums.resume / n).toFixed(0) +
    ' 英语 ' + (sums.english / n).toFixed(0) +
    ' 金钱 ' + (sums.money / n).toFixed(0));
  console.log('  派生分: 考研 ' + (sc3.kaoyan / n).toFixed(1) +
    ' / 考公 ' + (sc3.kaogong / n).toFixed(1) +
    ' / 就业 ' + (sc3.job / n).toFixed(1));
  return tally;
}

/* ---------- 数据体检 ---------- */

function validate() {
  var bad = [], ids = {};
  GD.EVENTS.forEach(function (e) {
    if (ids[e.id]) bad.push('事件 id 重复: ' + e.id);
    ids[e.id] = 1;
    if (!e.main) {
      if (!(e.ch && e.ch.length === 2 && e.ch[0] >= 1 && e.ch[1] <= 8 && e.ch[0] <= e.ch[1])) {
        bad.push('章节区间有问题: ' + e.id);
      }
    }
    if (!e.choices || e.choices.length < 2) bad.push('选项不足: ' + e.id);
    e.choices.forEach(function (c) {
      if (!c.t) bad.push('缺选项文案: ' + e.id);
      if (!c.r) bad.push('缺结果文案: ' + e.id);
    });
    if (e.major) e.major.forEach(function (k) { if (!GD.MAJORS[k]) bad.push('事件引用不存在的专业: ' + e.id + '/' + k); });
    if (e.cat && !GD.CATS[e.cat]) bad.push('事件门类不存在: ' + e.id);
  });
  [1, 2, 3, 4, 5, 6, 7, 8].forEach(function (n) {
    if (!GD.EVENTS.some(function (e) { return e.main && e.ch[0] === n; })) bad.push('缺主线: 第 ' + n + ' 章');
  });
  GD.COLLEGES.forEach(function (c) {
    if (!c.majors.length) bad.push('学院没有专业: ' + c.name);
    c.majors.forEach(function (m) {
      var d = GD.MAJORS[m[0]];
      if (!d) { bad.push('专业未展开: ' + m[0]); return; }
      if (!d.line) bad.push('专业缺一句话: ' + m[0]);
      if (!GD.CATS[d.cat]) bad.push('专业门类错: ' + m[0]);
    });
  });
  /* 窗口体检 */
  var itemCount = 0, winIds = {}, uniq = {};
  GD.WINDOWS.forEach(function (w) {
    if (winIds[w.id]) bad.push('窗口 id 重复: ' + w.id);
    winIds[w.id] = 1;
    if (!w.places || !w.places.length) bad.push('窗口没有地点: ' + w.id);
    w.places.forEach(function (p) {
      if (!p.items.length) bad.push('地点没有事项: ' + w.id + '/' + p.id);
      var local = {};
      p.items.forEach(function (it) {
        itemCount++;
        uniq[it.id] = 1;
        if (local[it.id]) bad.push('同一地点事项重复: ' + w.id + '/' + p.id + '/' + it.id);
        local[it.id] = 1;
        if (!it.r) bad.push('事项缺结果文案: ' + w.id + '/' + p.id + '/' + it.id);
        if (!it.eff || !Object.keys(it.eff).length) bad.push('事项没有效果: ' + w.id + '/' + p.id);
      });
    });
  });
  /* 每章每门类可用事件数 */
  Object.keys(GD.CATS).forEach(function (cat) {
    var line = [];
    for (var n = 1; n <= 8; n++) {
      var cnt = GD.EVENTS.filter(function (e) {
        if (e.main || e.ch[0] > n || e.ch[1] < n) return false;
        if (e.major) return false;
        if (e.cat && e.cat !== cat) return false;
        if (e.dir || e.rom) return false;
        return true;
      }).length;
      line.push(cnt);
      if (cnt < 3) bad.push(cat + ' 第 ' + n + ' 章可用事件只有 ' + cnt);
    }
    console.log('  ' + cat + ' 各章随机事件: ' + line.join(' / '));
  });
  console.log('=== 数据体检 ===');
  console.log('  学院 ' + GD.COLLEGES.length + ' 个，专业 ' + GD.MAJOR_ORDER.length + ' 个，省份 ' + GD.PROVINCES.length + ' 个');
  console.log('  事件 ' + GD.EVENTS.length + ' 条；窗口 ' + GD.WINDOWS.length +
    ' 个，地点 ' + GD.WINDOWS.reduce(function (a, w) { return a + w.places.length; }, 0) +
    ' 个，事项 ' + itemCount + ' 处（' + Object.keys(uniq).length + ' 种）');
  if (!bad.length) console.log('  全部通过');
  else bad.slice(0, 20).forEach(function (b) { console.log('  !! ' + b); });
}

validate();
console.log('\n=== 结局分布模拟 ===');
var N = parseInt(process.argv[2] || '800', 10);
var all = {};
Object.keys(POLICIES).forEach(function (k) { all[k] = run(k, POLICIES[k], N); });

console.log('\n=== 生源地影响（只改省份，策略不变）===');
[['sc', '四川（最近）'], ['hb', '湖北（中间）'], ['xj', '新疆（最远）']].forEach(function (p) {
  run('考研党 · ' + p[1], POLICIES.kaoyan, N, p[0]);
});
[['sc', '四川（最近）'], ['xj', '新疆（最远）']].forEach(function (p) {
  run('只学不休 · ' + p[1], POLICIES.extreme, N, p[0]);
});

console.log('\n=== 可达性 ===');
var reach = {};
Object.keys(all).forEach(function (p) { Object.keys(all[p]).forEach(function (e) { reach[e] = (reach[e] || 0) + all[p][e]; }); });
Object.keys(GD.ENDINGS).forEach(function (e) {
  var c = reach[e] || 0;
  console.log('  ' + (c > 0 ? '可达  ' : '不可达') + ' ' + GD.ENDINGS[e].title + ' : ' + c);
});

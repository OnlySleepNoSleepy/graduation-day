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
var GD = globalThis.GD, R = globalThis.RCU;

function wh(winId, itemId) {
  var w = GD.WIN[winId];
  for (var i = 0; i < w.places.length; i++) if (w.places[i].itemMap[itemId]) return true;
  return false;
}
function ph(winId, placeId, itemId) {
  var p = GD.WIN[winId].placeMap[placeId];
  return !!(p && p.itemMap[itemId]);
}
function cHub(sc, pref) {
  for (var i = 0; i < pref.length; i++)
    for (var j = 0; j < sc.windows.length; j++)
      if (wh(sc.windows[j].id, pref[i])) return j;
  return 0;
}
function cPlace(sc, pref) {
  for (var i = 0; i < pref.length; i++)
    for (var j = 0; j < sc.places.length; j++)
      if (ph(sc.winId, sc.places[j].id, pref[i])) return j;
  return 0;
}
function cItem(sc, pref) {
  for (var i = 0; i < pref.length; i++)
    for (var j = 0; j < sc.items.length; j++)
      if (sc.items[j].id === pref[i]) return j;
  return 0;
}
function compIdx(s) {
  var mm = R.naturalMonth(s), taken = {};
  s.comps.forEach(function (c) { taken[c.id] = 1; });
  var list = GD.COMPS.filter(function (c) { return c.months.indexOf(mm) >= 0 && !taken[c.id]; });
  for (var i = 0; i < list.length; i++) {
    var need = list[i].level === 1 ? 1 : list[i].level === 2 ? 2 : 3;
    if (need <= s.slots && list[i].energy <= s.energy) return i;
  }
  return -1;
}

var hist = {}, zc = [], aw = [];
for (var g = 0; g < 100; g++) {
  var s = R.newGame({ name: 't', major: 'cs', year: 2023, prov: 'sc', allow: 1500, gender: 'm' });
  R.beginMonth(s);
  var guard = 0;
  while (s.scene.kind !== 'end' && guard++ < 9000) {
    var sc = s.scene;
    var pref = s.mood < 32 ? ['sleep', 'ball', 'major'] : (Math.random() < 0.45 ? ['do', 'lead', 'team'] : ['major', 'eng', 'lead']);
    if (sc.kind === 'story') R.pick(s, 0);
    else if (sc.kind === 'result') R.pick(s, 0);
    else if (sc.kind === 'hub') {
      var ci = compIdx(s);
      if (!sc.attended && sc.slots >= sc.classSlots) R.attendClass(s);
      else if (ci >= 0) { R.compScene(s); R.pick(s, ci); }
      else if (sc.slots >= 2) R.pick(s, cHub(sc, pref));
      else R.endMonth(s);
    }
    else if (sc.kind === 'place') R.pick(s, cPlace(sc, pref));
    else if (sc.kind === 'item') R.pick(s, cItem(sc, pref));
    else if (sc.kind === 'dur') R.pick(s, s.energy < 32 ? 0 : 1);
    else if (sc.kind === 'comp') R.pick(s, 0);
    else if (sc.kind === 'effect') R.pick(s, 0);
    else if (sc.kind === 'summary') R.pick(s, 0);
    else if (sc.kind === 'settle') R.pick(s, 0);
    else break;
  }
  if (!s.ended) s.ended = R.evaluate(s);
  hist[s.ended] = (hist[s.ended] || 0) + 1;
  zc.push(R.zongce(s));
  aw.push(s.awards.length);
}
zc.sort(function (a, b) { return a - b; });
aw.sort(function (a, b) { return a - b; });
console.log('结局', JSON.stringify(hist));
console.log('获奖数 中位 ' + aw[50] + ' / 均值 ' + (aw.reduce(function (a, b) { return a + b; }, 0) / aw.length).toFixed(1) + ' / 分布 ' + aw.filter(function (v, i) { return i % 10 === 0; }).join(','));
console.log('综测 中位 ' + zc[50].toFixed(1) + ' / 均值 ' + (zc.reduce(function (a, b) { return a + b; }, 0) / zc.length).toFixed(1) + ' / 分布 ' + zc.filter(function (v, i) { return i % 10 === 0; }).map(function (v) { return v.toFixed(0); }).join(','));

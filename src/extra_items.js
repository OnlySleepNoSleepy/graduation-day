(function (GD) {
  'use strict';
  /* 给常用地点补选项。表里没有的地点跳过，不报错。 */
  function findPlace(winId, placeId) {
    var w = null, p = null;
    GD.WINDOWS.forEach(function (x) { if (x.id === winId) w = x; });
    if (!w) return null;
    w.places.forEach(function (x) { if (x.id === placeId) p = x; });
    return p;
  }
  function add(winId, placeId, items) {
    var p = findPlace(winId, placeId);
    if (!p) return;
    items.forEach(function (it) { p.items.push(it); });
  }

  add('study', 'lib', [
    ['note', '整理笔记', { gpa: 0.03, skill: 2, mood: 1 }, '你把三个星期的笔记压成两页，突然看懂了一件事。'],
    ['group', '和同学结伴自习', { gpa: 0.03, network: 3, mood: 2 }, '谁都不好意思先走，于是一起坐到了十点。'],
    /* 毕设：大四才出现 */
    ['thesis', '写毕业论文', { gpa: 0.01, mood: -3 }, '你打开文档，光标闪了很久，才敲下第一行。',
      function (s) { return s.ch >= 7; }]
  ]);
  add('study', 'room', [
    ['mock', '做一套真题', { gpa: 0.04, english: 2, mood: -2 }, '计时两小时，你只做完三分之二，铃声就响了。']
  ]);
  add('life', 'dorm2', [
    ['call', '给家里打个电话', { mood: 5, network: 2 }, '你妈问了三遍钱够不够花，你说够。']
  ]);
  add('play', 'field', [
    ['walk', '在操场走圈', { mood: 3, fitness: 2, network: 2 }, '你和室友走了十圈，谁都没提学习的事。']
  ]);
  add('play', 'street', [
    ['ktv', '去唱歌', { mood: 7, network: 3, money: -60 }, '你唱了两首，第二首被切了。']
  ]);
  add('social', 'club', [
    ['fare', '摆摊招新', { network: 4, resume: 2, mood: 1, money: -30 }, '你守了两小时摊位，加了七个微信。']
  ]);
  add('practice', 'intern', [
    ['overtime', '留下来加班', { resume: 5, money: 60, mood: -4, fitness: -2 }, '九点，办公室只剩你和保洁阿姨。']
  ]);
  add('practice', 'lab', [
    ['data', '跑数据', { skill: 3, resume: 2, gpa: 0.02, mood: -2 }, '跑了一下午，结果和预期完全相反。']
  ]);

  ['note', 'group', 'thesis', 'mock', 'call', 'walk', 'ktv', 'fare', 'overtime', 'data']
    .forEach(function (k) { if (GD.ITEM_COST[k] === undefined) GD.ITEM_COST[k] = 6; });

  Object.assign(GD.ITEM_COST, {
    note: 5, group: 4, thesis: 9, mock: 7, call: -3, walk: -4, ktv: 5, fare: 6, overtime: 16, data: 9
  });
  Object.assign(GD.ITEM_FIX, {
    note: 2, group: 2, thesis: 3, mock: 2, call: 1, walk: 1, ktv: 3, fare: 2, overtime: 3, data: 2
  });
})(globalThis.GD);

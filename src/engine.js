(function (g) {
  'use strict';
  var GD = g.GD;

  var SEM = ['大一上', '大一下', '大二上', '大二下', '大三上', '大三下', '大四上', '大四下'];
  var SEM_END = [
    '第一个学期结束。你终于知道一食堂几点人最少。',
    '大一下结束。成都的夏天来了，宿舍的空调开始整夜响。',
    '大二上结束。你开始觉得，四年好像也没那么长。',
    '大二下结束。你第一次在简历上写下了“项目经历”。',
    '大三上结束。三条路选了一条，剩下的两条偶尔还会在梦里出现。',
    '大三下结束。这个暑假之后，就只剩最后一年了。',
    '大四上结束。日历翻到了最薄的那一页。',
    '大四下结束。宿舍楼下的行李箱，一车一车地往外拉。'
  ];
  var KEYS = ['gpa', 'english', 'skill', 'network', 'fitness', 'mood', 'money', 'resume', 'prep', 'fail'];
  var LABEL = {
    gpa: '绩点', english: '英语', skill: '技能', network: '人脉', fitness: '体魄',
    mood: '心情', money: '金钱', resume: '履历', prep: '备考', fail: '挂科'
  };
  var CLAMP = { gpa: [0, 4], english: [0, 100], skill: [0, 100], network: [0, 100], fitness: [0, 100], mood: [0, 100], resume: [0, 100], prep: [0, 100] };

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function jitter(v) { return v * (0.82 + Math.random() * 0.36); }
  function deep(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------------- 状态 ---------------- */

  function newGame(o) {
    o = o || {};
    var mj = GD.MAJORS[o.major] ? o.major : 'cs';
    var year = GD.YEARS.indexOf(o.year) >= 0 ? o.year : 2023;
    var gender = 'm', i;
    for (i = 0; i < GD.GENDERS.length; i++) if (GD.GENDERS[i].k === o.gender) gender = o.gender;

    var prov = null, far = 2;
    for (i = 0; i < GD.PROVINCES.length; i++) {
      if (GD.PROVINCES[i][0] === o.prov) { prov = GD.PROVINCES[i]; far = GD.PROVINCES[i][3]; }
    }
    if (!prov) { prov = GD.PROVINCES[0]; far = 0; }

    var allow = Math.round(Number(o.allow) || 1500);
    allow = Math.max(GD.ALLOW_MIN, Math.min(GD.ALLOW_MAX, allow));

    var s = {
      name: (o.name || '').trim() || '李想',
      major: mj,
      cat: GD.MAJORS[mj].cat,
      year: year, prov: prov[0], provName: prov[1], far: far,
      food: prov[4], accent: prov[5], folk: prov[6],
      allow: allow, gender: gender,
      ch: 1, month: 1, energy: 100, slots: 6, attended: false, monthLog: [], summary: null,
      absent: 0, fails: 0, retake: false, awards: [], comps: [],
      vet: false, calJump: 0, debuff: 0, enlistChoice: null,
      club: null, clubAct: 0, clubHonor: 0, thesis: 0, ledger: { in: 0, out: 0 },
      seen: [], highlights: [],
      gpa: 3.0, english: 40, skill: 20, network: 20, fitness: 60,
      mood: 80, money: allow * 2, resume: 0, prep: 0, fail: 0,
      direction: null, rom: 0, flags: {},
      ended: null, scene: null, snapshot: null, lastAction: null
    };
    var b = GD.MAJORS[s.major].boost || {};
    for (var k in b) s[k] = clamp(s[k] + b[k], 0, 100);

    /* 离得越远，越孤单一点；四川本地的同学多 */
    s.mood = clamp(s.mood + (2 - far * 2), 0, 100);
    s.network = clamp(s.network + (4 - far * 2), 0, 100);

    /* 生活费：手头紧的人心情低一点，宽裕的高一点 */
    var am = allow < 900 ? -6 : allow < 1300 ? -3 : allow < 2000 ? 0 : allow < 3500 ? 3 : 5;
    s.mood = clamp(s.mood + am, 0, 100);

    s.scene = { kind: 'cover' };
    return s;
  }

  /* ---------------- 数值结算 ---------------- */

  function apply(s, eff) {
    var out = [];
    if (!eff) return out;
    for (var k in eff) {
      if (KEYS.indexOf(k) < 0) continue;
      var v = eff[k], before = s[k];
      var delta = (k === 'fail') ? v : jitter(v);
      if (k === 'money') delta = Math.round(delta / 10) * 10;
      else if (k === 'gpa') delta = Math.round(delta * 100) / 100;
      else delta = Math.round(delta);
      s[k] = s[k] + delta;
      if (CLAMP[k]) s[k] = clamp(s[k], CLAMP[k][0], CLAMP[k][1]);
      var real = Math.round((s[k] - before) * 100) / 100;
      if (k === 'money' && real) {
        s.ledger = s.ledger || { in: 0, out: 0 };
        if (real > 0) s.ledger.in += real; else s.ledger.out -= real;
      }
      if (real !== 0) out.push({ k: k, label: LABEL[k], v: real });
    }
    return out;
  }

  function pickChoice(s, ch) {
    var diff = apply(s, ch.e || {});
    if (ch.set) s.direction = ch.set;
    if (typeof ch.rom === 'number') s.rom = ch.rom;
    if (ch.flag) s.flags[ch.flag] = true;
    if (ch.log) s.highlights.push({ ch: s.ch, t: ch.log });
    if (typeof ch.enlist === 'boolean') s.enlistChoice = ch.enlist;
    if (typeof ch.club === 'string') {
      s.club = (ch.club === 'none') ? null : ch.club;
      s.clubAct = 0;
    }
    return diff;
  }

  /* ---------------- 事件池 ---------------- */

  function mainOf(n) {
    for (var i = 0; i < GD.EVENTS.length; i++) {
      var e = GD.EVENTS[i];
      if (e.main && e.ch[0] === n) return e;
    }
    return null;
  }

  function poolFor(s) {
    return GD.EVENTS.filter(function (e) {
      if (e.main) return false;
      if (s.seen.indexOf(e.id) >= 0) return false;
      if (s.ch < e.ch[0] || s.ch > e.ch[1]) return false;
      if (e.major && e.major.indexOf(s.major) < 0) return false;
      if (e.cat && e.cat !== s.cat) return false;
      if (e.yearMax && s.year > e.yearMax) return false;
      if (e.yearMin && s.year < e.yearMin) return false;
      if (e.home && e.home.indexOf(s.home) < 0) return false;
      if (e.farMin && s.far < e.farMin) return false;
      if (e.prov && e.prov.indexOf(s.prov) < 0) return false;
      if (e.dir && e.dir !== s.direction) return false;
      if (e.rom && s.rom < e.rom) return false;
      if (e.flag && !s.flags[e.flag]) return false;
      if (e.noflag && s.flags[e.noflag]) return false;
      return true;
    });
  }

  /* 事件文案可以是字符串，也可以是随开局设定变化的函数 */
  function textOf(e, s) {
    return typeof e.text === 'function' ? e.text(s) : e.text;
  }

  function drawEvent(s) {
    var pool = poolFor(s);
    if (!pool.length) return null;
    var total = 0, i;
    for (i = 0; i < pool.length; i++) total += (pool[i].w || 1);
    var r = Math.random() * total;
    for (i = 0; i < pool.length; i++) {
      r -= (pool[i].w || 1);
      if (r <= 0) { s.seen.push(pool[i].id); return pool[i]; }
    }
    s.seen.push(pool[0].id);
    return pool[0];
  }

  /* ---------------- 派生分 ---------------- */

  function norm(s) { return s.gpa / 4 * 100; }

  function scores(s) {
    var T = GD.TUNE, g = norm(s);
    var vb = s.vet ? 12 : 0;
    return {
      kaoyan: g * T.kaoyan.gpa + s.english * T.kaoyan.eng + s.prep * T.kaoyan.prep + s.mood * T.kaoyan.mood + vb,
      kaogong: s.prep * T.kaogong.prep + s.skill * T.kaogong.skill + s.english * T.kaogong.eng + s.network * T.kaogong.net + s.mood * T.kaogong.mood + g * T.kaogong.gpa,
      job: s.skill * T.job.skill + s.resume * T.job.resume + s.network * T.job.net + g * T.job.gpa
    };
  }

  function evaluate(s, fin) {
    var T = GD.TUNE, sc = fin || scores(s);
    if (s.mood <= T.moodLine) return 'burnout';
    if (s.fails >= T.failLimit) return 'delay';
    /* 保研：没有挂科记录 + 综测 ≥97 + 校级及以上二等奖 ≥10 个 */
    if (s.fails === 0 && s.awards.length >= GD.BAOYAN.awards &&
        zongce(s) >= GD.BAOYAN.zongce &&
        (s.direction === 'kaoyan' || !s.direction)) return 'baoyan';
    if (s.direction === 'kaoyan' && sc.kaoyan >= T.kaoyan.need) return 'kaoyan';
    if (s.direction === 'kaogong' && sc.kaogong >= T.kaogong.need) return 'kaogong';
    if (sc.job >= T.job.need) return 'bigco';
    if (sc.job >= T.stable.need) return 'stable';
    return 'idle';
  }

  /* 临场发挥：复试 / 面试 / 运气，统一 ±9%（就业 ±6%） */
  function luck(spread) {
    return 1 - spread + Math.random() * spread * 2;
  }

  /* ---------------- 流程 ---------------- */

  /* ---------------- 流程（按月推进） ---------------- */

  var MONTHS = ['9 月', '10 月', '11 月', '12 月', '1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月'];

  function monthLabel(s) {
    var off = s.month - 1;
    var num = (off + 8) % 12 + 1;
    var y = s.year + Math.floor((off + 8) / 12) + (s.calJump || 0);
    return y + ' 年 ' + num + ' 月';
  }

  function seasonOfM(m) {
    if (m >= 9 && m <= 11) return 'autumn';
    if (m === 12 || m <= 2) return 'winter';
    if (m >= 3 && m <= 5) return 'spring';
    return 'summer';
  }

  function pickMonthLine(s) {
    var used = s.lines || (s.lines = {});
    var sea = seasonOfM(naturalMonth(s));
    var y = Math.ceil(s.month / 12);
    function pool() {
      return GD.MONTH_LINES.filter(function (l) {
        if (used[l.id]) return false;
        if (l.sea && l.sea !== sea) return false;
        if (l.y && y < l.y) return false;
        return true;
      });
    }
    var p = pool();
    if (!p.length) { s.lines = used = {}; p = pool(); }
    if (!p.length) return null;
    var one = p[Math.floor(Math.random() * p.length)];
    used[one.id] = 1;
    return one;
  }

  function beginMonth(s) {
    if (s.month > 48) return finish(s);
    s.ch = Math.ceil(s.month / 6);
    /* 重修学期：两小时被重修课吃掉 */
    if ((s.month - 1) % 6 === 0) s.retake = s.fails > 0;
    s.slots = GD.MONTH_SLOTS;
    if (s.debuff > 0) s.debuff -= 1;
    var ml = pickMonthLine(s);
    s.monthLine = ml ? ml.t : '';
    if (ml && ml.e) apply(s, ml.e);
    s.attended = false;
    s.monthLog = [];
    s.snapshot = deep({
      name: s.name, major: s.major, cat: s.cat, ch: s.ch, month: s.month, energy: s.energy,
      slots: s.slots, attended: s.attended, absent: s.absent,
      fails: s.fails, retake: s.retake, awards: s.awards, comps: s.comps,
      vet: s.vet, calJump: s.calJump, debuff: s.debuff,
      monthLine: s.monthLine, lines: s.lines,
      club: s.club, clubAct: s.clubAct, clubHonor: s.clubHonor,
      seen: s.seen, highlights: s.highlights,
      year: s.year, prov: s.prov, provName: s.provName, far: s.far,
      food: s.food, accent: s.accent, folk: s.folk,
      allow: s.allow, gender: s.gender,
      gpa: s.gpa, english: s.english, skill: s.skill, network: s.network, fitness: s.fitness,
      mood: s.mood, money: s.money, resume: s.resume, prep: s.prep, fail: s.fail,
      direction: s.direction, rom: s.rom, flags: s.flags
    });
    save(s);


    /* 每学期第一个月：主线事件 */
    if (s.summary) {
      s.scene = { kind: 'summary', data: s.summary };
      s.summary = null;
      return s;
    }
    if ((s.month - 1) % 6 === 0) {
      var m = mainOf(s.ch);
      if (m) {
        s.scene = { kind: 'story', tag: 'main', title: m.title, text: textOf(m, s), choices: m.choices, month: monthLabel(s) };
        return s;
      }
    }

    /* 每年上学期首月：征兵（主线跑完再问） */
    var en = maybeEnlist(s);
    if (en) return en;
    /* 平时三成概率遇到点事 */
    if (Math.random() < 0.28) {
      var e = drawEvent(s);
      if (e) {
        s.scene = { kind: 'story', tag: 'random', title: '这个月的某一天', text: textOf(e, s), choices: e.choices, month: monthLabel(s) };
        return s;
      }
    }
    return hubScene(s);
  }

  function afterStory(s) {
    if (s.mood <= 0) return finish(s);
    if (s.enlistChoice === true) { s.enlistChoice = null; return doEnlist(s); }
    s.enlistChoice = null;
    var en2 = maybeEnlist(s);
    if (en2) return en2;
    return hubScene(s);
  }

  function advanceMonth(s) {
    s.month += 1;
    if (s.month > 48) return finish(s);
    s.energy = clamp(s.energy + GD.ENERGY_REGEN, 0, GD.ENERGY_MAX);
    return beginMonth(s);
  }

  /* 玩家点「进入下个月」时调用 */
  function endMonth(s) {
    if (!s.attended) s.absent += 1;
    s.summary = buildSummary(s);
    if (s.month === 48) return defenseScene(s);
    if (s.month % 6 === 0) return examScene(s);
    return advanceMonth(s);
  }

  function buildSummary(s) {
    var acts = s.monthLog.map(function (a) { return a.name; });
    var lines = [];
    if (!s.attended) lines.push('这个月没去上课，缺课累计 ' + s.absent + ' 次。');
    if (s.absent >= 3) lines.push('缺课已经到一半，学期末这一门要挂。');
    if (s.energy < 25) lines.push('精力快见底了，下个月最好先补一觉。');
    if (s.mood < 30) lines.push('心情不太行，找点让自己开心的事做做。');
    if (!acts.length) lines.push('这个月什么都没做。');
    return {
      month: monthLabel(s), acts: acts, lines: lines,
      gpa: s.gpa, mood: Math.round(s.mood), energy: Math.round(s.energy)
    };
  }

  /* ---------------- 自由探索：大类 → 地点 → 事项 → 时长 ---------------- */

  function windowsFor(s) {
    return GD.WINDOWS.filter(function (w) {
      if (w.req === 'prep' && s.ch < 5) return false;
      if (w.req === 'romance' && s.rom < 1) return false;
      return true;
    });
  }

  function hubScene(s) {
    var ws = windowsFor(s).map(function (w) {
      return { id: w.id, name: w.name, icon: w.icon, desc: w.desc, places: w.places.length };
    });
    s.scene = {
      kind: 'hub', windows: ws, title: monthLabel(s),
      energy: Math.round(s.energy), sub: SEM[s.ch - 1],
      hours: s.slots, attended: s.attended, retake: s.retake, line: s.monthLine || '',
      slots: s.slots, courses: coursesOf(s), classSlots: classSlots(s),
      course: coursesOf(s)[0],
      comps: openComps(s).length
    };
    return s;
  }

  function placeScene(s, winId) {
    var w = GD.WIN[winId];
    var ps = w.places.map(function (p) { return { id: p.id, name: p.name, note: p.note, items: p.items.length }; });
    s.scene = { kind: 'place', winId: winId, winName: w.name, places: ps, title: monthLabel(s), energy: Math.round(s.energy) };
    return s;
  }

  function itemScene(s, winId, placeId) {
    var w = GD.WIN[winId], p = w.placeMap[placeId];
    var its = p.items.filter(function (it) { return !it[4] || it[4](s); }).map(function (it) {
      return { id: it.id, name: it.name, cost: GD.ITEM_COST[it.id] || 12, fix: GD.ITEM_FIX[it.id] || 0, pay: (it.eff.money || 0) };
    });
    s.scene = {
      kind: 'item', winId: winId, placeId: placeId, winName: w.name, placeName: p.name,
      title: monthLabel(s), items: its, energy: Math.round(s.energy)
    };
    return s;
  }

  function durScene(s, winId, placeId, itemId) {
    var w = GD.WIN[winId], p = w.placeMap[placeId], it = p.itemMap[itemId];
    var base = GD.ITEM_COST[it.id] || 12;
    var opts = GD.DUR.map(function (d) {
      return {
        m: d.m, label: d.label, note: d.note,
        cost: Math.round(base * d.cost), hours: d.hours,
        recover: base < 0
      };
    });
    s.scene = {
      kind: 'dur', winId: winId, placeId: placeId, itemId: itemId,
      itemName: it.name, placeName: p.name, winName: w.name,
      title: monthLabel(s), opts: opts, energy: Math.round(s.energy)
    };
    return s;
  }

  function useItem(s, winId, placeId, itemId, durIdx) {
    var w = GD.WIN[winId], p = w.placeMap[placeId], it = p.itemMap[itemId];
    var d = GD.DUR[durIdx] || GD.DUR[1];
    /* 时间块不够就做不了 */
    if (s.slots < d.slots) {
      s.scene = {
        kind: 'effect', returnHub: true,
        text: '这个月只剩 ' + s.slots + ' 块时间了，做不了这件事。要不先「进入下个月」？',
        diff: [], energy: Math.round(s.energy),
        winId: winId, placeId: placeId, itemId: it.id,
        winName: w.name, placeName: p.name, itemName: it.name, hours: 0
      };
      return s;
    }
    s.slots -= d.slots;
    s.monthLog.push({ name: it.name });
    var tired = s.energy < 15 ? 0.7 : 1;
    var rusty = (s.debuff > 0 && (winId === 'study' || winId === 'prep')) ? 0.6 : 1;
    var k = d.eff * GD.BASE_SCALE * tired * rusty;

    var eff = {};
    for (var key in it.eff) {
      if (key === 'gpa') eff[key] = it.eff[key] * k;
      else eff[key] = Math.round(it.eff[key] * k);
    }
    if (d.m === 3) eff.mood = (eff.mood || 0) + GD.LONG_MOOD;

    var diff = apply(s, eff);
    if (typeof it.eff.rom === 'number') s.rom = Math.min(4, s.rom + it.eff.rom);

    /* 社团活跃度：参加活动和当负责人都在攒 */
    if (winId === 'study' || winId === 'prep') s.semStudy = (s.semStudy || 0) + 1;
    if (it.id === 'thesis') s.thesis = clamp((s.thesis || 0) + 12, 0, 100);
    if (s.club && (it.id === 'join' || it.id === 'lead')) {
      var add = it.id === 'lead' ? 16 : 9;
      s.clubAct = clamp(s.clubAct + add, 0, 100);
      diff.push({ k: 'club', label: '社团', v: add });
    }

    /* 老乡会对离家远的人格外有用 */
    if (it.id === 'meet' && s.far > 0) {
      var before = s.mood;
      s.mood = clamp(s.mood + s.far, 0, 100);
      var gain = s.mood - before;
      if (gain > 0) diff.push({ k: 'mood', label: '心情', v: gain });
    }

    /* 精力 */
    var base = GD.ITEM_COST[it.id] || 12;
    var e0 = s.energy;
    s.energy = clamp(s.energy - Math.round(base * d.cost), 0, GD.ENERGY_MAX);
    var eDelta = Math.round(s.energy - e0);
    if (eDelta !== 0) diff.push({ k: 'energy', label: '精力', v: eDelta });
    if (s.energy <= 0 && eDelta < 0) {
      s.mood = clamp(s.mood - 2, 0, 100);
      diff.push({ k: 'mood', label: '心情', v: -2 });
    }

    s.lastAction = { name: it.name, diff: diff };
    if (s.mood <= 0) return finish(s);
    s.scene = {
      kind: 'effect', text: it.r + (GD.reactLine ? ' ' + GD.reactLine(winId, s) : ''), diff: diff, energy: Math.round(s.energy),
      winId: winId, placeId: placeId, itemId: it.id,
      winName: w.name, placeName: p.name, itemName: it.name, hours: d.hours,
      monthEnd: (s.month % 6 === 0)
    };
    return s;
  }

  /* ---------------- 上课 / 竞赛 / 综测 ---------------- */

  function naturalMonth(s) { return (s.month - 1 + 8) % 12 + 1; }

  function collegeKeyOf(s) {
    var m = GD.MAJORS[s.major];
    return m ? m.collegeKey : 'cs';
  }

  function coursesOf(s) {
    var pool = GD.COURSES[collegeKeyOf(s)] || ['专业课'];
    var n = GD.SEM_COURSE_COUNT[s.ch - 1] || 3;
    if (s.ch === 7) return ['就业指导'];
    if (s.ch === 8) return ['毕业设计'];
    var yr = Math.min(4, Math.ceil(s.ch / 2));
    var pub = GD.PUBLIC[yr] || [];
    var list = pub.slice(0, Math.min(2, n, pub.length));
    while (list.length < n) list.push(pool[(s.ch * 2 + list.length) % pool.length]);
    return list;
  }

  function classSlots(s) { return GD.CLASS_SLOTS[s.ch - 1] || 2; }

  function attendClass(s) {
    if (s.attended) return hubScene(s);
    var cost = classSlots(s);
    if (s.slots < cost) return hubScene(s);
    var cs = coursesOf(s);
    s.slots -= cost;
    s.attended = true;
    var d = apply(s, { gpa: 0.006 });
    var e0 = s.energy;
    s.energy = clamp(s.energy - 6, 0, GD.ENERGY_MAX);
    d.push({ k: 'energy', label: '精力', v: Math.round(s.energy - e0) });
    s.monthLog.push({ name: '上课' });
    s.scene = {
      kind: 'effect', returnHub: true,
      text: '你去上了本学期的课：' + cs.join('、') + '。' +
        (s.retake ? '重修班的老师点到了你的名字。' : '点名点到你的时候，你答得很大声。'),
      diff: d, energy: Math.round(s.energy),
      winName: '上课', placeName: cs.join('、'), itemName: '本月课程', hours: cost
    };
    return s;
  }

  function myAbility(s, need) {
    return need.k === 'gpa' ? s.gpa / 4 * 100 : (s[need.k] || 0);
  }

  function openComps(s) {
    var mm = naturalMonth(s), taken = {};
    s.comps.forEach(function (c) { taken[c.id] = 1; });
    return GD.COMPS.filter(function (c) {
      return c.months.indexOf(mm) >= 0 && !taken[c.id];
    });
  }

  function compScene(s) {
    var list = openComps(s).map(function (c) {
      return {
        id: c.id, name: c.name, level: c.level, hours: c.hours, energy: c.energy, fee: c.fee,
        slots: c.level === 1 ? 1 : c.level === 2 ? 2 : 3,
        levelName: c.level === 1 ? '校级' : c.level === 2 ? '省级' : '国家级',
        needLabel: c.need.label, needReq: c.need.req, my: Math.round(myAbility(s, c.need))
      };
    });
    s.scene = {
      kind: 'comp', title: monthLabel(s), list: list,
      slots: s.slots, energy: Math.round(s.energy)
    };
    return s;
  }

  function runComp(s, compId) {
    var c = null;
    GD.COMPS.forEach(function (x) { if (x.id === compId) c = x; });
    if (!c) return hubScene(s);
    var need = c.level === 1 ? 1 : c.level === 2 ? 2 : 3;
    if (s.slots < need || s.energy < c.energy) {
      s.comps.push({ id: c.id, name: c.name, level: c.level, prize: '', month: s.month });
      s.scene = {
        kind: 'effect', returnHub: true,
        text: '你算了一下：这个比赛要 ' + need + ' 块时间、' + c.energy + ' 点精力，你这个月不够。',
        diff: [], energy: Math.round(s.energy),
        winName: '竞赛', placeName: c.name, itemName: '报名', hours: 0
      };
      return s;
    }
    s.slots -= need;
    s.monthLog.push({ name: c.name });
    var e0 = s.energy;
    s.energy = clamp(s.energy - c.energy, 0, GD.ENERGY_MAX);
    s.money -= c.fee;

    /* 能力越接近要求越稳，但能力不够也有 12% 的底子 */
    var my = myAbility(s, c.need);
    var ratio = Math.max(0, Math.min(1.4, my / c.need.req));
    var lvK = c.level === 3 ? 0.78 : c.level === 2 ? 0.9 : 1.05;
    var p = Math.min(0.94, (0.20 + 0.58 * ratio) * lvK);
    var roll = Math.random();
    var prize = roll < p * 0.2 ? '一等' : roll < p * 0.6 ? '二等' : roll < p ? '三等' : '';

    var d = [{ k: 'energy', label: '精力', v: Math.round(s.energy - e0) }];
    if (c.fee) d.push({ k: 'money', label: '金钱', v: -c.fee });

    var text;
    if (prize) {
      var rGain = c.level === 3 ? 8 : c.level === 2 ? 5 : 3;
      var b0 = s.resume;
      s.resume = clamp(s.resume + rGain, 0, 100);
      d.push({ k: 'resume', label: '履历', v: Math.round(s.resume - b0) });
      s.comps.push({ id: c.id, name: c.name, level: c.level, prize: prize, month: s.month });
      if (prize !== '三等') {
        s.awards.push({ id: c.id, name: c.name, level: c.level, prize: prize, month: s.month });
        s.highlights.push({ ch: s.ch, t: '你拿了' + c.name + '的' + prize + '等奖' });
      }
      text = '你代表学校参加了' + c.name + '，拿了' + prize + '等奖。证书发下来那天，你把它夹进了专业课的书里。';
    } else {
      s.comps.push({ id: c.id, name: c.name, level: c.level, prize: '', month: s.month });
      var m0 = s.mood;
      s.mood = clamp(s.mood - 3, 0, 100);
      d.push({ k: 'mood', label: '心情', v: Math.round(s.mood - m0) });
      text = '你在' + c.name + '里没拿到名次。评委的评语很客气，但意思很清楚。';
    }

    s.scene = {
      kind: 'effect', returnHub: true, text: text, diff: d,
      energy: Math.round(s.energy), winName: '竞赛', placeName: c.name,
      itemName: '参赛', hours: c.hours
    };
    return s;
  }

  function zongce(s) {
    var g = s.gpa / 4 * 100;
    var aw = Math.min(s.awards.length * 2.5, 30);
    var r = Math.min(s.resume, 100) * 0.2;
    var vet = s.vet ? 10 : 0;
    var ch = (s.clubHonor || 0) * GD.CLUB_HONOR.zongce;
    return Math.min(100, g * 0.6 + aw + r + vet + ch);
  }

  var ENLIST_MONTHS = [1, 13, 25, 37];   /* 大一上 / 大二上 / 大三上 / 大四上 的第一个月 */

  function maybeEnlist(s) {
    if (s.vet) return null;
    if (ENLIST_MONTHS.indexOf(s.month) < 0) return null;
    var key = 'enlist_' + s.month;
    if (s.flags[key]) return null;
    s.flags[key] = true;
    var grade = ['大一', '大二', '大三', '大四'][ENLIST_MONTHS.indexOf(s.month)];
    s.scene = {
      kind: 'story', tag: 'enlist', title: '征兵宣传',
      text: '九月，学校的征兵宣传车又停在食堂门口了，横幅上写着“大学生应征入伍，保留学籍，退伍复学”。\n\n' +
        '辅导员在班群里发通知：服役两年，学费全免，退伍后可以重新选专业，考研还有专项计划。\n\n' +
        '你现在是' + grade + '。你把通知看了三遍。',
      choices: [
        { t: '报名参军，去部队待两年', e: { mood: 2 },
          r: '你在报名表上签了字。体检、政审、公示，一切都比你想的快。',
          enlist: true, log: grade + '，你报名参了军' },
        { t: '不去，把书读完', e: { mood: 3 },
          r: '你把通知划走了。第二天横幅还在，你已经不看它了。', enlist: false }
      ]
    };
    return s;
  }

  function doEnlist(s) {
    s.vet = true;
    s.calJump = 2;
    s.money += 25000;
    s.gpa = Math.max(0, Math.round((s.gpa - 0.25) * 100) / 100);
    s.english = clamp(s.english - 10, 0, 100);
    s.skill = clamp(s.skill - 10, 0, 100);
    s.resume = clamp(s.resume + 15, 0, 100);
    s.fitness = clamp(s.fitness + 15, 0, 100);
    s.mood = clamp(s.mood + 6, 0, 100);
    s.debuff = 3;
    s.highlights.push({ ch: s.ch, t: '你去当了两年兵，然后回来了' });
    s.scene = {
      kind: 'vet', title: '两年后',
      text: '两年。你站过凌晨四点的岗，跑过五公里越野，也学会了在二十分钟内把被子叠成豆腐块。\n\n' +
        '退伍那天，指导员把退伍证递给你，说“回去吧，好好读”。\n\n' +
        '你回到学校，学籍还在，宿舍换了人。退伍费到账：¥25,000。学费全免，学校给你重新选专业的机会。\n\n' +
        '只是你翻开课本的时候发现，大二学的东西，一个字都不记得了。'
    };
    return s;
  }

  function remajorScene(s, step, colKey) {
    if (step === 1) {
      s.scene = {
        kind: 'remajor', step: 1, title: '复学 · 重新选专业',
        text: '你可以重新选一个专业。',
        list: GD.COLLEGES.map(function (c) {
          return { key: c.key, name: c.name, note: c.majors.length + ' 个专业' };
        })
      };
      return s;
    }
    var col = null;
    GD.COLLEGES.forEach(function (c) { if (c.key === colKey) col = c; });
    s.scene = {
      kind: 'remajor', step: 2, title: col.name, colKey: colKey,
      text: '选一个你想读的。',
      list: col.majors.map(function (m) {
        var d = GD.MAJORS[m[0]];
        return { key: m[0], name: d.name, note: d.tag || '' };
      })
    };
    return s;
  }

  function defenseScene(s) {
    var t = s.thesis || 0;
    var g = s.gpa / 4 * 100;
    var score = Math.round(t * 0.62 + g * 0.22 + 12 + (Math.random() * 12 - 6));
    score = clamp(score, 20, 100);
    var verdict = score >= 85 ? '优秀' : score >= 60 ? '通过' : '不通过';
    s.scene = { kind: 'defense', score: score, verdict: verdict, thesis: t };
    return s;
  }

  function examScene(s) {
    var seen = {}, list = [];
    coursesOf(s).forEach(function (c) {
      var nm = (typeof c === 'string') ? c : (c.name || c.course || '课程');
      if (seen[nm]) return;
      seen[nm] = 1;
      list.push(c);
    });
    list = list.slice(0, 4);
    var absent = s.absent || 0;
    var study = s.semStudy || 0;
    var g = s.gpa / 4 * 100;
    var rows = list.map(function (c) {
      var nm = (typeof c === 'string') ? c : (c.name || c.course || '课程');
      var base = 38 + g * 0.32 + Math.min(study, 16) * 1.4 + (s.attended ? 6 : -6) - Math.min(absent, 4) * 5;
      var sc = Math.round(base + (Math.random() * 16 - 8));
      sc = clamp(sc, 0, 100);
      return { name: nm, score: sc, grade: sc >= 90 ? '优' : sc >= 80 ? '良' : sc >= 70 ? '中' : sc >= 60 ? '及格' : '不及格' };
    });
    var sum = 0;
    rows.forEach(function (r) { sum += r.score; });
    var avg = Math.round(sum / Math.max(1, rows.length));
    var fails = rows.filter(function (r) { return r.score < 60; }).length;
    var total = 42;
    var rank = Math.round(total * (1 - (avg - 45) / 55));
    rank = clamp(rank, 1, total);
    var note = absent >= 3 ? '你有几门课几乎没去过。' : absent > 0 ? '你缺过 ' + absent + ' 次课。' : '这个学期你一节没缺。';
    s.exam = { avg: avg, fails: fails, rank: rank, total: total };
    s.scene = {
      kind: 'exam', sem: s.ch, rows: rows, avg: avg, rank: rank, total: total,
      fails: fails, note: note
    };
    return s;
  }

  function settleScene(s) {
    var notes = [], lines = [];
    /* 缺课达 1/3（一学期 6 个月，缺 2 个月即算） */
    /* 学年末评十佳社团 */
    if (s.month % 12 === 0 && s.club && s.clubAct >= GD.CLUB_HONOR.need) {
      s.clubHonor += 1;
      s.resume = clamp(s.resume + GD.CLUB_HONOR.resume, 0, 100);
      lines.push('你们社团评上了这一学年的“十佳学生社团”。颁奖那天你在台下鼓掌，手都拍红了。');
      s.highlights.push({ ch: s.ch, t: '你所在的' + GD.CLUBS[s.club].name + '评上了十佳社团' });
      s.clubAct = Math.round(s.clubAct * 0.5);
    } else if (s.month % 12 === 0 && s.club) {
      s.clubAct = Math.round(s.clubAct * 0.5);
    }

    var wasRetake = s.retake;
    s.semStudy = 0;
    if (s.absent >= 3) {
      s.fails += 1;
      s.retake = true;
      notes.push('这个学期缺了 ' + s.absent + ' 个月的课，' +
        (wasRetake ? '重修没过，下学期还得再来一次。' : '挂了一门，下学期要重修。'));
    } else if (wasRetake) {
      s.retake = false;
      lines.push('重修通过了。挂科的记录还在，但这门课总算过了。');
    }
    s.absent = 0;
    s.mood = clamp(s.mood + 4, 0, 100);
    s.money += s.allow;
    s.ledger = s.ledger || { in: 0, out: 0 };
    s.ledger.in += s.allow;
    if (s.vet) { s.money += 800; s.ledger.in += 800; }

    var T = GD.FAR_TRAIT[s.far] || GD.FAR_TRAIT[2];
    s.money -= T.travel;
    s.mood = clamp(s.mood + T.homeMood, 0, 100);
    if (T.travel > 0) {
      lines.push('放了个假，来回一趟' + (s.far >= 2 ? '路上折腾' : '车票') + '花了 ¥' + T.travel + '。');
    }
    if (T.homeMood > 0) {
      lines.push('你在家待了几天，走的时候家里人往包里塞了不少东西。');
    } else if (T.homeMood < 0) {
      lines.push('你没有回家。宿舍楼下比平时安静很多。');
    }

    if (s.mood <= 0) return finish(s);
    s.scene = {
      kind: 'settle', title: SEM[s.ch - 1] + ' · 学期结束',
      text: SEM_END[s.ch - 1], notes: notes, lines: lines, ch: s.ch
    };
    return s;
  }

  function finish(s) {
    var raw = scores(s);
    var fin = {
      kaoyan: raw.kaoyan * luck(0.09),
      kaogong: raw.kaogong * luck(0.09),
      job: raw.job * luck(0.06)
    };
    s.ended = evaluate(s, fin);
    s.scene = { kind: 'end', key: s.ended, scores: fin };
    try { localStorage.removeItem('rcu4.save'); } catch (e) {}
    return s;
  }

  /* ---------------- 交互入口 ---------------- */

  function pick(s, i) {
    var sc = s.scene;
    if (!sc || !sc.kind) return hubScene(s);
    if (sc.kind === 'story') {
      var ch = sc.choices[i];
      if (!ch) return s;
      var diff = pickChoice(s, ch);
      s.scene = { kind: 'result', text: ch.r, diff: diff, tag: sc.tag, source: sc };
      return s;
    }
    if (sc.kind === 'result') {
      var src = s.scene.source;
      s.scene = src;
      return afterStory(s);
    }
    if (sc.kind === 'hub') {
      var w = sc.windows[i];
      if (!w) return s;
      return placeScene(s, w.id);
    }
    if (sc.kind === 'place') {
      var p = sc.places[i];
      if (!p) return s;
      return itemScene(s, sc.winId, p.id);
    }
    if (sc.kind === 'item') {
      var it = sc.items[i];
      if (!it) return s;
      if (it.fix) return useItem(s, sc.winId, sc.placeId, it.id, it.fix - 1);
      return durScene(s, sc.winId, sc.placeId, it.id);
    }
    if (sc.kind === 'dur') {
      if (!sc.opts[i]) return s;
      return useItem(s, sc.winId, sc.placeId, sc.itemId, i);
    }
    if (sc.kind === 'comp') {
      var cp = sc.list[i];
      if (!cp) return s;
      return runComp(s, cp.id);
    }
    if (sc.kind === 'effect') {
      return hubScene(s);
    }
    if (sc.kind === 'defense') {
      if (sc.verdict === '不通过') {
        s.fails += 2;
        s.mood = clamp(s.mood - 12, 0, 100);
      } else if (sc.verdict === '优秀') {
        s.resume = clamp(s.resume + 6, 0, 100);
        s.mood = clamp(s.mood + 6, 0, 100);
      } else {
        s.mood = clamp(s.mood + 2, 0, 100);
      }
      return settleScene(s);
    }
    if (sc.kind === 'exam') {
      var ex = s.exam || {};
      s.gpa = clamp(Math.round((s.gpa + (ex.avg - 78) / 100 * 0.14) * 100) / 100, 0, 4);
      if (ex.avg >= 85) s.mood = clamp(s.mood + 4, 0, 100);
      else if (ex.avg < 60) s.mood = clamp(s.mood - 8, 0, 100);
      if (ex.fails >= 2) s.fails += 1;
      if (ex.avg >= 85) s.resume = clamp(s.resume + 1, 0, 100);
      return settleScene(s);
    }
    if (sc.kind === 'vet') return remajorScene(s, 1);
    if (sc.kind === 'remajor') {
      var opt = sc.list[i];
      if (!opt) return s;
      if (sc.step === 1) return remajorScene(s, 2, opt.key);
      s.major = opt.key;
      s.cat = GD.MAJORS[opt.key].cat;
      s.highlights.push({ ch: s.ch, t: '复学后你转到了' + GD.MAJORS[opt.key].name });
      return hubScene(s);
    }
    if (sc.kind === 'summary') return beginMonth(s);
    if (sc.kind === 'settle') return advanceMonth(s);
    return hubScene(s);
  }

  /* 返回上一层，不消耗精力 */
  function navBack(s) {
    var sc = s.scene;
    if (sc.kind === 'place') return hubScene(s);
    if (sc.kind === 'item') return placeScene(s, sc.winId);
    if (sc.kind === 'dur') return itemScene(s, sc.winId, sc.placeId);
    if (sc.kind === 'comp') return hubScene(s);
    return s;
  }

  /* ---------------- 存档 ---------------- */

  var SAVE_KEY = 'rcu4.save';

  function save(s) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, snap: s.snapshot }));
    } catch (e) {}
  }

  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.snap) return null;
      var s = o.snap;
      s.seen = s.seen || [];
      s.highlights = s.highlights || [];
      s.flags = s.flags || {};
      if (!s.prov) { s.prov = 'sc'; s.provName = '四川'; s.far = 0; }
      if (!s.allow) s.allow = 1500;
      if (!s.month) s.month = 1;
      if (typeof s.energy !== 'number') s.energy = 100;
      s.scene = { kind: 'cover' };
      return beginMonth(s);
    } catch (e) { return null; }
  }

  function clear() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }

  g.RCU = {
    SEM: SEM, LABEL: LABEL,
    newGame: newGame, beginMonth: beginMonth, pick: pick, endMonth: endMonth, navBack: navBack,
    monthLabel: monthLabel, attendClass: attendClass, compScene: compScene, runComp: runComp,
    zongce: zongce, naturalMonth: naturalMonth,
    hasSave: hasSave, load: load, clear: clear,
    evaluate: evaluate, scores: scores, norm: norm
  };

})(typeof window !== 'undefined' ? window : globalThis);

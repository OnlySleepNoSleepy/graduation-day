(function (g) {
  'use strict';
  var GD = g.GD, E = g.RCU;
  var root = document.getElementById('app');
  var S = null;
  var setup = { step: 0, name: '', gender: 'm', year: 2023, prov: 'sc', allow: 1500, college: null, major: null };

  function esc(t) {
    var s = String(t);
    if (S) {
      if (S.gender) s = s.replace(/\{P\}/g, GD.PARTNER[S.gender] || 'TA');
      s = s.replace(/\{PROV\}/g, S.provName || '')
        .replace(/\{FOOD\}/g, S.food || '')
        .replace(/\{ACCENT\}/g, S.accent || '')
        .replace(/\{FOLK\}/g, S.folk || '');
    }
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function cnYear(y) {
    var d = '〇一二三四五六七八九';
    return String(y).split('').map(function (c) { return d[+c]; }).join('');
  }
  function paras(t) {
    return String(t).split(/\n\n+/).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');
  }
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }

  /* ---------------- HUD ---------------- */

  function hudHTML() {
    var items = [
      ['绩点', S.gpa.toFixed(2)],
      ['英语', S.english],
      ['技能', S.skill],
      ['人脉', S.network],
      ['体魄', S.fitness],
      ['心情', S.mood],
      ['金钱', '¥' + S.money],
      ['履历', S.resume]
    ];
    if (S.ch >= 5) items.push(['备考', S.prep]);
    items.push(['综测', Math.round(E.zongce(S))]);
    if (S.club) items.push(['社团', S.clubAct]);
    items.push(['竞赛', S.awards.length]);
    if (S.fails > 0) items.push(['挂科', S.fails]);
    var dir = '';
    if (S.direction === 'kaoyan') dir = '<span class="dir dir-k">考研</span>';
    if (S.direction === 'kaogong') dir = '<span class="dir dir-g">考公</span>';
    if (S.direction === 'job') dir = '<span class="dir dir-j">就业</span>';

    var dots = '';
    for (var i = 1; i <= 8; i++) {
      dots += '<i class="' + (i < S.ch ? 'done' : (i === S.ch ? 'now' : '')) + '"></i>';
    }

    return '<div class="hud">' +
      '<div class="hud-top"><span class="sem">' + E.SEM[Math.min(S.ch, 8) - 1] + '</span>' + '<span class="pg">第 ' + (S.month || 1) + ' / 48 页</span>' +
      '<span class="bgm" id="bgmBtn" data-act="bgm">' + (BGM_ON ? '♪' : '✕') + '</span>' +
      '<span class="dots">' + dots + '</span>' + dir + '</div>' +
      '<div class="stats">' +
      items.map(function (it) { return '<span class="chip">' + it[0] + '<b>' + it[1] + '</b></span>'; }).join('') +
      '</div></div>';
  }

  /* ---------------- 视图 ---------------- */

  function coverView() {
    return '<div class="cover">' +
      '<div class="kicker">一款关于四年的文字游戏</div>' +
      '<h1>毕业那天<br><em>你会去哪</em></h1>' +
      '<p class="cover-sub">八个学期，二十四次行动。<br>推开学、玩、生活、社交、实践的窗，<br>每一扇后面都是你自己选的。</p>' +
      '<button class="btn primary" data-act="new">开始这四年</button>' +
      (E.hasSave() ? '<button class="btn ghost" data-act="resume">继续上次</button>' : '') +
      '<p class="tiny">虚构作品 · 校名、院系、人物均属虚构<br>约 12 分钟一局 · 支持手机</p>' +
      '</div>';
  }

  function collegeByKey(k) {
    for (var i = 0; i < GD.COLLEGES.length; i++) if (GD.COLLEGES[i].key === k) return GD.COLLEGES[i];
    return null;
  }

  function optChip(group, val, main, note, on) {
    return '<button class="opt' + (on ? ' on' : '') + '" data-act="opt" data-group="' + group + '" data-v="' + val + '">' +
      '<span class="o-main">' + esc(main) + '</span>' +
      (note ? '<span class="o-note">' + esc(note) + '</span>' : '') +
      '</button>';
  }

  function provHintText() {
    for (var i = 0; i < GD.PROVINCES.length; i++) {
      if (GD.PROVINCES[i][0] === setup.prov) {
        var p = GD.PROVINCES[i];
        return p[1] + ' · ' + (GD.FAR_TRAIT_HINT[p[3]] || '');
      }
    }
    return '';
  }

  function provincePicker() {
    return GD.REGIONS.map(function (r) {
      var chips = GD.PROVINCES.filter(function (p) { return p[2] === r.k; }).map(function (p) {
        return '<button class="prov' + (setup.prov === p[0] ? ' on' : '') + '" data-act="opt" data-group="p" data-v="' + p[0] + '">' + p[1] + '</button>';
      }).join('');
      return '<div class="rgroup"><span class="rname">' + r.name + '</span><div class="pgrid">' + chips + '</div></div>';
    }).join('');
  }

  function setupView() {
    if (setup.step === 0) {
      var g = GD.GENDERS.map(function (x) { return optChip('g', x.k, x.name, '', setup.gender === x.k); }).join('');
      var y = GD.YEARS.map(function (x) { return optChip('y', x, x, (x + 4) + ' 届', setup.year === x); }).join('');
      return '<div class="setup">' +
        '<div class="kicker">' + cnYear(setup.year) + ' 年，九月</div>' +
        '<h2 class="q">你叫什么？</h2>' +
        '<input id="nameInput" class="name-input" maxlength="8" placeholder="李想" value="' + esc(setup.name) + '">' +
        '<h2 class="q">你是</h2><div class="opts">' + g + '</div>' +
        '<h2 class="q">哪一年入学</h2><div class="opts yr">' + y + '</div>' +
        '<p class="hint" id="gradHint">你会在 ' + (setup.year + 4) + ' 年 6 月毕业。</p>' +
        '<h2 class="q">你来自</h2>' +
        '<div class="provs">' + provincePicker() + '</div>' +
        '<p class="hint" id="provHint">' + esc(provHintText()) + '</p>' +
        '<h2 class="q">每月生活费</h2>' +
        '<div class="allow-row">' +
        '<span class="allow-yen">¥</span>' +
        '<input id="allowInput" class="allow-input" type="number" min="' + GD.ALLOW_MIN + '" max="' + GD.ALLOW_MAX + '" step="100" value="' + setup.allow + '">' +
        '<span class="allow-unit">/ 月</span>' +
        '</div>' +
        '<p class="hint" id="allowHint">开局 ¥' + (setup.allow * 2) + '，之后每学期家里再打一个月。' +
        '（' + GD.ALLOW_MIN + '–' + GD.ALLOW_MAX + ' 元，可以自己填）</p>' +
        '<button class="btn primary" data-act="toCollege">下一步 · 选学院</button>' +
        '<p class="tiny">依据成都大学 20 个学院、' + GD.MAJOR_ORDER.length + ' 个本科专业设置。</p>' +
        '</div>';
    }

    if (setup.step === 1) {
      var cards = GD.COLLEGES.map(function (c) {
        return '<button class="col" data-act="col" data-k="' + c.key + '">' +
          '<span class="m-name">' + esc(c.name) + '</span>' +
          '<span class="m-col">' + c.majors.length + ' 个本科专业</span>' +
          '</button>';
      }).join('');
      return '<div class="setup">' +
        '<div class="kicker">' + cnYear(setup.year) + ' 年，九月</div>' +
        '<button class="back" data-act="back">← 改档案</button>' +
        '<h2 class="q">你被录取在</h2>' +
        '<div class="colleges">' + cards + '</div>' +
        '</div>';
    }

    var c = collegeByKey(setup.college);
    var list = c.majors.map(function (m) {
      var d = GD.MAJORS[m[0]];
      var ok = setup.year >= d.since;
      return '<button class="major' + (setup.major === m[0] ? ' on' : '') + (ok ? '' : ' off') + '"' +
        (ok ? ' data-act="maj" data-k="' + m[0] + '"' : ' disabled') + '>' +
        '<span class="m-name">' + esc(d.name) + '</span>' +
        (d.tag ? '<span class="m-tag">' + esc(d.tag) + '</span>' : '') +
        '<span class="m-line">' + esc(d.line) + '</span>' +
        (ok ? '' : '<span class="m-note">' + d.since + ' 年起开设</span>') +
        '</button>';
    }).join('');
    return '<div class="setup">' +
      '<button class="back" data-act="back">← 换个学院</button>' +
      '<h2 class="q">' + esc(c.name) + '</h2>' +
      '<div class="majors">' + list + '</div>' +
      '<button class="btn primary" data-act="go"' + (setup.major ? '' : ' disabled') + '>' +
      (setup.major ? '推开校门' : '先选一个专业') + '</button>' +
      '</div>';
  }

  function storyView(sc) {
    var ch = '';
    var n = sc.choices.length;
    sc.choices.forEach(function (c, i) {
      ch += '<button class="choice" data-act="pick" data-i="' + i + '">' + esc(c.t) + '</button>';
    });
    return '<div class="scene">' +
      '<div class="scene-title">' + esc(sc.title || '') + '</div>' +
      '<div class="prose">' + paras(sc.text) + '</div>' +
      '<div class="choices ' + (n > 3 ? 'four' : '') + '">' + ch + '</div>' +
      '</div>';
  }

  function resultView(sc) {
    var chips = (sc.diff || []).map(function (d) {
      var up = d.v > 0;
      var good = d.k === 'fail' ? false : up;
      return '<span class="delta ' + (good ? 'up' : 'down') + '">' + d.label + ' ' +
        (up ? '+' : '') + d.v + '</span>';
    }).join('');
    return '<div class="scene">' +
      '<div class="prose result-text">' + paras(sc.text) + '</div>' +
      '<div class="deltas">' + chips + '</div>' +
      '<button class="btn primary" data-act="cont">继续</button>' +
      '</div>';
  }

  function deltaChips(list) {
    return (list || []).map(function (d) {
      var up = d.v > 0, good = d.k === 'fail' ? false : up;
      return '<span class="delta ' + (good ? 'up' : 'down') + '">' + d.label + ' ' + (up ? '+' : '') + d.v + '</span>';
    }).join('');
  }

  /* ---------- 人物模型 ---------- */
  function avatarSVG() {
    var lowE = S.energy < 20, lowM = S.mood < 35;
    var stroke = lowM ? '#9c3b30' : '#2b2621';
    var mouth = S.mood >= 65 ? 'M50 62 Q60 70 70 62'
      : (S.mood >= 35 ? 'M50 64 L70 64' : 'M50 68 Q60 58 70 68');
    var e = Math.max(0, Math.min(100, S.energy));
    return '<svg class="avatar" viewBox="0 0 120 160" aria-hidden="true">' +
      '<circle cx="60" cy="78" r="52" fill="none" stroke="rgba(43,38,33,.07)" stroke-width="1"/>' +
      '<circle cx="60" cy="78" r="52" fill="none" stroke="' + (lowE ? '#9c3b30' : '#4c6b58') +
      '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + (e / 100 * 327) + ' 327"' +
      ' transform="rotate(-90 60 78)" opacity=".55"/>' +
      '<g fill="none" stroke="' + stroke + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      '<ellipse cx="60" cy="50" rx="21" ry="25"/>' +
      '<path d="M39 44 Q60 22 81 44 Q70 33 60 33 Q50 33 39 44"/>' +
      '<path d="M49 74 L49 82"/><path d="M71 74 L71 82"/>' +
      '<path d="M28 140 Q31 100 47 89 Q60 96 73 89 Q89 100 92 140"/>' +
      '</g>' +
      '<g fill="' + stroke + '"><circle cx="52" cy="50" r="2.3"/><circle cx="68" cy="50" r="2.3"/></g>' +
      '<path d="' + mouth + '" fill="none" stroke="' + stroke + '" stroke-width="1.9" stroke-linecap="round"/>' +
      '</svg>';
  }

  function statLine() {
    var s = '精神不错';
    if (S.energy < 15) s = '快不行了';
    else if (S.energy < 40) s = '撑着呢';
    else if (S.energy < 70) s = '有点累';
    return s;
  }

  function stageInner(sc) {
    var crumb = '';
    if (sc.kind === 'hub') crumb = '这个月，你想做点什么？';
    else if (sc.kind === 'place') crumb = esc(sc.winName);
    else if (sc.kind === 'item') crumb = esc(sc.winName) + ' › ' + esc(sc.placeName);
    else if (sc.kind === 'dur') crumb = esc(sc.winName) + ' › ' + esc(sc.placeName) + ' › ' + esc(sc.itemName);
    else if (sc.kind === 'comp') crumb = '竞赛 · 本月开放 ' + sc.list.length + ' 个';
    else if (sc.kind === 'effect') crumb = esc(sc.itemName) + (sc.hours ? ' · ' + sc.hours + ' 小时' : '');

    var extra = '';

    return '<div class="g-date">' + esc(sc.title || E.monthLabel(S)) + '</div>' +
      (sc.line ? '<p class="month-line">' + esc(sc.line) + '</p>' : '') +
      avatarSVG() +
      '<div class="g-crumb">' + crumb + '</div>' +
      extra +
      '<div class="g-energy"><i style="width:' + Math.round(S.energy) + '%' +
      (S.energy < 20 ? ';background:#9c3b30' : '') + '"></i></div>' +
      '<div class="g-state">' + Math.round(S.energy) + ' / 100 · ' + statLine() +
      (typeof S.slots === 'number' ? ' · 本月剩 ' + S.slots + ' 块' : '') + '</div>';
  }

  function railInner(sc) {
    var html = '';
    if (sc.kind === 'hub') {
      html = '<button class="rbtn attend' + (sc.attended ? ' done' : '') + '" data-act="attend">' +
        '<span class="r-ico">🏫</span>' +
        '<span class="r-txt"><b>' + (sc.attended ? '今天上过课了' : '去上课') + '</b><i>' +
        (sc.retake ? '重修 · ' : '') + sc.courses.length + ' 门课 · 占 ' + sc.classSlots + ' 块</i></span>' +
        '</button>' +
        sc.windows.map(function (w, i) {
          return '<button class="rbtn" data-act="pick" data-i="' + i + '">' +
            '<span class="r-ico">' + w.icon + '</span>' +
            '<span class="r-txt"><b>' + esc(w.name) + '</b><i>' + esc(w.desc) + '</i></span>' +
            '</button>';
        }).join('') +
        (sc.comps ? '<button class="rbtn" data-act="comp">' +
          '<span class="r-ico">🏆</span><span class="r-txt"><b>竞赛</b><i>本月有 ' +
          sc.comps + ' 个比赛开放</i></span></button>' : '') +
        '<button class="rbtn go" data-act="nextmonth"><span class="r-txt"><b>翻到下一页</b>' +
        '<i>本月还剩 ' + sc.slots + ' 块时间</i></span></button>';
    } else if (sc.kind === 'place') {
      html = '<button class="back" data-act="nav">← 回去</button>' +
        sc.places.map(function (p, i) {
          return '<button class="rbtn" data-act="pick" data-i="' + i + '">' +
            '<span class="r-txt"><b>' + esc(p.name) + '</b><i>' + esc(p.note) + '</i></span>' +
            '</button>';
        }).join('');
    } else if (sc.kind === 'item') {
      html = '<button class="back" data-act="nav">← 回去</button>' +
        sc.items.map(function (it, i) {
          var c = it.cost;
          return '<button class="rbtn" data-act="pick" data-i="' + i + '">' +
            '<span class="r-txt"><b>' + esc(it.name) + '</b><i>' +
            (it.pay ? '¥' + (-it.pay) + ' · ' : '') +
            (it.fix ? '占 ' + it.fix + ' 块 · ' : '') +
            (c < 0 ? '回 ' + (-c) : '耗 ' + c) + ' 精力</i></span>' +
            '</button>';
        }).join('');
    } else if (sc.kind === 'dur') {
      html = '<button class="back" data-act="nav">← 回去</button>' +
        sc.opts.map(function (o, i) {
          var sign = o.cost < 0 ? '+' : '−';
          return '<button class="rbtn" data-act="pick" data-i="' + i + '">' +
            '<span class="r-txt"><b>' + esc(o.label) + '</b><i>' + esc(o.note) +
            ' · 精力 ' + sign + Math.abs(o.cost) + '</i></span>' +
            '</button>';
        }).join('');
    } else if (sc.kind === 'effect') {
      html =
        '<div class="scene-art">' + GD.artFor(sc.winId, sc.placeId, sc.itemId) + '</div>' +
        '<div class="scene-sum">' + esc(sc.winName) + ' · ' + esc(sc.placeName) + ' · ' +
          esc(sc.itemName) + (sc.hours ? ' · ' + sc.hours + ' 小时' : '') + '</div>' +
        '<div class="effect-text">' + paras(sc.text) + '</div>' +
        '<div class="deltas">' + deltaChips(sc.diff) + '</div>' +
        '<button class="rbtn go" data-act="cont"><span class="r-txt"><b>继续</b><i>回到这个月</i></span></button>';
    } else if (sc.kind === 'comp') {
      html = '<button class="back" data-act="nav">← 回去</button>' +
        (sc.list.length
          ? sc.list.map(function (c, i) {
            return '<button class="rbtn" data-act="pick" data-i="' + i + '">' +
              '<span class="r-txt"><b>' + esc(c.name) + '</b><i>' + c.levelName + ' · 需' + c.needLabel + ' ' + c.needReq + '（你 ' + c.my + '）' +
              ' · 精力 ' + c.energy + (c.fee ? ' · ¥' + c.fee : '') + '</i></span>' +
              '</button>';
          }).join('')
          : '<p class="empty">这个月没有开放的比赛。</p>');
    }
    if (sc.kind === 'place' || sc.kind === 'item' || sc.kind === 'dur' || sc.kind === 'comp') {
      html += '<button class="rbtn go skip" data-act="nextmonth">' +
        '<span class="r-txt"><b>翻到下一页</b><i>这一项不做了，直接过完这个月</i></span></button>';
    }
    return html;
  }

  function gameView(sc) {
    return '<div class="game"><div class="stage">' + stageInner(sc) + '</div>' +
      '<div class="rail">' + railInner(sc) + '</div></div>';
  }

  function summaryView(sc) {
    var d = sc.data || {};
    var acts = (d.acts || []).length
      ? d.acts.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('')
      : '<li class="none">什么也没做</li>';
    var lines = (d.lines || []).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('');
    return '<div class="scene summary">' +
      '<div class="sum-tag">第 ' + Math.max(1, (S.month || 2) - 1) + ' 页 · ' + esc(d.month || '') + '</div>' +
      '<h2 class="sum-title">上一页写完了</h2>' +
      '<div class="sum-block"><span class="sum-lb">这个月你做了</span><ul class="sum-acts">' + acts + '</ul></div>' +
      (lines ? '<div class="sum-block"><span class="sum-lb">几句提醒</span><ul class="sum-lines">' + lines + '</ul></div>' : '') +
      '<div class="sum-stats">绩点 ' + (d.gpa || 0).toFixed(2) + ' · 心情 ' + (d.mood || 0) +
      ' · 精力 ' + (d.energy || 0) + '</div>' +
      '<button class="btn primary" data-act="cont">翻到这一页</button>' +
      '</div>';
  }

  function vetView(sc) {
    return '<div class="scene">' +
      '<div class="scene-title">' + esc(sc.title) + '</div>' +
      '<div class="prose">' + paras(sc.text) + '</div>' +
      '<button class="btn primary" data-act="cont">回到学校</button></div>';
  }

  function remajorView(sc) {
    var list = sc.list.map(function (o, i) {
      return '<button class="choice" data-act="pick" data-i="' + i + '">' + esc(o.name) +
        (o.note ? '  <span class="rm-note">' + esc(o.note) + '</span>' : '') + '</button>';
    }).join('');
    return '<div class="scene">' +
      '<div class="scene-title">' + esc(sc.title) + '</div>' +
      '<div class="prose"><p>' + esc(sc.text) + '</p></div>' +
      '<div class="choices">' + list + '</div></div>';
  }

  function defenseView(sc) {
    var tone = sc.verdict === '不通过' ? 'bad' : sc.verdict === '优秀' ? 'good' : '';
    var line = sc.thesis < 40 ? '你上台的时候，PPT 才做到第八页。'
      : sc.thesis < 70 ? '你讲了十二分钟，老师问了三个问题。'
      : '你讲了十五分钟，老师只问了一个问题。';
    return '<div class="scene">' +
      '<div class="scene-title">毕业论文答辩</div>' +
      '<div class="prose"><p>' + line + '</p></div>' +
      '<div class="def-score"><span>答辩成绩</span>' +
        '<b class="' + tone + '">' + sc.score + '</b>' +
        '<span class="def-verdict ' + tone + '">' + esc(sc.verdict) + '</span></div>' +
      '<button class="btn primary" data-act="cont">走下场</button></div>';
  }

  function examView(sc) {
    var rows = sc.rows.map(function (r) {
      return '<div class="ex-row">' +
        '<span class="ex-name">' + esc(r.name) + '</span>' +
        '<span class="ex-bar"><i style="width:' + r.score + '%"></i></span>' +
        '<span class="ex-score">' + r.score + '</span>' +
        '<span class="ex-grade' + (r.score < 60 ? ' bad' : '') + '">' + esc(r.grade) + '</span></div>';
    }).join('');
    return '<div class="scene">' +
      '<div class="scene-title">期末考试</div>' +
      '<div class="prose"><p>' + esc(sc.note) + '</p></div>' +
      '<div class="exam-paper">' + rows + '</div>' +
      '<p class="ex-rank">平均分 <b>' + sc.avg + '</b> · 班级排名 <b>' + sc.rank + '</b> / ' + sc.total + '</p>' +
      '<button class="btn primary" data-act="cont">交卷</button></div>';
  }

  function settleView(sc) {
    var notes = (sc.notes || []).map(function (n) { return '<p class="warn">' + esc(n) + '</p>'; }).join('');
    var lines = (sc.lines || []).map(function (n) { return '<p class="note">' + esc(n) + '</p>'; }).join('');
    return '<div class="scene">' +
      '<div class="scene-title">' + esc(sc.title) + '</div>' +
      '<div class="prose">' + paras(sc.text) + '</div>' +
      notes + lines +
      '<button class="btn primary" data-act="next">继续</button>' +
      '</div>';
  }

  function pickHighlights(list) {
    if (!list || !list.length) return [];
    var idx = [];
    var n = list.length;
    var slots = Math.min(5, n);
    for (var i = 0; i < slots; i++) {
      idx.push(Math.round(i * (n - 1) / Math.max(1, slots - 1)));
    }
    var out = [], used = {};
    idx.forEach(function (i) {
      if (!used[i] && list[i]) { used[i] = 1; out.push(list[i]); }
    });
    return out;
  }

  function endView(sc) {
    var en = GD.ENDINGS[sc.key];
    var m = GD.MAJORS[S.major];
    var cat = GD.CATS[m.cat];
    var gy = (S.year || 2022) + 4 + (m.five ? 1 : 0);
    var dest = (sc.key === 'bigco' || sc.key === 'stable') ? cat[sc.key] : en.dest;
    var fiveLine = m.five
      ? '<p class="rom">临床医学是五年制。这张成绩单只写到第四年，你还差一年才毕业。</p>'
      : '';
    var romLine = '';
    if (S.rom >= 4) romLine = '还有一件事没写进这张成绩单：那个人还在。';
    else if (S.rom >= 3) romLine = '你们约好了异地几年，这件事没写进上面。';
    var ledgerLine = '';
    if (S.ledger) {
      ledgerLine = '<p class="ledger">这四年进出的钱：收入 ¥' + Math.round(S.ledger.in) +
        ' · 支出 ¥' + Math.round(S.ledger.out) +
        ' · 最后剩 ¥' + Math.round(S.money) + '</p>';
    }
    var body = en.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var hl = pickHighlights(S.highlights).map(function (h) {
      var t = String(h.t).replace(/^大[一二三四]([上下]|暑假|寒假)?，?/, '');
      return '<li><span class="hl-ch">' + E.SEM[h.ch - 1] + '</span>' + esc(t) + '</li>';
    }).join('');
    var sc2 = sc.scores || {};
    var rows = [
      ['绩点', S.gpa.toFixed(2)], ['英语', S.english], ['技能', S.skill], ['人脉', S.network],
      ['体魄', S.fitness], ['心情', S.mood], ['履历', S.resume], ['备考', S.prep], ['金钱', '¥' + S.money]
    ].map(function (r) {
      return '<span class="chip">' + r[0] + '<b>' + r[1] + '</b></span>';
    }).join('');

    return '<div class="end">' +
      '<div class="cert">' +
      '<div class="cert-head">' + esc(GD.SCHOOL.name) + ' · ' + cnYear(gy) + '届</div>' +
      '<div class="cert-name">' + esc(S.name) + '</div>' +
      '<div class="cert-major">' + esc(m.name) + ' · ' + esc(m.college) + '</div>' +
      '<div class="cert-dest">去向 · ' + esc(dest) + '</div>' +
      '<div class="seal">' + esc(en.seal) + '</div>' +
      '</div>' +
      '<h2 class="end-title">' + esc(en.title) + '</h2>' +
      '<div class="prose">' + body + '</div>' +
      fiveLine +
      ledgerLine +
      (romLine ? '<p class="rom">' + romLine + '</p>' : '') +
      '<blockquote class="line">' + esc(en.line) + '</blockquote>' +
      (hl ? '<div class="review"><h3>四年里，你记得住的几件事</h3><ul>' + hl + '</ul></div>' : '') +
      '<div class="report">' +
      '<h3>成绩单</h3><div class="stats">' + rows + '</div>' +
      '<p class="tiny">考研分 ' + (sc2.kaoyan || 0).toFixed(0) +
      ' · 考公分 ' + (sc2.kaogong || 0).toFixed(0) +
      ' · 就业分 ' + (sc2.job || 0).toFixed(0) + '</p>' +
      '</div>' +
      '<button class="btn primary" data-act="again">再来一次</button>' +
      '</div>';
  }

  /* ---------------- 渲染 ---------------- */

  function seasonOf(s) {
    var forced = (location.hash.match(/season=(winter|spring|summer|autumn)/) || [])[1];
    if (forced) return forced;
    if (!s || !s.month) return 'autumn';
    var m = E.naturalMonth(s);
    if (m >= 9 && m <= 11) return 'autumn';
    if (m === 12 || m <= 2) return 'winter';
    if (m >= 3 && m <= 5) return 'spring';
    return 'summer';
  }

  function draw() {
    document.body.setAttribute('data-season', seasonOf(S));
    var sc = S ? S.scene : { kind: 'cover' };
    var head = '', body = '';

    if (sc.kind === 'cover') {
      head = '';
      body = coverView();
    } else if (sc.kind === 'setup') {
      body = setupView();
    } else {
      if (sc.kind !== 'end') head = hudHTML();
      if (sc.kind === 'story') body = storyView(sc);
      else if (sc.kind === 'result') body = resultView(sc);
      else if (sc.kind === 'summary') body = summaryView(sc);
      else if (sc.kind === 'settle') body = settleView(sc);
      else if (sc.kind === 'exam') body = examView(sc);
      else if (sc.kind === 'defense') body = defenseView(sc);
      else if (sc.kind === 'vet') body = vetView(sc);
      else if (sc.kind === 'remajor') body = remajorView(sc);
      else if (sc.kind === 'end') body = endView(sc);
      else body = gameView(sc);
    }

    root.innerHTML = '';
    root.appendChild(el('<div class="shell"><div class="head"></div><div class="body"></div></div>'));
    root.querySelector('.head').innerHTML = head;
    root.querySelector('.body').innerHTML = body;
    if (sc.kind === 'summary') {
      var sh = root.querySelector('.shell');
      if (sh) sh.classList.add('flip');
    }
    window.scrollTo(0, 0);
  }

  /* ---------------- 交互 ---------------- */

  root.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t && t.id === 'allowInput') {
      var v = parseInt(t.value, 10);
      if (isNaN(v)) return;
      setup.allow = v;
      var h = document.getElementById('allowHint');
      if (h) {
        h.textContent = '开局 ¥' + (v * 2) + '，之后每学期家里再打一个月。（' +
          GD.ALLOW_MIN + '–' + GD.ALLOW_MAX + ' 元，可以自己填）';
      }
    }
  });

  /* ---------- 声音 ---------- */
  var AC = null, BGM_ON = true, bgmTimer = null, bgmStep = 0;

  function audioCtx() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
    }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }

  /* 点击音：一个很短的木质“嗒” */
  function tick() {
    var c = audioCtx();
    if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.setValueAtTime(760, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(320, c.currentTime + 0.05);
    f.type = 'lowpass'; f.frequency.value = 1800;
    g.gain.setValueAtTime(0.075, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + 0.07);
    o.connect(f); f.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.08);
  }

  /* 背景音乐：自制的五声音阶循环，纯 WebAudio 合成，不加载任何音频文件 */
  /* 四段情绪：大一轻快、大二舒展、大三提速、大四紧绷 */
  function bgmProfile() {
    var ch = (S && S.ch) || 1;
    if (ch <= 2) return { gap: 2100, scale: [0, 2, 4, 7, 9, 12, 9, 4], vol: 0.038, root: 174.6, pulse: 0 };
    if (ch <= 4) return { gap: 1850, scale: [0, 2, 4, 7, 9, 12, 14, 9], vol: 0.043, root: 164.8, pulse: 0 };
    if (ch <= 6) return { gap: 1400, scale: [0, 2, 4, 7, 9, 12, 7, 4], vol: 0.049, root: 155.6, pulse: 1 };
    return { gap: 950, scale: [0, 3, 5, 7, 10, 12, 7, 3], vol: 0.055, root: 146.8, pulse: 2 };
  }
  function bgmNote(freq, dur, vol) {
    var c = audioCtx();
    if (!c) return;
    var o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 2.005;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); o2.connect(g); g.connect(c.destination);
    o.start(); o2.start(); o.stop(c.currentTime + dur); o2.stop(c.currentTime + dur);
  }
  function bgmTick() {
    if (!BGM_ON) { bgmTimer = null; return; }
    var pr = bgmProfile();
    var semi = pr.scale[bgmStep % pr.scale.length];
    var f = pr.root * Math.pow(2, semi / 12);
    bgmNote(f, pr.gap / 1000 * 1.7, pr.vol);
    if (bgmStep % 4 === 0) bgmNote(f / 2, pr.gap / 1000 * 2.2, pr.vol * 0.7);
    if (pr.pulse === 1 && bgmStep % 2 === 0) bgmNote(pr.root * 1.5, 0.28, pr.vol * 0.5);
    if (pr.pulse === 2) {
      bgmNote(pr.root * 1.5, 0.2, pr.vol * 0.55);
      if (bgmStep % 2 === 0) bgmNote(pr.root * 1.335, 0.18, pr.vol * 0.4);
    }
    bgmStep++;
    bgmTimer = setTimeout(bgmTick, pr.gap);
  }
  function startBgm() {
    if (bgmTimer) return;
    audioCtx();
    bgmTick();
  }
  function stopBgm() {
    if (bgmTimer) clearTimeout(bgmTimer);
    bgmTimer = null;
  }

  function haptic() {
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
  }

  function showConfirm(msg, onYes) {
    var d = document.createElement('div');
    d.className = 'mask';
    d.innerHTML = '<div class="dialog"><p>' + msg + '</p>' +
      '<div class="dbtns"><button class="dno">再想想</button>' +
      '<button class="dyes">确认进入</button></div></div>';
    document.body.appendChild(d);
    d.querySelector('.dno').onclick = function () { d.remove(); };
    d.querySelector('.dyes').onclick = function () { d.remove(); onYes(); };
  }

  root.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-act]') : null;
    if (!b) return;
    tick();
    haptic();
    if (!bgmTimer) startBgm();
    var act = b.getAttribute('data-act');

    if (act === 'new') {
      setup.step = 0;
      setup.college = null;
      setup.major = null;
      S = { scene: { kind: 'setup' } };
      draw();
      setTimeout(function () {
        var inp = document.getElementById('nameInput');
        if (inp) inp.focus();
      }, 30);
      return;
    }

    if (act === 'resume') {
      var loaded = E.load();
      if (loaded) { S = loaded; draw(); }
      return;
    }

    if (act === 'toCollege') {
      var niT = document.getElementById('nameInput');
      if (niT) setup.name = niT.value;
      var ai = document.getElementById('allowInput');
      if (ai) {
        var av = parseInt(ai.value, 10);
        if (!isNaN(av)) setup.allow = Math.max(GD.ALLOW_MIN, Math.min(GD.ALLOW_MAX, av));
      }
      setup.step = 1;
      draw();
      return;
    }

    if (act === 'opt') {
      var group = b.getAttribute('data-group'), val = b.getAttribute('data-v');
      if (group === 'g') setup.gender = val;
      else if (group === 'y') setup.year = parseInt(val, 10);
      else if (group === 'p') setup.prov = val;
      else if (group === 'a') setup.allow = parseInt(val, 10);
      var sibs = root.querySelectorAll('[data-group="' + group + '"]');
      for (var i2 = 0; i2 < sibs.length; i2++) sibs[i2].classList.remove('on');
      b.classList.add('on');
      if (group === 'y') {
        var gh = document.getElementById('gradHint');
        if (gh) gh.textContent = '你会在 ' + (setup.year + 4) + ' 年 6 月毕业。';
        var kk = root.querySelector('.kicker');
        if (kk) kk.textContent = cnYear(setup.year) + ' 年，九月';
      }
      if (group === 'p') {
        var ph = document.getElementById('provHint');
        if (ph) ph.textContent = provHintText();
      }
      return;
    }

    if (act === 'col') {
      setup.college = b.getAttribute('data-k');
      setup.major = null;
      setup.step = 2;
      draw();
      return;
    }

    if (act === 'maj') {
      setup.major = b.getAttribute('data-k');
      draw();
      return;
    }

    if (act === 'back') {
      if (setup.step === 2) { setup.step = 1; setup.major = null; }
      else { setup.step = 0; setup.college = null; setup.major = null; }
      draw();
      return;
    }

    if (act === 'go') {
      S = E.newGame({
        name: setup.name, gender: setup.gender, year: setup.year,
        prov: setup.prov, allow: setup.allow, major: setup.major
      });
      E.beginMonth(S);
      draw();
      return;
    }

    if (act === 'pick') {
      E.pick(S, parseInt(b.getAttribute('data-i'), 10));
      draw();
      return;
    }

    if (act === 'cont') {
      E.pick(S, 0);
      draw();
      return;
    }

    if (act === 'next') {
      E.pick(S, 0);
      draw();
      return;
    }

    if (act === 'nav') {
      E.navBack(S);
      draw();
      return;
    }

    if (act === 'bgm') {
      BGM_ON = !BGM_ON;
      if (BGM_ON) { startBgm(); } else { stopBgm(); }
      draw();
      return;
    }

    if (act === 'attend') {
      E.attendClass(S);
      draw();
      return;
    }

    if (act === 'comp') {
      E.compScene(S);
      draw();
      return;
    }

    if (act === 'nextmonth') {
      if (S.slots > 0) {
        showConfirm('本月还剩 <b>' + S.slots + '</b> 块时间，' +
          (S.attended ? '' : '而且今天还没去上课。') + '<br>确定进入下个月吗？',
          function () { E.endMonth(S); draw(); });
      } else {
        E.endMonth(S);
        draw();
      }
      return;
    }

    if (act === 'again') {
      E.clear();
      S = null;
      draw();
      return;
    }
  });

  window.addEventListener('load', function () {
    draw();
  });
  if (document.readyState && document.readyState !== 'loading') draw();

})(typeof window !== 'undefined' ? window : globalThis);

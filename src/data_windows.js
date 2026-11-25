(function (g) {
  'use strict';
  var GD = g.GD;

  /* ============================================================
     事项库：同一件事可以在不同地点做，效果和结果文案不同
     每条 [id, 名字, 效果, 一句结果]
     ============================================================ */

  GD.WINDOWS = [
    {
      id: 'study', name: '学习', icon: '📖', desc: '教室、图书馆，或者只是假装',
      places: [
        {
          id: 'lib', name: '图书馆', note: '四楼靠窗，六点半就没位子',
          items: [
            ['major', '啃专业课', { gpa: 0.05, skill: 1, mood: -2 }, '你在四楼靠窗坐到闭馆，把第三章看了两遍。'],
            ['eng', '背英语', { english: 5, gpa: 0.01, mood: -2 }, '单词本从 A 翻到 C，又翻回来了。'],
            ['write', '写点自己的东西', { skill: 4, gpa: 0.01, mood: -1 }, '你写的东西没人看，但它是你自己的。'],
            ['read', '看会儿闲书', { gpa: 0.02, mood: 3 }, '你借了一本和专业无关的书，一口气看了三章。']
          ]
        },
        {
          id: 'room', name: '空教室', note: '没人的教室，灯是声控的',
          items: [
            ['major', '啃专业课', { gpa: 0.035, skill: 1, mood: -1 }, '空教室里只有灯管的嗡嗡声，你反而看得进去。'],
            ['hw', '把作业补完', { gpa: 0.03, mood: -1 }, '最后一排，灯一亮一灭，你写完了一整章习题。'],
            ['audit', '蹭一节别人的课', { skill: 3, english: 2, mood: 2 }, '一整节课你只听懂了三分之一，但你觉得很值。'],
            ['nap', '趴着睡一会儿', { mood: 6, fitness: 2, gpa: -0.01 }, '你趴在桌上睡了半小时，醒来时嘴角有印子。']
          ]
        },
        {
          id: 'dorm', name: '宿舍', note: '床上、桌前、或者被窝里',
          items: [
            ['major', '啃专业课', { gpa: 0.02, skill: 1, mood: -3 }, '室友在打游戏，你看了半小时，一页没翻过去。'],
            ['eng', '背英语', { english: 3, mood: -1 }, '你躺在上铺背单词，背到第三个就睡着了。'],
            ['fake', '假装看书', { mood: 4, gpa: -0.01 }, '书翻到第三页，你已经刷了四十分钟手机。'],
            ['read', '躺着看会儿书', { gpa: 0.01, mood: 2 }, '你躺着看了二十页，然后睡着了，书盖在脸上。']
          ]
        }
      ]
    },
    {
      id: 'play', name: '玩', icon: '🎮', desc: '操场、后街、开黑，还有商场',
      places: [
        {
          id: 'field', name: '操场', note: '晚上九点人最多',
          items: [
            ['ball', '打一场球', { fitness: 6, mood: 5 }, '你投进了一个绝杀，虽然没人记分。'],
            ['run', '跑两圈', { fitness: 4, mood: 3 }, '跑到第二圈的时候，脑子终于空了。'],
            ['eng', '边跑边听英语', { english: 2, fitness: 2, mood: -1 }, '耳机里循环同一段听力，跑到第三圈才听懂一句。']
          ]
        },
        {
          id: 'street', name: '后街', note: '烧烤、奶茶、打印店',
          items: [
            ['bbq', '吃烧烤', { money: -70, mood: 6 }, '五个人一百八十串，老板说“你们这届快毕业了吧”。'],
            ['tea', '买杯奶茶', { money: -25, mood: 3 }, '你排了二十分钟，喝了两口，剩下的化成了水。'],
            ['meal', '一起吃顿饭', { mood: 5, network: 2, money: -40 }, '四个人点了一桌，最后谁也没抢到买单。']
          ]
        },
        {
          id: 'game', name: '宿舍开黑', note: '键盘声可以响到两点',
          items: [
            ['duo', '打到凌晨', { mood: 8, gpa: -0.05, fitness: -2 }, '连赢三把，你觉得人生还有希望。'],
            ['movie', '挤在一起看片', { money: -20, mood: 5 }, '两个人挤在一个屏幕前，声音不敢开大。']
          ]
        },
        {
          id: 'mall', name: '商场', note: '坐两站地铁就到',
          items: [
            ['movie', '看场电影', { money: -60, mood: 6, network: 2 }, '散场的时候外面在下雨，你站在门口不想走。'],
            ['shop', '逛一圈', { money: -200, mood: 5 }, '你试了一件两千块的外套，然后放回去了。'],
            ['eat', '在商场吃一顿', { money: -60, mood: 5, fitness: 1 }, '比食堂贵三倍，但确实好吃。']
          ]
        }
      ]
    },
    {
      id: 'life', name: '生活', icon: '🍜', desc: '吃饭、睡觉、挣点生活费',
      places: [
        {
          id: 'canteen', name: '食堂', note: '一食堂到八食堂，外加民族餐厅 · 早 7-9 / 午 11-13 / 晚 17-19，特色窗口开到 21:30',
          items: [
            ['c1', '一食堂（一楼）', { money: -10, mood: 1, fitness: 1 }, '大锅菜，最便宜，人最多。排队二十分钟，打了三个菜，味道和价钱一样朴素。'],
            ['c2', '民族餐厅', { money: -17, mood: 4 }, '在一食堂楼上。手抓饭配一碗汤，你第一次在学校吃撑。'],
            ['c3', '二食堂', { money: -13, mood: 2 }, '自选称重。你端着盘子算了两遍价钱，最后放下了那块红烧肉。'],
            ['c4', '三食堂', { money: -14, mood: 3 }, '家常炒菜。师傅舀了一勺红油，说“这个下饭”，你吃了两碗。'],
            ['c5', '四食堂', { money: -12, mood: 3 }, '面食档。一碗牛肉面，汤比面好喝，你把汤喝完了。'],
            ['c6', '五食堂', { money: -16, mood: 5, fitness: 1 }, '硬菜多。你点了一个荤一个素，吃完在楼下站了两分钟才走。'],
            ['c7', '六食堂', { money: -15, mood: 4 }, '特色窗口，晚上九点半才收。你十点前赶到，抢到最后一份。'],
            ['c8', '七食堂', { money: -20, mood: 5 }, '环境最好。灯很亮，桌椅是新的，菜价也是新的。'],
            ['c9', '八食堂', { money: -18, mood: 5, fitness: 1 }, '走过去要绕半个学校。同学说“太远了”，你还是去了。']
          ]
        },
        {
          id: 'dorm2', name: '宿舍', note: '床是这四年最忠实的伙伴',
          items: [
            ['sleep', '睡个够', { mood: 8, fitness: 3 }, '你从下午两点睡到六点，醒来时天是橘色的。'],
            ['tidy', '收拾一下', { mood: 3, fitness: 1 }, '拖了地，洗了衣服，宿舍亮了一个色号。'],
            ['nap', '眯一会儿', { mood: 4, fitness: 1 }, '你在床上眯了半小时，醒来时室友都走了。'],
            ['duo', '开一局', { mood: 6, gpa: -0.03, fitness: -1 }, '你说只打一局，然后天就亮了。']
          ]
        },
        {
          id: 'part', name: '兼职', note: '赚钱，也赚点别的',
          items: [
            ['flyer', '发传单', { money: 150, fitness: -3, mood: -2 }, '站了一天，下午三点腿开始抖。'],
            ['oncampus', '校内勤工助学', { money: 300, resume: 2, mood: -1 }, '在图书馆整理书架，顺便把想看的书都记下来了。']
          ]
        }
      ]
    },
    {
      id: 'social', name: '社交', icon: '👥', desc: '社团、老乡、室友、老师',
      places: [
        {
          id: 'club', name: '社团', note: '你还有一个没退的群',
          items: [
            ['join', '去参加活动', { network: 6, mood: 4, money: -60 }, '一下午搬了三十把椅子，但大家都记得你。'],
            ['lead', '当一次负责人', { network: 8, resume: 3, mood: -5 }, '你才发现，组织一场活动比参加累十倍。']
          ]
        },
        {
          id: 'hometown', name: '老乡会', note: '在外地听到乡音',
          items: [
            ['meet', '聚一次', { network: 3, mood: 7 }, '一桌人说{ACCENT}，桌上摆着{FOOD}，你差点没忍住。']
          ]
        },
        {
          id: 'roomie', name: '室友', note: '四年里离你最近的四个人',
          items: [
            ['meal', '凑一顿饭', { mood: 5, network: 2, money: -30 }, '你们点了外卖，坐在床沿上吃。'],
            ['duo', '一起开黑', { mood: 7, network: 2, gpa: -0.02 }, '四个人一队，输了一晚上，笑了一晚上。']
          ]
        },
        {
          id: 'teacher', name: '老师办公室', note: '门一直开着',
          items: [
            ['ask', '去问问题', { skill: 4, network: 4, gpa: 0.02, mood: -2 }, '老师给你讲了二十分钟，还借了你一本书。'],
            ['audit', '顺便旁听一节', { skill: 3, gpa: 0.01, mood: 1 }, '老师说“想来就来”，你就真的每周都来了。']
          ]
        }
      ]
    },
    {
      id: 'practice', name: '实践', icon: '💼', desc: '实习、竞赛、志愿、实验室',
      places: [
        {
          id: 'intern', name: '实习', note: '地铁一小时，日薪一百二',
          items: [
            ['go', '去公司待一阵', { resume: 5, skill: 2, money: 600, fitness: -4, mood: -2 }, '你第一次听到“上线”这个词，也第一次知道什么叫需求变更。']
          ]
        },
        {
          id: 'contest', name: '竞赛', note: '组队、熬夜、交作品',
          items: [
            ['team', '组个队打比赛', { resume: 4, skill: 3, mood: -4 }, '你们熬了三个通宵，最后拿了三等奖。']
          ]
        },
        {
          id: 'vol', name: '志愿', note: '穿马甲，站一天',
          items: [
            ['serve', '去做志愿者', { resume: 3, mood: 4, network: 2 }, '你连着站了六天岗，有个外国朋友教你说谢谢。']
          ]
        },
        {
          id: 'lab', name: '实验室', note: '仪器要预约，排到凌晨',
          items: [
            ['do', '跟一个项目', { skill: 4, resume: 3, mood: -3 }, '你在实验台上趴了半小时，醒来时窗外刚亮。']
          ]
        }
      ]
    },
    {
      id: 'prep', name: '备考', icon: '📚', desc: '自习室、真题、倒计时', req: 'prep',
      places: [
        {
          id: 'room2', name: '自习室', note: '五点开门，四点半就有人排队',
          items: [
            ['ky', '刷考研真题', { prep: 8, mood: -5, fitness: -2 }, '一套卷子做完，红笔比黑笔用得多。'],
            ['xg', '刷行测', { prep: 7, mood: -4 }, '图形推理你做梦都在推。'],
            ['sl', '写申论', { prep: 6, skill: 2, mood: -3 }, '你写了三千字，老师说“字不错”。']
          ]
        },
        {
          id: 'lib2', name: '图书馆', note: '安静，但要多走十分钟',
          items: [
            ['ky', '刷考研真题', { prep: 6, mood: -3 }, '旁边的人在背政治，你莫名有了紧迫感。'],
            ['sl', '写申论', { prep: 5, skill: 1, mood: -2 }, '你抄了三篇范文，抄着抄着有了点感觉。']
          ]
        }
      ]
    },
    {
      id: 'love', name: '恋爱', icon: '💗', desc: '有人陪你走一段', req: 'romance',
      places: [
        {
          id: 'outside', name: '校外', note: '湖边、小酒馆、夜市',
          items: [
            ['date', '出去走走', { mood: 8, money: -120, rom: 1 }, '你们在湖边坐到熄灯，什么也没干。']
          ]
        },
        {
          id: 'lib3', name: '图书馆', note: '一人一半耳机',
          items: [
            ['study2', '一起自习', { mood: 5, gpa: 0.02, rom: 1 }, '一人一半耳机，你把那道题看懂了。']
          ]
        }
      ]
    }
  ];

  /* ============================================================
     精力消耗（2 小时基准，负数表示回精力）
     ============================================================ */
  GD.ITEM_COST = {
    major: 13, eng: 8, write: 9, read: 1, hw: 6, audit: 3, fake: -3, nap: -9,
    ball: 9, run: 6, bbq: -1, tea: -2, meal: -2, duo: 3, movie: -2, shop: 4, eat: -3,
    sleep: -22, tidy: 3, fast: -1, flyer: 12, oncampus: 8,
    join: 4, lead: 9, meet: -3, ask: 5,
    go: 18, team: 14, serve: 8, do: 14,
    ky: 16, xg: 15, sl: 14,
    date: 2, study2: 5,
    c1: -4, c2: -5, c3: -4, c4: -4, c5: -3, c6: -5, c7: -4, c8: -5, c9: -5
  };

  /* ============================================================
     时长档：2 / 4 / 6 小时。时间越长，效果增长慢、精力消耗增长快
     ============================================================ */
  GD.DUR = [
    { m: 1, hours: 2, label: '一会儿', note: '占 1 块时间', eff: 1.0, cost: 1.0, slots: 1 },
    { m: 2, hours: 4, label: '半天', note: '占 2 块时间', eff: 1.7, cost: 1.8, slots: 2 },
    { m: 3, hours: 6, label: '一整天', note: '占 3 块时间', eff: 2.1, cost: 2.4, slots: 3 }
  ];
  /* 有些事情本身就有固定时长，不能自己拉长 */
  GD.ITEM_FIX = {
    lead: 1, join: 2, meet: 2, ask: 1, serve: 2, go: 3, team: 3, do: 2,
    flyer: 2, oncampus: 2, movie: 2, shop: 2, meal: 1, bbq: 1, tea: 1,
    eat: 1, fast: 1, nap: 1, tidy: 1, ball: 2, run: 1, read: 1, fake: 1,
    hw: 2, audit: 1, write: 2, eng: 1, date: 2, study2: 2, duo: 2,
    c1: 2, c2: 1, c3: 1, c4: 2, c5: 1, c6: 1, c7: 1, c8: 1, c9: 2
  };
  /* 单次「重」额外掉心情 */
  GD.LONG_MOOD = -2;
  /* 每月的总效果缩放（48 个月，平均摊薄） */
  GD.BASE_SCALE = 0.12;
  /* 每月自然恢复的精力 */
  GD.ENERGY_REGEN = 36;
  GD.ENERGY_MAX = 100;

  /* 展开成方便查询的结构 */
  GD.WIN = {};
  GD.WINDOWS.forEach(function (w) {
    w.placeMap = {};
    w.places.forEach(function (p) {
      p.itemMap = {};
      p.items = p.items.map(function (it) {
        var o = { id: it[0], name: it[1], eff: it[2], r: it[3], win: w.id, place: p.id };
        p.itemMap[o.id] = o;
        return o;
      });
      w.placeMap[p.id] = p;
    });
    GD.WIN[w.id] = w;
  });

})(typeof window !== 'undefined' ? window : globalThis);

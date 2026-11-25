(function (GD) {
  'use strict';
  /* 每类地点一张内联 SVG。全部矢量，不引外部图片。 */
  var INK = '#43392a';
  var INK2 = '#6b5f4c';
  var SOFT = '#e3d9c6';
  var SOFT2 = '#efe7d7';
  var ACC = '#b0792c';
  var PAPER = '#fbf7ee';

  function wrap(inner) {
    return '<svg viewBox="0 0 300 110" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="300" height="110" fill="' + PAPER + '"/>' + inner + '</svg>';
  }

  /* 图书馆：书架 + 长桌 + 台灯 */
  var lib = wrap(
    '<rect x="0" y="86" width="300" height="24" fill="' + SOFT2 + '"/>' +
    '<rect x="16" y="18" width="62" height="66" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<line x1="16" y1="40" x2="78" y2="40" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<line x1="16" y1="62" x2="78" y2="62" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<rect x="22" y="24" width="5" height="14" fill="' + ACC + '"/><rect x="30" y="22" width="5" height="16" fill="' + SOFT + '"/>' +
    '<rect x="38" y="26" width="5" height="12" fill="' + INK2 + '"/><rect x="47" y="23" width="5" height="15" fill="' + ACC + '"/>' +
    '<rect x="22" y="46" width="5" height="15" fill="' + SOFT + '"/><rect x="30" y="44" width="5" height="17" fill="' + ACC + '"/>' +
    '<rect x="22" y="68" width="5" height="15" fill="' + INK2 + '"/><rect x="31" y="69" width="5" height="14" fill="' + SOFT + '"/>' +
    '<rect x="104" y="70" width="180" height="7" fill="' + SOFT + '"/>' +
    '<rect x="112" y="77" width="6" height="22" fill="' + INK2 + '"/><rect x="270" y="77" width="6" height="22" fill="' + INK2 + '"/>' +
    '<rect x="196" y="52" width="34" height="5" fill="' + INK + '"/>' +
    '<path d="M213 52 L213 40 L226 40 L226 52" fill="none" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<circle cx="226" cy="36" r="4" fill="' + ACC + '" opacity=".8"/>' +
    '<rect x="136" y="58" width="26" height="12" fill="' + SOFT2 + '" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<circle cx="170" cy="34" r="7" fill="none" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<path d="M170 41 L168 56 M170 41 L176 56" stroke="' + INK2 + '" stroke-width="1.2" fill="none"/>'
  );

  /* 空教室：黑板 + 课桌 */
  var room = wrap(
    '<rect x="0" y="86" width="300" height="24" fill="' + SOFT2 + '"/>' +
    '<rect x="30" y="12" width="150" height="46" fill="' + INK + '" opacity=".88"/>' +
    '<line x1="42" y1="28" x2="120" y2="28" stroke="' + PAPER + '" stroke-width="1.6" opacity=".7"/>' +
    '<line x1="42" y1="38" x2="96" y2="38" stroke="' + PAPER + '" stroke-width="1.6" opacity=".55"/>' +
    '<line x1="42" y1="48" x2="140" y2="48" stroke="' + ACC + '" stroke-width="1.6" opacity=".85"/>' +
    '<rect x="196" y="14" width="76" height="56" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<line x1="234" y1="14" x2="234" y2="70" stroke="' + INK2 + '" stroke-width="1.1"/>' +
    '<rect x="24" y="72" width="54" height="6" fill="' + INK2 + '"/><rect x="30" y="78" width="5" height="16" fill="' + INK2 + '"/><rect x="67" y="78" width="5" height="16" fill="' + INK2 + '"/>' +
    '<rect x="96" y="72" width="54" height="6" fill="' + INK2 + '"/><rect x="102" y="78" width="5" height="16" fill="' + INK2 + '"/><rect x="139" y="78" width="5" height="16" fill="' + INK2 + '"/>' +
    '<rect x="168" y="72" width="54" height="6" fill="' + INK2 + '"/><rect x="174" y="78" width="5" height="16" fill="' + INK2 + '"/><rect x="211" y="78" width="5" height="16" fill="' + INK2 + '"/>'
  );

  /* 宿舍：上下铺 + 窗 + 月光 */
  var dorm = wrap(
    '<rect x="0" y="88" width="300" height="22" fill="' + SOFT2 + '"/>' +
    '<rect x="20" y="30" width="96" height="62" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<rect x="24" y="34" width="88" height="16" fill="' + SOFT + '"/>' +
    '<rect x="24" y="66" width="88" height="16" fill="' + SOFT + '"/>' +
    '<rect x="20" y="28" width="96" height="4" fill="' + INK2 + '"/>' +
    '<circle cx="216" cy="34" r="11" fill="' + ACC + '" opacity=".28"/>' +
    '<rect x="180" y="16" width="88" height="58" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<line x1="224" y1="16" x2="224" y2="74" stroke="' + INK2 + '" stroke-width="1.1"/>' +
    '<rect x="140" y="66" width="34" height="6" fill="' + INK2 + '"/>' +
    '<rect x="150" y="72" width="4" height="22" fill="' + INK2 + '"/><rect x="162" y="72" width="4" height="22" fill="' + INK2 + '"/>' +
    '<rect x="146" y="56" width="20" height="10" fill="' + ACC + '" opacity=".6"/>'
  );

  /* 操场：跑道 + 两个人 */
  var field = wrap(
    '<rect x="0" y="70" width="300" height="40" fill="' + ACC + '" opacity=".16"/>' +
    '<path d="M-10 96 Q150 62 310 96" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<path d="M-10 104 Q150 70 310 104" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<circle cx="96" cy="42" r="6" fill="' + INK + '"/>' +
    '<path d="M96 48 L92 66 M96 48 L102 66 M96 54 L86 50 M96 54 L106 50" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="150" cy="46" r="6" fill="' + INK2 + '"/>' +
    '<path d="M150 52 L146 70 M150 52 L156 70 M150 58 L141 54 M150 58 L159 54" stroke="' + INK2 + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<circle cx="236" cy="40" r="5" fill="' + ACC + '"/>' +
    '<path d="M236 45 L233 62 M236 45 L240 62" stroke="' + ACC + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
  );

  /* 后街：店招 + 灯串 + 摊 */
  var street = wrap(
    '<rect x="0" y="80" width="300" height="30" fill="' + SOFT2 + '"/>' +
    '<path d="M0 26 Q75 40 150 26 Q225 12 300 26" fill="none" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<circle cx="40" cy="31" r="3" fill="' + ACC + '"/><circle cx="90" cy="34" r="3" fill="' + ACC + '"/><circle cx="140" cy="30" r="3" fill="' + ACC + '"/><circle cx="200" cy="24" r="3" fill="' + ACC + '"/><circle cx="255" cy="25" r="3" fill="' + ACC + '"/>' +
    '<rect x="24" y="48" width="52" height="32" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<rect x="32" y="40" width="36" height="8" fill="' + ACC + '" opacity=".55"/>' +
    '<rect x="96" y="44" width="60" height="36" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<rect x="174" y="52" width="42" height="28" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<path d="M174 52 L216 52" stroke="' + ACC + '" stroke-width="3"/>' +
    '<circle cx="240" cy="66" r="9" fill="' + SOFT + '"/><rect x="228" y="74" width="24" height="6" fill="' + INK2 + '"/>'
  );

  /* 开黑：三台显示器 */
  var game = wrap(
    '<rect width="300" height="110" fill="#2f2a22"/>' +
    '<rect x="26" y="30" width="66" height="42" fill="#4a4336" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<rect x="117" y="24" width="66" height="48" fill="#4a4336" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<rect x="208" y="30" width="66" height="42" fill="#4a4336" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<rect x="34" y="38" width="50" height="3" fill="' + ACC + '" opacity=".55"/>' +
    '<rect x="34" y="46" width="34" height="3" fill="' + ACC + '" opacity=".35"/>' +
    '<rect x="125" y="32" width="50" height="3" fill="' + ACC + '" opacity=".55"/>' +
    '<rect x="125" y="40" width="40" height="3" fill="' + ACC + '" opacity=".35"/>' +
    '<rect x="216" y="38" width="50" height="3" fill="' + ACC + '" opacity=".55"/>' +
    '<rect x="216" y="46" width="28" height="3" fill="' + ACC + '" opacity=".35"/>' +
    '<rect x="34" y="78" width="230" height="6" fill="#4a4336"/>' +
    '<circle cx="240" cy="18" r="4" fill="' + ACC + '" opacity=".8"/>'
  );

  /* 食堂：打饭台 + 餐盘 + 热气 */
  var canteen = wrap(
    '<rect x="0" y="78" width="300" height="32" fill="' + SOFT2 + '"/>' +
    '<rect x="0" y="62" width="300" height="16" fill="' + SOFT + '"/>' +
    '<rect x="0" y="60" width="300" height="3" fill="' + INK2 + '"/>' +
    '<rect x="26" y="40" width="34" height="20" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<rect x="72" y="44" width="34" height="16" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<rect x="118" y="40" width="34" height="20" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<path d="M40 34 q6 -12 0 -20 M52 34 q6 -10 0 -18" stroke="' + ACC + '" stroke-width="1.4" fill="none" opacity=".7"/>' +
    '<ellipse cx="200" cy="52" rx="26" ry="7" fill="' + SOFT2 + '" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<rect x="182" y="46" width="10" height="6" fill="' + ACC + '" opacity=".7"/>' +
    '<rect x="196" y="46" width="12" height="6" fill="' + INK2 + '" opacity=".5"/>' +
    '<rect x="212" y="46" width="9" height="6" fill="' + ACC + '" opacity=".45"/>' +
    '<circle cx="252" cy="36" r="8" fill="' + SOFT + '"/><path d="M252 44 L252 58" stroke="' + INK2 + '" stroke-width="2"/>'
  );

  /* 商场：玻璃幕墙 + 扶梯 */
  var mall = wrap(
    '<rect x="0" y="84" width="300" height="26" fill="' + SOFT2 + '"/>' +
    '<rect x="20" y="14" width="150" height="70" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<line x1="70" y1="14" x2="70" y2="84" stroke="' + INK2 + '" stroke-width="1"/><line x1="120" y1="14" x2="120" y2="84" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<line x1="20" y1="38" x2="170" y2="38" stroke="' + INK2 + '" stroke-width="1"/><line x1="20" y1="62" x2="170" y2="62" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<path d="M186 84 L262 30" stroke="' + INK2 + '" stroke-width="1.6"/>' +
    '<path d="M196 84 L272 30" stroke="' + INK2 + '" stroke-width="1.6"/>' +
    '<line x1="196" y1="80" x2="200" y2="76" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<line x1="216" y1="66" x2="220" y2="62" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<line x1="236" y1="52" x2="240" y2="48" stroke="' + ACC + '" stroke-width="1.2"/>'
  );

  /* 实验室：台面 + 仪器 */
  var lab = wrap(
    '<rect x="0" y="80" width="300" height="30" fill="' + SOFT2 + '"/>' +
    '<rect x="0" y="74" width="300" height="8" fill="' + SOFT + '"/>' +
    '<rect x="40" y="46" width="26" height="28" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<path d="M50 46 L50 36 L58 36 L58 46" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<circle cx="52" cy="58" r="3" fill="' + ACC + '" opacity=".7"/>' +
    '<rect x="96" y="50" width="44" height="24" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<path d="M104 50 L104 44 L132 44 L132 50" fill="none" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<rect x="106" y="58" width="24" height="3" fill="' + ACC + '" opacity=".6"/>' +
    '<rect x="168" y="38" width="60" height="36" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<line x1="168" y1="52" x2="228" y2="52" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<circle cx="180" cy="46" r="2.5" fill="' + ACC + '"/><circle cx="192" cy="46" r="2.5" fill="' + INK2 + '"/>'
  );

  /* 实习：工位 */
  var intern = wrap(
    '<rect x="0" y="82" width="300" height="28" fill="' + SOFT2 + '"/>' +
    '<rect x="60" y="60" width="180" height="8" fill="' + SOFT + '"/>' +
    '<rect x="72" y="68" width="6" height="26" fill="' + INK2 + '"/><rect x="222" y="68" width="6" height="26" fill="' + INK2 + '"/>' +
    '<rect x="112" y="26" width="76" height="34" fill="' + INK + '" opacity=".9"/>' +
    '<rect x="120" y="34" width="56" height="3" fill="' + PAPER + '" opacity=".5"/>' +
    '<rect x="120" y="42" width="38" height="3" fill="' + PAPER + '" opacity=".35"/>' +
    '<rect x="146" y="60" width="8" height="0" fill="' + INK2 + '"/>' +
    '<circle cx="88" cy="40" r="8" fill="' + SOFT + '"/><rect x="80" y="48" width="16" height="16" fill="' + SOFT + '"/>' +
    '<rect x="40" y="70" width="20" height="4" fill="' + ACC + '" opacity=".6"/>'
  );

  /* 社团：横幅 + 桌子 + 人 */
  var club = wrap(
    '<rect x="0" y="84" width="300" height="26" fill="' + SOFT2 + '"/>' +
    '<rect x="34" y="10" width="150" height="22" fill="' + ACC + '" opacity=".28"/>' +
    '<rect x="34" y="10" width="150" height="22" fill="none" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<line x1="46" y1="18" x2="102" y2="18" stroke="' + INK2 + '" stroke-width="1.6"/>' +
    '<line x1="46" y1="25" x2="150" y2="25" stroke="' + INK2 + '" stroke-width="1.6" opacity=".6"/>' +
    '<rect x="150" y="58" width="90" height="7" fill="' + SOFT + '"/>' +
    '<rect x="158" y="65" width="5" height="20" fill="' + INK2 + '"/><rect x="226" y="65" width="5" height="20" fill="' + INK2 + '"/>' +
    '<circle cx="70" cy="50" r="7" fill="' + INK + '"/><rect x="62" y="58" width="16" height="26" fill="' + INK + '"/>' +
    '<circle cx="104" cy="54" r="6" fill="' + INK2 + '"/><rect x="97" y="61" width="14" height="23" fill="' + INK2 + '"/>' +
    '<circle cx="200" cy="44" r="7" fill="' + INK2 + '"/><rect x="192" y="52" width="16" height="6" fill="' + INK2 + '"/>'
  );

  /* 竞赛：奖杯 + 赛道 */
  var comp = wrap(
    '<rect x="0" y="86" width="300" height="24" fill="' + SOFT2 + '"/>' +
    '<path d="M112 24 h44 v18 a22 22 0 0 1 -44 0 z" fill="' + ACC + '" opacity=".55" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<path d="M112 28 h-12 a12 12 0 0 0 12 12 M156 28 h12 a12 12 0 0 1 -12 12" fill="none" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<rect x="130" y="62" width="8" height="10" fill="' + INK2 + '"/>' +
    '<rect x="118" y="72" width="32" height="6" fill="' + INK2 + '"/>' +
    '<line x1="196" y1="30" x2="270" y2="30" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<line x1="196" y1="46" x2="270" y2="46" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<line x1="196" y1="62" x2="270" y2="62" stroke="' + INK2 + '" stroke-width="1.2"/>' +
    '<circle cx="214" cy="30" r="3" fill="' + ACC + '"/><circle cx="248" cy="46" r="3" fill="' + ACC + '"/>'
  );

  /* 志愿：帐篷 + 马甲 */
  var vol = wrap(
    '<rect x="0" y="86" width="300" height="24" fill="' + SOFT2 + '"/>' +
    '<path d="M60 78 L110 30 L160 78 Z" fill="' + ACC + '" opacity=".18" stroke="' + INK2 + '" stroke-width="1.3"/>' +
    '<line x1="110" y1="30" x2="110" y2="78" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<rect x="188" y="44" width="34" height="40" fill="' + ACC + '" opacity=".35" stroke="' + ACC + '" stroke-width="1.2"/>' +
    '<rect x="198" y="44" width="14" height="10" fill="' + PAPER + '" opacity=".8"/>' +
    '<circle cx="205" cy="30" r="8" fill="' + SOFT + '"/>' +
    '<rect x="240" y="66" width="40" height="5" fill="' + INK2 + '"/>'
  );

  /* 老乡会：圆桌 + 碗 */
  var hometown = wrap(
    '<rect x="0" y="84" width="300" height="26" fill="' + SOFT2 + '"/>' +
    '<ellipse cx="150" cy="66" rx="76" ry="20" fill="' + SOFT + '" stroke="' + INK2 + '" stroke-width="1.3"/>' +
    '<ellipse cx="120" cy="58" rx="12" ry="5" fill="' + PAPER + '" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<ellipse cx="150" cy="54" rx="12" ry="5" fill="' + PAPER + '" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<ellipse cx="180" cy="58" rx="12" ry="5" fill="' + PAPER + '" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<path d="M136 44 q4 -10 0 -16 M150 42 q4 -10 0 -16 M164 44 q4 -10 0 -16" stroke="' + ACC + '" stroke-width="1.3" fill="none" opacity=".55"/>' +
    '<circle cx="54" cy="56" r="7" fill="' + INK + '"/><rect x="46" y="64" width="16" height="20" fill="' + INK + '"/>' +
    '<circle cx="246" cy="56" r="7" fill="' + INK2 + '"/><rect x="238" y="64" width="16" height="20" fill="' + INK2 + '"/>'
  );

  /* 通用：校园 */
  var def = wrap(
    '<rect x="0" y="82" width="300" height="28" fill="' + SOFT2 + '"/>' +
    '<circle cx="246" cy="28" r="12" fill="' + ACC + '" opacity=".25"/>' +
    '<rect x="40" y="42" width="70" height="42" fill="none" stroke="' + INK2 + '" stroke-width="1.4"/>' +
    '<line x1="52" y1="52" x2="68" y2="52" stroke="' + INK2 + '" stroke-width="1"/><line x1="80" y1="52" x2="96" y2="52" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<line x1="52" y1="64" x2="68" y2="64" stroke="' + INK2 + '" stroke-width="1"/><line x1="80" y1="64" x2="96" y2="64" stroke="' + INK2 + '" stroke-width="1"/>' +
    '<circle cx="160" cy="52" r="9" fill="' + INK + '"/><rect x="150" y="61" width="20" height="23" fill="' + INK + '"/>' +
    '<circle cx="196" cy="56" r="8" fill="' + INK2 + '"/><rect x="187" y="64" width="18" height="20" fill="' + INK2 + '"/>' +
    '<rect x="228" y="52" width="6" height="32" fill="' + INK2 + '"/>' +
    '<circle cx="231" cy="42" r="13" fill="' + ACC + '" opacity=".22"/>'
  );

  /* 上课：讲台 + 黑板 + 排排坐 */
  var cls = wrap(
    '<rect x="0" y="86" width="300" height="24" fill="' + SOFT2 + '"/>' +
    '<rect x="60" y="10" width="180" height="44" fill="' + INK + '" opacity=".9"/>' +
    '<line x1="76" y1="24" x2="170" y2="24" stroke="' + PAPER + '" stroke-width="1.6" opacity=".7"/>' +
    '<line x1="76" y1="34" x2="146" y2="34" stroke="' + PAPER + '" stroke-width="1.6" opacity=".5"/>' +
    '<line x1="76" y1="44" x2="200" y2="44" stroke="' + ACC + '" stroke-width="1.6" opacity=".9"/>' +
    '<rect x="128" y="62" width="44" height="6" fill="' + INK2 + '"/>' +
    '<circle cx="40" cy="64" r="6" fill="' + INK2 + '"/><rect x="32" y="70" width="16" height="16" fill="' + INK2 + '"/>' +
    '<circle cx="86" cy="66" r="6" fill="' + INK2 + '"/><rect x="78" y="72" width="16" height="14" fill="' + INK2 + '"/>' +
    '<circle cx="196" cy="66" r="6" fill="' + INK2 + '"/><rect x="188" y="72" width="16" height="14" fill="' + INK2 + '"/>' +
    '<circle cx="242" cy="64" r="6" fill="' + INK2 + '"/><rect x="234" y="70" width="16" height="16" fill="' + INK2 + '"/>'
  );

  GD.ART = {
    lib: lib, lib2: lib, lib3: lib, room: room, room2: room, cls: cls,
    dorm: dorm, dorm2: dorm, field: field, street: street, game: game,
    canteen: canteen, mall: mall, lab: lab, intern: intern, part: intern,
    club: club, comp: comp, vol: vol, hometown: hometown,
    roomie: dorm, teacher: intern, outside: street, def: def
  };

  /* 变体：0 白天（原图）／1 夜晚／2 雨天 */
  function variant(svg, v) {
    if (v === 1) {
      return svg.replace('</svg>',
        '<rect width="300" height="110" fill="#241d15" opacity=".58"/>' +
        '<circle cx="250" cy="22" r="9" fill="#f0e2b4" opacity=".55"/>' +
        '<circle cx="250" cy="22" r="16" fill="#f0e2b4" opacity=".10"/>' +
        '</svg>');
    }
    if (v === 2) {
      var rain = '';
      for (var i = 0; i < 22; i++) {
        var x = (i * 37) % 300;
        var y = (i * 53) % 100;
        rain += '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 8) + '" y2="' + (y + 14) +
          '" stroke="#6b7f8c" stroke-width="1" opacity=".35"/>';
      }
      return svg.replace('</svg>',
        '<rect width="300" height="110" fill="#5c6f7a" opacity=".16"/>' + rain + '</svg>');
    }
    return svg;
  }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
    return h;
  }

  GD.artFor = function (winId, placeId, itemId) {
    var base = GD.ART[placeId] || GD.ART[winId] || GD.ART.def;
    var v = hash(String(itemId || placeId || winId)) % 3;
    return variant(base, v);
  };
})(globalThis.GD);

/* 毛線小幫手：針法怎麼鉤（示意圖資料＋教學影片） */
(function (root) {
  'use strict';

  /*
   * 示意圖的每一格用資料描述，由 drawFrame() 畫出來：
   *   loops    鉤針上有幾個線圈（不含這一格的繞線）
   *   yo       針頭上有一個「繞線」（橘色）
   *   hl       要標成橘色的線圈（0 = 最靠近針頭）；hlLabel 是旁邊的字
   *   targets  上一圈要用到的針目（0 = 下一針，-1 = 再下一針…），預設 [0]
   *   insert   針插進哪個針目（targets 裡的編號）
   *   pull     從哪個針目把線拉出來；pullLabel 是旁邊的字
   *   tallPull 拉出來的線圈拉高一點（長針類）
   *   through  繞線一次穿過幾個線圈
   *   posts    已鉤好的針目：[{ base:[針目], h:'flat'|'short'|'mid'|'tall'|'xtall', dx:左右偏移, old:是否是之前就鉤好的 }]
   *   postLabel 新針目旁邊的字（預設「新的 1 針」）
   *   chain    鎖針模式：不畫上一圈，改畫幾個鎖針；chainNew 標出最新的 1 個
   *   text     這一步的說明
   */
  const VIDEOS = {
    ring_detail: { id: '82WF4_y1dyE', title: '鉤針新手 - 基礎環形起針、短針加針和減針', ch: '樂約創意', len: '11:26' },
    ring_quick:  { id: 'Gvs2E0I3MRg', title: '【環形起針 Magic Ring】基礎鉤針練習', ch: '餓犬手作', len: '4:50' },
    chain:       { id: 'BpwMx4gw-yA', title: '鉤針新手 - 如何拿鉤針毛線和鎖針起針', ch: '樂約創意', len: '11:17' },
    basics:      { id: 'uS-v0UN4v2Q', title: '鉤針編織教學｜短針、中長針、長針、長長針', ch: 'Kamui by Karen', len: '14:02' },
    basics_slip: { id: '5mv5Di9UQEY', title: '鉤針基礎：引拔針、短針、中長針、長針、長長針', ch: '緹織所', len: '6:43' },
    dc_quick:    { id: '62h39Jatyt8', title: '【鉤針基礎】編織教學-長針', ch: '我愛手藝 ioCraft', len: '1:48' }
  };

  const OLD_SHORT = { base: [0], h: 'short', old: true };

  const HOWTO = {
    MR: {
      name: '環形起針（魔術環）',
      summary: '用線繞一個圈當起點，鉤完第 1 圈再拉線頭收緊，中心不會留洞。玩偶幾乎都從這裡開始。',
      textSteps: [
        '線頭在手指上繞一圈，交叉處用手指捏住。',
        '鉤針伸進圈裡，鉤住工作線拉出來。',
        '鉤 1 鎖針當起立針（不算一針）。',
        '針伸進圈裡鉤短針，照圖解鉤滿第 1 圈的針數（例如 6X）。',
        '拉線頭把圈收緊，再引拔到第 1 針，第 1 圈完成。'
      ],
      tip: '手指繞線的動作用圖很難看懂，建議直接看影片。',
      videos: ['ring_detail', 'ring_quick']
    },
    CH: {
      name: '鎖針（辮子針）',
      summary: '最基本的針法，用在起針和起立針。',
      steps: [
        { loops: 1, yo: true, chain: 2, text: '針上有 1 個線圈。繞線（線從後往前掛到針頭上）。' },
        { loops: 1, yo: true, through: 1, chain: 2, text: '把繞線從針上的線圈拉出來。' },
        { loops: 1, chain: 3, chainNew: true, text: '針上又剩 1 個線圈，多了 1 個鎖針！重複就能鉤出一長條辮子。' }
      ],
      tip: '口訣：繞線、拉出來。鬆緊要一致，太緊下一圈會插不進去。',
      videos: ['chain']
    },
    SL: {
      name: '引拔針',
      summary: '幾乎沒有高度的針法，用來把一圈接起來、接合或移動位置。',
      steps: [
        { loops: 1, insert: 0, text: '針上有 1 個線圈。把針插進下一針。' },
        { loops: 1, insert: 0, yo: true, text: '繞線。' },
        { loops: 1, pull: 0, pullLabel: '直接穿過針上的圈', text: '把線拉出來時，一口氣連針上的線圈一起穿過去。' },
        { loops: 1, posts: [{ base: [0], h: 'flat' }], text: '針上還是 1 個線圈，1 引拔針完成！' }
      ],
      tip: '口訣：插、繞、一口氣拉過全部。和短針的差別是：短針分兩次拉，引拔針一次就拉過。',
      videos: ['basics_slip']
    },
    X: {
      name: '短針',
      summary: '玩偶最常用的針法，矮矮的、很紮實。',
      steps: [
        { loops: 1, insert: 0, text: '針上有 1 個線圈。把針插進上一圈的下一針（挑 V 字上面的 2 條線）。' },
        { loops: 1, insert: 0, yo: true, text: '繞線：線從後往前掛到針頭上。' },
        { loops: 2, hl: [0], pull: 0, text: '把線從針目裡拉出來，針上變成 2 個線圈。' },
        { loops: 2, yo: true, through: 2, text: '再繞線，一次穿過針上的 2 個線圈。' },
        { loops: 1, posts: [{ base: [0], h: 'short' }], text: '針上剩 1 個線圈，1 短針完成！' }
      ],
      tip: '口訣：插、繞、拉出（2 圈），繞、穿過 2 圈。',
      videos: ['ring_detail', 'basics']
    },
    T: {
      name: '中長針',
      summary: '大約 2 個鎖針高，介於短針和長針之間，有人稱為半長針（英文 hdc）。沒有「半短針」這種標準針法。',
      steps: [
        { loops: 1, yo: true, text: '先繞線 1 次（插針前就繞）。' },
        { loops: 2, insert: 0, yo: true, text: '針上 2 個線圈。插進下一針，再繞線。' },
        { loops: 3, hl: [0], pull: 0, tallPull: true, text: '把線拉出來，針上 3 個線圈。' },
        { loops: 3, yo: true, through: 3, text: '繞線，一次穿過全部 3 個線圈。' },
        { loops: 1, posts: [{ base: [0], h: 'mid' }], text: '針上剩 1 個線圈，1 中長針完成！' }
      ],
      tip: '口訣：先繞線 1 次，一次穿過 3 圈。',
      videos: ['basics', 'basics_slip']
    },
    F: {
      name: '長針',
      summary: '大約 3 個鎖針高，常用在花邊、葉子和裙邊。',
      steps: [
        { loops: 1, yo: true, text: '先繞線 1 次（插針前就繞）。' },
        { loops: 2, insert: 0, yo: true, text: '針上 2 個線圈。插進下一針，再繞線。' },
        { loops: 3, hl: [0], pull: 0, tallPull: true, text: '把線拉出來，拉高一點（約 2 鎖針高），針上 3 個線圈。' },
        { loops: 3, yo: true, through: 2, text: '繞線，穿過「前 2 個」線圈，針上剩 2 個。' },
        { loops: 2, yo: true, through: 2, text: '再繞線，穿過最後 2 個線圈。' },
        { loops: 1, posts: [{ base: [0], h: 'tall' }], text: '針上剩 1 個線圈，1 長針完成！' }
      ],
      tip: '口訣：先繞線 1 次，分兩次各穿過 2 圈。',
      videos: ['basics', 'dc_quick']
    },
    E: {
      name: '長長針',
      summary: '大約 4 個鎖針高，是最高的基本針法。',
      steps: [
        { loops: 3, hl: [0, 1], hlLabel: '繞 2 次', text: '先繞線 2 次，針上 3 個線圈。' },
        { loops: 3, insert: 0, yo: true, text: '插進下一針，再繞線。' },
        { loops: 4, hl: [0], pull: 0, tallPull: true, text: '把線拉出來（拉高一點），針上 4 個線圈。' },
        { loops: 4, yo: true, through: 2, text: '繞線，穿過前 2 個，剩 3 個。' },
        { loops: 3, yo: true, through: 2, text: '繞線，再穿過 2 個，剩 2 個。' },
        { loops: 2, yo: true, through: 2, text: '繞線，穿過最後 2 個。' },
        { loops: 1, posts: [{ base: [0], h: 'xtall' }], text: '針上剩 1 個線圈，1 長長針完成！' }
      ],
      tip: '口訣：先繞線 2 次，分三次各穿過 2 圈。',
      videos: ['basics', 'basics_slip']
    },
    BUMP: {
      name: '裡山（鎖針背面）',
      summary: '鎖針翻到背面，中間有一排小小的凸起，就是「裡山」。從鎖針起針時挑它，起針邊會比較整齊。',
      steps: [
        { draw: 'chainFront', text: '鎖針正面是一串 V 字。' },
        { draw: 'chainBack', hi: 2, text: '把鎖針翻到背面，會看到一排小小的凸起，這就是裡山。' },
        { draw: 'chainInsert', hi: 2, text: '圖解寫「挑裡山」時，針從背面這個小山的位置插進去，再照圖解鉤（例如短針）。' }
      ],
      tip: '只有圖解寫「挑裡山」才這樣挑；沒寫的時候，照該圖解的說明或平常的挑法即可。',
      see: ['CH']
    },
    LOOP: {
      name: '前半針與後半針（外半針、內半針）',
      summary: '針目頂端是一個 V 字，由 2 條線組成。只挑其中 1 條來鉤，叫「挑半針」，沒鉤的另一條會留成一排小脊。',
      steps: [
        { draw: 'loop', mode: 'both', text: '針目頂端有 2 條線：離你近的叫前半針（外半針），離你遠的叫後半針（內半針）。一般鉤法是 2 條一起挑。' },
        { draw: 'loop', mode: 'front', text: '只挑前半針（外半針，標 FLO）：針只插進離你近的那條線，後面那條留著。' },
        { draw: 'loop', mode: 'back', text: '只挑後半針（內半針，標 BLO）：針插進離你遠的那條線，前面那條留著。' },
        { draw: 'loop', mode: 'ridge', text: '沒鉤的那一條會留成一排小脊，之後可以在上面鉤花邊、羊毛或另一片。' }
      ],
      tip: '注意：有些作者把「內半針」當成前半針，剛好相反。原文有附說明時，以原作者為準。',
      see: ['X']
    },
    TURN: {
      name: '起立針',
      summary: '開始新的一排或一圈時，先鉤幾個鎖針把高度墊起來，這幾個鎖針叫起立針。',
      steps: [
        { loops: 1, chain: 3, chainNew: true, text: '先鉤幾個鎖針，把高度墊起來，再鉤這一排的第 1 針。' },
        { draw: 'turn', text: '針法越高，起立的鎖針越多。圖上是各針法的高度，旁邊的鎖針堆就是它常用的起立針數。' }
      ],
      table: [['短針', '1 鎖針'], ['中長針', '2 鎖針'], ['長針', '3 鎖針'], ['長長針', '4 鎖針']],
      tip: '起立針算不算一針，各作者不同（短針的起立針通常不算一針）。以該份圖解的說明為準。',
      see: ['CH']
    },
    V: {
      name: '短針加針',
      summary: '在「同一針」裡鉤 2 個短針，這一針就變成 2 針，圈會越鉤越大。',
      steps: [
        { loops: 1, posts: [OLD_SHORT], insert: 0, text: '先在這一針鉤好 1 短針。接著把針插回「同一個針目」。' },
        { loops: 2, hl: [0], pull: 0, posts: [OLD_SHORT], text: '繞線拉出來，針上 2 個線圈。' },
        { loops: 2, yo: true, through: 2, posts: [OLD_SHORT], text: '再繞線，一次穿過 2 個線圈。' },
        { loops: 1, posts: [{ base: [0], h: 'short', dx: -14, old: true }, { base: [0], h: 'short', dx: 14 }], postLabel: '1 針變 2 針', text: '同一個針目裡有 2 個短針，這圈多了 1 針。' }
      ],
      see: ['X'],
      videos: ['ring_detail']
    },
    W: {
      name: '3 短針加針',
      summary: '在「同一針」裡鉤 3 個短針，這一針就變成 3 針。常用在轉角或尖端。',
      steps: [
        { loops: 1, posts: [OLD_SHORT], insert: 0, text: '先在這一針鉤好 1 短針，再把針插回「同一個針目」。' },
        { loops: 1, posts: [{ base: [0], h: 'short', dx: -12, old: true }, { base: [0], h: 'short', dx: 12, old: true }], insert: 0, text: '鉤好第 2 個短針，再插回同一個針目。' },
        { loops: 1, posts: [{ base: [0], h: 'short', dx: -22, old: true }, { base: [0], h: 'short', old: true }, { base: [0], h: 'short', dx: 22 }], postLabel: '1 針變 3 針', text: '鉤第 3 個短針。同一個針目裡有 3 個短針，這圈多了 2 針。' }
      ],
      see: ['X', 'V'],
      videos: ['ring_detail']
    },
    A: {
      name: '短針減針',
      summary: '把 2 針併成 1 針，圈會越鉤越小，通常用在收口。',
      steps: [
        { loops: 2, hl: [0], pull: 0, targets: [0, -1], text: '針插進下一針，繞線拉出來，先不要鉤完。針上 2 個線圈。' },
        { loops: 3, hl: [0], pull: -1, targets: [0, -1], text: '針直接插進再下一針，繞線拉出來，針上 3 個線圈。' },
        { loops: 3, yo: true, through: 3, targets: [0, -1], text: '繞線，一次穿過 3 個線圈。' },
        { loops: 1, posts: [{ base: [0, -1], h: 'short' }], postLabel: '2 針併成 1 針', text: '上一圈的 2 針，變成這一圈的 1 針。' }
      ],
      see: ['X'],
      tip: '玩偶常用「隱形減針」：只挑 2 針的前半針，再照上面的方法鉤，表面比較平整。',
      videos: ['ring_detail']
    },
    M: {
      name: '3 針併 1',
      summary: '把 3 針併成 1 針，一次減 2 針，收得比較快。',
      steps: [
        { loops: 2, hl: [0], pull: 0, targets: [0, -1, -2], text: '針插進下一針，繞線拉出來，先不要鉤完。針上 2 個線圈。' },
        { loops: 3, hl: [0], pull: -1, targets: [0, -1, -2], text: '插進再下一針，繞線拉出來，針上 3 個線圈。' },
        { loops: 4, hl: [0], pull: -2, targets: [0, -1, -2], text: '插進第 3 針，繞線拉出來，針上 4 個線圈。' },
        { loops: 4, yo: true, through: 4, targets: [0, -1, -2], text: '繞線，一次穿過 4 個線圈。' },
        { loops: 1, posts: [{ base: [0, -1, -2], h: 'short' }], postLabel: '3 針併成 1 針', text: '上一圈的 3 針，變成這一圈的 1 針。' }
      ],
      see: ['X', 'A'],
      videos: ['ring_detail']
    },
    FV: {
      name: '長針加針',
      summary: '在「同一針」裡鉤 2 個長針。',
      steps: [
        { loops: 1, yo: true, posts: [{ base: [0], h: 'tall', old: true }], text: '先在這一針鉤好 1 長針，再繞線。' },
        { loops: 2, insert: 0, posts: [{ base: [0], h: 'tall', old: true }], text: '針插回「同一個針目」。' },
        { loops: 1, posts: [{ base: [0], h: 'tall', dx: -14, old: true }, { base: [0], h: 'tall', dx: 14 }], postLabel: '1 針變 2 針', text: '照長針的方法鉤完（繞線拉出，再分兩次各穿過 2 圈）。同一個針目裡有 2 個長針。' }
      ],
      see: ['F'],
      videos: ['basics']
    },
    EV: {
      name: '長長針加針',
      summary: '在「同一針」裡鉤 2 個長長針。',
      steps: [
        { loops: 1, posts: [{ base: [0], h: 'xtall', old: true }], text: '先在這一針鉤好 1 長長針。' },
        { loops: 3, hl: [0, 1], hlLabel: '繞 2 次', insert: 0, posts: [{ base: [0], h: 'xtall', old: true }], text: '先繞線 2 次，針插回「同一個針目」。' },
        { loops: 1, posts: [{ base: [0], h: 'xtall', dx: -14, old: true }, { base: [0], h: 'xtall', dx: 14 }], postLabel: '1 針變 2 針', text: '照長長針的方法鉤完（繞線拉出，再分三次各穿過 2 圈）。' }
      ],
      see: ['E'],
      videos: ['basics']
    }
  };

  /* ---------- 畫示意圖 ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  let uid = 0;
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) el.setAttribute(k, v);
    kids.flat(Infinity).forEach(k => { if (k) el.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
    return el;
  }

  const W = 320, H = 200;
  const SHAFT_Y = 60, TIP_X = 70, LOOP_X0 = 112, LOOP_GAP = 26;
  const ROW_Y = 168, TARGET_X = 130, STITCH_GAP = 50;
  const POST_H = { flat: 8, short: 26, mid: 40, tall: 56, xtall: 70 };
  const SLASHES = { tall: 1, xtall: 2 };
  const TARGET_NAMES = { 0: '下一針', '-1': '再下一針', '-2': '第 3 針' };
  const tx = i => TARGET_X + i * STITCH_GAP;

  // 不屬於「針上線圈」模式的示意圖：裡山、半針、起立針
  function drawCustom(f) {
    const id = 'ah' + (++uid);
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'dg', role: 'img' });
    svg.appendChild(s('defs', null,
      s('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' },
        s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'dg-acc-fill' }))));
    const arrow = (x1, y1, x2, y2) => s('line', { x1, y1, x2, y2, class: 'dg-arrow dash', 'marker-end': 'url(#' + id + ')' });
    const text = (x, y, t, cls, anchor) => s('text', { x, y, class: cls || 'dg-label', 'text-anchor': anchor || 'middle' }, t);
    const tag = t => [
      s('rect', { x: 4, y: 4, width: 14 * t.length + 18, height: 26, rx: 13, class: 'dg-badge' }),
      s('text', { x: 4 + (14 * t.length + 18) / 2, y: 22, class: 'dg-badge-t', 'text-anchor': 'middle' }, t)];
    const xs = [60, 110, 160, 210, 260];

    if (f.draw === 'chainFront') {
      svg.append(...tag('正面'));
      xs.forEach(x => svg.appendChild(s('ellipse', { cx: x, cy: 100, rx: 27, ry: 13, class: 'dg-old' })));
      svg.appendChild(text(160, 150, '一串 V 字'));
    } else if (f.draw === 'chainBack' || f.draw === 'chainInsert') {
      svg.append(...tag('背面'));
      svg.appendChild(s('line', { x1: 30, y1: 104, x2: 290, y2: 104, class: 'dg-fabric' }));
      xs.forEach((x, i) => svg.appendChild(s('ellipse', { cx: x, cy: 100, rx: 11, ry: 9, class: i === f.hi ? 'dg-new' : 'dg-old' })));
      if (f.draw === 'chainBack') {
        svg.appendChild(text(160, 150, '一排小小的山 = 裡山'));
      } else {
        svg.appendChild(arrow(250, 36, xs[f.hi] + 6, 88));
        svg.appendChild(text(160, 150, '針從裡山插進去'));
      }
    } else if (f.draw === 'loop') {
      const mode = f.mode;
      if (mode === 'ridge') {
        [70, 160, 250].forEach(x => {
          svg.appendChild(s('ellipse', { cx: x, cy: 88, rx: 34, ry: 9, class: 'dg-old' }));
          svg.appendChild(s('ellipse', { cx: x, cy: 112, rx: 34, ry: 9, class: 'dg-new' }));
        });
        svg.appendChild(text(160, 150, '沒鉤的那條線 = 一排小脊'));
        svg.appendChild(text(160, 172, '（橘色是沒鉤的前半針）', 'dg-small'));
      } else {
        const frontCls = mode === 'back' ? 'dg-fabric' : mode === 'front' ? 'dg-new' : 'dg-old';
        const backCls = mode === 'front' ? 'dg-fabric' : mode === 'back' ? 'dg-new' : 'dg-old';
        svg.appendChild(s('ellipse', { cx: 160, cy: 78, rx: 62, ry: 14, class: backCls }));
        svg.appendChild(s('ellipse', { cx: 160, cy: 112, rx: 62, ry: 14, class: frontCls }));
        svg.appendChild(text(22, 80, '後半針', null, 'start'));
        svg.appendChild(text(22, 96, '（內半針）', 'dg-small', 'start'));
        svg.appendChild(text(22, 116, '前半針', null, 'start'));
        svg.appendChild(text(22, 132, '（外半針）', 'dg-small', 'start'));
        svg.appendChild(text(160, 36, '離你遠', 'dg-small'));
        svg.appendChild(text(160, 160, '離你近', 'dg-small'));
        if (mode === 'front') svg.appendChild(arrow(262, 172, 214, 124));
        if (mode === 'back') svg.appendChild(arrow(280, 150, 218, 84));
        if (mode === 'both') svg.appendChild(arrow(268, 126, 224, 96));
        svg.appendChild(text(160, 190, mode === 'both' ? '2 條線一起挑' : mode === 'front' ? '只挑前半針（FLO）' : '只挑後半針（BLO）'));
      }
    } else if (f.draw === 'turn') {
      const cols = [
        { x: 50, h: 'short', n: 1, name: '短針' }, { x: 125, h: 'mid', n: 2, name: '中長針' },
        { x: 200, h: 'tall', n: 3, name: '長針' }, { x: 275, h: 'xtall', n: 4, name: '長長針' }];
      const base = 140;
      cols.forEach(c => {
        const hgt = POST_H[c.h];
        const top = base - hgt;
        svg.appendChild(s('line', { x1: c.x + 14, y1: base, x2: c.x + 14, y2: top + 5, class: 'dg-old' }));
        for (let k = 1; k <= (SLASHES[c.h] || 0); k++) {
          const my = base - (hgt * k) / ((SLASHES[c.h] || 0) + 1);
          svg.appendChild(s('line', { x1: c.x + 6, y1: my + 4, x2: c.x + 22, y2: my - 4, class: 'dg-old' }));
        }
        svg.appendChild(s('ellipse', { cx: c.x + 14, cy: top, rx: 12, ry: 4, class: 'dg-old' }));
        const gap = hgt / c.n;
        for (let k = 0; k < c.n; k++) {
          svg.appendChild(s('ellipse', { cx: c.x - 12, cy: base - gap * (k + 0.5), rx: 9, ry: Math.min(7, gap / 2 - 1), class: 'dg-new' }));
        }
        svg.appendChild(s('line', { x1: c.x - 26, y1: base + 4, x2: c.x + 30, y2: base + 4, class: 'dg-fabric' }));
        svg.appendChild(text(c.x + 2, 164, c.name));
        svg.appendChild(text(c.x + 2, 184, c.n + ' 鎖針', 'dg-small'));
      });
    }
    return svg;
  }

  function drawFrame(f) {
    if (f.draw) return drawCustom(f);
    const id = 'ah' + (++uid);
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'dg', role: 'img' });
    svg.appendChild(s('defs', null,
      s('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' },
        s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'dg-acc-fill' }))));
    const arrow = (x1, y1, x2, y2, dash) => s('line', { x1, y1, x2, y2, class: 'dg-arrow' + (dash ? ' dash' : ''), 'marker-end': 'url(#' + id + ')' });

    const posts = f.posts || [];
    const finished = posts.some(p => !p.old);
    const targets = finished ? [] : (f.targets || [0]);

    if (f.chain) {
      // 鎖針：從針上的線圈往下垂的一串辮子
      svg.appendChild(s('line', { x1: LOOP_X0, y1: SHAFT_Y + 16, x2: LOOP_X0, y2: 122, class: 'dg-fabric' }));
      for (let k = 0; k < f.chain; k++) {
        svg.appendChild(s('ellipse', { cx: LOOP_X0 + k * 36, cy: 132, rx: 17, ry: 9, class: k === 0 && f.chainNew ? 'dg-new' : 'dg-fabric' }));
      }
      if (f.chainNew) svg.appendChild(s('text', { x: LOOP_X0, y: 165, class: 'dg-small', 'text-anchor': 'middle' }, '新的鎖針'));
    } else {
      // 上一圈的針目（俯看是一排 V 字）
      for (let i = -2; i <= 3; i++) {
        const x = tx(i);
        svg.appendChild(s('ellipse', { cx: x, cy: ROW_Y, rx: 20, ry: 7, class: targets.includes(i) ? 'dg-target' : 'dg-fabric' }));
        svg.appendChild(s('line', { x1: x, y1: ROW_Y + 7, x2: x, y2: H, class: 'dg-fabric' }));
      }
      if (targets.length > 1 || f.insert != null) {
        targets.forEach(i => svg.appendChild(s('text', { x: tx(i), y: ROW_Y + 25, class: 'dg-small', 'text-anchor': 'middle' }, TARGET_NAMES[i])));
      }
    }

    // 鉤好的針目
    let labelX = null, labelY = null;
    posts.forEach(p => {
      const hgt = POST_H[p.h] || POST_H.short;
      const bases = p.base.map(tx);
      const topX = bases.reduce((a, b) => a + b, 0) / bases.length + (p.dx || 0);
      const top = ROW_Y - 7 - hgt;
      const cls = p.old ? 'dg-old' : 'dg-new';
      if (p.h !== 'flat') bases.forEach(bx => svg.appendChild(s('line', { x1: bx, y1: ROW_Y - 7, x2: topX, y2: top + 6, class: cls })));
      const n = SLASHES[p.h] || 0;
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        const mx = bases[0] + (topX - bases[0]) * t, my = (ROW_Y - 7) + (top + 6 - (ROW_Y - 7)) * t;
        svg.appendChild(s('line', { x1: mx - 8, y1: my + 5, x2: mx + 8, y2: my - 5, class: cls }));
      }
      svg.appendChild(s('ellipse', { cx: topX, cy: top, rx: 15, ry: 5, class: cls }));
      if (!p.old && (labelX == null || topX > labelX)) { labelX = topX; labelY = top; }
    });
    if (labelX != null) svg.appendChild(s('text', { x: labelX + 24, y: labelY + 5, class: 'dg-label' }, f.postLabel || '新的 1 針'));

    // 鉤針：握柄在右，針頭在左
    svg.appendChild(s('rect', { x: 236, y: SHAFT_Y - 9, width: 80, height: 18, rx: 9, class: 'dg-handle' }));
    svg.appendChild(s('line', { x1: TIP_X + 8, y1: SHAFT_Y, x2: 240, y2: SHAFT_Y, class: 'dg-shaft' }));
    svg.appendChild(s('path', { d: 'M' + (TIP_X + 10) + ',' + SHAFT_Y + ' Q' + (TIP_X - 2) + ',' + (SHAFT_Y - 1) + ' ' + (TIP_X + 1) + ',' + (SHAFT_Y + 9), class: 'dg-tip' }));

    // 針上的線圈（0 = 最靠近針頭）
    const hl = f.hl || [];
    for (let j = 0; j < f.loops; j++) {
      const x = LOOP_X0 + j * LOOP_GAP;
      const tall = f.tallPull && j === 0;
      svg.appendChild(s('ellipse', { cx: x, cy: SHAFT_Y + (tall ? 6 : 0), rx: 7, ry: tall ? 22 : 16, class: hl.includes(j) ? 'dg-loop hl' : 'dg-loop' }));
    }
    if (f.hlLabel && hl.length) {
      const cx = LOOP_X0 + (hl.reduce((a, b) => a + b, 0) / hl.length) * LOOP_GAP;
      svg.appendChild(s('text', { x: cx, y: SHAFT_Y - 24, class: 'dg-label', 'text-anchor': 'middle' }, f.hlLabel));
    }

    // 繞線
    if (f.yo) {
      const x = TIP_X + 22;
      svg.appendChild(s('ellipse', { cx: x, cy: SHAFT_Y, rx: 6, ry: 16, class: 'dg-yo' }));
      svg.appendChild(s('path', { d: 'M' + x + ',' + (SHAFT_Y - 16) + ' Q' + (x + 30) + ',' + (SHAFT_Y - 46) + ' 160,16', class: 'dg-yarn' }));
      svg.appendChild(s('text', { x: x - 6, y: SHAFT_Y - 22, class: 'dg-label', 'text-anchor': 'end' }, '繞線'));
    }

    // 插針
    if (f.insert != null) svg.appendChild(arrow(TIP_X + 4, SHAFT_Y + 14, tx(f.insert) - 4, ROW_Y - 12, true));

    // 拉出
    if (f.pull != null) {
      const x = tx(f.pull);
      svg.appendChild(arrow(x, ROW_Y - 10, LOOP_X0 - 4, SHAFT_Y + 30));
      svg.appendChild(s('text', { x: Math.max(x, LOOP_X0) + 22, y: ROW_Y - 30, class: 'dg-label' }, f.pullLabel || '拉出來'));
    }

    // 一次穿過幾個線圈
    if (f.through) {
      const x1 = LOOP_X0 + (f.through - 1) * LOOP_GAP + 10;
      const y = SHAFT_Y + 28;
      svg.appendChild(s('path', { d: 'M' + (LOOP_X0 - 10) + ',' + (y - 6) + ' V' + y + ' H' + x1 + ' V' + (y - 6), class: 'dg-bracket' }));
      svg.appendChild(arrow(x1 + 4, y + 14, TIP_X + 22, y + 14));
      svg.appendChild(s('text', { x: x1 + 10, y: y + 19, class: 'dg-label' }, '一次穿過 ' + f.through + ' 圈'));
    }

    // 右上角：針上幾個線圈
    svg.appendChild(s('rect', { x: W - 112, y: 4, width: 108, height: 26, rx: 13, class: 'dg-badge' }));
    svg.appendChild(s('text', { x: W - 58, y: 22, class: 'dg-badge-t', 'text-anchor': 'middle' }, '針上 ' + f.loops + ' 個線圈'));
    return svg;
  }

  function videoUrl(key) { return 'https://www.youtube.com/watch?v=' + VIDEOS[key].id; }

  // 某一步用到哪些可以查的針法
  function keysForStep(step) {
    const out = [];
    const add = k => { if (HOWTO[k] && !out.includes(k)) out.push(k); };
    const text = [step.tip, step.text, step.raw].concat(step.sub || []).filter(Boolean).join(' ');
    if (/環形起針|魔術環|MR/.test(text)) add('MR');
    (step.tokens || []).forEach(t => add(t.k));
    if (/鎖針/.test(text)) add('CH');
    if (/裡山/.test(text)) add('BUMP');
    if (/內半針|外半針|前半針|後半針/.test(text)) add('LOOP');
    if (/起立針/.test(text)) add('TURN');
    if (/引拔/.test(text)) add('SL');
    return out;
  }

  root.Howto = { HOWTO, VIDEOS, drawFrame, videoUrl, keysForStep };
})(typeof self !== 'undefined' ? self : this);

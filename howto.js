/* 毛線小幫手：針法怎麼鉤（示意圖資料＋教學影片） */
(function (root) {
  'use strict';

  /*
   * 示意圖的每一格用資料描述，由 drawFrame() 畫出來：
   *   loops   鉤針上有幾個線圈（不含這一格的繞線）
   *   yo      針頭上有一個「繞線」（橘色）
   *   hl      要標成橘色的線圈（0 = 最靠近針頭）
   *   insert  針插進上一圈的「下一針」
   *   pull    把線從針目裡拉出來
   *   through 繞線一次穿過幾個線圈
   *   post    'short' | 'mid' | 'tall'：完成後的針目高度
   *   text    這一步的說明
   */
  const VIDEOS = {
    ring_detail: { id: '82WF4_y1dyE', title: '鉤針新手 - 基礎環形起針、短針加針和減針', ch: '樂約創意', len: '11:26' },
    ring_quick:  { id: 'Gvs2E0I3MRg', title: '【環形起針 Magic Ring】基礎鉤針練習', ch: '餓犬手作', len: '4:50' },
    chain:       { id: 'BpwMx4gw-yA', title: '鉤針新手 - 如何拿鉤針毛線和鎖針起針', ch: '樂約創意', len: '11:17' },
    basics:      { id: 'uS-v0UN4v2Q', title: '鉤針編織教學｜短針、中長針、長針、長長針', ch: 'Kamui by Karen', len: '14:02' },
    dc_quick:    { id: '62h39Jatyt8', title: '【鉤針基礎】編織教學-長針', ch: '我愛手藝 ioCraft', len: '1:48' }
  };

  const HOWTO = {
    MR: {
      name: '環形起針（魔術環）',
      summary: '用線繞一個圈當起點，鉤完第 1 圈再拉線頭收緊，中心不會留洞。玩偶幾乎都從這裡開始。',
      steps: null,
      textSteps: [
        '線頭在手指上繞一圈，交叉處用手指捏住。',
        '鉤針伸進圈裡，鉤住工作線拉出來。',
        '鉤 1 鎖針當起立針（不算一針）。',
        '針伸進圈裡鉤短針，照圖解鉤滿第 1 圈的針數（例如 6X）。',
        '拉線頭把圈收緊，再引拔到第 1 針，第 1 圈完成。'
      ],
      videos: ['ring_detail', 'ring_quick']
    },
    CH: {
      name: '鎖針（辮子針）',
      summary: '最基本的針法，常用在起針與起立針。',
      textSteps: [
        '針上有 1 個線圈。',
        '繞線（線從後往前掛到針上）。',
        '把繞線從針上的線圈拉出來，就完成 1 鎖針。'
      ],
      videos: ['chain']
    },
    X: {
      name: '短針',
      summary: '玩偶最常用的針法，矮矮的、很紮實。',
      steps: [
        { loops: 1, insert: true, text: '針上有 1 個線圈。把針插進上一圈的下一針（挑 V 字上面的 2 條線）。' },
        { loops: 1, insert: true, yo: true, text: '繞線：線從後往前掛到針頭上。' },
        { loops: 2, hl: [0], pull: true, text: '把線從針目裡拉出來，針上變成 2 個線圈。' },
        { loops: 2, yo: true, through: 2, text: '再繞線，一次穿過針上的 2 個線圈。' },
        { loops: 1, post: 'short', text: '針上剩 1 個線圈，1 短針完成！' }
      ],
      tip: '口訣：插、繞、拉出（2 圈），繞、穿過 2 圈。',
      videos: ['ring_detail', 'basics']
    },
    V: {
      name: '短針加針',
      summary: '在「同一針」裡鉤 2 個短針，這一針就變成 2 針，圈會越鉤越大。',
      textSteps: [
        '照平常鉤 1 短針。',
        '針插回「剛剛同一個針目」，再鉤 1 短針。',
        '完成：上一圈的 1 針，變成這一圈的 2 針。'
      ],
      see: ['X'],
      videos: ['ring_detail']
    },
    A: {
      name: '短針減針',
      summary: '把 2 針併成 1 針，圈會越鉤越小，通常用在收口。',
      textSteps: [
        '針插進下一針，繞線拉出來（針上 2 個線圈），先不要鉤完。',
        '針直接插進再下一針，繞線拉出來（針上 3 個線圈）。',
        '繞線，一次穿過 3 個線圈。上一圈的 2 針，變成這一圈的 1 針。'
      ],
      see: ['X'],
      tip: '玩偶常用「隱形減針」：只挑 2 針的前半針，再照上面的方法鉤，表面比較平整。',
      videos: ['ring_detail']
    },
    F: {
      name: '長針',
      summary: '大約 3 個鎖針高，常用在花邊、葉子和裙邊。',
      steps: [
        { loops: 1, yo: true, text: '先繞線 1 次（插針前就繞）。' },
        { loops: 2, insert: true, yo: true, text: '針上 2 個線圈。插進下一針，再繞線。' },
        { loops: 3, hl: [0], pull: true, tallPull: true, text: '把線拉出來，拉高一點（約 2 鎖針高），針上 3 個線圈。' },
        { loops: 3, yo: true, through: 2, text: '繞線，穿過「前 2 個」線圈，針上剩 2 個。' },
        { loops: 2, yo: true, through: 2, text: '再繞線，穿過最後 2 個線圈。' },
        { loops: 1, post: 'tall', text: '針上剩 1 個線圈，1 長針完成！' }
      ],
      tip: '口訣：先繞線 1 次，分兩次各穿過 2 圈。',
      videos: ['basics', 'dc_quick']
    },
    FV: {
      name: '長針加針',
      summary: '在「同一針」裡鉤 2 個長針。',
      textSteps: [
        '照平常鉤 1 長針。',
        '針插回「剛剛同一個針目」，再鉤 1 長針。'
      ],
      see: ['F'],
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
  const SHAFT_Y = 72, TIP_X = 70, LOOP_X0 = 112, LOOP_GAP = 26;
  const ROW_Y = 168, TARGET_X = 92, STITCH_GAP = 50;

  function drawFrame(f) {
    const id = 'ah' + (++uid);
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'dg', role: 'img' });
    svg.appendChild(s('defs', null,
      s('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' },
        s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'dg-acc-fill' }))));

    // 上一圈的針目（俯看是一排 V 字）
    for (let i = -1; i < 6; i++) {
      const x = TARGET_X + i * STITCH_GAP;
      const isT = i === 0;
      svg.appendChild(s('ellipse', { cx: x, cy: ROW_Y, rx: 20, ry: 7, class: isT && !f.post ? 'dg-target' : 'dg-fabric' }));
      svg.appendChild(s('line', { x1: x, y1: ROW_Y + 7, x2: x, y2: H, class: 'dg-fabric' }));
    }
    if (f.insert && !f.post) {
      svg.appendChild(s('text', { x: TARGET_X, y: ROW_Y + 25, class: 'dg-small', 'text-anchor': 'middle' }, '下一針'));
    }

    // 完成的針目
    if (f.post) {
      const hgt = f.post === 'short' ? 26 : f.post === 'mid' ? 42 : 58;
      const top = ROW_Y - 7 - hgt;
      svg.appendChild(s('line', { x1: TARGET_X, y1: ROW_Y - 7, x2: TARGET_X, y2: top + 6, class: 'dg-new' }));
      if (f.post === 'tall') svg.appendChild(s('line', { x1: TARGET_X - 9, y1: top + hgt / 2 + 4, x2: TARGET_X + 9, y2: top + hgt / 2 - 6, class: 'dg-new' }));
      svg.appendChild(s('ellipse', { cx: TARGET_X, cy: top, rx: 18, ry: 6, class: 'dg-new' }));
      svg.appendChild(s('text', { x: TARGET_X + 30, y: top + 4, class: 'dg-label' }, '新的 1 針'));
    }

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

    // 繞線
    if (f.yo) {
      const x = TIP_X + 22;
      svg.appendChild(s('ellipse', { cx: x, cy: SHAFT_Y, rx: 6, ry: 16, class: 'dg-yo' }));
      svg.appendChild(s('path', { d: 'M' + x + ',' + (SHAFT_Y - 16) + ' Q' + (x + 30) + ',' + (SHAFT_Y - 50) + ' 150,22', class: 'dg-yarn' }));
      svg.appendChild(s('text', { x: x - 4, y: SHAFT_Y - 26, class: 'dg-label', 'text-anchor': 'end' }, '繞線'));
    }

    // 插針
    if (f.insert && !f.post) {
      svg.appendChild(s('line', { x1: TIP_X + 4, y1: SHAFT_Y + 14, x2: TARGET_X - 4, y2: ROW_Y - 12, class: 'dg-arrow dash', 'marker-end': 'url(#' + id + ')' }));
    }

    // 拉出
    if (f.pull) {
      svg.appendChild(s('line', { x1: TARGET_X, y1: ROW_Y - 10, x2: LOOP_X0 - 4, y2: SHAFT_Y + 30, class: 'dg-arrow', 'marker-end': 'url(#' + id + ')' }));
      svg.appendChild(s('text', { x: TARGET_X + 26, y: ROW_Y - 22, class: 'dg-label' }, '拉出來'));
    }

    // 一次穿過幾個線圈
    if (f.through) {
      const x1 = LOOP_X0 + (f.through - 1) * LOOP_GAP + 10;
      const x2 = TIP_X + 22;
      const y = SHAFT_Y + 30;
      svg.appendChild(s('path', { d: 'M' + (LOOP_X0 - 10) + ',' + (y - 6) + ' V' + y + ' H' + x1 + ' V' + (y - 6), class: 'dg-bracket' }));
      svg.appendChild(s('line', { x1: x1 + 4, y1: y + 14, x2: x2, y2: y + 14, class: 'dg-arrow', 'marker-end': 'url(#' + id + ')' }));
      svg.appendChild(s('text', { x: x1 + 10, y: y + 19, class: 'dg-label' }, '一次穿過 ' + f.through + ' 圈'));
    }

    // 左上角：針上幾個線圈
    const n = f.loops;
    svg.appendChild(s('rect', { x: 4, y: 4, width: 104, height: 28, rx: 14, class: 'dg-badge' }));
    svg.appendChild(s('text', { x: 56, y: 23, class: 'dg-badge-t', 'text-anchor': 'middle' }, '針上 ' + n + ' 個線圈'));
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
    return out;
  }

  root.Howto = { HOWTO, VIDEOS, drawFrame, videoUrl, keysForStep };
})(typeof self !== 'undefined' ? self : this);

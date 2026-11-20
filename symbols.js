/* 毛線小幫手：鉤針符號圖示（自己重畫的 SVG，24×24，線條用 currentColor，深淺主題都看得清楚） */
(function (root) {
  'use strict';

  // 長針類的「直桿＋頂橫線＋斜槓」：從 (bx,by) 長到 (tx,ty)，slashes = 斜槓數
  function post(bx, by, tx, ty, slashes) {
    const out = [['path', { d: 'M' + bx + ' ' + by + 'L' + tx + ' ' + ty }],
      ['path', { d: 'M' + (tx - 2.5) + ' ' + ty + 'H' + (tx + 2.5) }]];
    for (let i = 0; i < slashes; i++) {
      const f = slashes === 1 ? 0.5 : 0.38 + i * 0.26;
      const mx = tx + (bx - tx) * f, my = ty + (by - ty) * f;
      out.push(['path', { d: 'M' + (mx - 2) + ' ' + (my + 1.2) + 'L' + (mx + 2) + ' ' + (my - 1.2) }]);
    }
    return out;
  }
  const fan = (tops, slashes) => tops.reduce((a, t) => a.concat(post(12, 21, t[0], t[1], slashes)), []);
  // 併針：幾根桿子從下面不同針目往上收到同一點，頂端一條橫線
  const join = (bases, slashes) => bases.reduce((a, b) => a.concat(post(b[0], b[1], 12, 4, slashes)), []);
  // 斜槓（長針 1 條、長長針 2 條），畫在棗形、爆米花中間
  const bars = n => Array.from({ length: n }, (_, i) => ['path', { d: 'M8 ' + (14 + i * 3) + 'L16 ' + (11 + i * 3) }]);
  const SLASH = { T: 0, F: 1, E: 2 };
  // 棗形針：葉子形（未完成的針一起拉過）；爆米花針：圓桶形（完整的針收成一團）
  const puff = b => [['path', { d: 'M12 21C5 16 5 10 12 6C19 10 19 16 12 21Z' }], ['path', { d: 'M8 4H16' }], ['path', { d: 'M12 6V21' }]].concat(bars(SLASH[b]));
  const popcorn = b => [['path', { d: 'M7 6C3 10 3 17 7 21H17C21 17 21 10 17 6Z' }], ['path', { d: 'M6 4H18' }], ['path', { d: 'M10 7V20M14 7V20' }]].concat(bars(SLASH[b]));

  const DATA = {
    X:  [['path', { d: 'M6 6L18 18M18 6L6 18' }]],
    V:  [['path', { d: 'M12 21L5 4M12 21L19 4' }]],
    W:  [['path', { d: 'M12 21L4 5M12 21V3M12 21L20 5' }]],
    A:  [['path', { d: 'M5 21L12 4L19 21' }]],
    M:  [['path', { d: 'M4 20L12 3L20 20M12 3V21' }]],
    T:  [['path', { d: 'M6 4H18M12 4V21' }]],
    F:  post(12, 21, 12, 4, 1),
    E:  post(12, 21, 12, 4, 2),
    FV: fan([[5, 4], [19, 4]], 1),
    EV: fan([[5, 4], [19, 4]], 2),
    FW: fan([[3.5, 7], [12, 3], [20.5, 7]], 1),
    TV: fan([[5, 4], [19, 4]], 0),
    TW: fan([[3.5, 7], [12, 3], [20.5, 7]], 0),
    EW: fan([[3.5, 7], [12, 3], [20.5, 7]], 2),
    TA: join([[5, 21], [19, 21]], 0),
    TM: join([[4, 21], [12, 21], [20, 21]], 0),
    FA: join([[5, 21], [19, 21]], 1),
    FM: join([[4, 21], [12, 21], [20, 21]], 1),
    EA: join([[5, 21], [19, 21]], 2),
    EM: join([[4, 21], [12, 21], [20, 21]], 2),
    SL: [['ellipse', { cx: 12, cy: 12, rx: 5, ry: 3, fill: 'currentColor' }]],
    CH: [['ellipse', { cx: 12, cy: 12, rx: 7, ry: 4 }]],
    K:  [['path', { d: 'M3 17Q12 3 21 17', 'stroke-dasharray': '2.5 3' }]],
    MR: [['path', { d: 'M12 12m-1.5 0a1.5 1.5 0 1 1 3 0a3.5 3.5 0 1 1 -7 0a5.5 5.5 0 1 1 11 0a7.5 7.5 0 1 1 -15 0' }]]
  };

  // 棗形針、爆米花針不分針數用同一個圖（2～6 針，和 core.js 一致）
  for (let n = 2; n <= 6; n++) ['T', 'F', 'E'].forEach(b => { DATA[n + b + 'Q'] = puff(b); DATA[n + b + 'G'] = popcorn(b); });

  const CODES = Object.keys(DATA);
  const has = code => Object.prototype.hasOwnProperty.call(DATA, code);
  const NS = 'http://www.w3.org/2000/svg';

  function svg(code, size) {
    if (!has(code)) return null;
    const px = String(size || 22);
    const el = document.createElementNS(NS, 'svg');
    const attrs = { viewBox: '0 0 24 24', width: px, height: px, fill: 'none', stroke: 'currentColor',
      'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', class: 'sym' };
    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    DATA[code].forEach(([tag, a]) => {
      const c = document.createElementNS(NS, tag);
      Object.keys(a).forEach(k => c.setAttribute(k, a[k]));
      el.appendChild(c);
    });
    return el;
  }

  const api = { CODES, has, svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Symbols = api;
})(typeof self !== 'undefined' ? self : this);

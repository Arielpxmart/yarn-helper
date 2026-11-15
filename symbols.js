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
    SL: [['ellipse', { cx: 12, cy: 12, rx: 5, ry: 3, fill: 'currentColor' }]],
    CH: [['ellipse', { cx: 12, cy: 12, rx: 7, ry: 4 }]],
    K:  [['path', { d: 'M3 17Q12 3 21 17', 'stroke-dasharray': '2.5 3' }]],
    MR: [['path', { d: 'M12 12m-1.5 0a1.5 1.5 0 1 1 3 0a3.5 3.5 0 1 1 -7 0a5.5 5.5 0 1 1 11 0a7.5 7.5 0 1 1 -15 0' }]]
  };

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

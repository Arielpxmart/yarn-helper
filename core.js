/* 毛線小幫手：織圖解析核心（App 與電腦端驗證共用） */
(function (root) {
  'use strict';

  // c = 用掉上一圈幾針, p = 產生幾針
  const STITCHES = {
    X:  { c: 1, p: 1, name: '短針',   short: '短' },
    V:  { c: 1, p: 2, name: '加針',   short: '加' },
    W:  { c: 1, p: 3, name: '3 短針加針', short: '3加' },
    A:  { c: 2, p: 1, name: '減針',   short: '減' },
    T:  { c: 1, p: 1, name: '中長針', short: '中長' },
    F:  { c: 1, p: 1, name: '長針',   short: '長' },
    FV: { c: 1, p: 2, name: '長針加針', short: '長加' },
    E:  { c: 1, p: 1, name: '長長針', short: '長長' },
    EV: { c: 1, p: 2, name: '長長針加針', short: '長長加' },
    M:  { c: 3, p: 1, name: '3 針併 1', short: '併3' },
    SL: { c: 1, p: 1, name: '引拔針', short: '引' },
    CH: { c: 0, p: 1, name: '鎖針',   short: '鎖' }
  };

  const LEGEND_TEXT = {
    X: '短針',
    V: '加針：同一針裡鉤 2 短針',
    W: '同一針裡鉤 3 短針',
    A: '減針：2 針併成 1 針',
    T: '中長針',
    F: '長針',
    FV: '長針加針：同一針裡鉤 2 長針',
    E: '長長針',
    EV: '長長針加針：同一針裡鉤 2 長長針',
    M: '3 針併成 1 短針',
    SL: '引拔針',
    CH: '鎖針'
  };

  function normalize(raw) {
    return String(raw)
      .replace(/[（]/g, '(').replace(/[）]/g, ')')
      .replace(/[｛]/g, '{').replace(/[｝]/g, '}')
      .replace(/[：]/g, ':')
      .replace(/[，、；;]/g, ',')
      .replace(/[×＊]/g, '*')
      .replace(/\s+/g, '');
  }

  // 解析：回傳節點樹；看不懂的寫法丟出錯誤
  function parseRaw(raw) {
    const s = normalize(raw);
    let i = 0;

    function err(msg) { throw new Error(msg + '（位置 ' + (i + 1) + '）'); }
    function num() {
      const m = /^\d+/.exec(s.slice(i));
      if (!m) return null;
      i += m[0].length;
      return parseInt(m[0], 10);
    }
    function list(endCh) {
      const items = [];
      for (;;) {
        items.push(item());
        if (s[i] === ',') { i++; continue; }
        if (endCh ? s[i] === endCh : i >= s.length) break;
        err('看不懂的符號「' + (s[i] || '') + '」');
      }
      return items;
    }
    function item() {
      const n = num();
      if (s[i] === '(') {
        i++;
        const inner = list(')');
        i++;
        let times = n;
        if (s[i] === '*') {
          i++;
          const t = num();
          if (t == null) err('「*」後面要接次數');
          if (times != null) err('重複次數寫了兩次');
          times = t;
        }
        return { type: 'group', times: times == null ? 1 : times, items: inner };
      }
      if (s[i] === '{') {
        if (n != null) err('顏色區段前面不能有數字');
        i++;
        const end = s.indexOf(':', i);
        if (end < 0) err('顏色區段要寫成 {顏色: 針法}');
        const color = s.slice(i, end);
        i = end + 1;
        const inner = list('}');
        i++;
        return { type: 'color', color, items: inner };
      }
      const rest = s.slice(i);
      const m = /^(SL|CH|FV|EV|[XVWATFEM])/.exec(rest);
      if (!m) err('看不懂的針法「' + (rest[0] || '') + '」');
      i += m[1].length;
      return { type: 'st', k: m[1], n: n == null ? 1 : n };
    }

    if (!s) throw new Error('沒有內容');
    const tree = list(null);
    return tree;
  }

  // 展開成一針一按的清單
  function expand(tree, color) {
    const out = [];
    function walk(items, col) {
      items.forEach((it, idx) => {
        if (it.type === 'st') {
          for (let k = 0; k < it.n; k++) out.push({ k: it.k, color: col || null, sep: k === 0 });
        } else if (it.type === 'group') {
          for (let t = 0; t < it.times; t++) {
            const start = out.length;
            walk(it.items, col);
            if (out[start]) out[start].sep = true;
          }
        } else if (it.type === 'color') {
          const start = out.length;
          walk(it.items, it.color);
          if (out[start]) out[start].sep = true;
        }
      });
    }
    walk(tree, color || null);
    return out;
  }

  // 轉成好讀的文字片段：[{t, color}]
  function toSegments(tree) {
    const segs = [];
    function stText(it) {
      const d = STITCHES[it.k];
      return it.n + ' ' + d.name;
    }
    function inline(items) {
      return items.map(it => {
        if (it.type === 'st') return stText(it);
        if (it.type === 'group') return '(' + inline(it.items) + ') ×' + it.times;
        return inline(it.items);
      }).join('、');
    }
    tree.forEach((it, idx) => {
      if (idx > 0) segs.push({ t: '、', color: null });
      if (it.type === 'color') segs.push({ t: inline(it.items), color: it.color });
      else segs.push({ t: inline([it]), color: null });
    });
    return segs;
  }

  function countTokens(tokens) {
    let c = 0, p = 0;
    tokens.forEach(tk => { c += STITCHES[tk.k].c; p += STITCHES[tk.k].p; });
    return { consumed: c, produced: p };
  }

  function parseRows(rows) {
    const m = /^(\d+)(?:\s*[-~～]\s*(\d+))?$/.exec(String(rows).trim());
    if (!m) return null;
    const a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a;
    if (b < a || b - a > 200) return null;
    const out = [];
    for (let r = a; r <= b; r++) out.push(r);
    return out;
  }

  // 把部件的步驟攤平，並做針數核對
  function flattenPart(part) {
    const steps = [];
    const prefix = part.prefix || (part.unit === '行' ? 'H' : 'R');
    let prevProduced = null;
    let lastColor = part.color || null;

    (part.steps || []).forEach(src => {
      if (src.note != null) {
        steps.push({ type: 'note', text: String(src.note) });
        return;
      }
      const nums = parseRows(src.rows) || [null];
      nums.forEach((r, k) => {
        const step = {
          type: 'row',
          label: src.label ? String(src.label) : r == null ? String(src.rows || '') : prefix + r,
          rangeLabel: nums.length > 1 ? prefix + nums[0] + '～' + nums[nums.length - 1] + '（第 ' + (k + 1) + '/' + nums.length + ' 圈）' : null,
          raw: src.raw || null,
          text: src.text || null,
          tip: src.tip || null,
          color: src.color || part.color || null,
          sub: Array.isArray(src.sub) ? src.sub.slice() : null,
          st: typeof src.st === 'number' ? src.st : null,
          tokens: null,
          segments: null,
          consumed: null,
          warnings: [],
          colorChange: false
        };
        if (step.raw) {
          try {
            const tree = parseRaw(step.raw);
            step.tokens = expand(tree, null);
            step.segments = toSegments(tree);
            const cnt = countTokens(step.tokens);
            step.consumed = cnt.consumed;
            if (step.st != null && step.st !== cnt.produced) {
              step.warnings.push('織圖寫 ' + step.st + ' 針，但照針法算是 ' + cnt.produced + ' 針');
            }
            step.st = cnt.produced;
          } catch (e) {
            step.warnings.push('針法看不懂：' + e.message);
          }
        }
        if (prevProduced != null && step.consumed != null && step.consumed !== prevProduced) {
          step.warnings.push('上一圈是 ' + prevProduced + ' 針，這一圈卻要用掉 ' + step.consumed + ' 針，對不上');
        }
        if (step.color && lastColor && step.color !== lastColor) step.colorChange = true;
        if (step.color) lastColor = step.color;
        prevProduced = step.st;
        steps.push(step);
      });
    });
    return steps;
  }

  function stepTotal(step) {
    if (!step || step.type !== 'row') return 0;
    if (step.tokens) return step.tokens.length;
    if (step.sub) return step.sub.length;
    if (step.st) return step.st;
    return 0; // 0 = 自由計數
  }

  function validatePattern(p) {
    const errors = [];
    if (!p || typeof p !== 'object') return ['不是有效的織圖檔'];
    if (p.format !== 'yarn-pattern/1') errors.push('格式欄位應為 yarn-pattern/1');
    if (!p.id) errors.push('缺少 id');
    if (!p.title) errors.push('缺少 title');
    if (!Array.isArray(p.parts) || !p.parts.length) errors.push('沒有任何部件');
    else p.parts.forEach((part, i) => {
      if (!part.id) errors.push('第 ' + (i + 1) + ' 個部件缺少 id');
      if (!Array.isArray(part.steps)) errors.push('部件「' + (part.name || i) + '」沒有步驟');
    });
    return errors;
  }

  const api = { STITCHES, LEGEND_TEXT, parseRaw, expand, toSegments, flattenPart, stepTotal, validatePattern, normalize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YarnCore = api;
})(typeof self !== 'undefined' ? self : this);

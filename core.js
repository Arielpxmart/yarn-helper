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
    CH: { c: 0, p: 1, name: '鎖針',   short: '鎖' },
    K:  { c: 1, p: 0, name: '跳過',   short: '跳', fmt: n => '跳過 ' + n + ' 針' }
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
    CH: '鎖針',
    K: '跳過不鉤（K3 = 跳過 3 針）'
  };

  function normalize(raw) {
    return String(raw)
      .replace(/[（]/g, '(').replace(/[）]/g, ')')
      .replace(/[｛]/g, '{').replace(/[｝]/g, '}')
      .replace(/[：]/g, ':')
      .replace(/[，、；;]/g, ',')
      .replace(/[×＊]/g, '*')
      .replace(/K(\d+)/g, '$1K') // K3（跳過 3 針）→ 3K
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
    let depth = 0;
    function item() {
      const n = num();
      if (s[i] === '(') {
        if (++depth > MAX_DEPTH) err('括號太多層');
        i++;
        const inner = list(')');
        depth--;
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
      const m = /^(SL|CH|FV|EV|[XVWATFEMK])/.exec(rest);
      if (!m) err('看不懂的針法「' + (rest[0] || '') + '」');
      i += m[1].length;
      return { type: 'st', k: m[1], n: n == null ? 1 : n };
    }

    if (!s) throw new Error('沒有內容');
    if (s.length > 2000) throw new Error('針法太長');
    const tree = list(null);
    return tree;
  }

  // 一圈最多幾針：防止「99999(99999X)」這種寫法把手機記憶體吃光
  const MAX_TOKENS = 3000;
  const MAX_DEPTH = 20;

  // 展開成一針一按的清單
  function expand(tree, color) {
    const out = [];
    function push(tk) {
      if (out.length >= MAX_TOKENS) throw new Error('一圈超過 ' + MAX_TOKENS + ' 針，可能寫錯了');
      out.push(tk);
    }
    function walk(items, col) {
      items.forEach((it, idx) => {
        if (it.type === 'st') {
          for (let k = 0; k < it.n; k++) push({ k: it.k, color: col || null, sep: k === 0 });
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
      return d.fmt ? d.fmt(it.n) : it.n + ' ' + d.name;
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

  // 新手模式用：整圈只有一個重複組（例如 6(5X, V)），組內有 2 種以上針法、且含加減針時，回傳每組內容；其餘回傳 null
  // 整圈只有一種針法（全短針、全減針）、組內含顏色區段或巢狀括號，都不算（不需要輔助）
  function analyzeCycle(tree) {
    if (!tree || tree.length !== 1 || tree[0].type !== 'group') return null;
    const g = tree[0];
    if (g.times < 2 || !g.items.length || g.items.some(it => it.type !== 'st')) return null;
    const unit = [];
    let produced = 0, consumed = 0, changes = false;
    g.items.forEach(it => {
      const d = STITCHES[it.k];
      const last = unit[unit.length - 1];
      if (last && last.k === it.k) last.n += it.n; else unit.push({ k: it.k, n: it.n });
      produced += d.p * it.n; consumed += d.c * it.n;
      if (d.c !== d.p) changes = true;
    });
    const kinds = new Set(unit.map(u => u.k));
    if (kinds.size < 2 || !changes) return null;
    return { times: g.times, unit, produced, consumed };
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

    (part.steps || []).forEach((src, srcIdx) => {
      if (src.note != null) {
        steps.push({ type: 'note', text: String(src.note), group: srcIdx });
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
          cycle: null,
          consumed: null,
          warnings: [],
          colorChange: false,
          group: srcIdx,
          prevSt: null,
          delta: null
        };
        if (step.raw) {
          try {
            const tree = parseRaw(step.raw);
            step.tokens = expand(tree, null);
            step.segments = toSegments(tree);
            step.cycle = analyzeCycle(tree);
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
        if (prevProduced != null && step.st != null) {
          step.prevSt = prevProduced;
          step.delta = step.st - prevProduced;
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

  /* ---------- 匯入檢查（檔案可能來自別人，一律當成不可信） ---------- */
  const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
  // 不能用 __proto__、constructor、toString 這類 JavaScript 物件的保留名稱，否則會改到內部物件結構
  const validId = id => typeof id === 'string' && ID_RE.test(id) && !(id in Object.prototype);
  const IMG_RE = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  const LIMITS = { parts: 60, steps: 600, sub: 60, images: 12, list: 60, count: 50, text: 4000 };
  const isStr = (v, max) => typeof v === 'string' && v.length <= (max || LIMITS.text);
  const isStrOrNum = v => isStr(v) || (typeof v === 'number' && isFinite(v));
  const strList = (v, max) => Array.isArray(v) && v.length <= (max || LIMITS.list) && v.every(x => isStr(x));

  function validatePattern(p) {
    const errors = [];
    if (!p || typeof p !== 'object' || Array.isArray(p)) return ['不是有效的織圖檔'];
    if (p.format !== 'yarn-pattern/1') errors.push('格式欄位應為 yarn-pattern/1');
    if (!validId(p.id)) errors.push('id 只能用英文、數字、- 和 _（最多 64 字）');
    if (!isStr(p.title, 200) || !p.title) errors.push('缺少 title，或 title 太長');
    ['craft', 'source'].forEach(k => { if (p[k] != null && !isStr(p[k])) errors.push(k + ' 格式不對'); });
    ['materials', 'notes', 'legend'].forEach(k => { if (p[k] != null && !strList(p[k])) errors.push(k + ' 要是文字清單'); });
    if (p.images != null) {
      if (!Array.isArray(p.images) || p.images.length > LIMITS.images) errors.push('照片最多 ' + LIMITS.images + ' 張');
      else p.images.forEach((im, i) => {
        if (!im || !isStr(im.name, 100) || typeof im.data !== 'string' || !IMG_RE.test(im.data)) errors.push('第 ' + (i + 1) + ' 張照片格式不對（只接受內嵌的 JPEG／PNG／WebP／GIF）');
      });
    }
    if (!Array.isArray(p.parts) || !p.parts.length) errors.push('沒有任何部件');
    else if (p.parts.length > LIMITS.parts) errors.push('部件太多');
    else {
      const seen = new Set();
      p.parts.forEach((part, i) => {
        const where = '第 ' + (i + 1) + ' 個部件';
        if (!part || typeof part !== 'object') { errors.push(where + '格式不對'); return; }
        if (!validId(part.id)) errors.push(where + '的 id 只能用英文、數字、- 和 _');
        else if (seen.has(part.id)) errors.push(where + '的 id 重複');
        else seen.add(part.id);
        if (!isStr(part.name, 100)) errors.push(where + '缺少名稱');
        ['unit', 'prefix', 'color'].forEach(k => { if (part[k] != null && !isStr(part[k], 40)) errors.push(where + '的 ' + k + ' 格式不對'); });
        if (part.count != null && !(Number.isInteger(part.count) && part.count >= 1 && part.count <= LIMITS.count)) errors.push(where + '的數量要是 1～' + LIMITS.count);
        if (!Array.isArray(part.steps) || part.steps.length > LIMITS.steps) { errors.push(where + '沒有步驟，或步驟太多'); return; }
        part.steps.forEach((st, j) => {
          const w = where + '第 ' + (j + 1) + ' 步';
          if (!st || typeof st !== 'object' || Array.isArray(st)) { errors.push(w + '格式不對'); return; }
          ['note', 'rows', 'raw', 'text', 'tip', 'label', 'color'].forEach(k => { if (st[k] != null && !isStrOrNum(st[k])) errors.push(w + '的 ' + k + ' 格式不對'); });
          if (st.st != null && !(Number.isInteger(st.st) && st.st >= 0 && st.st <= MAX_TOKENS)) errors.push(w + '的針數不合理');
          if (st.sub != null && !strList(st.sub, LIMITS.sub)) errors.push(w + '的 sub 要是文字清單');
        });
      });
    }
    return errors;
  }

  // 備份裡的進度：只留下格式正確的欄位
  function sanitizeProgress(pg) {
    if (!pg || typeof pg !== 'object') return null;
    const int = (v, max) => Number.isInteger(v) && v >= 0 && v <= max ? v : 0;
    const out = { partIdx: int(pg.partIdx, LIMITS.parts), parts: {}, updated: int(pg.updated, 1e14) };
    if (pg.parts && typeof pg.parts === 'object') {
      for (const [pid, pp] of Object.entries(pg.parts)) {
        if (!validId(pid) || !pp || typeof pp !== 'object') continue;
        out.parts[pid] = { step: int(pp.step, LIMITS.steps * 200), copy: Math.max(1, int(pp.copy, LIMITS.count)), tap: 0, done: pp.done === true };
      }
    }
    return out;
  }

  const api = { STITCHES, LEGEND_TEXT, parseRaw, expand, toSegments, flattenPart, analyzeCycle, stepTotal, validatePattern, sanitizeProgress, normalize, validId, MAX_TOKENS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.YarnCore = api;
})(typeof self !== 'undefined' ? self : this);

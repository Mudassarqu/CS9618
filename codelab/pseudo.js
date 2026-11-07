/* Cambridge 9618 pseudocode interpreter (teaching version)
 * Supports: DECLARE (incl. 1D/2D ARRAY), CONSTANT, ←, INPUT, OUTPUT, IF/THEN/ELSE/ENDIF,
 * CASE OF/OTHERWISE/ENDCASE (values, lists, ranges), FOR/TO/STEP/NEXT, WHILE/DO/ENDWHILE,
 * REPEAT/UNTIL, PROCEDURE/CALL (BYVAL/BYREF), FUNCTION/RETURNS/RETURN, text files,
 * and the 9618 insert functions. Gives exam-style error messages, including hints for Python habits.
 */
(function (global) {
  "use strict";

  const KEYWORDS = new Set(("DECLARE CONSTANT INPUT OUTPUT IF THEN ELSE ENDIF CASE OF OTHERWISE ENDCASE FOR TO STEP NEXT WHILE DO ENDWHILE " +
    "REPEAT UNTIL PROCEDURE ENDPROCEDURE FUNCTION RETURNS RETURN ENDFUNCTION CALL BYREF BYVAL AND OR NOT DIV MOD TRUE FALSE ARRAY " +
    "OPENFILE READFILE WRITEFILE CLOSEFILE READ WRITE APPEND INTEGER REAL STRING CHAR BOOLEAN DATE").split(" "));
  const TYPES = new Set(["INTEGER", "REAL", "STRING", "CHAR", "BOOLEAN", "DATE"]);
  const PY_HINTS = {
    print: "Python's print( ) is OUTPUT in pseudocode, e.g.  OUTPUT \"Total: \", Total",
    input: "Use  INPUT Variable  (put a prompt on the line before with OUTPUT)",
    elif: "There is no ELIF/ELSEIF. Use ELSE followed by a nested IF … ENDIF (or a CASE statement)",
    def: "Use PROCEDURE Name(…) … ENDPROCEDURE, or FUNCTION Name(…) RETURNS type … ENDFUNCTION",
    range: "Use  FOR i ← 1 TO n … NEXT i   (TO includes n)",
    len: "Use LENGTH(String)",
    int: "Use INT(x) for the integer part, or STR_TO_NUM(s) to turn a string into a number",
    str: "Use NUM_TO_STR(x)",
    upper: "Use TO_UPPER(s)", lower: "Use TO_LOWER(s)"
  };

  class PseudoError extends Error { constructor(msg, line) { super(msg); this.line = line; } }
  const err = (msg, line) => { throw new PseudoError(msg, line); };

  /* ---------------- Tokenizer ---------------- */
  function tokenizeLine(src, lineNo) {
    const s = src.replace(/[‘’‚`´]/g, "'").replace(/[“”„]/g, '"')
      .replace(/≠/g, "<>").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/×/g, "*").replace(/÷/g, "/");
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " " || c === "\t" || c === "\r") { i++; continue; }
      if (c === "/" && s[i + 1] === "/") break; // comment
      if (c === '"') {
        let j = i + 1; while (j < s.length && s[j] !== '"') j++;
        if (j >= s.length) err('A string is missing its closing quotation mark "', lineNo);
        toks.push({ t: "str", v: s.slice(i + 1, j) }); i = j + 1; continue;
      }
      if (c === "'") {
        let j = i + 1; while (j < s.length && s[j] !== "'") j++;
        if (j >= s.length) err("A character is missing its closing ' mark", lineNo);
        const v = s.slice(i + 1, j);
        toks.push(v.length === 1 ? { t: "chr", v } : { t: "str", v, singleQuoted: true }); i = j + 1; continue;
      }
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1]))) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const raw = s.slice(i, j); if ((raw.match(/\./g) || []).length > 1) err("Badly formed number " + raw, lineNo);
        toks.push({ t: "num", v: parseFloat(raw), isReal: raw.includes(".") }); i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
        toks.push({ t: "id", v: s.slice(i, j) }); i = j; continue;
      }
      const two = s.slice(i, i + 2);
      if (two === "<-") { toks.push({ t: "op", v: "←" }); i += 2; continue; }
      if (["<=", ">=", "<>", "==", "!=", "+=", "-=", "**", "//"].includes(two)) {
        if (two === "==") err("Python's == is just = in pseudocode, e.g. IF X = 5", lineNo);
        if (two === "!=") err("Python's != is <> in pseudocode", lineNo);
        if (two === "+=" || two === "-=") err(`${two} is Python. Write it out in full, e.g. Total ← Total + 1`, lineNo);
        if (two === "**") err("Python's ** is ^ in pseudocode, e.g. X ^ 2", lineNo);
        toks.push({ t: "op", v: two }); i += 2; continue;
      }
      if ("←+-*/^&()[],:=<>.".includes(c)) { toks.push({ t: "op", v: c }); i++; continue; }
      if (c === "%") err("Python's % is MOD in pseudocode, e.g. X MOD 2", lineNo);
      if (c === "#") err("# is a Python comment. Pseudocode comments start with //", lineNo);
      err(`Unexpected character "${c}"`, lineNo);
    }
    toks.forEach(t => t.line = lineNo);
    return toks;
  }
  const isKw = (tok, kw) => tok && tok.t === "id" && tok.v === kw;
  const isOp = (tok, op) => tok && tok.t === "op" && tok.v === op;

  function isCaseLabel(toks) {
    if (!toks.length) return false;
    if (isKw(toks[0], "OTHERWISE")) return true;
    const t0 = toks[0];
    const lit = t0.t === "num" || t0.t === "str" || t0.t === "chr" || isKw(t0, "TRUE") || isKw(t0, "FALSE") || (isOp(t0, "-") && toks[1] && toks[1].t === "num");
    return lit && toks.some(t => isOp(t, ":"));
  }

  // Split one physical line into logical lines (THEN / ELSE / ENDIF on the same line, CASE label + statement)
  function splitLogical(toks) {
    if (!toks.length) return [];
    if (isCaseLabel(toks)) {
      let k;
      if (isKw(toks[0], "OTHERWISE")) k = isOp(toks[1], ":") ? 1 : 0;
      else k = toks.findIndex(t => isOp(t, ":"));
      const label = toks.slice(0, k + 1), rest = toks.slice(k + 1);
      return [label, ...splitLogical(rest)];
    }
    const kws = ["THEN", "ELSE", "ENDIF"];
    for (let i = 0; i < toks.length; i++) {
      if (kws.some(k => isKw(toks[i], k)) && (i > 0 || toks.length > 1)) {
        const out = [];
        if (i > 0) out.push(toks.slice(0, i));
        out.push([toks[i]]);
        out.push(...splitLogical(toks.slice(i + 1)));
        return out;
      }
    }
    return [toks];
  }

  /* ---------------- Expression parser ---------------- */
  class Exp {
    constructor(toks, line) { this.toks = toks; this.p = 0; this.line = line; }
    peek(o = 0) { return this.toks[this.p + o]; }
    next() { return this.toks[this.p++]; }
    eatOp(v) { if (isOp(this.peek(), v)) { this.p++; return true; } return false; }
    eatKw(v) { if (isKw(this.peek(), v)) { this.p++; return true; } return false; }
    expectOp(v, ctx) { if (!this.eatOp(v)) err(`Expected "${v}"${ctx ? " " + ctx : ""}` + (this.peek() ? ` but found "${this.peek().v}"` : ""), this.line); }
    done() { return this.p >= this.toks.length; }
    parse() { return this.or(); }
    or() { let l = this.and(); while (this.eatKw("OR")) { const r = this.and(); l = { k: "bin", op: "OR", l, r }; } return l; }
    and() { let l = this.not(); while (this.eatKw("AND")) { const r = this.not(); l = { k: "bin", op: "AND", l, r }; } return l; }
    not() { if (this.eatKw("NOT")) return { k: "un", op: "NOT", e: this.not() }; return this.cmp(); }
    cmp() {
      let l = this.add();
      for (;;) {
        const t = this.peek();
        if (t && t.t === "op" && ["=", "<>", "<", ">", "<=", ">="].includes(t.v)) { this.p++; l = { k: "bin", op: t.v, l, r: this.add() }; }
        else return l;
      }
    }
    add() {
      let l = this.mul();
      for (;;) {
        const t = this.peek();
        if (t && t.t === "op" && ["+", "-", "&"].includes(t.v)) { this.p++; l = { k: "bin", op: t.v, l, r: this.mul() }; }
        else return l;
      }
    }
    mul() {
      let l = this.unary();
      for (;;) {
        const t = this.peek();
        if (t && ((t.t === "op" && ["*", "/"].includes(t.v)) || isKw(t, "DIV") || isKw(t, "MOD"))) { this.p++; l = { k: "bin", op: t.v, l, r: this.unary() }; }
        else return l;
      }
    }
    unary() { if (this.eatOp("-")) return { k: "un", op: "-", e: this.unary() }; if (this.eatOp("+")) return this.unary(); return this.pow(); }
    pow() { const b = this.primary(); if (this.eatOp("^")) return { k: "bin", op: "^", l: b, r: this.unary() }; return b; }
    args() {
      const a = [];
      if (this.eatOp(")")) return a;
      do { a.push(this.parse()); } while (this.eatOp(","));
      this.expectOp(")", "to close the brackets");
      return a;
    }
    primary() {
      const t = this.next();
      if (!t) err("The expression is incomplete", this.line);
      if (t.t === "num") return { k: "lit", v: t.v, isReal: t.isReal };
      if (t.t === "str") return { k: "lit", v: t.v };
      if (t.t === "chr") return { k: "lit", v: t.v };
      if (isOp(t, "(")) { const e = this.parse(); this.expectOp(")", "to close the bracket"); return e; }
      if (t.t === "id") {
        if (t.v === "TRUE" || t.v === "FALSE") return { k: "lit", v: t.v === "TRUE" };
        if (/^(true|false|True|False)$/.test(t.v)) err(`Write Boolean values in capitals: ${t.v.toUpperCase()}`, this.line);
        if (isOp(this.peek(), "(")) { this.p++; return { k: "call", name: t.v, args: this.args(), line: this.line }; }
        if (isOp(this.peek(), "[")) {
          this.p++; const idx = [this.parse()]; while (this.eatOp(",")) idx.push(this.parse());
          this.expectOp("]", "to close the array index");
          return { k: "idx", name: t.v, idx, line: this.line };
        }
        if (isOp(this.peek(), ".")) err(`"${t.v}." looks like a Python method. Use a pseudocode function instead, e.g. TO_UPPER(s), LENGTH(s)`, this.line);
        if (KEYWORDS.has(t.v) && !TYPES.has(t.v)) err(`Unexpected keyword ${t.v} inside an expression`, this.line);
        return { k: "var", name: t.v, line: this.line };
      }
      err(`Unexpected "${t.v}" in expression`, this.line);
    }
  }
  function parseExpr(toks, line, ctx) {
    if (!toks.length) err(`Missing expression${ctx ? " " + ctx : ""}`, line);
    const e = new Exp(toks, line); const r = e.parse();
    (function tag(n) { if (!n || typeof n !== "object") return; if (n.line === undefined) n.line = line; ["l", "r", "e"].forEach(k => tag(n[k])); (n.args || []).forEach(tag); (n.idx || []).forEach(tag); })(r);
    if (!e.done()) {
      const t = e.peek();
      if (isOp(t, "=") ) err("Unexpected = here. Assignment uses ←, and comparisons go in IF/WHILE/UNTIL conditions", line);
      if (isOp(t, ":")) err("Unexpected colon. Python puts : at the end of IF/FOR/WHILE lines; pseudocode doesn't (use THEN / DO)", line);
      err(`Unexpected "${t.v}"${ctx ? " " + ctx : ""}`, line);
    }
    return r;
  }

  /* ---------------- Statement parser ---------------- */
  function parseProgram(source) {
    const lines = [];
    source.split("\n").forEach((src, i) => {
      const toks = tokenizeLine(src, i + 1);
      splitLogical(toks).forEach(t => { if (t.length) lines.push({ toks: t, line: i + 1 }); });
    });
    let pos = 0;
    const procs = {}, funcs = {};

    const first = l => l.toks[0];
    function block(stop, ctxName, openLine) {
      const body = [];
      for (;;) {
        if (pos >= lines.length) {
          if (stop) err(`${ctxName} that starts on line ${openLine} is never closed (missing ${stop.label})`, openLine);
          return body;
        }
        const L = lines[pos];
        if (stop && stop.test(L)) return body;
        body.push(statement());
      }
    }
    const kwStop = (...ks) => ({ test: L => ks.some(k => isKw(first(L), k)), label: ks.join(" or ") });

    function splitAt(toks, pred) { const i = toks.findIndex(pred); return i < 0 ? [toks, null] : [toks.slice(0, i), toks.slice(i + 1)]; }
    function parseTarget(toks, line) {
      if (!toks.length || toks[0].t !== "id") err("Expected a variable name", line);
      const e = parseExpr(toks, line);
      if (e.k !== "var" && e.k !== "idx") err("You can only assign to a variable or an array element", line);
      return e;
    }
    function parseParams(toks, line) {
      // ( [BYREF|BYVAL] a : TYPE, b : TYPE )
      const params = []; if (!toks.length) return params;
      if (!isOp(toks[0], "(") || !isOp(toks[toks.length - 1], ")")) err("Parameters must be in brackets, e.g. (Num : INTEGER)", line);
      const inner = toks.slice(1, -1); if (!inner.length) return params;
      let mode = "BYVAL"; const groups = [[]];
      inner.forEach(t => { if (isOp(t, ",")) groups.push([]); else groups[groups.length - 1].push(t); });
      groups.forEach(g => {
        if (isKw(g[0], "BYREF") || isKw(g[0], "BYVAL")) { mode = g[0].v; g = g.slice(1); }
        if (g.length > 3 && isKw(g[2], "ARRAY")) g = g.slice(0, 3);
        if (g.length !== 3 || g[0].t !== "id" || !isOp(g[1], ":") || g[2].t !== "id") err("Each parameter needs a name and a type, e.g. Num : INTEGER", line);
        params.push({ name: g[0].v, type: g[2].v, byref: mode === "BYREF" });
      });
      return params;
    }

    function statement() {
      const L = lines[pos++], T = L.toks, line = L.line, f = T[0];
      if (f.t !== "id") {
        if (isCaseLabel(T)) err("This looks like a CASE option, but it is not inside CASE OF … ENDCASE", line);
        err(`A statement can't start with "${f.v}"`, line);
      }
      const w = f.v;
      // Python / lowercase hints
      if (w === "for" && T.some(t => t.v === "in")) err("for … in range( ) is Python. Use  FOR i ← 1 TO n  …  NEXT i   (TO includes n)", line);
      if (!KEYWORDS.has(w) && KEYWORDS.has(w.toUpperCase()) && T.length > 1 && !isOp(T[1], "←") && !isOp(T[1], "[")) err(`Keywords must be written in capitals: ${w.toUpperCase()}, not ${w}`, line);
      if (PY_HINTS[w] && (T.length === 1 || isOp(T[1], "(")) && !(procs[w] || funcs[w])) err(`"${w}" is Python. ${PY_HINTS[w]}`, line);
      if (/^(for|while|if|else|def|return)$/.test(w)) err(`"${w}" is Python/lowercase. Use ${w === "def" ? "PROCEDURE or FUNCTION" : w.toUpperCase()} in capitals`, line);

      switch (w) {
        case "DECLARE": {
          const [names, rest] = splitAt(T.slice(1), t => isOp(t, ":"));
          if (!rest) err("DECLARE needs a colon and a type, e.g. DECLARE Total : INTEGER", line);
          const ids = names.filter(t => !isOp(t, ","));
          if (!ids.length || ids.some(t => t.t !== "id")) err("DECLARE needs variable names, e.g. DECLARE A, B : INTEGER", line);
          if (isKw(rest[0], "ARRAY")) {
            const r = rest.slice(1);
            if (!isOp(r[0], "[")) err("Array bounds go in square brackets, e.g. ARRAY[1:10] OF INTEGER", line);
            const close = r.findIndex(t => isOp(t, "]")); if (close < 0) err("Missing ] in ARRAY declaration", line);
            const dims = []; let cur = [];
            r.slice(1, close).forEach(t => { if (isOp(t, ",")) { dims.push(cur); cur = []; } else cur.push(t); }); dims.push(cur);
            const bounds = dims.map(d => { const [a, b] = splitAt(d, t => isOp(t, ":")); if (!b) err("Each array dimension needs lower:upper, e.g. [1:10]", line); return [parseExpr(a, line), parseExpr(b, line)]; });
            if (bounds.length > 2) err("Only 1D and 2D arrays are supported", line);
            if (!isKw(r[close + 1], "OF") || !r[close + 2] || !TYPES.has(r[close + 2].v)) err("Array declaration must end with OF <type>, e.g. OF INTEGER", line);
            return { k: "declare", names: ids.map(t => t.v), type: r[close + 2].v, bounds, line };
          }
          if (rest.length !== 1 || !TYPES.has(rest[0].v)) {
            if (rest[0] && TYPES.has(String(rest[0].v).toUpperCase())) err(`Data types are written in capitals: ${String(rest[0].v).toUpperCase()}`, line);
            err("Unknown data type. Use INTEGER, REAL, STRING, CHAR, BOOLEAN or DATE", line);
          }
          return { k: "declare", names: ids.map(t => t.v), type: rest[0].v, line };
        }
        case "CONSTANT": {
          if (!T[1] || T[1].t !== "id" || !(isOp(T[2], "←") || isOp(T[2], "="))) err("Write constants as  CONSTANT Name ← value", line);
          return { k: "const", name: T[1].v, e: parseExpr(T.slice(3), line), line };
        }
        case "INPUT": return { k: "input", target: parseTarget(T.slice(1), line), line };
        case "OUTPUT": case "PRINT": {
          if (w === "PRINT") err("Use OUTPUT, not PRINT", line);
          const parts = []; let cur = [], depth = 0;
          T.slice(1).forEach(t => { if (isOp(t, "(") || isOp(t, "[")) depth++; if (isOp(t, ")") || isOp(t, "]")) depth--; if (isOp(t, ",") && depth === 0) { parts.push(cur); cur = []; } else cur.push(t); });
          parts.push(cur);
          return { k: "output", es: parts.map(p => parseExpr(p, line, "in OUTPUT")), line };
        }
        case "IF": {
          let condToks = T.slice(1);
          if (condToks.length && isOp(condToks[condToks.length - 1], ":")) err("Remove the colon: pseudocode uses THEN, not ':'", line);
          const cond = parseExpr(condToks, line, "in the IF condition");
          if (pos >= lines.length || !isKw(first(lines[pos]), "THEN")) err("IF must be followed by THEN", line);
          pos++;
          const then = block(kwStop("ELSE", "ENDIF"), "IF", line);
          let els = [];
          if (isKw(first(lines[pos]), "ELSE")) { pos++; els = block(kwStop("ENDIF"), "IF … ELSE", line); }
          pos++; // ENDIF
          return { k: "if", cond, then, els, line };
        }
        case "CASE": {
          if (!isKw(T[1], "OF")) err("Write CASE OF <variable>, e.g. CASE OF Choice", line);
          const subject = parseExpr(T.slice(2), line);
          const clauses = []; let other = null;
          for (;;) {
            if (pos >= lines.length) err(`CASE on line ${line} is missing ENDCASE`, line);
            const C = lines[pos];
            if (isKw(first(C), "ENDCASE")) { pos++; break; }
            if (isKw(first(C), "ENDIF")) err("CASE must end with ENDCASE, not ENDIF", C.line);
            if (isKw(first(C), "ELSE")) err("In a CASE statement use OTHERWISE, not ELSE", C.line);
            if (!isCaseLabel(C.toks)) err("Expected a CASE option such as  1 : …  or  'A' : …  or  OTHERWISE : …", C.line);
            pos++;
            const stop = { test: L2 => isKw(first(L2), "ENDCASE") || isKw(first(L2), "ENDIF") || isKw(first(L2), "ELSE") || isCaseLabel(L2.toks), label: "ENDCASE" };
            if (isKw(first(C), "OTHERWISE")) { other = block(stop, "CASE", line); continue; }
            if (other) err("OTHERWISE must be the last option in a CASE", C.line);
            const labelToks = C.toks.slice(0, -1); // drop ':'
            const items = []; let cur = [];
            labelToks.forEach(t => { if (isOp(t, ",")) { items.push(cur); cur = []; } else cur.push(t); }); items.push(cur);
            const labels = items.map(it => { const [a, b] = splitAt(it, t => isKw(t, "TO")); return b ? { lo: parseExpr(a, C.line), hi: parseExpr(b, C.line) } : { v: parseExpr(a, C.line) }; });
            clauses.push({ labels, body: block(stop, "CASE", line) });
          }
          return { k: "case", subject, clauses, other, line };
        }
        case "FOR": {
          if (!T[1] || T[1].t !== "id" || !isOp(T[2], "←")) {
            if (T.some(t => isKw(t, "in") || isKw(t, "IN"))) err("FOR … IN is Python. Use FOR i ← 1 TO n", line);
            err("Write the loop as FOR Counter ← start TO end", line);
          }
          const rest = T.slice(3); const toI = rest.findIndex(t => isKw(t, "TO")); if (toI < 0) err("FOR loop needs TO, e.g. FOR i ← 1 TO 10", line);
          const stI = rest.findIndex(t => isKw(t, "STEP"));
          const start = parseExpr(rest.slice(0, toI), line), end = parseExpr(rest.slice(toI + 1, stI < 0 ? undefined : stI), line);
          const step = stI < 0 ? null : parseExpr(rest.slice(stI + 1), line);
          const body = block(kwStop("NEXT", "ENDFOR"), "FOR loop", line);
          const nl = lines[pos++];
          if (isKw(first(nl), "ENDFOR")) err("A FOR loop ends with NEXT, not ENDFOR", nl.line);
          if (nl.toks[1] && nl.toks[1].v !== T[1].v) err(`NEXT ${nl.toks[1].v} doesn't match the loop variable ${T[1].v}`, nl.line);
          return { k: "for", v: T[1].v, start, end, step, body, line };
        }
        case "WHILE": {
          let c = T.slice(1); if (isKw(c[c.length - 1], "DO")) c = c.slice(0, -1);
          if (c.length && isOp(c[c.length - 1], ":")) err("Remove the colon: write WHILE condition DO", line);
          const cond = parseExpr(c, line, "in the WHILE condition");
          const body = block(kwStop("ENDWHILE"), "WHILE loop", line); pos++;
          return { k: "while", cond, body, line };
        }
        case "REPEAT": {
          const body = block(kwStop("UNTIL"), "REPEAT loop", line);
          const ul = lines[pos++];
          return { k: "repeat", body, cond: parseExpr(ul.toks.slice(1), ul.line, "in the UNTIL condition"), line };
        }
        case "PROCEDURE": case "FUNCTION": {
          if (!T[1] || T[1].t !== "id") err(`${w} needs a name`, line);
          const name = T[1].v; let rest = T.slice(2), returns = null;
          if (w === "FUNCTION") {
            const ri = rest.findIndex(t => isKw(t, "RETURNS"));
            if (ri < 0) err("A FUNCTION header must say what it RETURNS, e.g. FUNCTION Square(N : INTEGER) RETURNS INTEGER", line);
            returns = rest[ri + 1] && rest[ri + 1].v; rest = rest.slice(0, ri);
          }
          const params = parseParams(rest, line);
          const endKw = w === "PROCEDURE" ? "ENDPROCEDURE" : "ENDFUNCTION";
          const body = block(kwStop(endKw, w === "PROCEDURE" ? "ENDFUNCTION" : "ENDPROCEDURE"), w, line);
          if (!isKw(first(lines[pos]), endKw)) err(`${w} ${name} must end with ${endKw}`, lines[pos].line);
          pos++;
          (w === "PROCEDURE" ? procs : funcs)[name] = { name, params, body, returns, line };
          return { k: "nop" };
        }
        case "CALL": {
          if (!T[1] || T[1].t !== "id") err("CALL needs a procedure name", line);
          const args = T.length > 2 ? new Exp(T.slice(2), line) : null;
          let a = [];
          if (args) { args.expectOp("("); a = args.args(); if (!args.done()) err("Unexpected text after CALL", line); }
          return { k: "call", name: T[1].v, args: a, line };
        }
        case "RETURN": return { k: "return", e: T.length > 1 ? parseExpr(T.slice(1), line) : null, line };
        case "OPENFILE": {
          const fi = T.findIndex(t => isKw(t, "FOR")); if (fi < 0) err("Write OPENFILE \"name.txt\" FOR READ / WRITE / APPEND", line);
          const mode = T[fi + 1] && T[fi + 1].v; if (!["READ", "WRITE", "APPEND"].includes(mode)) err("File mode must be READ, WRITE or APPEND", line);
          return { k: "open", f: parseExpr(T.slice(1, fi), line), mode, line };
        }
        case "READFILE": case "WRITEFILE": {
          const [a, b] = splitAt(T.slice(1), t => isOp(t, ","));
          if (!b) err(`Write ${w} FileName, ${w === "READFILE" ? "Variable" : "Data"}`, line);
          return w === "READFILE" ? { k: "readf", f: parseExpr(a, line), target: parseTarget(b, line), line } : { k: "writef", f: parseExpr(a, line), e: parseExpr(b, line), line };
        }
        case "CLOSEFILE": return { k: "close", f: parseExpr(T.slice(1), line), line };
        case "ENDIF": case "ELSE": case "THEN": err(`${w} without a matching IF`, line);
        case "NEXT": err("NEXT without a matching FOR", line);
        case "ENDWHILE": err("ENDWHILE without a matching WHILE", line);
        case "UNTIL": err("UNTIL without a matching REPEAT", line);
        case "ENDCASE": err("ENDCASE without a matching CASE OF", line);
        case "OTHERWISE": err("OTHERWISE must be inside CASE OF … ENDCASE", line);
        case "ENDPROCEDURE": case "ENDFUNCTION": err(`${w} without a matching header`, line);
        case "ELSEIF": case "ELIF": err("There is no ELSEIF. Use ELSE, then a nested IF … THEN … ENDIF", line);
      }
      // assignment
      const ai = T.findIndex(t => isOp(t, "←"));
      if (ai > 0) return { k: "assign", target: parseTarget(T.slice(0, ai), line), e: parseExpr(T.slice(ai + 1), line, "after ←"), line };
      if (T.some(t => isOp(t, "="))) err("Assignment uses ← (or <-), not =. For example: Total ← 0", line);
      if (isOp(T[1], "(")) err(`To run a procedure write CALL ${w}(…). A function call must be used in an expression, e.g. X ← ${w}(…)`, line);
      err(`I don't understand "${w}". Check spelling and that keywords are in capitals`, line);
    }

    const main = block(null, "program", 1);
    return { main, procs, funcs };
  }

  /* ---------------- Runtime ---------------- */
  function fmt(v) {
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 1e10) / 1e10);
    if (v === undefined) return "";
    return String(v);
  }
  const typeOfVal = v => typeof v === "boolean" ? "BOOLEAN" : typeof v === "number" ? (Number.isInteger(v) ? "INTEGER" : "REAL") : (typeof v === "string" ? (v.length === 1 ? "CHAR" : "STRING") : "?");

  function run(source, opts = {}) {
    const inputs = (opts.input || "").split("\n"); if (inputs.length && inputs[inputs.length - 1] === "") inputs.pop();
    const files = {}; Object.entries(opts.files || {}).forEach(([n, txt]) => { const ls = txt.split("\n"); if (ls[ls.length - 1] === "") ls.pop(); files[n] = { lines: ls, open: null, pos: 0 }; });
    const out = []; const warnings = []; const warned = new Set();
    const maxSteps = opts.maxSteps || 2000000; let steps = 0;
    const result = { out, warnings, ok: true, error: null, vars: {}, files };
    let prog;
    try { prog = parseProgram(source); }
    catch (e) { result.ok = false; result.error = e instanceof PseudoError ? e : new PseudoError(String(e.message || e), 0); return result; }

    const globals = new Map();
    let scope = globals; // current local scope (globals at top level)
    const warn = (key, msg) => { if (!warned.has(key)) { warned.add(key); warnings.push(msg); } };

    function findVar(name, line, forWrite) {
      if (scope !== globals && scope.has(name)) return scope.get(name);
      if (globals.has(name)) return globals.get(name);
      if (forWrite) return null;
      const all = [...(scope !== globals ? scope.keys() : []), ...globals.keys()];
      const near = all.find(n => n.toLowerCase() === name.toLowerCase());
      if (near) err(`Unknown variable "${name}". Did you mean "${near}"? Identifiers must be spelt exactly the same every time.`, line);
      if (prog.funcs[name]) err(`${name} is a function, so call it with brackets: ${name}(…)`, line);
      err(`Variable "${name}" has not been declared or given a value`, line);
    }
    function checkType(cell, v, name, line) {
      if (!cell.type || v === undefined) return v;
      const t = cell.type, vt = typeOfVal(v);
      if (t === "INTEGER") { if (typeof v !== "number") err(`${name} is INTEGER but is being given ${vt} ${JSON.stringify(fmt(v))}`, line); if (!Number.isInteger(v)) err(`${name} is INTEGER but is being given the real number ${fmt(v)}. Declare it as REAL, or use INT( ) / DIV`, line); }
      if (t === "REAL" && typeof v !== "number") err(`${name} is REAL but is being given ${vt} "${fmt(v)}"`, line);
      if (t === "STRING" && typeof v !== "string") err(`${name} is STRING but is being given ${vt} ${fmt(v)}. Use NUM_TO_STR( ) to convert a number`, line);
      if (t === "CHAR" && (typeof v !== "string" || v.length !== 1)) err(`${name} is CHAR, so it can hold only one character (given "${fmt(v)}")`, line);
      if (t === "BOOLEAN" && typeof v !== "boolean") err(`${name} is BOOLEAN but is being given ${fmt(v)}`, line);
      return v;
    }
    function arrIndex(cell, idxVals, name, line) {
      if (!cell.arr) err(`${name} is not an array${typeof cell.v === "string" ? ". To get one character of a string use MID(" + name + ", i, 1)" : ""}`, line);
      if (idxVals.length !== cell.bounds.length) err(`${name} has ${cell.bounds.length} dimension(s) but ${idxVals.length} index value(s) were given`, line);
      let flat = 0, mult = 1;
      for (let d = cell.bounds.length - 1; d >= 0; d--) {
        const [lo, hi] = cell.bounds[d], i = idxVals[d];
        if (typeof i !== "number" || !Number.isInteger(i)) err(`Array index must be a whole number (got ${fmt(i)})`, line);
        if (i < lo || i > hi) err(`Index ${i} is outside the bounds of ${name}[${cell.bounds.map(b => b[0] + ":" + b[1]).join(", ")}]`, line);
        flat += (i - lo) * mult; mult *= (hi - lo + 1);
      }
      return flat;
    }
    // A reference: {get(), set(v)} for BYREF and targets
    function ref(target, line) {
      if (target.k === "var") {
        let cell = findVar(target.name, line, true);
        if (cell && cell.arr) return { get: () => cell, set: v => { cell.arr = v.arr; cell.bounds = v.bounds; }, whole: cell };
        return {
          get: () => { const c = cell || findVar(target.name, line); if (c.v === undefined) err(`"${target.name}" is used before it has been given a value. Initialise it first, e.g. ${target.name} ← 0`, line); return c.v; },
          set: v => {
            if (!cell) {
              const all = [...(scope !== globals ? scope.keys() : []), ...globals.keys()];
              const near = all.find(n => n.toLowerCase() === target.name.toLowerCase());
              if (near) err(`"${target.name}" is not declared. Did you mean "${near}"? Identifiers must be spelt exactly the same every time.`, line);
              cell = { v: undefined, type: null }; scope.set(target.name, cell); if (!prog.procs[target.name]) warn("decl:" + target.name, `"${target.name}" was used without a DECLARE statement (line ${line}). Exam answers should declare every variable.`); }
            if (cell.isConst) err(`${target.name} is a CONSTANT and cannot be changed`, line);
            cell.v = checkType(cell, v, target.name, line);
          },
          cell: () => cell || findVar(target.name, line)
        };
      }
      const cell = findVar(target.name, line);
      const idx = target.idx.map(e => ev(e));
      const k = arrIndex(cell, idx, target.name, line);
      const label = `${target.name}[${idx.join(", ")}]`;
      return {
        get: () => { const v = cell.arr[k]; if (v === undefined) err(`${label} is used before it has been given a value`, line); return v; },
        set: v => { cell.arr[k] = checkType(cell, v, label, line); },
        cell: () => cell
      };
    }
    function toNum(v, line, what) { if (typeof v !== "number") err(`${what} needs a number but got ${typeOfVal(v)} "${fmt(v)}"`, line); return v; }
    function toStr(v, line, what) { if (typeof v !== "string") err(`${what} needs a string but got ${typeOfVal(v)} ${fmt(v)}${typeof v === "number" ? " (use NUM_TO_STR)" : ""}`, line); return v; }
    function toBool(v, line, what) { if (typeof v !== "boolean") err(`${what} must be TRUE or FALSE (a condition), but got ${fmt(v)}`, line); return v; }

    const BUILTINS = {
      LENGTH: (a, l) => toStr(a[0], l, "LENGTH").length,
      LEFT: (a, l) => toStr(a[0], l, "LEFT").slice(0, Math.max(0, toNum(a[1], l, "LEFT"))),
      RIGHT: (a, l) => { const s = toStr(a[0], l, "RIGHT"), n = toNum(a[1], l, "RIGHT"); return n <= 0 ? "" : s.slice(-n); },
      MID: (a, l) => { const s = toStr(a[0], l, "MID"), x = toNum(a[1], l, "MID"), y = toNum(a[2], l, "MID"); if (x < 1) err("MID positions start at 1, not 0", l); return s.substr(x - 1, y); },
      TO_UPPER: (a, l) => toStr(a[0], l, "TO_UPPER").toUpperCase(), TO_LOWER: (a, l) => toStr(a[0], l, "TO_LOWER").toLowerCase(),
      UCASE: (a, l) => toStr(a[0], l, "UCASE").toUpperCase(), LCASE: (a, l) => toStr(a[0], l, "LCASE").toLowerCase(),
      NUM_TO_STR: (a, l) => fmt(toNum(a[0], l, "NUM_TO_STR")),
      STR_TO_NUM: (a, l) => { const s = toStr(a[0], l, "STR_TO_NUM"); const n = Number(s); if (s.trim() === "" || isNaN(n)) err(`STR_TO_NUM can't convert "${s}" to a number`, l); return n; },
      IS_NUM: (a, l) => { const s = toStr(a[0], l, "IS_NUM"); return s.trim() !== "" && !isNaN(Number(s)); },
      ASC: (a, l) => toStr(a[0], l, "ASC").charCodeAt(0), CHR: (a, l) => String.fromCharCode(toNum(a[0], l, "CHR")),
      INT: (a, l) => Math.trunc(toNum(a[0], l, "INT")), RAND: (a, l) => Math.random() * toNum(a[0], l, "RAND"),
      ROUND: (a, l) => { const p = a.length > 1 ? toNum(a[1], l, "ROUND") : 0, m = Math.pow(10, p); return Math.round(toNum(a[0], l, "ROUND") * m) / m; },
      DIV: (a, l) => { const d = toNum(a[1], l, "DIV"); if (d === 0) err("Division by zero", l); return Math.trunc(toNum(a[0], l, "DIV") / d); },
      MOD: (a, l) => { const d = toNum(a[1], l, "MOD"); if (d === 0) err("Division by zero", l); return toNum(a[0], l, "MOD") % d; },
      SQUAREROOT: (a, l) => Math.sqrt(toNum(a[0], l, "SQUAREROOT")), SQRT: (a, l) => Math.sqrt(toNum(a[0], l, "SQRT")),
      EOF: (a, l) => { const f = getFile(a[0], l, "READ"); return f.pos >= f.lines.length; }
    };
    function getFile(name, line, needMode) {
      const f = files[name];
      if (!f || !f.open) err(`File "${name}" is not open. Use OPENFILE "${name}" FOR ${needMode} first`, line);
      if (needMode === "READ" && f.open !== "READ") err(`File "${name}" was opened for ${f.open}, so it can't be read`, line);
      if (needMode === "WRITE" && f.open === "READ") err(`File "${name}" was opened for READ, so you can't write to it`, line);
      return f;
    }

    function ev(e) {
      switch (e.k) {
        case "lit": return e.v;
        case "var": {
          const c = findVar(e.name, e.line);
          if (c.arr) err(`${e.name} is an array. Use an index, e.g. ${e.name}[1]`, e.line);
          if (c.v === undefined) err(`"${e.name}" is used before it has been given a value. Initialise it first, e.g. ${e.name} ← 0`, e.line);
          return c.v;
        }
        case "idx": return ref(e, e.line).get();
        case "un": { const v = ev(e.e); if (e.op === "-") return -toNum(v, e.line, "Minus"); return !toBool(v, e.line, "NOT"); }
        case "bin": {
          const op = e.op;
          if (op === "AND") { return toBool(ev(e.l), e.line, "AND") ? toBool(ev(e.r), e.line, "AND") : false; }
          if (op === "OR") { return toBool(ev(e.l), e.line, "OR") ? true : toBool(ev(e.r), e.line, "OR"); }
          const a = ev(e.l), b = ev(e.r), line = e.l.line || e.line;
          switch (op) {
            case "&": if (typeof a !== "string" || typeof b !== "string") err(`& joins strings only. Convert numbers with NUM_TO_STR( ) (got ${fmt(a)} & ${fmt(b)})`, line); return a + b;
            case "+": if (typeof a === "string" || typeof b === "string") err("Use & to join strings, not +", line); return toNum(a, line, "+") + toNum(b, line, "+");
            case "-": return toNum(a, line, "-") - toNum(b, line, "-");
            case "*": if (typeof a === "string" || typeof b === "string") err('You can\'t multiply a string. "#" * n is Python; build the string with a loop and &', line); return a * b;
            case "/": if (toNum(b, line, "/") === 0) err("Division by zero", line); return toNum(a, line, "/") / b;
            case "^": return Math.pow(toNum(a, line, "^"), toNum(b, line, "^"));
            case "DIV": if (toNum(b, line, "DIV") === 0) err("Division by zero", line); return Math.trunc(toNum(a, line, "DIV") / b);
            case "MOD": if (toNum(b, line, "MOD") === 0) err("Division by zero", line); return toNum(a, line, "MOD") % b;
            case "=": return a === b; case "<>": return a !== b;
            case "<": case ">": case "<=": case ">=":
              if (typeof a !== typeof b) err(`Can't compare ${typeOfVal(a)} with ${typeOfVal(b)} (${fmt(a)} ${op} ${fmt(b)})`, line);
              return op === "<" ? a < b : op === ">" ? a > b : op === "<=" ? a <= b : a >= b;
          }
        }
        case "call": {
          if (BUILTINS[e.name]) return BUILTINS[e.name](e.args.map(ev), e.line);
          const f = prog.funcs[e.name];
          if (!f) {
            if (prog.procs[e.name]) err(`${e.name} is a PROCEDURE, so it doesn't return a value. Use CALL ${e.name}(…) on its own line`, e.line);
            const up = e.name.toUpperCase();
            if (BUILTINS[up]) err(`Function names are in capitals: ${up}`, e.line);
            if (PY_HINTS[e.name]) err(`"${e.name}( )" is Python. ${PY_HINTS[e.name]}`, e.line);
            err(`Unknown function "${e.name}"`, e.line);
          }
          const r = invoke(f, e.args, e.line, true);
          return r;
        }
      }
      err("Unknown expression", e.line);
    }

    class Ret { constructor(v) { this.v = v; } }
    function invoke(sub, argExprs, line, isFunc) {
      if (argExprs.length !== sub.params.length) err(`${sub.name} expects ${sub.params.length} argument(s) but was given ${argExprs.length}`, line);
      const local = new Map();
      sub.params.forEach((p, i) => {
        const a = argExprs[i];
        const argCell = a.k === "var" ? findVar(a.name, line, true) : null;
        if (argCell && argCell.arr) { // arrays: BYREF shares, BYVAL copies
          local.set(p.name, p.byref ? argCell : { type: argCell.type, arr: argCell.arr.slice(), bounds: argCell.bounds });
          return;
        }
        if (p.byref) {
          if (a.k !== "var" && a.k !== "idx") err(`Parameter ${p.name} is BYREF, so the argument must be a variable`, line);
          const r = ref(a, line);
          local.set(p.name, { type: p.type, get v() { return r.get(); }, set v(x) { r.set(x); }, byref: true });
        } else {
          const v = ev(a);
          const cell = { v: undefined, type: p.type }; cell.v = checkType(cell, v, p.name, line); local.set(p.name, cell);
        }
      });
      const saved = scope; scope = local;
      try { execBlock(sub.body); }
      catch (x) {
        if (x instanceof Ret) {
          if (!isFunc) err("RETURN with a value can only be used in a FUNCTION", line);
          scope = saved;
          return checkType({ type: sub.returns }, x.v, `The return value of ${sub.name}`, line);
        }
        throw x;
      } finally { scope = saved; }
      if (isFunc) err(`FUNCTION ${sub.name} finished without a RETURN statement`, sub.line);
    }

    function execBlock(stmts) { for (const s of stmts) exec(s); }
    function exec(s) {
      if (++steps > maxSteps) err("Program stopped after too many steps. Is there an infinite loop? Check that the loop condition can become true/false.", s.line);
      switch (s.k) {
        case "nop": return;
        case "declare": {
          s.names.forEach(n => {
            if (scope.has(n) && scope === globals) err(`"${n}" has already been declared`, s.line);
            if (s.bounds) {
              const b = s.bounds.map(([lo, hi]) => [ev(lo), ev(hi)]);
              const size = b.reduce((a, [lo, hi]) => a * (hi - lo + 1), 1);
              if (size <= 0 || size > 1e6) err("Array bounds are not valid", s.line);
              scope.set(n, { type: s.type, arr: new Array(size), bounds: b });
            } else scope.set(n, { v: undefined, type: s.type });
          });
          return;
        }
        case "const": { const v = ev(s.e); scope.set(s.name, { v, type: null, isConst: true }); return; }
        case "assign": ref(s.target, s.line).set(ev(s.e)); return;
        case "input": {
          const r = ref(s.target, s.line);
          if (!inputs.length) err(`INPUT needs a value but the Input box has run out. Add another line to the Input box (one value per line).`, s.line);
          const raw = inputs.shift();
          out.push({ kind: "in", text: raw });
          const cell = s.target.k === "var" ? findVar(s.target.name, s.line, true) : findVar(s.target.name, s.line);
          const t = cell && cell.type;
          let v;
          if (t === "INTEGER" || t === "REAL") { v = Number(raw); if (raw.trim() === "" || isNaN(v)) err(`Input "${raw}" is not a number, but ${s.target.name} is ${t}`, s.line); if (t === "INTEGER" && !Number.isInteger(v)) err(`Input "${raw}" is not a whole number, but ${s.target.name} is INTEGER`, s.line); }
          else if (t === "BOOLEAN") { const u = raw.trim().toUpperCase(); if (u !== "TRUE" && u !== "FALSE") err(`Input must be TRUE or FALSE for ${s.target.name}`, s.line); v = u === "TRUE"; }
          else if (t === "STRING" || t === "CHAR" || t === "DATE") v = raw;
          else v = raw.trim() !== "" && !isNaN(Number(raw)) ? Number(raw) : raw;
          r.set(v); return;
        }
        case "output": out.push({ kind: "out", text: s.es.map(e => fmt(ev(e))).join("") }); return;
        case "if": execBlock(toBool(ev(s.cond), s.line, "The IF condition") ? s.then : s.els); return;
        case "case": {
          const v = ev(s.subject);
          for (const c of s.clauses) {
            const hit = c.labels.some(lb => lb.v ? ev(lb.v) === v : (typeof v === typeof ev(lb.lo) && v >= ev(lb.lo) && v <= ev(lb.hi)));
            if (hit) { execBlock(c.body); return; }
          }
          if (s.other) execBlock(s.other); return;
        }
        case "for": {
          const r = ref({ k: "var", name: s.v }, s.line);
          const start = toNum(ev(s.start), s.line, "FOR start"), end = toNum(ev(s.end), s.line, "FOR end"), step = s.step ? toNum(ev(s.step), s.line, "STEP") : 1;
          if (step === 0) err("STEP can't be 0", s.line);
          for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
            r.set(i);
            execBlock(s.body);
            if (++steps > maxSteps) err("Program stopped after too many steps", s.line);
          }
          return;
        }
        case "while": while (toBool(ev(s.cond), s.line, "The WHILE condition")) { execBlock(s.body); if (++steps > maxSteps) err("Program stopped after too many steps. Infinite WHILE loop? Make sure something inside the loop changes the condition.", s.line); } return;
        case "repeat": do { execBlock(s.body); if (++steps > maxSteps) err("Program stopped after too many steps. Infinite REPEAT loop?", s.line); } while (!toBool(ev(s.cond), s.line, "The UNTIL condition")); return;
        case "call": {
          const p = prog.procs[s.name];
          if (!p) { if (prog.funcs[s.name]) err(`${s.name} is a FUNCTION. Use its result in an expression, e.g. X ← ${s.name}(…), not CALL`, s.line); err(`Unknown procedure "${s.name}"`, s.line); }
          invoke(p, s.args, s.line, false); return;
        }
        case "return": if (scope === globals) err("RETURN can only be used inside a FUNCTION", s.line); throw new Ret(s.e ? ev(s.e) : undefined);
        case "open": {
          const n = toStr(ev(s.f), s.line, "OPENFILE");
          if (s.mode === "READ") { if (!files[n]) err(`File "${n}" doesn't exist. Add it in the Files box (check the name and quotation marks)`, s.line); files[n].open = "READ"; files[n].pos = 0; }
          else if (s.mode === "WRITE") files[n] = { lines: [], open: "WRITE", pos: 0, written: true };
          else { if (!files[n]) files[n] = { lines: [], pos: 0 }; files[n].open = "APPEND"; files[n].written = true; }
          return;
        }
        case "readf": { const n = ev(s.f); const f = getFile(n, s.line, "READ"); if (f.pos >= f.lines.length) err(`Tried to read past the end of "${n}". Check EOF( ) before READFILE`, s.line); ref(s.target, s.line).set(f.lines[f.pos++]); return; }
        case "writef": { const n = ev(s.f); const f = getFile(n, s.line, "WRITE"); f.lines.push(fmt(ev(s.e))); return; }
        case "close": { const n = ev(s.f); if (!files[n] || !files[n].open) err(`File "${n}" is not open`, s.line); files[n].open = null; return; }
      }
    }

    try {
      execBlock(prog.main);
      Object.values(files).forEach(f => { if (f.open) warn("open", "A file was left open. Remember CLOSEFILE."); });
    } catch (e) {
      result.ok = false;
      result.error = e instanceof PseudoError ? e : (e instanceof RangeError ? new PseudoError("Too much recursion: a procedure or function keeps calling itself", 0) : new PseudoError("Internal error: " + (e.message || e), 0));
    }
    globals.forEach((c, n) => { result.vars[n] = c.arr ? "[" + Array.from(c.arr, x => x === undefined ? "·" : fmt(x)).join(", ") + "]" : (c.v === undefined ? "(no value)" : (typeof c.v === "string" ? JSON.stringify(c.v) : fmt(c.v))); });
    return result;
  }

  global.Pseudo = { run, parse: parseProgram, fmt };
})(typeof window !== "undefined" ? window : globalThis);

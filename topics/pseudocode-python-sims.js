/* Simulations for the Pseudocode & Python module */
(function () {
  const { $, $$, esc, highlight, saveScore } = Hub;
  const TOPIC = "Pseudocode & Python";
  const fmt = v => typeof v === "string" ? `"${v}"` : typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : Array.isArray(v) ? "[" + v.join(", ") + "]" : (v === undefined ? "—" : String(v));

  /* ===== 1. Trace-table stepper ===== */
  // Each program: code (pseudocode lines), inputs (editable), traceVars, and run(inputs) -> generator of {line, v, out}
  const PROGRAMS = {
    staircase: {
      name: "Staircase (nested FOR)",
      inputsLabel: "Rows", inputs: "3", traceVars: ["Row", "Col", "Line", "Total"],
      code: `INPUT Rows
Total ← 0
FOR Row ← 1 TO Rows
    Line ← ""
    FOR Col ← 1 TO Row
        Line ← Line & "#"
    NEXT Col
    OUTPUT Line
    Total ← Total + Row
NEXT Row
OUTPUT "Total: ", Total`,
      *run(inp) {
        const v = {}; const Rows = parseInt(inp) || 3; v.Rows = Rows; yield { line: 1, v };
        v.Total = 0; yield { line: 2, v };
        for (v.Row = 1; v.Row <= Rows; v.Row++) {
          yield { line: 3, v };
          v.Line = ""; yield { line: 4, v };
          for (v.Col = 1; v.Col <= v.Row; v.Col++) { yield { line: 5, v }; v.Line += "#"; yield { line: 6, v }; }
          yield { line: 7, v };
          yield { line: 8, v, out: v.Line };
          v.Total += v.Row; yield { line: 9, v };
        }
        yield { line: 10, v };
        yield { line: 11, v, out: "Total: " + v.Total };
      }
    },
    grade: {
      name: "Grades (nested IF)",
      inputsLabel: "Mark", inputs: "65", traceVars: ["Mark", "Grade"],
      code: `INPUT Mark
IF Mark < 40
  THEN
    Grade ← "Fail"
  ELSE
    IF Mark < 60
      THEN
        Grade ← "Pass"
      ELSE
        IF Mark < 80
          THEN
            Grade ← "Merit"
          ELSE
            Grade ← "Distinction"
        ENDIF
    ENDIF
ENDIF
OUTPUT Grade`,
      *run(inp) {
        const v = {}; v.Mark = parseFloat(inp); yield { line: 1, v };
        yield { line: 2, v };
        if (v.Mark < 40) { yield { line: 3, v }; v.Grade = "Fail"; yield { line: 4, v }; }
        else { yield { line: 5, v }; yield { line: 6, v };
          if (v.Mark < 60) { yield { line: 7, v }; v.Grade = "Pass"; yield { line: 8, v }; }
          else { yield { line: 9, v }; yield { line: 10, v };
            if (v.Mark < 80) { yield { line: 11, v }; v.Grade = "Merit"; yield { line: 12, v }; }
            else { yield { line: 13, v }; v.Grade = "Distinction"; yield { line: 14, v }; }
            yield { line: 15, v }; }
          yield { line: 16, v }; }
        yield { line: 17, v };
        yield { line: 18, v, out: v.Grade };
      }
    },
    zone: {
      name: "Zone price (CASE)",
      inputsLabel: "Zone", inputs: "B", traceVars: ["Zone", "Price"],
      code: `INPUT Zone
CASE OF Zone
    'A' : Price ← 100
    'B' : Price ← 150
    'C' : Price ← 220
    OTHERWISE : Price ← 0
ENDCASE
OUTPUT Price`,
      *run(inp) {
        const v = {}; v.Zone = (inp || "A").trim().charAt(0); yield { line: 1, v };
        yield { line: 2, v };
        const map = { A: [3, 100], B: [4, 150], C: [5, 220] };
        const hit = map[v.Zone];
        if (hit) { v.Price = hit[1]; yield { line: hit[0], v }; } else { v.Price = 0; yield { line: 6, v }; }
        yield { line: 7, v };
        yield { line: 8, v, out: String(v.Price) };
      }
    },
    validate: {
      name: "Validation (REPEAT … UNTIL)",
      inputsLabel: "Inputs typed in order, comma separated", inputs: "-4, 15, 7", traceVars: ["Value"],
      code: `REPEAT
    OUTPUT "Enter value 0 to 10"
    INPUT Value
UNTIL Value >= 0 AND Value <= 10
OUTPUT "Accepted ", Value`,
      *run(inp) {
        const list = inp.split(",").map(s => parseFloat(s)).filter(n => !isNaN(n)); let k = 0; const v = {};
        do {
          yield { line: 1, v };
          yield { line: 2, v, out: "Enter value 0 to 10" };
          if (k >= list.length) { yield { line: 3, v, out: "(no more test inputs — add a valid value)" }; return; }
          v.Value = list[k++]; yield { line: 3, v };
          yield { line: 4, v, cond: v.Value >= 0 && v.Value <= 10 };
        } while (!(v.Value >= 0 && v.Value <= 10));
        yield { line: 5, v, out: "Accepted " + v.Value };
      }
    },
    compare: {
      name: "Function: odd vs even positions",
      inputsLabel: "Array values, comma separated", inputs: "4, 9, 2, 7, 5, 1", traceVars: ["i", "i MOD 2", "OddTotal", "EvenTotal"],
      code: `FUNCTION Compare() RETURNS STRING
    OddTotal ← 0
    EvenTotal ← 0
    FOR i ← 1 TO N
        IF i MOD 2 = 1
          THEN
            OddTotal ← OddTotal + Values[i]
          ELSE
            EvenTotal ← EvenTotal + Values[i]
        ENDIF
    NEXT i
    IF OddTotal > EvenTotal THEN RETURN "Odd" ENDIF
    IF EvenTotal > OddTotal THEN RETURN "Even" ENDIF
    RETURN "Same"
ENDFUNCTION`,
      *run(inp) {
        const vals = inp.split(",").map(s => parseInt(s)).filter(n => !isNaN(n)); const v = { N: vals.length, Values: vals };
        yield { line: 1, v }; v.OddTotal = 0; yield { line: 2, v }; v.EvenTotal = 0; yield { line: 3, v };
        for (v.i = 1; v.i <= vals.length; v.i++) {
          v["i MOD 2"] = v.i % 2; yield { line: 4, v }; yield { line: 5, v };
          if (v.i % 2 === 1) { yield { line: 6, v }; v.OddTotal += vals[v.i - 1]; yield { line: 7, v }; }
          else { yield { line: 8, v }; v.EvenTotal += vals[v.i - 1]; yield { line: 9, v }; }
          yield { line: 10, v }; yield { line: 11, v };
        }
        yield { line: 12, v }; if (v.OddTotal > v.EvenTotal) { yield { line: 12, v, out: 'returns "Odd"' }; return; }
        yield { line: 13, v }; if (v.EvenTotal > v.OddTotal) { yield { line: 13, v, out: 'returns "Even"' }; return; }
        yield { line: 14, v, out: 'returns "Same"' };
      }
    },
    build: {
      name: "Exam-style: CASE + MID trace",
      inputsLabel: "Code parameter", inputs: "A2B3", traceVars: ["i", "c", "n", "Out"],
      code: `PROCEDURE Build(Code : STRING)
    Out ← ""
    FOR i ← 1 TO LENGTH(Code) STEP 2
        c ← MID(Code, i, 1)
        n ← STR_TO_NUM(MID(Code, i + 1, 1))
        CASE OF c
            'A' : Out ← Out & LEFT("xxxx", n)
            'B' : Out ← Out & RIGHT("1234", n)
        ENDCASE
    NEXT i
    OUTPUT Out
ENDPROCEDURE`,
      *run(inp) {
        const Code = inp.trim(); const v = {}; yield { line: 1, v };
        v.Out = ""; yield { line: 2, v };
        for (v.i = 1; v.i <= Code.length; v.i += 2) {
          yield { line: 3, v };
          v.c = Code.charAt(v.i - 1); yield { line: 4, v };
          v.n = parseInt(Code.charAt(v.i)) || 0; yield { line: 5, v };
          yield { line: 6, v };
          if (v.c === "A") { v.Out += "xxxx".slice(0, v.n); yield { line: 7, v }; }
          else if (v.c === "B") { v.Out += "1234".slice(Math.max(0, 4 - v.n)); yield { line: 8, v }; }
          yield { line: 9, v }; yield { line: 10, v };
        }
        yield { line: 11, v, out: v.Out }; yield { line: 12, v };
      }
    }
  };

  function traceSim(el) {
    el.innerHTML = `<div class="sim">
      <div class="btn-row"><label>Program: <select data-prog>${Object.entries(PROGRAMS).map(([k, p]) => `<option value="${k}">${p.name}</option>`).join("")}</select></label>
        <label><span data-inlabel></span>: <input type="text" data-inp style="width:200px"></label>
        <label><input type="checkbox" data-predict> Predict mode (guess the values before each step)</label></div>
      <div class="sim-grid">
        <div><div class="codeview" data-code></div>
          <div class="btn-row"><button class="btn" data-reset>⟲ Reset</button><button class="btn primary" data-step>Step ▶</button><button class="btn" data-run>Run to end ⏭</button><span class="pill" data-stepno>Step 0</span></div>
          <div data-predictbox></div></div>
        <div><b>Variables</b><div class="vars" data-vars></div><b>Output</b><div class="console" data-out></div></div>
      </div>
      <h4>Trace table</h4><div class="table-wrap"><table class="trace" data-trace></table></div>
      <p class="muted" style="font-size:.85rem">A new trace-table row is added each time a traced variable changes or something is output. This is how the exam expects you to fill one in.</p></div>`;
    let prog, gen, steps, last, predictScore, predictTotal;
    const sel = $("[data-prog]", el), inp = $("[data-inp]", el);
    function load(keepInput) {
      prog = PROGRAMS[sel.value];
      $("[data-inlabel]", el).textContent = prog.inputsLabel;
      if (!keepInput) inp.value = prog.inputs;
      $("[data-code]", el).innerHTML = prog.code.split("\n").map((l, i) => `<div class="ln" data-l="${i + 1}"><span class="no">${i + 1}</span><span>${highlight(l, "pseudo")}</span></div>`).join("");
      gen = prog.run(inp.value); steps = 0; last = {}; predictScore = 0; predictTotal = 0;
      $("[data-vars]", el).innerHTML = ""; $("[data-out]", el).textContent = ""; $("[data-stepno]", el).textContent = "Step 0";
      $("[data-trace]", el).innerHTML = `<tr>${prog.traceVars.map(n => `<th>${n}</th>`).join("")}<th>OUTPUT</th></tr>`;
      $("[data-step]", el).disabled = false; $("[data-run]", el).disabled = false; $("[data-predictbox]", el).innerHTML = "";
    }
    function apply(s) {
      steps++;
      $$(".ln", el).forEach(l => l.classList.toggle("cur", +l.dataset.l === s.line));
      const cur = {}; prog.traceVars.forEach(n => cur[n] = s.v[n]);
      const changed = prog.traceVars.filter(n => fmt(cur[n]) !== fmt(last[n]));
      const shown = Object.keys(s.v).filter(k => k !== "Values");
      $("[data-vars]", el).innerHTML = shown.map(k => `<span class="var ${changed.includes(k) ? "changed" : ""}">${k} = ${esc(fmt(s.v[k]))}</span>`).join("") + (s.cond !== undefined ? `<span class="var">condition = ${s.cond ? "TRUE" : "FALSE"}</span>` : "");
      if (s.out !== undefined) $("[data-out]", el).textContent += s.out + "\n";
      if (changed.length || s.out !== undefined) {
        $$("tr.new", el).forEach(r => r.classList.remove("new"));
        $("[data-trace]", el).insertAdjacentHTML("beforeend", `<tr class="new">${prog.traceVars.map(n => `<td>${changed.includes(n) ? esc(fmt(cur[n])) : ""}</td>`).join("")}<td>${s.out !== undefined ? esc(s.out) : ""}</td></tr>`);
      }
      last = cur;
      $("[data-stepno]", el).textContent = "Step " + steps;
    }
    function next() {
      const r = gen.next();
      if (r.done) { finish(); return false; }
      apply(r.value); return true;
    }
    function finish() {
      $("[data-step]", el).disabled = true; $("[data-run]", el).disabled = true;
      $$(".ln", el).forEach(l => l.classList.remove("cur"));
      if ($("[data-predict]", el).checked && predictTotal) {
        $("[data-predictbox]", el).innerHTML = `<div class="callout tip">Prediction score: ${predictScore}/${predictTotal}</div>`;
        saveScore({ topic: TOPIC, activity: "Trace predictor — " + prog.name, type: "Simulation", score: predictScore, max: predictTotal });
      }
    }
    function stepClick() {
      if (!$("[data-predict]", el).checked) { next(); return; }
      // predict mode: peek next step on a cloned generator is not possible; run a fresh copy up to steps+1
      const g2 = prog.run(inp.value); let s; for (let k = 0; k <= steps; k++) { const r = g2.next(); if (r.done) { finish(); return; } s = r.value; }
      const target = {}; prog.traceVars.forEach(n => target[n] = s.v[n]);
      const changed = prog.traceVars.filter(n => fmt(target[n]) !== fmt(last[n]));
      if (!changed.length) { next(); return; }
      const box = $("[data-predictbox]", el);
      box.innerHTML = `<div class="callout"><b>Line ${s.line}: predict the new value${changed.length > 1 ? "s" : ""}</b><div class="btn-row">${changed.map(n => `<label>${n} = <input type="text" data-guess="${esc(n)}" style="width:110px"></label>`).join("")}<button class="btn primary" data-check>Check</button></div></div>`;
      $("[data-guess]", box).focus();
      $("[data-check]", box).onclick = () => {
        let ok = 0;
        changed.forEach(n => { const g = $(`[data-guess="${CSS.escape(n)}"]`, box).value.trim().replace(/^"|"$/g, "").toUpperCase(); const want = fmt(target[n]).replace(/^"|"$/g, "").toUpperCase(); if (g === want) ok++; });
        predictTotal += changed.length; predictScore += ok;
        box.innerHTML = `<div class="callout ${ok === changed.length ? "tip" : "bad"}">${ok === changed.length ? "✅ Correct" : "❌ Answer: " + changed.map(n => n + " = " + esc(fmt(target[n]))).join(", ")} · running score ${predictScore}/${predictTotal}</div>`;
        next();
      };
    }
    sel.onchange = () => load(false); inp.onchange = () => load(true);
    $("[data-reset]", el).onclick = () => load(true);
    $("[data-step]", el).onclick = stepClick;
    $("[data-run]", el).onclick = () => { $("[data-predict]", el).checked = false; let guard = 0; while (next() && guard++ < 2000); };
    $("[data-predict]", el).onchange = () => load(true);
    load(false);
  }

  /* ===== 2. Loop visualiser ===== */
  function loopSim(el) {
    el.innerHTML = `<div class="sim"><p>Change the numbers to see which values the pseudocode FOR loop produces, and the Python <code>range()</code> that matches it.</p>
      <div class="btn-row"><label>Start <input type="number" data-a value="1" style="width:70px"></label><label>End <input type="number" data-b value="5" style="width:70px"></label><label>Step <input type="number" data-s value="1" style="width:70px"></label></div>
      <div class="two-col"><div><div class="label">Pseudocode</div><pre data-p></pre><div class="loopviz" data-pv></div></div>
      <div><div class="label">Correct Python</div><pre data-py></pre><div class="loopviz" data-pyv></div>
      <div class="label" style="margin-top:8px">Common mistake</div><pre data-wrong></pre><div class="loopviz" data-wv></div></div></div>
      <div class="callout" data-msg></div></div>`;
    const seq = (a, b, s) => { const r = []; if (!s) return r; if (s > 0) for (let i = a; i <= b && r.length < 60; i += s) r.push(i); else for (let i = a; i >= b && r.length < 60; i += s) r.push(i); return r; };
    const pyr = (a, b, s) => { const r = []; if (!s) return r; if (s > 0) for (let i = a; i < b && r.length < 60; i += s) r.push(i); else for (let i = a; i > b && r.length < 60; i += s) r.push(i); return r; };
    function upd() {
      const a = +$("[data-a]", el).value, b = +$("[data-b]", el).value, s = +$("[data-s]", el).value || 1;
      $("[data-p]", el).innerHTML = highlight(`FOR i ← ${a} TO ${b}${s !== 1 ? " STEP " + s : ""}\n    OUTPUT i\nNEXT i`, "pseudo");
      const end = s > 0 ? b + 1 : b - 1;
      $("[data-py]", el).innerHTML = highlight(`for i in range(${a}, ${end}${s !== 1 ? ", " + s : ""}):\n    print(i)`, "python");
      $("[data-wrong]", el).innerHTML = highlight(`for i in range(${a}, ${b}${s !== 1 ? ", " + s : ""}):\n    print(i)`, "python");
      const P = seq(a, b, s), W = pyr(a, b, s);
      $("[data-pv]", el).innerHTML = P.map(x => `<span>${x}</span>`).join("") || "<em class='muted'>runs 0 times</em>";
      $("[data-pyv]", el).innerHTML = P.map(x => `<span>${x}</span>`).join("") || "<em class='muted'>runs 0 times</em>";
      $("[data-wv]", el).innerHTML = P.map(x => `<span class="${W.includes(x) ? "" : "off"}">${x}</span>`).join("");
      $("[data-msg]", el).innerHTML = `The loop body runs <b>${P.length}</b> time(s). Writing <code>range(${a}, ${b})</code> misses <b>${P.filter(x => !W.includes(x)).join(", ") || "nothing"}</b>, because Python's <code>range</code> stops <i>before</i> the end value.`;
    }
    $$("input", el).forEach(i => i.oninput = upd); upd();
  }

  /* ===== 3. Pseudocode ↔ Python linker ===== */
  const PAIRS = {
    "Average with rogue value": [
      ["Total ← 0", "total = 0"], ["Count ← 0", "count = 0"], ["INPUT Num", "num = int(input())"],
      ["WHILE Num <> -1 DO", "while num != -1:"], ["    Total ← Total + Num", "    total = total + num"], ["    Count ← Count + 1", "    count = count + 1"],
      ["    INPUT Num", "    num = int(input())"], ["ENDWHILE", "(no end keyword — indentation ends the loop)"],
      ["IF Count > 0", "if count > 0:"], ["  THEN", "(no THEN — the colon starts the block)"], ["    OUTPUT \"Average: \", Total / Count", "    print(\"Average:\", total / count)"],
      ["  ELSE", "else:"], ["    OUTPUT \"No numbers\"", "    print(\"No numbers\")"], ["ENDIF", "(no ENDIF)"]],
    "Validation with REPEAT": [
      ["REPEAT", "while True:"], ["    OUTPUT \"Enter password\"", "    print(\"Enter password\")"], ["    INPUT Password", "    password = input()"],
      ["UNTIL LENGTH(Password) >= 8", "    if len(password) >= 8:\n        break"], ["OUTPUT \"Accepted\"", "print(\"Accepted\")"]],
    "Function with string handling": [
      ["FUNCTION CountA(Word : STRING) RETURNS INTEGER", "def count_a(word):"], ["    DECLARE i, Count : INTEGER", "    (no declarations)"], ["    Count ← 0", "    count = 0"],
      ["    FOR i ← 1 TO LENGTH(Word)", "    for i in range(1, len(word) + 1):"], ["        IF MID(Word, i, 1) = 'a'", "        if word[i - 1] == 'a':"], ["          THEN", "(no THEN)"],
      ["            Count ← Count + 1", "            count = count + 1"], ["        ENDIF", "(no ENDIF)"], ["    NEXT i", "(no NEXT)"], ["    RETURN Count", "    return count"], ["ENDFUNCTION", "(no ENDFUNCTION)"]]
  };
  function linkSim(el) {
    el.innerHTML = `<div class="sim"><div class="btn-row"><label>Example: <select data-ex>${Object.keys(PAIRS).map(k => `<option>${k}</option>`).join("")}</select></label><span class="muted">Click (or hover over) any line to see its partner.</span></div>
      <div class="two-col"><div><div class="label">Cambridge pseudocode</div><div class="codeview" data-l></div></div><div><div class="label">Python</div><div class="codeview" data-r></div></div></div><div class="callout" data-note>Pick a line.</div></div>`;
    function render() {
      const P = PAIRS[$("[data-ex]", el).value];
      $("[data-l]", el).innerHTML = P.map((p, i) => `<div class="ln" data-i="${i}"><span class="no">${i + 1}</span><span>${highlight(p[0], "pseudo")}</span></div>`).join("");
      $("[data-r]", el).innerHTML = P.map((p, i) => `<div class="ln" data-i="${i}"><span class="no">${i + 1}</span><span>${p[1].startsWith("(") ? `<span style="color:var(--cm)">${esc(p[1])}</span>` : highlight(p[1], "python")}</span></div>`).join("");
      $$(".ln", el).forEach(l => { const go = () => { $$(".ln", el).forEach(x => x.classList.toggle("pair", x.dataset.i === l.dataset.i)); const p = P[+l.dataset.i]; $("[data-note]", el).innerHTML = `<code>${esc(p[0].trim())}</code> ⇄ <code>${esc(p[1].trim())}</code>`; }; l.onmouseenter = go; l.onclick = go; });
    }
    $("[data-ex]", el).onchange = render; render();
  }

  /* ===== 4. Pattern builder ===== */
  function patternSim(el) {
    const shapes = {
      "Staircase": { gen: n => Array.from({ length: n }, (_, r) => "#".repeat(r + 1)), inner: "FOR Col ← 1 TO Row" },
      "Upside-down staircase": { gen: n => Array.from({ length: n }, (_, r) => "#".repeat(n - r)), outer: "FOR Row ← Rows TO 1 STEP -1", inner: "FOR Col ← 1 TO Row" },
      "Square": { gen: n => Array.from({ length: n }, () => "#".repeat(n)), inner: "FOR Col ← 1 TO Rows" },
      "Number triangle": { gen: n => Array.from({ length: n }, (_, r) => Array.from({ length: r + 1 }, (_, c) => c + 1).join("")), inner: "FOR Col ← 1 TO Row", add: "NUM_TO_STR(Col)" }
    };
    el.innerHTML = `<div class="sim"><div class="btn-row"><label>Pattern <select data-s>${Object.keys(shapes).map(k => `<option>${k}</option>`).join("")}</select></label><label>Rows <input type="range" min="1" max="9" value="4" data-n> <b data-nv>4</b></label></div>
      <div class="two-col"><div><div class="label">Pseudocode</div><pre data-code></pre></div><div><div class="label">Output</div><div class="console" data-out style="font-size:1rem"></div><p data-count></p></div></div></div>`;
    function upd() {
      const k = $("[data-s]", el).value, n = +$("[data-n]", el).value, s = shapes[k];
      $("[data-nv]", el).textContent = n;
      const lines = s.gen(n);
      $("[data-out]", el).textContent = lines.join("\n");
      const chars = lines.reduce((a, l) => a + l.length, 0);
      $("[data-count]", el).innerHTML = `Characters printed: <b>${chars}</b>`;
      $("[data-code]", el).innerHTML = highlight(`INPUT Rows          // ${n}
Total ← 0
${s.outer || "FOR Row ← 1 TO Rows"}
    Line ← ""
    ${s.inner}
        Line ← Line & ${s.add || '"#"'}
        Total ← Total + 1
    NEXT Col
    OUTPUT Line
NEXT Row
OUTPUT "Total: ", Total   // ${chars}`, "pseudo");
    }
    $$("select,input", el).forEach(i => i.oninput = upd); upd();
  }

  /* ===== 5. String function lab ===== */
  function strSim(el) {
    el.innerHTML = `<div class="sim"><div class="btn-row"><label>String <input type="text" data-s value="COMPUTER" style="width:180px"></label>
      <label>x <input type="number" data-x value="3" style="width:60px"></label><label>y <input type="number" data-y value="2" style="width:60px"></label></div>
      <div class="loopviz" data-cells></div><div class="table-wrap"><table data-t></table></div>
      <p class="muted">The numbers under each letter are pseudocode positions (starting at 1). Python indexes start at 0.</p></div>`;
    function upd() {
      const s = $("[data-s]", el).value, x = +$("[data-x]", el).value, y = +$("[data-y]", el).value;
      $("[data-cells]", el).innerHTML = [...s].map((c, i) => `<span style="${i + 1 >= x && i + 1 < x + y ? "background:var(--warn-soft);outline:2px solid var(--warn)" : ""}">${esc(c)}<br><small>${i + 1}</small></span>`).join("");
      const rows = [
        [`LENGTH(S)`, s.length, `len(s)`], [`LEFT(S, ${x})`, `"${s.slice(0, x)}"`, `s[:${x}]`], [`RIGHT(S, ${x})`, `"${x > 0 ? s.slice(-x) : ""}"`, `s[-${x}:]`],
        [`MID(S, ${x}, ${y})`, `"${s.substr(x - 1, y)}"`, `s[${x - 1}:${x - 1 + y}]`], [`TO_LOWER(S)`, `"${s.toLowerCase()}"`, `s.lower()`],
        [`ASC(MID(S, 1, 1))`, s ? s.charCodeAt(0) : "—", `ord(s[0])`], [`S & "!"`, `"${s}!"`, `s + "!"`]];
      $("[data-t]", el).innerHTML = `<tr><th>Pseudocode</th><th>Result</th><th>Python</th></tr>` + rows.map(r => `<tr><td><code>${esc(r[0])}</code></td><td><code>${esc(String(r[1]))}</code></td><td><code>${esc(r[2])}</code></td></tr>`).join("");
    }
    $$("input", el).forEach(i => i.oninput = upd); upd();
  }

  traceSim($("#sim-trace")); loopSim($("#sim-loop")); linkSim($("#sim-translate")); patternSim($("#sim-pattern")); strSim($("#sim-str"));
})();

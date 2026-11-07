/* Code Lab: editor component, pseudocode + Python runners, test checker */
(function () {
  "use strict";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Editor (textarea + line numbers) ---------- */
  function createEditor(host, { lang = "pseudo", value = "", storageKey = null, onRun = null, minLines = 16 } = {}) {
    host.classList.add("ed");
    host.innerHTML = `<div class="ed-bar">${lang === "pseudo" ? `<span class="ed-insert">Insert:</span>` + ["←", "&lt;&gt;", "&lt;=", "&gt;=", "&amp;"].map(s => `<button type="button" data-ins="${s}">${s}</button>`).join("") : `<span class="ed-insert">Python 3</span>`}
      <span class="ed-tip">Tab = indent · Ctrl+Enter = run${lang === "pseudo" ? " · typing &lt;- gives ←" : ""}</span></div>
      <div class="ed-body"><pre class="ed-gutter" aria-hidden="true"></pre><textarea class="ed-text" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="${lang === "pseudo" ? "Pseudocode" : "Python"} editor"></textarea></div>`;
    const ta = host.querySelector("textarea"), gut = host.querySelector(".ed-gutter");
    ta.value = (storageKey && store.get(storageKey, null)) ?? value;
    let errLine = 0;
    const lines = () => { const n = Math.max(ta.value.split("\n").length, minLines); let s = ""; for (let i = 1; i <= n; i++) s += (i === errLine ? `<b class="ed-errno">${i}</b>` : i) + "\n"; gut.innerHTML = s; };
    const save = () => { if (storageKey) store.set(storageKey, ta.value); };
    const insert = (txt) => { const s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText(txt, s, e, "end"); ta.focus(); lines(); save(); };
    ta.addEventListener("input", () => {
      if (lang === "pseudo") {
        const p = ta.selectionStart;
        if (ta.value.slice(p - 2, p) === "<-") { ta.setRangeText("←", p - 2, p, "end"); }
      }
      errLine = 0; lines(); save();
    });
    ta.addEventListener("scroll", () => { gut.scrollTop = ta.scrollTop; });
    ta.addEventListener("keydown", e => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        if (s === en && !e.shiftKey) { insert("    "); return; }
        // indent / outdent selected lines
        const start = ta.value.lastIndexOf("\n", s - 1) + 1, block = ta.value.slice(start, en);
        const nb = e.shiftKey ? block.replace(/^ {1,4}/gm, "") : block.replace(/^/gm, "    ");
        ta.setRangeText(nb, start, en, "select"); lines(); save();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); onRun && onRun();
      } else if (e.key === "Enter") {
        const s = ta.selectionStart, ls = ta.value.lastIndexOf("\n", s - 1) + 1, cur = ta.value.slice(ls, s);
        let ind = cur.match(/^\s*/)[0];
        if (lang === "python" && /:\s*$/.test(cur)) ind += "    ";
        if (lang === "pseudo" && /^\s*(FOR|WHILE|REPEAT|THEN|ELSE|PROCEDURE|FUNCTION|CASE)\b/.test(cur) && !/\b(NEXT|ENDWHILE|UNTIL|ENDIF|ENDCASE)\b/.test(cur)) ind += "    ";
        e.preventDefault(); insert("\n" + ind);
      }
    });
    host.querySelectorAll("[data-ins]").forEach(b => b.onclick = () => insert(b.textContent + (b.textContent === "←" ? " " : "")));
    lines();
    return {
      get: () => ta.value,
      set: v => { ta.value = v; errLine = 0; lines(); save(); },
      markError: n => { errLine = n || 0; lines(); if (n) { const pos = ta.value.split("\n").slice(0, n - 1).join("\n").length + (n > 1 ? 1 : 0); ta.focus(); ta.setSelectionRange(pos, pos); const lh = parseFloat(getComputedStyle(ta).lineHeight) || 20; ta.scrollTop = Math.max(0, (n - 4) * lh); } },
      el: ta
    };
  }

  /* ---------- Pseudocode runner ---------- */
  function runPseudo(code, input, files) {
    const t0 = performance.now();
    const r = Pseudo.run(code, { input, files });
    const items = r.out.map(o => ({ kind: o.kind, text: o.text }));
    r.warnings.forEach(w => items.push({ kind: "warn", text: "⚠ " + w }));
    if (!r.ok) items.push({ kind: "err", text: `✖ Error${r.error.line ? " on line " + r.error.line : ""}: ${r.error.message}` });
    const written = Object.entries(r.files).filter(([, f]) => f.written).map(([n, f]) => ({ name: n, text: f.lines.join("\n") }));
    return { items, ok: r.ok, errorLine: r.ok ? 0 : r.error.line, vars: r.vars, written, ms: performance.now() - t0 };
  }

  /* ---------- Python runner (Pyodide in a Web Worker, main-thread fallback) ---------- */
  const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const HARNESS = `
import builtins, sys, traceback, os
def __run(code, lines, files):
    for _n in list(os.listdir(".")):
        try:
            if os.path.isfile(_n): os.remove(_n)
        except Exception: pass
    for _n, _t in files.items():
        with open(_n, "w") as _f: _f.write(_t)
    q = list(lines)
    def _inp(prompt=""):
        if prompt: print(prompt, end="")
        if not q:
            print()
            raise EOFError("input() needs a value but the Input box has run out. Add another line to the Input box.")
        v = q.pop(0); print(v); return v
    builtins.input = _inp
    ns = {"__name__": "__main__"}
    try:
        exec(compile(code, "<your code>", "exec"), ns)
    except SystemExit:
        pass
    except BaseException as e:
        tb = e.__traceback__.tb_next if e.__traceback__ else None
        sys.stderr.write("".join(traceback.format_exception(type(e), e, tb)))
    written = {}
    for _n in os.listdir("."):
        if os.path.isfile(_n) and (_n not in files or open(_n).read() != files[_n]):
            written[_n] = open(_n).read()
    return written
`;
  const WORKER_SRC = `
importScripts("${PYODIDE}pyodide.js");
let py = null;
self.onmessage = async (e) => {
  const { id, code, lines, files } = e.data;
  try {
    if (!py) { self.postMessage({ id, type: "status", text: "Loading Python… (first run only, about 5–10 seconds)" }); py = await loadPyodide({ indexURL: "${PYODIDE}" }); py.runPython(${JSON.stringify(HARNESS)}); self.postMessage({ id, type: "status", text: "" }); }
    py.setStdout({ batched: s => self.postMessage({ id, type: "out", text: s }) });
    py.setStderr({ batched: s => self.postMessage({ id, type: "err", text: s }) });
    const run = py.globals.get("__run");
    const w = run(code, py.toPy(lines), py.toPy(files));
    const written = w.toJs({ dict_converter: Object.fromEntries }); w.destroy && w.destroy(); run.destroy();
    self.postMessage({ id, type: "done", written });
  } catch (err) { self.postMessage({ id, type: "fatal", text: String(err && err.message || err) }); }
};`;
  const PyRunner = {
    worker: null, mainPy: null, mode: null, seq: 0,
    ensureWorker() {
      if (this.worker || this.mode === "main") return;
      try { this.worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }))); this.mode = "worker"; }
      catch (e) { this.mode = "main"; }
    },
    stop() { if (this.worker) { this.worker.terminate(); this.worker = null; this.mode = null; } },
    async loadMain(status) {
      if (this.mainPy) return this.mainPy;
      status && status("Loading Python… (first run only)");
      if (!window.loadPyodide) await new Promise((res, rej) => { const s = document.createElement("script"); s.src = PYODIDE + "pyodide.js"; s.onload = res; s.onerror = () => rej(new Error("Could not download Python. Check the internet connection.")); document.head.appendChild(s); });
      this.mainPy = await loadPyodide({ indexURL: PYODIDE }); this.mainPy.runPython(HARNESS); status && status("");
      return this.mainPy;
    },
    run(code, input, files, { onStatus, timeoutMs = 15000 } = {}) {
      const lines = (input || "").split("\n"); if (lines.length && lines[lines.length - 1] === "") lines.pop();
      this.ensureWorker();
      const items = [];
      if (this.mode === "worker") {
        return new Promise(resolve => {
          const id = ++this.seq, w = this.worker; let loading = false, timer = null;
          const finish = (written, fatal) => {
            clearTimeout(timer); w.removeEventListener("message", onMsg); w.removeEventListener("error", onErr);
            if (fatal) items.push({ kind: "err", text: fatal });
            resolve({ items: splitItems(items), ok: !items.some(i => i.kind === "err"), errorLine: pyErrLine(items), written: Object.entries(written || {}).map(([name, text]) => ({ name, text })) });
          };
          const arm = () => { clearTimeout(timer); timer = setTimeout(() => { this.stop(); finish(null, "✖ Stopped after " + timeoutMs / 1000 + " seconds. Is there an infinite loop?"); }, timeoutMs); };
          const onMsg = e => {
            const m = e.data; if (m.id !== id) return;
            if (m.type === "status") { loading = !!m.text; onStatus && onStatus(m.text); if (!loading) arm(); }
            else if (m.type === "out") items.push({ kind: "out", text: m.text });
            else if (m.type === "err") items.push({ kind: "err", text: m.text });
            else if (m.type === "done") finish(m.written);
            else if (m.type === "fatal") finish(null, "✖ " + m.text);
          };
          const onErr = async ev => {
            // Worker could not start (e.g. opened as a local file) → fall back to the main thread
            ev.preventDefault && ev.preventDefault(); clearTimeout(timer);
            w.removeEventListener("message", onMsg); w.removeEventListener("error", onErr);
            this.worker = null; this.mode = "main";
            resolve(await this.run(code, input, files, { onStatus, timeoutMs }));
          };
          w.addEventListener("message", onMsg); w.addEventListener("error", onErr);
          w.postMessage({ id, code, lines, files: files || {} });
          setTimeout(() => { if (!loading) arm(); }, 300);
        });
      }
      // main-thread mode
      return (async () => {
        try {
          const py = await this.loadMain(onStatus);
          py.setStdout({ batched: s => items.push({ kind: "out", text: s }) });
          py.setStderr({ batched: s => items.push({ kind: "err", text: s }) });
          const run = py.globals.get("__run");
          const w = run(code, py.toPy(lines), py.toPy(files || {}));
          const written = w.toJs({ dict_converter: Object.fromEntries });
          return { items: splitItems(items), ok: !items.some(i => i.kind === "err"), errorLine: pyErrLine(items), written: Object.entries(written).map(([name, text]) => ({ name, text })) };
        } catch (e) { items.push({ kind: "err", text: "✖ " + (e.message || e) }); return { items, ok: false, errorLine: 0, written: [] }; }
      })();
    }
  };
  function splitItems(items) { const out = []; items.forEach(i => String(i.text).split("\n").forEach(t => out.push({ kind: i.kind, text: t }))); while (out.length && out[out.length - 1].text === "" && out[out.length - 1].kind === "err") out.pop(); return out; }
  function pyErrLine(items) { const t = items.filter(i => i.kind === "err").map(i => i.text).join("\n"); const m = [...t.matchAll(/"<your code>", line (\d+)/g)]; return m.length ? +m[m.length - 1][1] : 0; }

  /* ---------- Console rendering ---------- */
  function renderConsole(el, res, { showVars = true } = {}) {
    const lines = res.items.map(i => `<div class="c-${i.kind}">${esc(i.text) || "&nbsp;"}</div>`).join("");
    let extra = "";
    if (res.written && res.written.length) extra += res.written.map(f => `<div class="c-file"><b>📄 ${esc(f.name)}</b> (written by your program)<pre>${esc(f.text)}</pre></div>`).join("");
    el.innerHTML = (lines || `<div class="c-in">(no output)</div>`) + extra;
    if (showVars && res.vars && Object.keys(res.vars).length) {
      el.insertAdjacentHTML("beforeend", `<details class="c-vars"><summary>Variables at the end</summary>${Object.entries(res.vars).map(([k, v]) => `<span>${esc(k)} = ${esc(v)}</span>`).join("")}</details>`);
    }
  }

  /* ---------- Test checking ---------- */
  const norm = s => s.replace(/\s+/g, "").toLowerCase();
  function outputLines(res) { return res.items.filter(i => i.kind === "out").map(i => i.text); }
  function checkOutput(res, expected) {
    const exp = expected.split("\n"), got = outputLines(res);
    let k = 0;
    for (const g of got) { if (k < exp.length && norm(g) === norm(exp[k])) k++; }
    return { pass: res.ok && k === exp.length, matched: k, total: exp.length, got };
  }
  async function runTests(lang, code, tests, files, onStatus) {
    const results = [];
    for (const t of tests) {
      const res = lang === "pseudo" ? runPseudo(code, t.input, files) : await PyRunner.run(code, t.input, files, { onStatus });
      results.push({ test: t, res, ...checkOutput(res, t.output) });
    }
    return results;
  }
  function renderTests(el, results) {
    const passed = results.filter(r => r.pass).length;
    el.innerHTML = `<div class="result-bar"><span class="pill ${passed === results.length ? "good" : passed ? "" : "bad"}">${passed} / ${results.length} tests passed</span></div>` +
      results.map((r, i) => `<details class="q" ${r.pass ? "" : "open"}><summary><span>${r.pass ? "✅" : "❌"} Test ${i + 1}</span><span class="marks">input: ${esc(r.test.input.replace(/\n/g, " ↵ ")) || "(none)"}</span></summary><div class="body">
        <div class="two-col"><div><div class="label">Expected (in this order)</div><pre>${esc(r.test.output)}</pre></div>
        <div><div class="label">Your program printed</div><pre>${esc(r.got.join("\n")) || "(nothing)"}</pre></div></div>
        ${r.res.ok ? "" : `<div class="callout bad">${esc(r.res.items.filter(x => x.kind === "err").map(x => x.text).join("\n"))}</div>`}
        ${!r.pass && r.res.ok ? `<p class="muted">Matched ${r.matched} of ${r.total} expected lines. Check spelling, the loop range and the order of your OUTPUT statements.</p>` : ""}</div></details>`).join("");
    return passed;
  }

  window.CodeLab = { createEditor, runPseudo, PyRunner, renderConsole, runTests, renderTests, checkOutput, esc, store };
})();

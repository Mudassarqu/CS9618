/* 9618 Study Hub — shared behaviour: tabs, highlighting, quiz engines, score saving */
(function () {
  "use strict";
  const CFG = window.SITE_CONFIG || {};
  const LS_NAME = "cs9618_student", LS_SCORES = "cs9618_scores";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- Toast ---------- */
  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ---------- Student name ---------- */
  function studentName() { return (store.get(LS_NAME, "") || "").trim(); }
  function initStudent() {
    $$(".student-name").forEach(inp => {
      inp.value = studentName();
      inp.addEventListener("change", () => { store.set(LS_NAME, inp.value.trim()); $$(".student-name").forEach(o => o.value = inp.value.trim()); toast("Name saved: " + inp.value.trim()); });
    });
  }

  /* ---------- Score saving ---------- */
  function saveScore({ topic, activity, type, score, max, details }) {
    const name = studentName();
    const rec = {
      timestamp: new Date().toISOString(), student: name || "(no name)", topic, activity, type,
      score: Math.round(score * 100) / 100, max, percent: max ? Math.round((score / max) * 1000) / 10 : 0,
      details: details || "", page: location.pathname.split("/").pop()
    };
    const all = store.get(LS_SCORES, []); all.push(rec); store.set(LS_SCORES, all);
    if (!name) toast("Score saved on this device. Enter your name at the top so your teacher receives it.");
    if (CFG.SCORES_ENDPOINT && name) {
      fetch(CFG.SCORES_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(rec) })
        .then(() => toast(`Saved to teacher sheet: ${rec.score}/${max} (${rec.percent}%)`))
        .catch(() => toast("Could not reach the score sheet — saved on this device."));
    } else if (name) toast(`Score saved: ${rec.score}/${max} (${rec.percent}%)`);
    renderScoreTables();
    return rec;
  }
  function renderScoreTables() {
    $$("[data-score-table]").forEach(el => {
      const all = store.get(LS_SCORES, []).slice().reverse();
      if (!all.length) { el.innerHTML = '<p class="muted">No scores yet on this device.</p>'; return; }
      el.innerHTML = '<div class="table-wrap"><table class="scores-table"><tr><th>Date</th><th>Student</th><th>Topic</th><th>Activity</th><th>Score</th><th>%</th></tr>' +
        all.slice(0, 60).map(r => `<tr><td>${new Date(r.timestamp).toLocaleString()}</td><td>${esc(r.student)}</td><td>${esc(r.topic)}</td><td>${esc(r.activity)}</td><td>${r.score}/${r.max}</td><td>${r.percent}%</td></tr>`).join("") +
        "</table></div>";
    });
  }

  /* ---------- Tabs (top level + sub tabs), remembered in URL hash ---------- */
  function initTabs() {
    $$("[data-tabs]").forEach(bar => {
      const group = bar.dataset.tabs, buttons = $$("button[data-tab]", bar);
      const show = (id, push) => {
        buttons.forEach(b => b.setAttribute("aria-selected", b.dataset.tab === id ? "true" : "false"));
        $$(`[data-panel-group="${group}"]`).forEach(p => p.hidden = p.dataset.panel !== id);
        if (push && bar.classList.contains("tabs")) history.replaceState(null, "", "#" + id);
        if (bar.classList.contains("tabs")) window.scrollTo({ top: 0, behavior: "smooth" });
      };
      buttons.forEach(b => { b.setAttribute("role", "tab"); b.addEventListener("click", () => show(b.dataset.tab, true)); });
      const fromHash = location.hash.slice(1);
      const start = bar.classList.contains("tabs") && buttons.some(b => b.dataset.tab === fromHash) ? fromHash : buttons[0].dataset.tab;
      show(start, false);
    });
    $$("a[data-goto]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); const b = $(`.tabs button[data-tab="${a.dataset.goto}"]`); if (b) b.click(); }));
  }

  /* ---------- Code highlighting (pseudocode + python) ---------- */
  const PSEUDO_KW = "DECLARE|CONSTANT|INPUT|OUTPUT|IF|THEN|ELSE|ENDIF|CASE|OF|OTHERWISE|ENDCASE|FOR|TO|STEP|NEXT|REPEAT|UNTIL|WHILE|DO|ENDWHILE|PROCEDURE|ENDPROCEDURE|FUNCTION|ENDFUNCTION|RETURNS|RETURN|CALL|BYREF|BYVAL|AND|OR|NOT|MOD|DIV|INTEGER|REAL|STRING|CHAR|BOOLEAN|DATE|ARRAY|TRUE|FALSE|OPENFILE|READFILE|WRITEFILE|CLOSEFILE|READ|WRITE|APPEND|TYPE|ENDTYPE";
  const PY_KW = "def|return|if|elif|else|for|in|range|while|print|input|int|float|str|len|and|or|not|True|False|None|open|with|as|import|break|continue|global";
  function highlight(code, lang) {
    const kw = new RegExp("\\b(" + (lang === "python" ? PY_KW : PSEUDO_KW) + ")\\b", "g");
    const cm = lang === "python" ? /#.*$/ : /\/\/.*$/;
    return code.split("\n").map(line => {
      let comment = "", m = line.match(cm);
      // avoid treating # inside strings as comment
      if (m && (line.slice(0, m.index).split('"').length % 2 === 1)) { comment = line.slice(m.index); line = line.slice(0, m.index); } else m = null;
      const parts = line.split(/("[^"]*"|'[^']*')/);
      const out = parts.map((p, i) => i % 2 ? `<span class="st">${esc(p)}</span>` :
        esc(p).replace(kw, '<span class="kw">$1</span>').replace(/\b(\d+(\.\d+)?)\b/g, '<span class="nu">$1</span>')).join("");
      return out + (comment ? `<span class="cm">${esc(comment)}</span>` : "");
    }).join("\n");
  }
  function initHighlight(root = document) {
    $$("pre[data-lang]", root).forEach(pre => { if (pre.dataset.hl) return; pre.innerHTML = highlight(pre.textContent.replace(/^\n/, ""), pre.dataset.lang); pre.dataset.hl = 1; });
  }

  /* ---------- Kahoot-style quiz ---------- */
  function kahoot(el, { title, topic, questions, seconds = 20 }) {
    const shapes = ["▲", "◆", "●", "■"];
    let qs, i, pts, correct, timer, t0, answered;
    const start = () => { qs = shuffle(questions); i = 0; pts = 0; correct = 0; render(); };
    function render() {
      if (i >= qs.length) return finish();
      const q = qs[i]; answered = false;
      const opts = q.options.map((o, k) => ({ o, k }));
      el.innerHTML = `<div class="kahoot"><div class="k-top"><span class="pill">Question ${i + 1} / ${qs.length}</span><span class="k-score">${pts} pts</span></div>
        <div class="k-timer"><i></i></div><div class="k-q">${q.q}</div>
        <div class="k-opts">${opts.map(({ o, k }) => `<button class="k-opt" data-k="${k}"><span class="shape">${shapes[k]}</span><span>${o}</span></button>`).join("")}</div>
        <div class="k-feedback"></div><div class="btn-row" style="justify-content:center"></div></div>`;
      initHighlight(el);
      const bar = $(".k-timer i", el); t0 = performance.now();
      timer = setInterval(() => { const left = Math.max(0, 1 - (performance.now() - t0) / (seconds * 1000)); bar.style.width = left * 100 + "%"; if (left <= 0) choose(-1); }, 100);
      $$(".k-opt", el).forEach(b => b.addEventListener("click", () => choose(+b.dataset.k)));
    }
    function choose(k) {
      if (answered) return; answered = true; clearInterval(timer);
      const q = qs[i], ok = k === q.answer, elapsed = (performance.now() - t0) / 1000;
      if (ok) { correct++; pts += Math.round(1000 * (1 - Math.min(elapsed, seconds) / seconds / 2)); }
      $$(".k-opt", el).forEach(b => { const kk = +b.dataset.k; if (kk === q.answer) b.classList.add("right"); else b.classList.add("dim"); });
      $(".k-feedback", el).innerHTML = (k === -1 ? "⏰ Time's up! " : ok ? "✅ Correct! " : "❌ Not quite. ") + (q.why ? `<div class="muted" style="font-weight:400">${q.why}</div>` : "");
      $(".k-top .k-score", el).textContent = pts + " pts";
      const nb = document.createElement("button"); nb.className = "btn primary"; nb.textContent = i + 1 < qs.length ? "Next question →" : "See results";
      nb.onclick = () => { i++; render(); }; $(".btn-row", el).appendChild(nb); nb.focus();
    }
    function finish() {
      el.innerHTML = `<div class="kahoot" style="text-align:center"><h3>🏆 ${esc(title)} — finished</h3>
        <p class="k-score">${correct} / ${qs.length} correct · ${pts} points</p>
        <div class="btn-row" style="justify-content:center"><button class="btn primary">Play again</button></div></div>`;
      $("button", el).onclick = start;
      saveScore({ topic, activity: title, type: "Kahoot quiz", score: correct, max: qs.length, details: pts + " points" });
    }
    el.innerHTML = `<div class="kahoot" style="text-align:center"><h3>${esc(title)}</h3><p class="muted">${questions.length} questions · ${seconds} seconds each · faster answers score more points</p><button class="btn primary">Start</button></div>`;
    $("button", el).onclick = start;
  }

  /* ---------- Match the columns ---------- */
  function matcher(el, { title, topic, pairs }) {
    let left, right, sel, done, attempts;
    const start = () => {
      left = shuffle(pairs.map((p, i) => ({ t: p[0], i }))); right = shuffle(pairs.map((p, i) => ({ t: p[1], i })));
      sel = null; done = new Set(); attempts = 0; render();
    };
    function render() {
      el.innerHTML = `<p class="muted">${esc(title)} — click an item on the left, then its match on the right.</p>
        <div class="match"><div class="col">${left.map(x => `<button data-side="L" data-i="${x.i}" class="${done.has(x.i) ? "done" : ""}">${x.t}</button>`).join("")}</div>
        <div class="col">${right.map(x => `<button data-side="R" data-i="${x.i}" class="${done.has(x.i) ? "done" : ""}">${x.t}</button>`).join("")}</div></div>
        <div class="result-bar"><span class="pill">Matched ${done.size}/${pairs.length}</span><span class="pill">Attempts ${attempts}</span><button class="btn" data-reset>Shuffle & restart</button></div>`;
      initHighlight(el);
      $("[data-reset]", el).onclick = start;
      $$(".match button", el).forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.i; if (done.has(i)) return;
        if (b.dataset.side === "L") { $$('[data-side="L"]', el).forEach(x => x.classList.remove("sel")); b.classList.add("sel"); sel = i; return; }
        if (sel === null) { toast("Pick an item on the left first"); return; }
        attempts++;
        if (sel === i) { done.add(i); sel = null; render(); if (done.size === pairs.length) finish(); }
        else { b.classList.add("wrong"); setTimeout(() => b.classList.remove("wrong"), 500); $(".result-bar .pill:nth-child(2)", el).textContent = "Attempts " + attempts; }
      }));
    }
    function finish() {
      const score = Math.max(0, pairs.length - (attempts - pairs.length) * 0.5);
      $(".result-bar", el).insertAdjacentHTML("afterbegin", `<span class="pill good">Complete! Score ${score}/${pairs.length}</span>`);
      saveScore({ topic, activity: title, type: "Match the columns", score, max: pairs.length, details: attempts + " attempts" });
    }
    start();
  }

  /* ---------- Flashcards ---------- */
  function flashcards(el, { cards }) {
    let order = cards.map((_, i) => i), i = 0;
    function render() {
      const c = cards[order[i]];
      el.innerHTML = `<div class="flash-stage"><span class="pill">Card ${i + 1} / ${cards.length}</span>
        <div class="flash" tabindex="0" aria-label="Flashcard, press to flip"><div class="flash-inner"><div class="flash-face flash-front">${c[0]}</div><div class="flash-face flash-back"><div>${c[1]}</div></div></div></div>
        <div class="btn-row"><button class="btn" data-a="prev">← Prev</button><button class="btn primary" data-a="flip">Flip</button><button class="btn" data-a="next">Next →</button><button class="btn" data-a="shuf">Shuffle</button></div></div>`;
      initHighlight(el);
      const f = $(".flash", el), flip = () => f.classList.toggle("flipped");
      f.onclick = flip; f.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } };
      $$("[data-a]", el).forEach(b => b.onclick = () => {
        const a = b.dataset.a;
        if (a === "flip") flip(); if (a === "next") { i = (i + 1) % cards.length; render(); }
        if (a === "prev") { i = (i - 1 + cards.length) % cards.length; render(); }
        if (a === "shuf") { order = shuffle(order); i = 0; render(); }
      });
    }
    render();
  }

  /* ---------- Fill in the blanks ---------- */
  // items: [{text:"Use ___ to assign", answers:[["←","<-"]]}]
  function blanks(el, { title, topic, items }) {
    const norm = s => s.trim().replace(/\s+/g, " ").toUpperCase();
    el.innerHTML = items.map((it, n) => {
      let k = 0;
      const html = esc(it.text).replace(/___/g, () => `<input type="text" data-n="${n}" data-k="${k++}" autocomplete="off" spellcheck="false">`);
      return `<div class="blank-item"><b>${n + 1}.</b> ${html}${it.hint ? `<div class="muted" style="font-size:.85rem">Hint: ${esc(it.hint)}</div>` : ""}</div>`;
    }).join("") + `<div class="result-bar"><button class="btn primary" data-check>Check answers</button><button class="btn" data-show>Show answers</button><span data-res></span></div>`;
    $("[data-check]", el).onclick = () => {
      let right = 0, total = 0;
      $$("input", el).forEach(inp => {
        const acc = items[+inp.dataset.n].answers[+inp.dataset.k]; total++;
        const ok = acc.some(a => norm(a) === norm(inp.value)); if (ok) right++;
        inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok);
      });
      $("[data-res]", el).innerHTML = `<span class="pill ${right === total ? "good" : ""}">${right} / ${total} correct</span>`;
      saveScore({ topic, activity: title, type: "Fill in the blanks", score: right, max: total });
    };
    $("[data-show]", el).onclick = () => $$("input", el).forEach(inp => { inp.value = items[+inp.dataset.n].answers[+inp.dataset.k][0]; inp.classList.remove("no"); });
  }

  /* ---------- Exam-style questions with self-marking against mark points ---------- */
  // q: {id, title, marks, prompt(html), points:[...], model(html), lang?}
  function examQuestions(el, { title, topic, questions }) {
    el.innerHTML = questions.map((q, n) => `
      <details class="q" data-q="${n}"><summary><span>${esc(q.title)}</span><span class="marks">[${q.marks} mark${q.marks > 1 ? "s" : ""}]</span></summary><div class="body">
        <div>${q.prompt}</div>
        <label class="muted" style="font-size:.85rem">Your answer:</label>
        <textarea data-ans placeholder="Write your answer here, exactly as you would in the exam…"></textarea>
        <div class="btn-row"><button class="btn primary" data-reveal>Reveal mark scheme & self-mark</button></div>
        <div data-ms hidden>
          <h4>Mark scheme — tick each point your answer contains</h4>
          <ul class="mp-list">${q.points.map((p, k) => `<li><input type="checkbox" id="mp-${q.id}-${k}"><label for="mp-${q.id}-${k}">${p}</label></li>`).join("")}</ul>
          ${q.maxNote ? `<p class="muted" style="font-size:.85rem">${q.maxNote}</p>` : ""}
          <h4>Model answer</h4>${q.model}
          <div class="result-bar"><button class="btn primary" data-save>Save my mark</button><span data-res></span></div>
        </div></div></details>`).join("") + `<div class="result-bar"><span class="pill" data-total>Total so far: 0 / ${questions.reduce((a, q) => a + q.marks, 0)}</span></div>`;
    initHighlight(el);
    const got = {};
    $$("details.q", el).forEach(d => {
      const q = questions[+d.dataset.q];
      $("[data-reveal]", d).onclick = () => { $("[data-ms]", d).hidden = false; };
      $("[data-save]", d).onclick = () => {
        const ticked = $$(".mp-list input:checked", d).length, score = Math.min(q.marks, ticked);
        got[q.id] = score;
        $("[data-res]", d).innerHTML = `<span class="pill ${score === q.marks ? "good" : ""}">${score} / ${q.marks}</span>`;
        const tot = Object.values(got).reduce((a, b) => a + b, 0);
        $("[data-total]", el).textContent = `Total so far: ${tot} / ${questions.reduce((a, q) => a + q.marks, 0)}`;
        saveScore({ topic, activity: title + " — " + q.title, type: "Exam-style question", score, max: q.marks, details: $("[data-ans]", d).value.slice(0, 1500) });
      };
    });
  }

  /* ---------- Short answer quiz (type, then compare & self-assess) ---------- */
  function shortAnswer(el, { title, topic, items }) {
    el.innerHTML = items.map((it, n) => `<div class="blank-item" data-n="${n}"><b>${n + 1}. ${it.q}</b>
      <textarea style="min-height:70px;font-family:var(--sans)" placeholder="Type your answer"></textarea>
      <div class="btn-row"><button class="btn" data-show>Check</button></div>
      <div data-a hidden><div class="callout tip">${it.a}</div>
      <div class="btn-row"><span class="muted">Did you get it?</span><button class="btn" data-y>✔ Yes</button><button class="btn" data-n2>✘ No</button></div></div></div>`).join("") +
      `<div class="result-bar"><span class="pill" data-tot>0 / ${items.length}</span><button class="btn primary" data-save>Save score</button></div>`;
    initHighlight(el);
    const res = {};
    const upd = () => { $("[data-tot]", el).textContent = Object.values(res).filter(Boolean).length + " / " + items.length; };
    $$("[data-n]", el).forEach(box => {
      const n = +box.dataset.n;
      $("[data-show]", box).onclick = () => { $("[data-a]", box).hidden = false; };
      $("[data-y]", box).onclick = () => { res[n] = true; box.style.borderColor = "var(--good)"; upd(); };
      $("[data-n2]", box).onclick = () => { res[n] = false; box.style.borderColor = "var(--bad)"; upd(); };
    });
    $("[data-save]", el).onclick = () => saveScore({ topic, activity: title, type: "Short answer", score: Object.values(res).filter(Boolean).length, max: items.length });
  }

  /* ---------- Key term search ---------- */
  function initTermSearch() {
    $$("[data-term-search]").forEach(inp => {
      const box = document.getElementById(inp.dataset.termSearch);
      inp.addEventListener("input", () => { const q = inp.value.toLowerCase(); $$(".term", box).forEach(t => t.hidden = !t.textContent.toLowerCase().includes(q)); });
    });
  }

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    const saved = store.get("cs9618_theme", null); if (saved) document.documentElement.dataset.theme = saved;
    $$("[data-theme-toggle]").forEach(b => b.onclick = () => {
      const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const nx = cur === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = nx; store.set("cs9618_theme", nx);
    });
  }

  window.Hub = { kahoot, matcher, flashcards, blanks, examQuestions, shortAnswer, saveScore, highlight, initHighlight, toast, esc, $, $$, store };
  document.addEventListener("DOMContentLoaded", () => { initTheme(); initStudent(); initTabs(); initHighlight(); initTermSearch(); renderScoreTables(); });
})();

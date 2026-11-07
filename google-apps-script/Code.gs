/**
 * 9618 Study Hub — score collector
 * Paste into Extensions → Apps Script of a Google Sheet, then Deploy → New deployment → Web app.
 * Execute as: Me · Who has access: Anyone
 * Creates/uses three tabs:  Scores (raw log) · Summary (per student per activity, best + latest) · Students (overall)
 */
const SCORES = "Scores", SUMMARY = "Summary", STUDENTS = "Students";
const HEADERS = ["Timestamp", "Student", "Topic", "Activity", "Type", "Score", "Max", "Percent", "Details", "Page"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sh = sheet_(SCORES, HEADERS);
    sh.appendRow([
      d.timestamp ? new Date(d.timestamp) : new Date(),
      clean_(d.student), clean_(d.topic), clean_(d.activity), clean_(d.type),
      Number(d.score) || 0, Number(d.max) || 0, (Number(d.percent) || 0) / 100,
      clean_(d.details).slice(0, 4000), clean_(d.page)
    ]);
    sh.getRange(sh.getLastRow(), 8).setNumberFormat("0.0%");
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the web-app URL in a browser to check it is live.
function doGet() {
  return json_({ ok: true, message: "9618 score collector is running" });
}

/** Run once from the editor (▶ setup) to create the tabs and formula summaries. */
function setup() {
  sheet_(SCORES, HEADERS);
  const sum = sheet_(SUMMARY, []);
  sum.clear();
  sum.getRange("A1").setFormula(
    '=QUERY(Scores!A:J,"select B, C, D, count(F), max(H), avg(H) where B is not null and B <> \'Student\' group by B, C, D order by B, C, D label count(F) \'Attempts\', max(H) \'Best %\', avg(H) \'Average %\'",1)'
  );
  sum.getRange("E:F").setNumberFormat("0.0%");
  const st = sheet_(STUDENTS, []);
  st.clear();
  st.getRange("A1").setFormula(
    '=QUERY(Scores!A:J,"select B, count(F), sum(F), sum(G), avg(H), max(A) where B is not null and B <> \'Student\' group by B order by B label count(F) \'Attempts\', sum(F) \'Marks gained\', sum(G) \'Marks available\', avg(H) \'Average %\', max(A) \'Last active\'",1)'
  );
  st.getRange("E:E").setNumberFormat("0.0%");
  SpreadsheetApp.getActive().toast("Score sheet ready. Now deploy as a Web app.");
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers.length && sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e3e9fd");
    sh.setFrozenRows(1);
  }
  return sh;
}
function clean_(v) { return String(v == null ? "" : v).replace(/^[=+\-@]/, "'$&"); } // stop formula injection
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

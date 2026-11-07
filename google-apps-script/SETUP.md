# Connect the website to a Google Sheet (about 5 minutes)

1. Create a new Google Sheet, for example **"9618 Scores"**.
2. Open **Extensions → Apps Script**. Delete the sample code, paste in everything from `Code.gs`, and click **Save**.
3. Pick **setup** from the function drop-down and click **▶ Run**. Approve the permissions. This creates three tabs:
   - **Scores**: one row for every quiz or question attempt (student, activity, score, max, %, the student's written answer)
   - **Summary**: each student × activity, with attempts, best % and average %
   - **Students**: each student's attempts, marks gained out of marks available, average % and when they were last active
4. Click **Deploy → New deployment → Select type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
5. Open `assets/config.js` in the website folder and paste the URL:
   ```js
   SCORES_ENDPOINT: "https://script.google.com/macros/s/XXXX/exec",
   ```
6. Open the site, type a name in the **Name** box at the top, and do a quiz. A new row should appear in **Scores** within a few seconds.

## Notes
- Scores are always kept in the browser too (the **My scores** page), so nothing is lost while offline.
- If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**. The URL stays the same.
- Paste the web app URL into a browser tab to check it is live. It should reply `{"ok":true,...}`.
- The site sends data in `no-cors` mode, so the browser cannot confirm the sheet received it. Check the sheet to be sure.

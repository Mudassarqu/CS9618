# 9618 Computer Science Study Hub

A static revision website for Cambridge International AS & A Level Computer Science (9618).

## Open it
- **Locally:** double-click `index.html`. It needs an internet connection only for Google Fonts and for sending scores.
- **GitHub Pages:** push this folder to a repo, then turn on Settings → Pages → *Deploy from branch* (root).

## Structure
```
index.html                          landing page with every topic by paper
scores.html                         scores saved on this device
assets/style.css, app.js            shared design, tabs, quiz engines, score saving
assets/config.js                    paste the Google Apps Script URL here
topics/pseudocode-python.html       module 1 (Ch 9, 11, plus arrays and files from Ch 10)
topics/pseudocode-python-data.js    key terms, textbook answers, practice, quizzes
topics/pseudocode-python-sims.js    simulations
google-apps-script/                 Code.gs + SETUP.md for the score sheet
```

## Adding the next topic
Copy `topics/pseudocode-python.html` and its two `.js` files, rename them, and replace the content. Then change the matching card in `index.html` from "Coming soon" to a link.

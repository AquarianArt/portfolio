# Charles Perez — Portfolio Website

A responsive one-page portfolio website using HTML, CSS, vanilla JavaScript, Google Fonts (Poppins), and Google Apps Script.

## Files
- `index.html` — page content and sections
- `styles.css` — black/blue visual theme and responsive layouts
- `script.js` — navigation, 5-slide carousel, contact form submission
- `assets/e-commerce-website-design.png` — your uploaded portfolio sample
- `apps-script/Code.gs` — stores contact inquiries in Google Sheets and emails `charles.perez1984@gmail.com`

## Preview locally
Open `index.html` in a browser. For a local server, open a terminal in this folder and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Connect the contact form to Google Apps Script
1. Sign in to the Google account where you want to receive inquiries.
2. Create a Google Sheet, or allow the script to create one automatically.
3. In the Sheet, choose **Extensions → Apps Script**. You can also visit `https://script.google.com/` and create a standalone project.
4. Replace the editor contents with `apps-script/Code.gs` and save.
5. Select **Deploy → New deployment → Web app**.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then deploy.
7. Approve the requested Google permissions. Copy the deployed Web app URL ending in `/exec`.
8. Open `script.js` and replace:
   `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
   with your deployed URL.
9. Save and redeploy/refresh your website. Submit a test inquiry and verify both the email and the `Portfolio Inquiries` Google Sheet.

The Apps Script creates a spreadsheet named **Charles Perez — Portfolio Inquiries** on the first successful submission if no spreadsheet ID has been saved. You can find it in Google Drive.

## Important
- Apps Script deployment access set to **Anyone** is required for a public website form. Keep the script limited to this contact-form purpose; do not add sensitive data to the form.
- The browser uses `no-cors` when posting to Apps Script. Browsers do not expose the response body in this mode, so the on-page confirmation means the request was dispatched, not proof that the email was delivered. Verify the first test in Gmail and Google Sheets.
- If you change the Apps Script code after deployment, update the deployment to a new version.
- Only one actual work sample was supplied. The other four carousel slides are clearly marked as concept previews. Replace them with real project images as you collect more portfolio work.
- Update any wording, services, and experience details to match your current availability before publishing.

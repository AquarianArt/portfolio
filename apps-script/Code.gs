/**
 * Portfolio contact form handler.
 * Emails each inquiry to TO_EMAIL and logs it in a Google Sheet.
 */
const TO_EMAIL = "charles.perez1984@gmail.com";
const SHEET_TITLE = "Charles Perez — Portfolio Inquiries";
const TAB_NAME = "Portfolio Inquiries";

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || "";
    let data;
    try { data = JSON.parse(raw); } catch (_) { data = (e && e.parameter) || {}; }

    const name = clean(data.name, 100);
    const email = clean(data.email, 160);
    const service = clean(data.service, 100);
    const message = clean(data.message, 5000);

    if (!name || !email || !message) return reply({ ok: false, error: "Missing required fields" });

    // 1) Send the email first so a spreadsheet problem can never block it.
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const mail = {
      to: TO_EMAIL,
      subject: "New portfolio inquiry from " + name,
      name: "AquarianArt Website",
      body:
        "You have a new inquiry from your portfolio website.\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Service: " + service + "\n\n" +
        "Message:\n" + message + "\n"
    };
    if (validEmail) mail.replyTo = email;
    MailApp.sendEmail(mail);

    // 2) Log to Google Sheets (non-fatal if it fails).
    try {
      const sheet = getSheet_();
      sheet.appendRow([new Date(), name, email, service, message]);
    } catch (sheetErr) {
      console.error("Sheet error: " + sheetErr);
    }

    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: String(err) });
  }
}

// Visiting the /exec URL in a browser should show this message.
function doGet() {
  return reply({ ok: true, message: "Contact endpoint is running" });
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SPREADSHEET_ID");
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(SHEET_TITLE);
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
    sheet.appendRow(["Timestamp", "Name", "Email", "Service", "Message"]);
  }
  return sheet;
}

function clean(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 500);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this ONCE from the editor (select it in the function dropdown, press Run)
 * to grant the email + spreadsheet permissions and send yourself a test email.
 */
function authorizeAndTest() {
  MailApp.sendEmail(TO_EMAIL, "Contact form test", "If you got this, email sending works.");
  getSheet_();
  console.log("Authorized. Check your inbox.");
}

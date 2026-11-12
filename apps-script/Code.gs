/**
 * Charles Perez Portfolio — Google Apps Script contact endpoint
 * 1) Create a Google Sheet (or let this script create one on first use).
 * 2) Paste this file into Extensions > Apps Script.
 * 3) Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 4) Copy the Web app URL into APPS_SCRIPT_URL in script.js.
 *
 * The script saves each inquiry in a spreadsheet and emails the owner.
 */
const OWNER_EMAIL = "charles.perez1984@gmail.com";
const SHEET_NAME = "Portfolio Inquiries";

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!data.name || !data.email || !data.service || !data.message) {
      return jsonOutput({ ok: false, message: "Please complete all required fields." });
    }
    if (String(data.name).length > 100 || String(data.email).length > 160 ||
        String(data.message).length > 5000) {
      return jsonOutput({ ok: false, message: "Submitted content is too long." });
    }

    const sheet = getOrCreateSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Email", "Service", "Message"]);
      sheet.setFrozenRows(1);
    }
    const safe = value => String(value || "").replace(/[\r\n]+/g, " ").trim();
    sheet.appendRow([new Date(), safe(data.name), safe(data.email), safe(data.service), String(data.message).trim()]);

    const subject = "New portfolio inquiry — " + safe(data.service);
    const body =
      "You received a new message through your portfolio website.\n\n" +
      "Name: " + safe(data.name) + "\n" +
      "Email: " + safe(data.email) + "\n" +
      "Service: " + safe(data.service) + "\n\n" +
      "Project details:\n" + String(data.message).trim() + "\n\n" +
      "Reply directly to: " + safe(data.email);
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: subject,
      body: body,
      replyTo: safe(data.email)
    });
    return jsonOutput({ ok: true, message: "Inquiry received." });
  } catch (err) {
    console.error(err);
    return jsonOutput({ ok: false, message: "Unable to process inquiry." });
  }
}

function getOrCreateSheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("INQUIRY_SPREADSHEET_ID");
  let spreadsheet;
  if (id) {
    spreadsheet = SpreadsheetApp.openById(id);
  } else {
    spreadsheet = SpreadsheetApp.create("Charles Perez — Portfolio Inquiries");
    props.setProperty("INQUIRY_SPREADSHEET_ID", spreadsheet.getId());
  }
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT (GAS) UNTUK SINKRONISASI OTOMATIS KE DASHBOARD LIMBAHAPP (GFORMS)
 * =========================================================================================
 * 
 * Petunjuk Pemasangan:
 * 1. Buka masing-masing Google Sheet (Limbah Domestik & Limbah B3).
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'.
 * 3. Hapus kode default (jika ada), lalu tempelkan (paste) kode script di bawah ini.
 * 4. Ganti WEBHOOK_BASE_URL dengan URL server aplikasi Anda (misal ngrok / domain hosting / IP server).
 * 5. Klik icon Disket (Save / Simpan).
 * 6. Klik menu icon Jam di sebelah kiri (Triggers / Pemicu) -> Klik '+ Add Trigger' (+ Tambahkan Pemicu):
 *    - Pilih fungsi yang akan dijalankan: onFormSubmitB3 (untuk sheet B3) ATAU onFormSubmitDomestic (untuk sheet Domestik)
 *    - Pilih sumber acara: 'From spreadsheet' (Dari spreadsheet)
 *    - Pilih jenis acara: 'On form submit' (Saat mengirim formulir)
 * 7. Simpan dan beri izin akses saat diminta Google.
 * =========================================================================================
 */

// Ganti dengan URL domain atau tunneling (ngrok/Cloudflare Tunnel) web app Anda
const WEBHOOK_BASE_URL = "http://127.0.0.1:8080"; // Contoh: "https://your-domain.com" atau "https://xxxx.ngrok-free.app"

/**
 * 1. TRIGGER UNTUK SPREADSHEET LIMBAH B3
 */
function onFormSubmitB3(e) {
  try {
    const sheet = e ? e.range.getSheet() : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const row = e ? e.range.getRow() : sheet.getLastRow();
    
    // Ambil header di baris ke-1
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const rowData = {};
    for (let i = 0; i < headers.length; i++) {
      rowData[headers[i].trim()] = values[i];
    }
    
    // Mapping field sesuai header di Sheet B3
    const payload = {
      timestamp: rowData["Timestamp"] || "",
      tanggal: rowData["Tanggal Masuk/Keluar"] || "",
      jenis_pergerakan: rowData["Jenis Pergerakan"] || "IN",
      nama_limbah: rowData["Nama Limbah B3"] || "",
      sumber: rowData["Sumber / Area Asal Limbah"] || "",
      berat_kg: rowData["Berat (kg)"] || 0,
      tujuan: rowData["Tujuan / Pihak Ketiga (jika OUT)"] || "",
      nomor_manifest: rowData["Nomor Manifest (jika OUT)"] || "",
      catatan: rowData["Catatan Tambahan"] || "",
      foto: rowData["Foto"] || ""
    };
    
    sendWebhookPayload(WEBHOOK_BASE_URL + "/api/sync/b3", payload);
  } catch (err) {
    Logger.log("Error onFormSubmitB3: " + err.toString());
  }
}

/**
 * 2. TRIGGER UNTUK SPREADSHEET LIMBAH DOMESTIK
 */
function onFormSubmitDomestic(e) {
  try {
    const sheet = e ? e.range.getSheet() : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const row = e ? e.range.getRow() : sheet.getLastRow();
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const rowData = {};
    for (let i = 0; i < headers.length; i++) {
      rowData[headers[i].trim()] = values[i];
    }
    
    // Kirim seluruh rowData langsung, backend Laravel akan otomatis memetakan detail Pagi & Siang
    const payload = {
      timestamp: rowData["Timestamp"] || "",
      tanggal: rowData["Tanggal"] || "",
      ...rowData
    };
    
    sendWebhookPayload(WEBHOOK_BASE_URL + "/api/sync/domestic", payload);
  } catch (err) {
    Logger.log("Error onFormSubmitDomestic: " + err.toString());
  }
}

/**
 * Helper pengirim HTTP POST request
 */
function sendWebhookPayload(url, payload) {
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  Logger.log("Response [" + response.getResponseCode() + "]: " + response.getContentText());
}

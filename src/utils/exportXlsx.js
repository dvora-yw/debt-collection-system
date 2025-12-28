import * as XLSX from 'xlsx';

/**
 * Export an array of objects to an .xlsx file and trigger download in the browser.
 * @param {string} filename - e.g. 'clients.xlsx'
 * @param {Array<object>} data - array of objects (rows). Keys become column headers.
 * @param {string} sheetName - optional, defaults to 'Sheet1'
 */
export function exportToXlsx(filename, data, sheetName = 'Sheet1') {
  if (!Array.isArray(data)) data = [];
  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // Write file and trigger download
  XLSX.writeFile(workbook, filename);
}

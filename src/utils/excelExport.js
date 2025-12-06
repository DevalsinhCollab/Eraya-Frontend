import * as XLSX from 'xlsx';

/**
 * Export data to Excel file with totals row
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the Excel file (without extension)
 * @param {String} sheetName - Name of the sheet
 * @param {Array} columns - Array of column configurations (optional)
 */
export const exportToExcel = (data, fileName, sheetName = 'Sheet1', columns = null) => {
  try {
    // Prepare the data
    let exportData = data;
    let columnHeaders = [];
    
    // If columns are specified, only export those fields
    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
          const fieldKey = col.field || col.key;
          const headerName = col.headerName || col.label || fieldKey;
          newRow[headerName] = row[fieldKey] || '';
        });
        return newRow;
      });
      columnHeaders = columns.map(col => col.headerName || col.label || col.field);
    } else {
      if (exportData.length > 0) {
        columnHeaders = Object.keys(exportData[0]);
      }
    }

    // Create totals row
    const totalsRow = {};
    columnHeaders.forEach(header => {
      totalsRow[header] = null;
    });

    // Calculate totals for numeric columns
    columnHeaders.forEach(header => {
      const values = exportData.map(row => row[header]);
      const numericValues = values.filter(val => typeof val === 'number' && !isNaN(val));
      
      if (numericValues.length > 0) {
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        totalsRow[header] = sum;
      }
    });

    // Add totals row label in the first column
    const firstColumn = columnHeaders[0];
    totalsRow[firstColumn] = 'TOTAL';

    // Combine data with totals row
    const finalData = [...exportData, totalsRow];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Auto-adjust column widths
    const colWidths = [];
    if (columnHeaders.length > 0) {
      columnHeaders.forEach((header) => {
        colWidths.push({ wch: Math.max(header.length, 15) });
      });
      ws['!cols'] = colWidths;
    }

    // Style the totals row (make it bold and add background)
    const totalRowIndex = exportData.length + 1; // +1 for header row
    columnHeaders.forEach((header, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: colIndex });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFD3D3D3' } }, // Light gray background
          alignment: { horizontal: 'right' }
        };
      }
    });

    // Generate file and trigger download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export data to Excel');
  }
};

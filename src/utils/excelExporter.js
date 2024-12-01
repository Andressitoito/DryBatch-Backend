const ExcelJS = require('exceljs');

async function exportProductData(product) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Product Data');

  // Add column headers
  worksheet.columns = [
    { header: 'Batch ID', key: 'id' },
    { header: 'Container Name', key: 'containerName' },
    { header: 'Initial Gross Weight', key: 'initialGrossWeight' },
    // Add more columns as necessary
  ];

  // Add rows from product batches
  product.Batches.forEach((batch) => {
    worksheet.addRow(batch);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { exportProductData };
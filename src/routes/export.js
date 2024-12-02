const express = require('express');
const excelExporter = require('../utils/excelExporter');
const Product = require('../models/Product');
const Measurement = require('../models/Measurement');

const router = express.Router();

// Export product data to Excel
router.get('/product/:productId', async (req, res) => {
  try {
    // Find product by primary key, including associated measurements
    const product = await Product.findByPk(req.params.productId, { include: Measurement });
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    // Export product data to an Excel file
    const excelFile = await excelExporter.exportProductData(product);
    res.attachment('product_data.xlsx');
    res.send(excelFile);
  } catch (error) {
    console.error('Error exporting product data:', error);
    res.status(500).send('Error exporting product data');
  }
});

module.exports = router;

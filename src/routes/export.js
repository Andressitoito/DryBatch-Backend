const express = require('express');
const excelExporter = require('../utils/excelExporter');
const { Product, Batch } = require('../models');

const router = express.Router();

// Export product data to Excel
router.get('/product/:productId', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId, { include: Batch });
    if (!product) {
      return res.status(404).send('Product not found');
    }
    const excelFile = await excelExporter.exportProductData(product);
    res.attachment('product_data.xlsx');
    res.send(excelFile);
  } catch (error) {
    res.status(500).send('Error exporting product data');
  }
});

module.exports = router;
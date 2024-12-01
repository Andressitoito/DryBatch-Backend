const express = require('express');
const { Product, Batch } = require('../../src/models');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
});

// Create new product
router.post('/', async (req, res) => {
  const { name, code } = req.body;
  try {
    const newProduct = await Product.create({ name, code });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).send('Error creating product');
  }
});

// Get specific product and batches
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Batch });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching product');
  }
});

// Other CRUD operations follow similar patterns
// For brevity, omitted PUT and DELETE operations for products and batches

module.exports = router;
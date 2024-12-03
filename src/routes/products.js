const express = require('express');
const Product = require('../models/Product');
const Measurement = require('../models/Measurement');

const router = express.Router();

// Get all products (including associated measurements)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: Measurement,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

// Create new product with measurements
router.post('/', async (req, res) => {
  const { name, code, createdAt, measurements } = req.body;
  try {
    // Create the product
    const newProduct = await Product.create({
      name,
      code,
      createdAt,
    });

    // Create associated measurements
    if (measurements && measurements.length > 0) {
      const newMeasurements = measurements.map((measurement) => ({
        ...measurement,
        productId: newProduct.id,
      }));
      await Measurement.bulkCreate(newMeasurements);
    }

    // Fetch the newly created product including its measurements
    const productWithMeasurements = await Product.findByPk(newProduct.id, {
      include: Measurement,
    });

    res.status(201).json(productWithMeasurements);
  } catch (error) {
    res.status(500).json({ error: 'Error creating product', details: error.message });
  }
});

// Get specific product and its measurements
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Measurement });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product', details: error.message });
  }
});

// Update product details
router.put('/:id', async (req, res) => {
  const { name, code, createdAt } = req.body;
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update({ name, code, createdAt });
      res.status(200).json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating product', details: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.status(200).send('Product deleted successfully');
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product', details: error.message });
  }
});

// Add a new measurement for a product
router.post('/:productId/measurements', async (req, res) => {
  const { productId } = req.params;
  const { tare, initialGross, currentGross, lastUpdatedBy } = req.body;

  try {
    // Find the product by primary key
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Create a new measurement associated with the product
    const newMeasurement = await Measurement.create({
      tare,
      initialGross,
      currentGross,
      lastUpdatedBy,
      productId,
    });

    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: 'Error adding measurement', details: error.message });
  }
});

module.exports = router;

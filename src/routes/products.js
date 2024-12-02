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

// Create new product
router.post('/', async (req, res) => {
  const { name, code, measurements } = req.body;
  try {
    const newProduct = await Product.create({ name, code });

    // If measurements are provided in the request, create them and associate them with the product
    if (measurements && measurements.length > 0) {
      const newMeasurements = measurements.map(measurement => ({
        ...measurement,
        productCode: newProduct.code,
      }));
      await Measurement.bulkCreate(newMeasurements);
    }

    // Fetch the newly created product including its measurements
    const productWithMeasurements = await Product.findByPk(newProduct.id, { include: Measurement });

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
  const { name, code } = req.body;
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update({ name, code });
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

// Add or Edit a measurement for a product
router.post('/:productId/measurements', async (req, res) => {
  const { productId } = req.params;
  const { id, tare, initialGross, currentGross, lastUpdatedBy, timestamp } = req.body;

  try {
    // Find the product by primary key
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    let measurement;
    if (id) {
      // If id is provided, try to find the measurement to update it
      measurement = await Measurement.findByPk(id);

      if (measurement) {
        // Update existing measurement
        await measurement.update({ tare, initialGross, currentGross, lastUpdatedBy, timestamp });
        res.status(200).json(measurement);
      } else {
        res.status(404).send('Measurement not found for update');
      }
    } else {
      // If no id, create a new measurement associated with the product
      measurement = await Measurement.create({
        tare,
        initialGross,
        currentGross,
        lastUpdatedBy,
        timestamp,
        productCode: product.code,
      });

      res.status(201).json(measurement);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error adding or editing measurement', details: error.message });
  }
});

module.exports = router;

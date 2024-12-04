// src/routes/products.js

const express = require('express');
const Product = require('../models/Product');
const Measurement = require('../models/Measurement');
const Container = require('../models/Container');

const router = express.Router();

// Get all products (including associated measurements and containers)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: {
        model: Measurement,
        include: {
          model: Container,
        },
      },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

// Get a specific product by ID (including associated measurements and containers)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: {
        model: Measurement,
        include: {
          model: Container,
        },
      },
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product', details: error.message });
  }
});

// Create new product (including measurements and containers)
router.post('/', async (req, res) => {
  const { name, code, createdAt, measurements } = req.body;
  try {
    // Create new product
    const newProduct = await Product.create({ name, code, createdAt });

    // If measurements are provided, create them along with containers
    if (measurements && measurements.length > 0) {
      for (const measurementData of measurements) {
        const { timestamp, lastUpdatedBy, containers } = measurementData;

        // Create measurement associated with the product
        const newMeasurement = await Measurement.create({
          timestamp,
          lastUpdatedBy,
          productId: newProduct.id,
        });

        // If containers are provided, create them associated with the measurement
        if (containers && containers.length > 0) {
          const containerData = containers.map((container) => ({
            ...container,
            measurementId: newMeasurement.id,
          }));
          await Container.bulkCreate(containerData);
        }
      }
    }

    // Fetch the newly created product including its measurements and containers
    const productWithDetails = await Product.findByPk(newProduct.id, {
      include: {
        model: Measurement,
        include: {
          model: Container,
        },
      },
    });

    res.status(201).json(productWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Error creating product', details: error.message });
  }
});

// Add a new measurement to an existing product
router.post('/:productId/measurements', async (req, res) => {
  const { productId } = req.params;
  const { timestamp, lastUpdatedBy, containers } = req.body;

  try {
    // Find the product by its ID
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create a new measurement associated with the product
    const newMeasurement = await Measurement.create({
      timestamp,
      lastUpdatedBy,
      productId,
    });

    // If containers are provided, create them associated with the measurement
    if (containers && containers.length > 0) {
      const containerData = containers.map((container) => ({
        ...container,
        measurementId: newMeasurement.id,
      }));
      await Container.bulkCreate(containerData);
    }

    // Fetch the updated product including the newly added measurement and containers
    const updatedProduct = await Product.findByPk(productId, {
      include: {
        model: Measurement,
        include: {
          model: Container,
        },
      },
    });

    res.status(201).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error adding measurement to product', details: error.message });
  }
});

// Update product details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  try {
    const product = await Product.findByPk(id);
    if (product) {
      await product.update({ name, code });
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating product', details: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (product) {
      await product.destroy();
      res.status(200).send('Product deleted successfully');
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product', details: error.message });
  }
});

module.exports = router;

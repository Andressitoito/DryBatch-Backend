const sequelize = require('./src/database');
const Product = require('./src/models/Product');
const Batch = require('./src/models/Batch');

// Mock Data
const mockProducts = [
  { name: "Arroz hervido", code: "A001" },
  { name: "Frijoles secos", code: "B002" },
  { name: "Maíz molido", code: "C003" },
];

const mockMeasurements = {
  A001: [
    { containerName: "Container A", tareWeight: 0.5, initialGrossWeight: 5, currentGrossWeight: 4.8, lastUpdatedBy: "Usuario Actual", timestamp: "2024-11-29T10:00:00Z" },
    { containerName: "Container B", tareWeight: 0.4, initialGrossWeight: 4, currentGrossWeight: 3.9, lastUpdatedBy: "Usuario Actual", timestamp: "2024-11-29T11:00:00Z" },
  ],
  B002: [
    { containerName: "Container C", tareWeight: 0.3, initialGrossWeight: 4.5, currentGrossWeight: 4.2, lastUpdatedBy: "Usuario Actual", timestamp: "2024-11-29T13:00:00Z" },
  ],
  C003: [
    { containerName: "Container D", tareWeight: 0.5, initialGrossWeight: 5.5, currentGrossWeight: 5.1, lastUpdatedBy: "Usuario Actual", timestamp: "2024-11-29T14:00:00Z" },
  ],
};

(async () => {
  try {
    await sequelize.sync({ force: true }); // Warning: force true will drop tables first!

    // Create products
    const products = await Product.bulkCreate(mockProducts);

    // Create measurements/batches
    for (const product of products) {
      const batches = mockMeasurements[product.code] || [];
      for (const batch of batches) {
        await Batch.create({ ...batch, productId: product.id });
      }
    }

    console.log("Mock data populated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error populating mock data:", error);
    process.exit(1);
  }
})();

require("dotenv").config(); // Load environment variables

module.exports = {
	development: {
		use_env_variable: "DB_CONNECTION_STRING", // Use the connection string from .env
		dialect: "mysql",
		database: "drybatch_db",
	},
	production: {
		use_env_variable: "DB_CONNECTION_STRING", // Same for production
		dialect: "mysql",
		database: "drybatch_db",
	},
};

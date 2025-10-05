import app from './app';
import { db } from './config/database';

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection established successfully');

    // Run migrations
    // await db.migrate.latest();
    // console.log('✅ Database migrations completed');

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Identify endpoint: http://localhost:${PORT}/identify`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await db.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await db.destroy();
  process.exit(0);
});

startServer();
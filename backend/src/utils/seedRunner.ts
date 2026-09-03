import { connectDB, closeDB } from '../config/db';
import { seedDatabase } from './seedData';

const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('🎉 Database seeding complete!');
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();

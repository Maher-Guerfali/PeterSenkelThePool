import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Mongoose will handle reconnection automatically if connection drops
    const connection = await mongoose.connect(mongoUri);
    
    console.log(`✓ MongoDB connected: ${connection.connection.host}`);
    
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    // Exit the process if we can't connect to the database
    // In production you might want more sophisticated retry logic
    process.exit(1);
  }
};

// Handle connection events for better debugging
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

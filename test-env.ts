import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Dotenv config result:', result);
console.log('Environment variables:');
console.log('LIMITLESS_API_KEY:', process.env.LIMITLESS_API_KEY);
console.log('DB_TYPE:', process.env.DB_TYPE);
console.log('PORT:', process.env.PORT);
console.log('Current working directory:', process.cwd());

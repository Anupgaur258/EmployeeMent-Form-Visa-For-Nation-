import { connectDB } from './config/db.js';
import Lead from './models/Lead.js';

console.log('Testing modules...');
console.log('Lead model compiled successfully:', typeof Lead === 'function');
process.exit(0);

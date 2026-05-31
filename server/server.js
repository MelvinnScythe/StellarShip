const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// 1. MUST BE FIRST: CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true
}));

// 2. Body Parser
app.use(express.json());

// 3. Health Check Route (to verify if server is up)
app.get('/', (req, res) => {
  res.json({ status: 'Online', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// 4. Auth Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/analyze-speech', require('./routes/analyze'));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Server is running on port ${PORT}`);
});

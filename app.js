const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });
const sequelize = require('./config/database');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Sync
sequelize.sync({ alter: false })
    .then(() => console.log('Database connected and synchronized.'))
    .catch(err => console.error('Error synchronizing DB:', err));

// Routes
app.use('/origin/api/login', require('./routes/authRouter.js'));
app.use('/origin/api/user', require('./routes/userRouter.js'));
app.use('/origin/api/product', require('./routes/productRouter.js'));
app.use('/origin/api/department', require('./routes/departmentRouter.js'));
app.use('/origin/api/product-type', require('./routes/productTypeRouter.js'));
app.use('/origin/api/product-use', require('./routes/productUseRouter.js'));
app.use('/origin/api/branch', require('./routes/branchRouter.js'));
app.use('/origin/api/deposit', require('./routes/depositRouter.js'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
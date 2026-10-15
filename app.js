const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ quiet: true });
const sequelize = require('./config/database');
const { initSocket } = require('./helpers/socket');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/origin/api/inventory', require('./routes/inventoryRouter.js'));
app.use('/origin/api/transfer', require('./routes/transferRouter.js'));
app.use('/origin/api/equipment', require('./routes/equipmentRouter.js'));
app.use('/origin/api/branch-equipment', require('./routes/branchEquipmentRouter.js'));
app.use('/origin/api/mobile-stand', require('./routes/mobileStandRouter.js'));
app.use('/origin/api/portion', require('./routes/portionRouter.js'));
app.use('/origin/api/menu-product', require('./routes/menuProductRouter.js'));
app.use('/origin/api/menu-product-portion', require('./routes/menuProductPortionRouter.js'));
app.use('/origin/api/mobile-stand-portion', require('./routes/mobileStandPortionRouter.js'));
app.use('/origin/api/portion-supply', require('./routes/portionSupplyRouter.js'));
app.use('/origin/api/client', require('./routes/clientRouter.js'));
app.use('/origin/api/invoice', require('./routes/invoiceRouter.js'));

const PORT = process.env.PORT || 4000;

// Socket.IO comparte el servidor HTTP de Express (pantalla de cocina en tiempo real)
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
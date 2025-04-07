// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const proveedoresRoutes = require('./routes/proveedores');
const gastosRoutes = require('./routes/gastos');
const ingresosRoutes = require('./routes/ingresos');

app.use(cors());
app.use(express.json());

app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express'); 
const router = express.Router();  // Usar router en lugar de app
const db = require('../db');  // Asumiendo que 'db' es el módulo para la conexión a la base de datos

// Ruta para obtener todos los gastos
router.get('/', (req, res) => {
  db.query('SELECT g.*, p.nombre AS proveedor_nombre FROM gastos g LEFT JOIN proveedores p ON g.proveedor_id = p.id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los gastos' });
    }
    res.json(results);
  });
});

// Ruta para agregar un nuevo gasto/ingreso
router.post('/', (req, res) => {
    const { descripcion, monto, tipo, proveedor_id } = req.body;
  
    if (!descripcion || !monto || !tipo) {
      return res.status(400).json({ error: 'Faltan datos para agregar el gasto/ingreso' });
    }
  
    const montoDecimal = parseFloat(monto);
    if (isNaN(montoDecimal)) {
      return res.status(400).json({ error: 'El monto debe ser un número válido' });
    }
  
    db.query(
      'INSERT INTO gastos (descripcion, monto, tipo, proveedor_id) VALUES (?, ?, ?, ?)',
      [descripcion, montoDecimal, tipo, proveedor_id || null],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error al agregar el gasto/ingreso' });
        }
        res.json({ id: result.insertId, descripcion, monto: montoDecimal, tipo, proveedor_id });
      }
    );
  });

  // Ruta para obtener un gasto por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
  
    db.query('SELECT * FROM gastos WHERE id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener el gasto' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Gasto no encontrado' });
      }
      res.json(results[0]);
    });
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, tipo, proveedor_id } = req.body;
  
    const montoDecimal = parseFloat(monto);
    if (isNaN(montoDecimal)) {
      return res.status(400).json({ error: 'El monto debe ser un número válido' });
    }
  
    db.query(
      'UPDATE gastos SET descripcion = ?, monto = ?, tipo = ?, proveedor_id = ? WHERE id = ?',
      [descripcion, montoDecimal, tipo, proveedor_id || null, id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar el gasto/ingreso' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        res.json({ id, descripcion, monto: montoDecimal, tipo, proveedor_id });
      }
    );
  });

// Ruta para eliminar un gasto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM gastos WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json({ message: 'Gasto eliminado correctamente' });
  });
});

module.exports = router;  // Exporta el router para usarlo en server.js

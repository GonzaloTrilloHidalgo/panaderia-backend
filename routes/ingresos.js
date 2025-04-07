const express = require('express');
const router = express.Router();  // Usar router en lugar de app
const db = require('../db');  // Asumiendo que 'db' es el módulo para la conexión a la base de datos

// Ruta para obtener ingresos por mes y año
router.get('/', (req, res) => {
    const { mes, anio } = req.query; // Obtener mes y año de los parámetros de la URL
    
    // Si se proporcionan mes y año, filtrar los ingresos por esa fecha
    let query = 'SELECT i.*, p.nombre AS proveedor_nombre FROM ingresos i LEFT JOIN proveedores p ON i.proveedor_id = p.id';
    
    if (mes && anio) {
      query += ' WHERE MONTH(i.fecha_registro) = ? AND YEAR(i.fecha_registro) = ?';
    }
  
    db.query(query, [mes, anio], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener los ingresos' });
      }
      res.json(results);
    });
  });

router.get('/api/ingresos', async (req, res) => {
    const { mes, anio } = req.query;
    const query = `
        SELECT * FROM ingresos 
        WHERE MONTH(fecha_registro) = ? AND YEAR(fecha_registro) = ?;
    `;

    try {
        const [ingresos] = await db.execute(query, [mes, anio]);
        res.json(ingresos);
    } catch (error) {
        console.error('Error al obtener ingresos:', error);
        res.status(500).json({ error: 'Error al obtener los ingresos' });
    }
});

  

// Ruta para obtener un ingreso por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    // Realizar la consulta en la base de datos para obtener el ingreso con el id dado
    db.query('SELECT i.*, p.nombre AS proveedor_nombre FROM ingresos i LEFT JOIN proveedores p ON i.proveedor_id = p.id WHERE i.id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener el ingreso' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Ingreso no encontrado' });
      }
      res.json(results[0]);  // Enviar el primer (y único) resultado como respuesta
    });
  });

// Ruta para agregar un nuevo ingreso
router.post('/', (req, res) => {
  const { descripcion, monto, tipo, proveedor_id } = req.body;

  // Validar datos
  if (!descripcion || !monto || !tipo) {
    return res.status(400).json({ error: 'Faltan datos para agregar el ingreso' });
  }

  const montoDecimal = parseFloat(monto);
  if (isNaN(montoDecimal) || montoDecimal <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo válido' });
  }

  // Validar proveedor (si es necesario)
  if (proveedor_id) {
    db.query('SELECT id FROM proveedores WHERE id = ?', [proveedor_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al verificar el proveedor' });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: 'Proveedor no encontrado' });
      }

      // Insertar el ingreso
      db.query(
        'INSERT INTO ingresos (descripcion, monto, tipo, proveedor_id) VALUES (?, ?, ?, ?)',
        [descripcion, montoDecimal, tipo, proveedor_id || null],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al agregar el ingreso' });
          }
          res.json({ id: result.insertId, descripcion, monto: montoDecimal, tipo, proveedor_id });
        }
      );
    });
  } else {
    // Insertar sin proveedor
    db.query(
      'INSERT INTO ingresos (descripcion, monto, tipo, proveedor_id) VALUES (?, ?, ?, ?)',
      [descripcion, montoDecimal, tipo, proveedor_id || null],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al agregar el ingreso' });
        }
        res.json({ id: result.insertId, descripcion, monto: montoDecimal, tipo, proveedor_id });
      }
    );
  }
});

// Ruta para actualizar un ingreso
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, tipo, proveedor_id } = req.body;

  // Verificamos si faltan campos
  if (!descripcion || !monto || !tipo) {
    return res.status(400).json({ error: 'Faltan datos para actualizar el ingreso' });
  }

  const montoDecimal = parseFloat(monto);
  if (isNaN(montoDecimal) || montoDecimal <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo válido' });
  }

  // Validar proveedor (si es necesario)
  if (proveedor_id) {
    db.query('SELECT id FROM proveedores WHERE id = ?', [proveedor_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al verificar el proveedor' });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: 'Proveedor no encontrado' });
      }

      // Actualizar el ingreso
      db.query(
        'UPDATE ingresos SET descripcion = ?, monto = ?, tipo = ?, proveedor_id = ? WHERE id = ?',
        [descripcion, montoDecimal, tipo, proveedor_id || null, id],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar el ingreso' });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ingreso no encontrado' });
          }
          res.json({ id, descripcion, monto: montoDecimal, tipo, proveedor_id });
        }
      );
    });
  } else {
    // Actualizar sin proveedor
    db.query(
      'UPDATE ingresos SET descripcion = ?, monto = ?, tipo = ?, proveedor_id = ? WHERE id = ?',
      [descripcion, montoDecimal, tipo, proveedor_id || null, id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al actualizar el ingreso' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Ingreso no encontrado' });
        }
        res.json({ id, descripcion, monto: montoDecimal, tipo, proveedor_id });
      }
    );
  }
});

// Ruta para eliminar un ingreso
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM ingresos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar el ingreso' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    res.json({ message: 'Ingreso eliminado correctamente' });
  });
});

module.exports = router; // No olvides exportar el router

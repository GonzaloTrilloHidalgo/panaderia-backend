const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los proveedores
router.get('/', (req, res) => {
  db.query('SELECT * FROM proveedores', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Obtener un proveedor por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM proveedores WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(results[0]);
  });
});

// Crear nuevo proveedor
router.post('/', (req, res) => {
    const { nombre, direccion, telefono, email } = req.body;
    db.query(
      'INSERT INTO proveedores (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?)',
      [nombre, direccion, telefono, email],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ id: result.insertId, nombre, direccion, telefono, email });
      }
    );
  });
  
  // Actualizar proveedor por ID
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, telefono, email } = req.body;
    db.query(
      'UPDATE proveedores SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE id = ?',
      [nombre, direccion, telefono, email, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Proveedor no encontrado' });
        res.json({ id, nombre, direccion, telefono, email });
      }
    );
  });

// Eliminar proveedor por ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Intentando eliminar el proveedor con ID: ${id}`); // Log para verificar
  
    db.query('DELETE FROM proveedores WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.log('Error en la eliminación:', err); // Log de error
        return res.status(500).json({ error: err });
      }
      if (result.affectedRows === 0) {
        console.log('Proveedor no encontrado'); // Log si no se encontró el proveedor
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }
  
      console.log(`Proveedor con ID ${id} eliminado`); // Log si se eliminó correctamente
      res.json({ message: 'Proveedor eliminado correctamente' });
    });
  });
  

module.exports = router;

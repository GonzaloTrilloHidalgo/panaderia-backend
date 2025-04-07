// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gonzalo02',
  database: 'panaderia'
});

connection.connect(err => {
  if (err) throw err;
  console.log("✅ Conectado a la base de datos panaderia");
});

module.exports = connection;

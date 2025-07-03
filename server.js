const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'TU_CADENA_DE_CONEXION'; // Reemplaza por tu cadena de conexión o usa .env
const DB_NAME = 'loginDB'; // Puedes cambiar el nombre de la base de datos

app.use(cors());
app.use(express.json());

let db, users;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    users = db.collection('users');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Endpoint para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan datos' });
  const user = await users.findOne({ email, password });
  if (user) {
    res.json({ success: true, message: 'Inicio de sesión exitoso' });
  } else {
    res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
  }
});

// Endpoint para registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan datos' });
  const exists = await users.findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: 'El usuario ya existe' });
  await users.insertOne({ email, password });
  res.json({ success: true, message: 'Usuario registrado correctamente' });
});

// Endpoint solo para pruebas: listar todos los usuarios
app.get('/users', async (req, res) => {
  try {
    const allUsers = await users.find().toArray();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

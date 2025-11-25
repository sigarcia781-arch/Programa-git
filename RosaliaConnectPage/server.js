const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Importar rutas
const authRoutes = require('./backend/routes/auth');
const userRoutes = require('./backend/routes/users');
const courseRoutes = require('./backend/routes/courses');
const enrollmentRoutes = require('./backend/routes/enrollments');
const assignmentRoutes = require('./backend/routes/assignments');

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar base de datos
const db = require('./backend/database/db');
db.init();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor LMS corriendo en http://localhost:${PORT}`);
});

module.exports = app;


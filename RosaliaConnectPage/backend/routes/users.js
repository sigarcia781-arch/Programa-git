const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireRole('admin', 'instructor'), (req, res) => {
    const database = db.getDb();
    database.all('SELECT id, email, nombre, apellido, rol, fecha_creacion FROM users', (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(users);
    });
});

// Obtener usuario por ID
router.get('/:id', authenticateToken, (req, res) => {
    const database = db.getDb();
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.rol;

    // Solo el mismo usuario o admin/instructor pueden ver el perfil
    if (parseInt(userId) !== currentUserId && !['admin', 'instructor'].includes(currentUserRole)) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    database.get(
        'SELECT id, email, nombre, apellido, rol, fecha_creacion FROM users WHERE id = ?',
        [userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener usuario' });
            }
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(user);
        }
    );
});

// Actualizar usuario
router.put('/:id', authenticateToken, (req, res) => {
    const database = db.getDb();
    const userId = req.params.id;
    const currentUserId = req.user.id;
    const { nombre, apellido } = req.body;

    // Solo el mismo usuario puede actualizar su perfil
    if (parseInt(userId) !== currentUserId) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    database.run(
        'UPDATE users SET nombre = ?, apellido = ? WHERE id = ?',
        [nombre, apellido, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar usuario' });
            }
            res.json({ message: 'Usuario actualizado exitosamente' });
        }
    );
});

module.exports = router;


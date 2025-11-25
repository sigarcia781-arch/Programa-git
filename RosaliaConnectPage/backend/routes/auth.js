const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre, apellido, rol } = req.body;

        if (!email || !password || !nombre || !apellido) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const database = db.getDb();

        database.run(
            'INSERT INTO users (email, password, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, nombre, apellido, rol || 'estudiante'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'El email ya está registrado' });
                    }
                    return res.status(500).json({ error: 'Error al registrar usuario' });
                }
                res.status(201).json({ 
                    message: 'Usuario registrado exitosamente',
                    userId: this.lastID 
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const database = db.getDb();

        database.get(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Error en el servidor' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const token = jwt.sign(
                    { 
                        id: user.id, 
                        email: user.email, 
                        rol: user.rol 
                    },
                    process.env.JWT_SECRET || 'secret_key',
                    { expiresIn: '24h' }
                );

                res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        rol: user.rol
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;


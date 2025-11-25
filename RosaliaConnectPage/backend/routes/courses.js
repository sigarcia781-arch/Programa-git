const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los cursos
router.get('/', authenticateToken, (req, res) => {
    const database = db.getDb();
    const query = `
        SELECT c.*, u.nombre || ' ' || u.apellido as instructor_nombre
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.estado = 'activo'
    `;
    
    database.all(query, (err, courses) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener cursos' });
        }
        res.json(courses);
    });
});

// Obtener curso por ID
router.get('/:id', authenticateToken, (req, res) => {
    const database = db.getDb();
    const courseId = req.params.id;
    
    const query = `
        SELECT c.*, u.nombre || ' ' || u.apellido as instructor_nombre
        FROM courses c
        JOIN users u ON c.instructor_id = u.id
        WHERE c.id = ?
    `;
    
    database.get(query, [courseId], (err, course) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener curso' });
        }
        if (!course) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.json(course);
    });
});

// Crear curso (solo instructores y admin)
router.post('/', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
    const database = db.getDb();
    const { titulo, descripcion } = req.body;
    const instructorId = req.user.id;

    if (!titulo) {
        return res.status(400).json({ error: 'El título es requerido' });
    }

    database.run(
        'INSERT INTO courses (titulo, descripcion, instructor_id) VALUES (?, ?, ?)',
        [titulo, descripcion, instructorId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear curso' });
            }
            res.status(201).json({ 
                message: 'Curso creado exitosamente',
                courseId: this.lastID 
            });
        }
    );
});

// Actualizar curso
router.put('/:id', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
    const database = db.getDb();
    const courseId = req.params.id;
    const { titulo, descripcion, estado } = req.body;

    // Verificar que el usuario sea el instructor del curso o admin
    database.get('SELECT instructor_id FROM courses WHERE id = ?', [courseId], (err, course) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar curso' });
        }
        if (!course) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        if (course.instructor_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para editar este curso' });
        }

        const updates = [];
        const values = [];
        
        if (titulo) {
            updates.push('titulo = ?');
            values.push(titulo);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            values.push(descripcion);
        }
        if (estado) {
            updates.push('estado = ?');
            values.push(estado);
        }
        
        values.push(courseId);
        
        database.run(
            `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
            values,
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar curso' });
                }
                res.json({ message: 'Curso actualizado exitosamente' });
            }
        );
    });
});

// Eliminar curso
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
    const database = db.getDb();
    const courseId = req.params.id;

    database.run('UPDATE courses SET estado = ? WHERE id = ?', ['inactivo', courseId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar curso' });
        }
        res.json({ message: 'Curso eliminado exitosamente' });
    });
});

module.exports = router;


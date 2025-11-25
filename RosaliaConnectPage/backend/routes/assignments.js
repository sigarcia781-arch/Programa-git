const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Obtener asignaciones de un curso
router.get('/course/:courseId', authenticateToken, (req, res) => {
    const database = db.getDb();
    const courseId = req.params.courseId;

    database.all(
        'SELECT * FROM assignments WHERE curso_id = ? ORDER BY fecha_creacion DESC',
        [courseId],
        (err, assignments) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener asignaciones' });
            }
            res.json(assignments);
        }
    );
});

// Obtener asignación por ID
router.get('/:id', authenticateToken, (req, res) => {
    const database = db.getDb();
    const assignmentId = req.params.id;

    database.get('SELECT * FROM assignments WHERE id = ?', [assignmentId], (err, assignment) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener asignación' });
        }
        if (!assignment) {
            return res.status(404).json({ error: 'Asignación no encontrada' });
        }
        res.json(assignment);
    });
});

// Crear asignación (solo instructor/admin)
router.post('/', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
    const database = db.getDb();
    const { curso_id, titulo, descripcion, fecha_limite, puntos } = req.body;

    if (!curso_id || !titulo) {
        return res.status(400).json({ error: 'Curso ID y título son requeridos' });
    }

    // Verificar que el usuario sea el instructor del curso
    database.get('SELECT instructor_id FROM courses WHERE id = ?', [curso_id], (err, course) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar curso' });
        }
        if (!course) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        if (course.instructor_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para crear asignaciones en este curso' });
        }

        database.run(
            'INSERT INTO assignments (curso_id, titulo, descripcion, fecha_limite, puntos) VALUES (?, ?, ?, ?, ?)',
            [curso_id, titulo, descripcion, fecha_limite, puntos || 100],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear asignación' });
                }
                res.status(201).json({ 
                    message: 'Asignación creada exitosamente',
                    assignmentId: this.lastID 
                });
            }
        );
    });
});

// Actualizar asignación
router.put('/:id', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
    const database = db.getDb();
    const assignmentId = req.params.id;
    const { titulo, descripcion, fecha_limite, puntos } = req.body;

    // Verificar permisos
    database.get(
        'SELECT a.*, c.instructor_id FROM assignments a JOIN courses c ON a.curso_id = c.id WHERE a.id = ?',
        [assignmentId],
        (err, assignment) => {
            if (err) {
                return res.status(500).json({ error: 'Error al verificar asignación' });
            }
            if (!assignment) {
                return res.status(404).json({ error: 'Asignación no encontrada' });
            }
            if (assignment.instructor_id !== req.user.id && req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta asignación' });
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
            if (fecha_limite) {
                updates.push('fecha_limite = ?');
                values.push(fecha_limite);
            }
            if (puntos) {
                updates.push('puntos = ?');
                values.push(puntos);
            }
            
            values.push(assignmentId);
            
            database.run(
                `UPDATE assignments SET ${updates.join(', ')} WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error al actualizar asignación' });
                    }
                    res.json({ message: 'Asignación actualizada exitosamente' });
                }
            );
        }
    );
});

// Eliminar asignación
router.delete('/:id', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
    const database = db.getDb();
    const assignmentId = req.params.id;

    // Verificar permisos
    database.get(
        'SELECT a.*, c.instructor_id FROM assignments a JOIN courses c ON a.curso_id = c.id WHERE a.id = ?',
        [assignmentId],
        (err, assignment) => {
            if (err) {
                return res.status(500).json({ error: 'Error al verificar asignación' });
            }
            if (!assignment) {
                return res.status(404).json({ error: 'Asignación no encontrada' });
            }
            if (assignment.instructor_id !== req.user.id && req.user.rol !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para eliminar esta asignación' });
            }

            database.run('DELETE FROM assignments WHERE id = ?', [assignmentId], function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al eliminar asignación' });
                }
                res.json({ message: 'Asignación eliminada exitosamente' });
            });
        }
    );
});

module.exports = router;


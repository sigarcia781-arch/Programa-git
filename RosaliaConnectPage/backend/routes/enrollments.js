const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Inscribirse a un curso
router.post('/', authenticateToken, requireRole('estudiante'), (req, res) => {
    const database = db.getDb();
    const { curso_id } = req.body;
    const estudianteId = req.user.id;

    if (!curso_id) {
        return res.status(400).json({ error: 'ID del curso es requerido' });
    }

    // Verificar que el curso existe
    database.get('SELECT * FROM courses WHERE id = ? AND estado = ?', [curso_id, 'activo'], (err, course) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar curso' });
        }
        if (!course) {
            return res.status(404).json({ error: 'Curso no encontrado o inactivo' });
        }

        // Inscribir al estudiante
        database.run(
            'INSERT INTO enrollments (estudiante_id, curso_id) VALUES (?, ?)',
            [estudianteId, curso_id],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
                    }
                    return res.status(500).json({ error: 'Error al inscribirse al curso' });
                }
                res.status(201).json({ 
                    message: 'Inscripción exitosa',
                    enrollmentId: this.lastID 
                });
            }
        );
    });
});

// Obtener cursos del estudiante
router.get('/my-courses', authenticateToken, (req, res) => {
    const database = db.getDb();
    const userId = req.user.id;
    const userRole = req.user.rol;

    let query;
    let params;

    if (userRole === 'estudiante') {
        query = `
            SELECT c.*, u.nombre || ' ' || u.apellido as instructor_nombre, e.fecha_inscripcion
            FROM enrollments e
            JOIN courses c ON e.curso_id = c.id
            JOIN users u ON c.instructor_id = u.id
            WHERE e.estudiante_id = ? AND e.estado = 'activo'
        `;
        params = [userId];
    } else if (userRole === 'instructor') {
        query = `
            SELECT c.*, COUNT(e.id) as estudiantes_inscritos
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.curso_id AND e.estado = 'activo'
            WHERE c.instructor_id = ? AND c.estado = 'activo'
            GROUP BY c.id
        `;
        params = [userId];
    } else {
        query = `
            SELECT c.*, u.nombre || ' ' || u.apellido as instructor_nombre
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.estado = 'activo'
        `;
        params = [];
    }

    database.all(query, params, (err, courses) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener cursos' });
        }
        res.json(courses);
    });
});

// Obtener estudiantes de un curso (solo instructor/admin)
router.get('/course/:courseId/students', authenticateToken, requireRole('instructor', 'admin'), (req, res) => {
    const database = db.getDb();
    const courseId = req.params.courseId;

    const query = `
        SELECT u.id, u.email, u.nombre, u.apellido, e.fecha_inscripcion
        FROM enrollments e
        JOIN users u ON e.estudiante_id = u.id
        WHERE e.curso_id = ? AND e.estado = 'activo'
    `;

    database.all(query, [courseId], (err, students) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener estudiantes' });
        }
        res.json(students);
    });
});

// Cancelar inscripción
router.delete('/:enrollmentId', authenticateToken, (req, res) => {
    const database = db.getDb();
    const enrollmentId = req.params.enrollmentId;
    const userId = req.user.id;

    // Verificar que la inscripción pertenece al usuario
    database.get('SELECT * FROM enrollments WHERE id = ?', [enrollmentId], (err, enrollment) => {
        if (err) {
            return res.status(500).json({ error: 'Error al verificar inscripción' });
        }
        if (!enrollment) {
            return res.status(404).json({ error: 'Inscripción no encontrada' });
        }
        if (enrollment.estudiante_id !== userId && req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        database.run('UPDATE enrollments SET estado = ? WHERE id = ?', ['cancelado', enrollmentId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al cancelar inscripción' });
            }
            res.json({ message: 'Inscripción cancelada exitosamente' });
        });
    });
});

module.exports = router;


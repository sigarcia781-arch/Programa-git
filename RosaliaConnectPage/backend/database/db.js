const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.db');
let db = null;

const init = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error al conectar con la base de datos:', err);
                reject(err);
            } else {
                console.log('Conectado a la base de datos SQLite');
                createTables().then(resolve).catch(reject);
            }
        });
    });
};

const createTables = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabla de usuarios
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                rol TEXT NOT NULL DEFAULT 'estudiante',
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Tabla de cursos
            db.run(`CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                instructor_id INTEGER NOT NULL,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                estado TEXT DEFAULT 'activo',
                FOREIGN KEY (instructor_id) REFERENCES users(id)
            )`);

            // Tabla de inscripciones
            db.run(`CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                estudiante_id INTEGER NOT NULL,
                curso_id INTEGER NOT NULL,
                fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
                estado TEXT DEFAULT 'activo',
                FOREIGN KEY (estudiante_id) REFERENCES users(id),
                FOREIGN KEY (curso_id) REFERENCES courses(id),
                UNIQUE(estudiante_id, curso_id)
            )`);

            // Tabla de tareas/asignaciones
            db.run(`CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                descripcion TEXT,
                fecha_limite DATETIME,
                puntos INTEGER DEFAULT 100,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES courses(id)
            )`);

            // Tabla de entregas
            db.run(`CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                asignacion_id INTEGER NOT NULL,
                estudiante_id INTEGER NOT NULL,
                contenido TEXT,
                archivo_url TEXT,
                calificacion INTEGER,
                fecha_entrega DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (asignacion_id) REFERENCES assignments(id),
                FOREIGN KEY (estudiante_id) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                contenido TEXT NOT NULL,
                autor_id INTEGER NOT NULL,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES courses(id),
                FOREIGN KEY (autor_id) REFERENCES users(id)
            )`, (err) => {
                if (err) {
                    console.error('Error al crear tablas:', err);
                    reject(err);
                } else {
                    console.log('Tablas creadas exitosamente');
                    resolve();
                }
            });
        });
    });
};

const getDb = () => {
    if (!db) {
        throw new Error('Base de datos no inicializada');
    }
    return db;
};

const close = () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error al cerrar la base de datos:', err);
            } else {
                console.log('Conexión a la base de datos cerrada');
            }
        });
    }
};

module.exports = {
    init,
    getDb,
    close
};


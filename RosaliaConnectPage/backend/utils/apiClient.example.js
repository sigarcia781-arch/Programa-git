/**
 * Ejemplo de uso del APIClient
 * Este archivo muestra cómo usar la función para llamar a diferentes rutas de la API
 */

const APIClient = require('./apiClient');

// Crear una instancia del cliente API
const api = new APIClient('http://localhost:3000');

// Ejemplo 1: Registro de usuario (sin autenticación)
async function ejemploRegistro() {
    try {
        const response = await api.register({
            email: 'usuario@ejemplo.com',
            password: 'password123',
            nombre: 'Juan',
            apellido: 'Pérez',
            rol: 'estudiante'
        });
        console.log('Usuario registrado:', response);
    } catch (error) {
        console.error('Error al registrar:', error);
    }
}

// Ejemplo 2: Login y obtención de token
async function ejemploLogin() {
    try {
        const response = await api.login('usuario@ejemplo.com', 'password123');
        console.log('Login exitoso:', response);
        console.log('Token guardado automáticamente en el cliente');
    } catch (error) {
        console.error('Error al hacer login:', error);
    }
}

// Ejemplo 3: Obtener todos los cursos (requiere autenticación)
async function ejemploObtenerCursos() {
    try {
        // Primero hacer login para obtener el token
        await api.login('usuario@ejemplo.com', 'password123');
        
        // Luego obtener los cursos
        const response = await api.getCourses();
        console.log('Cursos obtenidos:', response);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
    }
}

// Ejemplo 4: Crear un curso (requiere autenticación como instructor)
async function ejemploCrearCurso() {
    try {
        // Login como instructor
        await api.login('instructor@ejemplo.com', 'password123');
        
        // Crear curso
        const response = await api.createCourse({
            titulo: 'Curso de Ejemplo',
            descripcion: 'Descripción del curso de ejemplo'
        });
        console.log('Curso creado:', response);
    } catch (error) {
        console.error('Error al crear curso:', error);
    }
}

// Ejemplo 5: Usar métodos HTTP genéricos
async function ejemploMetodosGenericos() {
    try {
        // Login primero
        await api.login('usuario@ejemplo.com', 'password123');
        
        // GET request
        const cursos = await api.get('/api/courses');
        console.log('Cursos (GET genérico):', cursos);
        
        // POST request
        const nuevoCurso = await api.post('/api/courses', {
            titulo: 'Nuevo Curso',
            descripcion: 'Descripción'
        });
        console.log('Curso creado (POST genérico):', nuevoCurso);
        
        // PUT request
        const cursoActualizado = await api.put('/api/courses/1', {
            titulo: 'Curso Actualizado',
            descripcion: 'Nueva descripción'
        });
        console.log('Curso actualizado (PUT genérico):', cursoActualizado);
        
        // DELETE request
        const cursoEliminado = await api.delete('/api/courses/1');
        console.log('Curso eliminado (DELETE genérico):', cursoEliminado);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Ejemplo 6: Usar con token manual
async function ejemploTokenManual() {
    const apiConToken = new APIClient('http://localhost:3000', 'tu_token_aqui');
    
    try {
        const response = await apiConToken.get('/api/users');
        console.log('Usuarios obtenidos:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Ejecutar ejemplos (descomentar el que quieras probar)
// ejemploRegistro();
// ejemploLogin();
// ejemploObtenerCursos();
// ejemploCrearCurso();
// ejemploMetodosGenericos();
// ejemploTokenManual();

module.exports = {
    ejemploRegistro,
    ejemploLogin,
    ejemploObtenerCursos,
    ejemploCrearCurso,
    ejemploMetodosGenericos,
    ejemploTokenManual
};


/**
 * Script de prueba para el APIClient
 * Ejecutar con: node backend/utils/testApi.js
 */

const APIClient = require('./apiClient');

async function testAPI() {
    const api = new APIClient('http://localhost:3000');
    
    console.log('=== Iniciando pruebas de API ===\n');
    
    try {
        // Test 1: Registro
        console.log('1. Probando registro de usuario...');
        const registro = await api.register({
            email: `test${Date.now()}@ejemplo.com`,
            password: 'test123',
            nombre: 'Test',
            apellido: 'Usuario',
            rol: 'estudiante'
        });
        console.log('✓ Registro exitoso:', registro.data);
        console.log('');
        
        // Test 2: Login
        console.log('2. Probando login...');
        const login = await api.login(registro.data.email || 'test@ejemplo.com', 'test123');
        console.log('✓ Login exitoso. Token obtenido automáticamente.');
        console.log('');
        
        // Test 3: Obtener cursos
        console.log('3. Probando obtener cursos...');
        const cursos = await api.getCourses();
        console.log('✓ Cursos obtenidos:', cursos.data.length, 'cursos');
        console.log('');
        
        // Test 4: Obtener usuarios (si es admin/instructor)
        console.log('4. Probando obtener usuarios...');
        try {
            const usuarios = await api.getUsers();
            console.log('✓ Usuarios obtenidos:', usuarios.data.length, 'usuarios');
        } catch (error) {
            console.log('⚠ No se pudo obtener usuarios (puede requerir rol admin/instructor):', error.error);
        }
        console.log('');
        
        console.log('=== Pruebas completadas ===');
        
    } catch (error) {
        console.error('✗ Error en las pruebas:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testAPI();
}

module.exports = testAPI;


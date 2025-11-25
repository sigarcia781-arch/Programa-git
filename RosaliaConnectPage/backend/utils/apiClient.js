const http = require('http');

/**
 * Cliente API para hacer llamadas HTTP a diferentes rutas de la API
 * Útil para testing y llamadas programáticas desde Node.js
 */
class APIClient {
    constructor(baseURL = 'http://localhost:3000', token = null) {
        this.baseURL = baseURL;
        this.token = token;
    }

    /**
     * Establece el token de autenticación
     * @param {string} token - Token JWT
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Realiza una petición HTTP a la API
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE, etc.)
     * @param {string} endpoint - Ruta del endpoint (ej: '/api/auth/login')
     * @param {object} data - Datos a enviar en el body (opcional)
     * @param {object} headers - Headers adicionales (opcional)
     * @returns {Promise<object>} - Respuesta de la API
     */
    async request(method, endpoint, data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.baseURL);
            
            const options = {
                hostname: url.hostname,
                port: url.port || 3000,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            // Agregar token de autenticación si existe
            if (this.token) {
                options.headers['Authorization'] = `Bearer ${this.token}`;
            }

            const req = http.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsedData = responseData ? JSON.parse(responseData) : {};
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({
                                status: res.statusCode,
                                data: parsedData,
                                headers: res.headers
                            });
                        } else {
                            reject({
                                status: res.statusCode,
                                error: parsedData.error || parsedData.message || 'Error en la petición',
                                data: parsedData
                            });
                        }
                    } catch (error) {
                        reject({
                            status: res.statusCode,
                            error: 'Error al parsear respuesta',
                            rawData: responseData
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject({
                    status: 0,
                    error: error.message,
                    details: error
                });
            });

            // Enviar datos si existen
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // Métodos de conveniencia para cada método HTTP

    /**
     * Realiza una petición GET
     * @param {string} endpoint - Ruta del endpoint
     * @param {object} headers - Headers adicionales (opcional)
     * @returns {Promise<object>}
     */
    async get(endpoint, headers = {}) {
        return this.request('GET', endpoint, null, headers);
    }

    /**
     * Realiza una petición POST
     * @param {string} endpoint - Ruta del endpoint
     * @param {object} data - Datos a enviar
     * @param {object} headers - Headers adicionales (opcional)
     * @returns {Promise<object>}
     */
    async post(endpoint, data = {}, headers = {}) {
        return this.request('POST', endpoint, data, headers);
    }

    /**
     * Realiza una petición PUT
     * @param {string} endpoint - Ruta del endpoint
     * @param {object} data - Datos a enviar
     * @param {object} headers - Headers adicionales (opcional)
     * @returns {Promise<object>}
     */
    async put(endpoint, data = {}, headers = {}) {
        return this.request('PUT', endpoint, data, headers);
    }

    /**
     * Realiza una petición DELETE
     * @param {string} endpoint - Ruta del endpoint
     * @param {object} headers - Headers adicionales (opcional)
     * @returns {Promise<object>}
     */
    async delete(endpoint, headers = {}) {
        return this.request('DELETE', endpoint, null, headers);
    }

    /**
     * Realiza una petición PATCH
     * @param {string} endpoint - Ruta del endpoint
     * @param {object} data - Datos a enviar
     * @param {object} headers - Headers adicionales (opcional)
     * @returns {Promise<object>}
     */
    async patch(endpoint, data = {}, headers = {}) {
        return this.request('PATCH', endpoint, data, headers);
    }

    // Métodos específicos para las rutas de la API

    /**
     * Registra un nuevo usuario
     * @param {object} userData - Datos del usuario
     * @returns {Promise<object>}
     */
    async register(userData) {
        return this.post('/api/auth/register', userData);
    }

    /**
     * Inicia sesión y obtiene un token
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<object>}
     */
    async login(email, password) {
        const response = await this.post('/api/auth/login', { email, password });
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    /**
     * Obtiene todos los usuarios (requiere autenticación)
     * @returns {Promise<object>}
     */
    async getUsers() {
        return this.get('/api/users');
    }

    /**
     * Obtiene un usuario por ID (requiere autenticación)
     * @param {number} userId - ID del usuario
     * @returns {Promise<object>}
     */
    async getUser(userId) {
        return this.get(`/api/users/${userId}`);
    }

    /**
     * Actualiza un usuario (requiere autenticación)
     * @param {number} userId - ID del usuario
     * @param {object} userData - Datos a actualizar
     * @returns {Promise<object>}
     */
    async updateUser(userId, userData) {
        return this.put(`/api/users/${userId}`, userData);
    }

    /**
     * Obtiene todos los cursos (requiere autenticación)
     * @returns {Promise<object>}
     */
    async getCourses() {
        return this.get('/api/courses');
    }

    /**
     * Obtiene un curso por ID (requiere autenticación)
     * @param {number} courseId - ID del curso
     * @returns {Promise<object>}
     */
    async getCourse(courseId) {
        return this.get(`/api/courses/${courseId}`);
    }

    /**
     * Crea un nuevo curso (requiere autenticación como instructor o admin)
     * @param {object} courseData - Datos del curso
     * @returns {Promise<object>}
     */
    async createCourse(courseData) {
        return this.post('/api/courses', courseData);
    }

    /**
     * Actualiza un curso (requiere autenticación como instructor o admin)
     * @param {number} courseId - ID del curso
     * @param {object} courseData - Datos a actualizar
     * @returns {Promise<object>}
     */
    async updateCourse(courseId, courseData) {
        return this.put(`/api/courses/${courseId}`, courseData);
    }

    /**
     * Elimina un curso (requiere autenticación como admin)
     * @param {number} courseId - ID del curso
     * @returns {Promise<object>}
     */
    async deleteCourse(courseId) {
        return this.delete(`/api/courses/${courseId}`);
    }
}

module.exports = APIClient;


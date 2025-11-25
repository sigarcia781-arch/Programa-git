# Guía de Uso del Cliente API

Este documento explica cómo usar el `APIClient` para hacer llamadas a la API desde Node.js y también cómo usar Postman directamente.

## Cliente API para Node.js

### Instalación y Uso Básico

```javascript
const APIClient = require('./backend/utils/apiClient');

// Crear instancia del cliente
const api = new APIClient('http://localhost:3000');

// Ejemplo: Login
async function ejemplo() {
    const response = await api.login('usuario@ejemplo.com', 'password123');
    console.log(response);
}
```

### Métodos Disponibles

#### Métodos HTTP Genéricos
- `api.get(endpoint, headers)` - GET request
- `api.post(endpoint, data, headers)` - POST request
- `api.put(endpoint, data, headers)` - PUT request
- `api.delete(endpoint, headers)` - DELETE request
- `api.patch(endpoint, data, headers)` - PATCH request

#### Métodos Específicos de la API

**Autenticación:**
- `api.register(userData)` - Registro de usuario
- `api.login(email, password)` - Login (guarda el token automáticamente)

**Usuarios:**
- `api.getUsers()` - Obtener todos los usuarios
- `api.getUser(userId)` - Obtener usuario por ID
- `api.updateUser(userId, userData)` - Actualizar usuario

**Cursos:**
- `api.getCourses()` - Obtener todos los cursos
- `api.getCourse(courseId)` - Obtener curso por ID
- `api.createCourse(courseData)` - Crear curso
- `api.updateCourse(courseId, courseData)` - Actualizar curso
- `api.deleteCourse(courseId)` - Eliminar curso

## Uso con Postman

### Configuración Base

1. **Base URL**: `http://localhost:3000`
2. **Headers por defecto**: 
   - `Content-Type: application/json`
   - `Authorization: Bearer {token}` (para rutas protegidas)

### Rutas Disponibles

#### Autenticación (Sin token requerido)

**POST /api/auth/register**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "estudiante"
}
```

**POST /api/auth/login**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```
Respuesta incluye un `token` que debes usar en las siguientes peticiones.

#### Usuarios (Requiere token)

**GET /api/users**
- Headers: `Authorization: Bearer {token}`
- Solo admin/instructor

**GET /api/users/:id**
- Headers: `Authorization: Bearer {token}`
- El usuario puede ver su propio perfil o admin/instructor pueden ver cualquier perfil

**PUT /api/users/:id**
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "nombre": "Nuevo Nombre",
  "apellido": "Nuevo Apellido"
}
```

#### Cursos (Requiere token)

**GET /api/courses**
- Headers: `Authorization: Bearer {token}`
- Obtiene todos los cursos activos

**GET /api/courses/:id**
- Headers: `Authorization: Bearer {token}`
- Obtiene un curso específico

**POST /api/courses**
- Headers: `Authorization: Bearer {token}`
- Solo instructor/admin
- Body:
```json
{
  "titulo": "Título del Curso",
  "descripcion": "Descripción del curso"
}
```

**PUT /api/courses/:id**
- Headers: `Authorization: Bearer {token}`
- Solo instructor del curso o admin
- Body:
```json
{
  "titulo": "Título Actualizado",
  "descripcion": "Nueva descripción",
  "estado": "activo"
}
```

**DELETE /api/courses/:id**
- Headers: `Authorization: Bearer {token}`
- Solo admin

#### Inscripciones (Requiere token)

**POST /api/enrollments**
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "curso_id": 1
}
```

**GET /api/enrollments/my-courses**
- Headers: `Authorization: Bearer {token}`
- Obtiene los cursos del usuario autenticado

**GET /api/enrollments/course/:courseId/students**
- Headers: `Authorization: Bearer {token}`
- Solo instructor del curso o admin

#### Tareas (Requiere token)

**GET /api/assignments/course/:courseId**
- Headers: `Authorization: Bearer {token}`
- Obtiene las tareas de un curso

**POST /api/assignments**
- Headers: `Authorization: Bearer {token}`
- Solo instructor/admin
- Body:
```json
{
  "curso_id": 1,
  "titulo": "Título de la Tarea",
  "descripcion": "Descripción",
  "fecha_limite": "2024-12-31"
}
```

### Flujo de Trabajo en Postman

1. **Registrar un usuario** (POST /api/auth/register)
2. **Hacer login** (POST /api/auth/login) - Copiar el `token` de la respuesta
3. **Configurar el token** en las variables de entorno de Postman o en cada request:
   - Header: `Authorization: Bearer {token}`
4. **Hacer peticiones autenticadas** usando el token

### Variables de Entorno en Postman

Puedes configurar variables en Postman para facilitar el uso:

1. Crear una variable `base_url` = `http://localhost:3000`
2. Crear una variable `token` = (se actualiza después del login)
3. Usar en las URLs: `{{base_url}}/api/courses`
4. Usar en headers: `Bearer {{token}}`

## Ejecutar Scripts de Prueba

```bash
# Probar el cliente API
node backend/utils/testApi.js

# Ver ejemplos de uso
cat backend/utils/apiClient.example.js
```


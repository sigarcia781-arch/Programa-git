# LMS - Sistema de Gestión de Aprendizaje

Sistema de Gestión de Aprendizaje (LMS) desarrollado con JavaScript para instituciones educativas.

## Características

- **Autenticación de usuarios**: Registro e inicio de sesión con JWT
- **Gestión de roles**: Estudiante, Instructor y Administrador
- **Gestión de cursos**: Crear, editar y visualizar cursos
- **Inscripciones**: Los estudiantes pueden inscribirse en cursos
- **Asignaciones**: Los instructores pueden crear tareas y asignaciones
- **Interfaz moderna**: Diseño responsive y atractivo

## Estructura del Proyecto

```
Ejercicio1/
├── backend/
│   ├── database/
│   │   └── db.js          # Configuración de base de datos SQLite
│   ├── middleware/
│   │   └── auth.js        # Middleware de autenticación
│   └── routes/
│       ├── auth.js        # Rutas de autenticación
│       ├── users.js       # Rutas de usuarios
│       ├── courses.js     # Rutas de cursos
│       ├── enrollments.js # Rutas de inscripciones
│       └── assignments.js # Rutas de asignaciones
├── public/
│   ├── css/
│   │   └── styles.css     # Estilos de la aplicación
│   ├── js/
│   │   ├── api.js         # Cliente API
│   │   ├── auth.js        # Utilidades de autenticación
│   │   ├── courses.js     # Lógica de cursos
│   │   └── app.js         # Aplicación principal
│   └── index.html         # Página principal
├── server.js              # Servidor Express
├── package.json           # Dependencias del proyecto
└── README.md              # Este archivo
```

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia el archivo `.env.example` a `.env` y configura las variables:
```bash
cp .env.example .env
```

Edita `.env` y configura:
```
PORT=3000
JWT_SECRET=tu_secreto_jwt_aqui
NODE_ENV=development
```

3. **Iniciar el servidor:**
```bash
npm start
```

Para desarrollo con recarga automática:
```bash
npm run dev
```

4. **Abrir en el navegador:**
Navega a `http://localhost:3000`

## Uso

### Registro de Usuario

1. Haz clic en "Registrarse"
2. Completa el formulario con tus datos
3. Selecciona tu rol (Estudiante o Instructor)
4. Inicia sesión con tus credenciales

### Como Estudiante

- Ver cursos disponibles
- Inscribirse en cursos
- Ver tus cursos inscritos
- Ver asignaciones de tus cursos

### Como Instructor

- Crear nuevos cursos
- Gestionar tus cursos
- Crear asignaciones para tus cursos
- Ver estudiantes inscritos en tus cursos

### Como Administrador

- Acceso completo a todas las funcionalidades
- Gestionar todos los cursos y usuarios

## Tecnologías Utilizadas

- **Backend:**
  - Node.js
  - Express.js
  - SQLite3
  - JWT (JSON Web Tokens)
  - bcryptjs (hash de contraseñas)

- **Frontend:**
  - HTML5
  - CSS3 (con gradientes y animaciones)
  - JavaScript (ES6+)

## Base de Datos

El sistema utiliza SQLite como base de datos. Las tablas se crean automáticamente al iniciar el servidor:

- `users`: Usuarios del sistema
- `courses`: Cursos disponibles
- `enrollments`: Inscripciones de estudiantes
- `assignments`: Asignaciones/tareas
- `submissions`: Entregas de estudiantes
- `announcements`: Anuncios de cursos

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Usuarios
- `GET /api/users` - Listar usuarios (admin/instructor)
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obtener curso
- `POST /api/courses` - Crear curso (instructor/admin)
- `PUT /api/courses/:id` - Actualizar curso
- `DELETE /api/courses/:id` - Eliminar curso (admin)

### Inscripciones
- `POST /api/enrollments` - Inscribirse en curso
- `GET /api/enrollments/my-courses` - Mis cursos
- `GET /api/enrollments/course/:id/students` - Estudiantes del curso
- `DELETE /api/enrollments/:id` - Cancelar inscripción

### Asignaciones
- `GET /api/assignments/course/:id` - Asignaciones del curso
- `POST /api/assignments` - Crear asignación
- `PUT /api/assignments/:id` - Actualizar asignación
- `DELETE /api/assignments/:id` - Eliminar asignación

## Desarrollo Futuro

- Sistema de calificaciones
- Foros de discusión
- Mensajería entre usuarios
- Subida de archivos
- Notificaciones
- Dashboard de estadísticas
- Sistema de reportes

## Licencia

ISC

## Autor

Sistema desarrollado para instituciones educativas.


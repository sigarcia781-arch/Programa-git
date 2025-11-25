class App {
    static init() {
        this.setupEventListeners();
        this.checkAuth();
        this.showView('homeView');
    }

    static setupEventListeners() {
        // Navegación
        document.getElementById('homeLink')?.addEventListener('click', () => this.showView('homeView'));
        document.getElementById('coursesLink')?.addEventListener('click', () => this.showView('coursesView'));
        document.getElementById('myCoursesLink')?.addEventListener('click', () => this.showView('myCoursesView'));
        document.getElementById('profileLink')?.addEventListener('click', () => this.showView('profileView'));
        document.getElementById('loginLink')?.addEventListener('click', () => this.showView('loginView'));
        document.getElementById('registerLink')?.addEventListener('click', () => this.showView('registerView'));
        document.getElementById('logoutLink')?.addEventListener('click', () => Auth.logout());

        // Switch entre login y registro
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('registerView');
        });
        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showView('loginView');
        });

        // Formularios
        document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('registerForm')?.addEventListener('submit', this.handleRegister.bind(this));

        // Toggle de contraseña
        this.setupPasswordToggle();
    }

    static setupPasswordToggle() {
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('loginPassword');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                togglePassword.textContent = type === 'password' ? '👁' : '🙈';
            });
        }
    }

    static checkAuth() {
        const isAuthenticated = Auth.isAuthenticated();
        const user = Auth.getUser();

        // Mostrar/ocultar enlaces según autenticación
        document.getElementById('loginLink').style.display = isAuthenticated ? 'none' : 'block';
        document.getElementById('registerLink').style.display = isAuthenticated ? 'none' : 'block';
        document.getElementById('logoutLink').style.display = isAuthenticated ? 'block' : 'none';
        document.getElementById('myCoursesLink').style.display = isAuthenticated ? 'block' : 'none';
        document.getElementById('profileLink').style.display = isAuthenticated ? 'block' : 'none';
    }

    static showView(viewId) {
        const navbar = document.querySelector('.navbar');
        const container = document.querySelector('.container');
        
        // Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });
        document.querySelectorAll('.login-view').forEach(view => {
            view.style.display = 'none';
        });

        // Si es la vista de login, ocultar navbar y container
        if (viewId === 'loginView') {
            if (navbar) navbar.style.display = 'none';
            if (container) container.style.display = 'none';
        } else {
            if (navbar) navbar.style.display = 'block';
            if (container) container.style.display = 'block';
        }

        // Mostrar la vista seleccionada
        const view = document.getElementById(viewId);
        if (view) {
            view.style.display = 'block';

            // Si es login, configurar el toggle de contraseña
            if (viewId === 'loginView') {
                setTimeout(() => this.setupPasswordToggle(), 100);
            }

            // Cargar datos según la vista
            switch(viewId) {
                case 'coursesView':
                    this.loadCourses();
                    break;
                case 'myCoursesView':
                    this.loadMyCourses();
                    break;
                case 'profileView':
                    this.loadProfile();
                    break;
            }
        }
    }

    static async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await API.login(email, password);
            Auth.setUser(response.user, response.token);
            this.checkAuth();
            this.showMessage('Inicio de sesión exitoso', 'success');
            // Mostrar navbar y container antes de cambiar de vista
            const navbar = document.querySelector('.navbar');
            const container = document.querySelector('.container');
            if (navbar) navbar.style.display = 'block';
            if (container) container.style.display = 'block';
            this.showView('homeView');
        } catch (error) {
            this.showMessage('Error: ' + error.message, 'error');
        }
    }

    static async handleRegister(e) {
        e.preventDefault();
        const userData = {
            nombre: document.getElementById('registerNombre').value,
            apellido: document.getElementById('registerApellido').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            rol: document.getElementById('registerRol').value
        };

        try {
            await API.register(userData);
            this.showMessage('Registro exitoso. Por favor inicia sesión.', 'success');
            setTimeout(() => {
                this.showView('loginView');
            }, 1500);
        } catch (error) {
            this.showMessage('Error: ' + error.message, 'error');
        }
    }

    static async loadCourses() {
        try {
            const courses = await API.getCourses();
            Courses.renderCoursesList(courses, 'coursesList');
        } catch (error) {
            this.showMessage('Error al cargar cursos: ' + error.message, 'error');
        }
    }

    static async loadMyCourses() {
        if (!Auth.isAuthenticated()) {
            this.showView('loginView');
            return;
        }

        try {
            const courses = await API.getMyCourses();
            Courses.renderCoursesList(courses, 'myCoursesList');
        } catch (error) {
            this.showMessage('Error al cargar mis cursos: ' + error.message, 'error');
        }
    }

    static async loadProfile() {
        if (!Auth.isAuthenticated()) {
            this.showView('loginView');
            return;
        }

        const user = Auth.getUser();
        const container = document.getElementById('profileContent');
        
        container.innerHTML = `
            <div class="profile-info">
                <p><strong>Nombre:</strong> ${user.nombre} ${user.apellido}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Rol:</strong> ${user.rol}</p>
            </div>
        `;
    }

    static showCourseDetail(courseId) {
        this.showView('courseDetailView');
        Courses.renderCourseDetail(courseId);
    }

    static showMessage(message, type = 'success') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.className = `message ${type} show`;
        
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});


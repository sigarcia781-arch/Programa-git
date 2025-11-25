const API_BASE_URL = 'http://localhost:3000/api';

class API {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Users
    static async getUser(id) {
        return this.request(`/users/${id}`);
    }

    static async updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Courses
    static async getCourses() {
        return this.request('/courses');
    }

    static async getCourse(id) {
        return this.request(`/courses/${id}`);
    }

    static async createCourse(courseData) {
        return this.request('/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    }

    // Enrollments
    static async enrollInCourse(courseId) {
        return this.request('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ curso_id: courseId })
        });
    }

    static async getMyCourses() {
        return this.request('/enrollments/my-courses');
    }

    static async getCourseStudents(courseId) {
        return this.request(`/enrollments/course/${courseId}/students`);
    }

    // Assignments
    static async getCourseAssignments(courseId) {
        return this.request(`/assignments/course/${courseId}`);
    }

    static async createAssignment(assignmentData) {
        return this.request('/assignments', {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });
    }
}


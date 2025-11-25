class Auth {
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static setUser(user, token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    }

    static logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
    }

    static getRole() {
        const user = this.getUser();
        return user ? user.rol : null;
    }
}


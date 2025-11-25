class Courses {
    static renderCoursesList(courses, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = '<p>No hay cursos disponibles.</p>';
            return;
        }

        container.innerHTML = courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <h3>${course.titulo}</h3>
                <p>${course.descripcion || 'Sin descripción'}</p>
                <div class="course-meta">
                    <span>Instructor: ${course.instructor_nombre || 'N/A'}</span>
                    <span>${new Date(course.fecha_creacion).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        // Agregar event listeners
        container.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', () => {
                const courseId = card.dataset.courseId;
                App.showCourseDetail(courseId);
            });
        });
    }

    static async renderCourseDetail(courseId) {
        try {
            const course = await API.getCourse(courseId);
            const assignments = await API.getCourseAssignments(courseId);
            const user = Auth.getUser();
            const isEnrolled = await this.checkEnrollment(courseId);

            const container = document.getElementById('courseDetailContent');
            if (!container) return;

            let enrollButton = '';
            if (user && user.rol === 'estudiante' && !isEnrolled) {
                enrollButton = '<button class="btn btn-primary" id="enrollBtn">Inscribirse al Curso</button>';
            }

            let assignmentsSection = '';
            if (assignments.length > 0) {
                assignmentsSection = `
                    <h3>Asignaciones</h3>
                    ${assignments.map(assignment => `
                        <div class="assignment-item">
                            <h4>${assignment.titulo}</h4>
                            <p>${assignment.descripcion || ''}</p>
                            <p><strong>Puntos:</strong> ${assignment.puntos}</p>
                            ${assignment.fecha_limite ? `<p><strong>Fecha límite:</strong> ${new Date(assignment.fecha_limite).toLocaleString()}</p>` : ''}
                        </div>
                    `).join('')}
                `;
            }

            container.innerHTML = `
                <div>
                    <button class="btn btn-secondary" id="backToCourses">← Volver a Cursos</button>
                    <h2>${course.titulo}</h2>
                    <p>${course.descripcion || 'Sin descripción'}</p>
                    <p><strong>Instructor:</strong> ${course.instructor_nombre}</p>
                    ${enrollButton}
                    ${assignmentsSection}
                </div>
            `;

            // Event listeners
            const backBtn = document.getElementById('backToCourses');
            if (backBtn) {
                backBtn.addEventListener('click', () => App.showView('coursesView'));
            }

            const enrollBtn = document.getElementById('enrollBtn');
            if (enrollBtn) {
                enrollBtn.addEventListener('click', () => this.enrollInCourse(courseId));
            }
        } catch (error) {
            App.showMessage('Error al cargar el curso: ' + error.message, 'error');
        }
    }

    static async checkEnrollment(courseId) {
        try {
            const myCourses = await API.getMyCourses();
            return myCourses.some(course => course.id === parseInt(courseId));
        } catch {
            return false;
        }
    }

    static async enrollInCourse(courseId) {
        try {
            await API.enrollInCourse(courseId);
            App.showMessage('Te has inscrito exitosamente al curso', 'success');
            setTimeout(() => {
                this.renderCourseDetail(courseId);
            }, 1000);
        } catch (error) {
            App.showMessage('Error al inscribirse: ' + error.message, 'error');
        }
    }
}


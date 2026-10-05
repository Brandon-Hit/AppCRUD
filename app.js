// Clase que representa a un Empleado
class Employee {
    constructor(id, name, email, position, department) {
        this.id = id || Date.now().toString(); // ID único basado en timestamp
        this.name = name;
        this.email = email;
        this.position = position;
        this.department = department;
    }
}

// Clase que maneja el CRUD y el almacenamiento (LocalStorage)
class EmployeeManager {
    constructor() {
        this.storageKey = 'employees_db';
        this.employees = this.loadFromStorage();
    }

    // Cargar datos de localStorage (Read inicial)
    loadFromStorage() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data).map(emp => new Employee(emp.id, emp.name, emp.email, emp.position, emp.department)) : [];
    }

    // Guardar datos en localStorage
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.employees));
    }

    // Create
    addEmployee(name, email, position, department) {
        const newEmployee = new Employee(null, name, email, position, department);
        this.employees.push(newEmployee);
        this.saveToStorage();
    }

    // Update
    updateEmployee(id, name, email, position, department) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees[index] = new Employee(id, name, email, position, department);
            this.saveToStorage();
        }
    }

    // Delete
    deleteEmployee(id) {
        this.employees = this.employees.filter(emp => emp.id !== id);
        this.saveToStorage();
    }

    // Obtener un empleado por ID
    getEmployeeById(id) {
        return this.employees.find(emp => emp.id === id);
    }
}

// --- CONTROLADOR DE LA INTERFAZ (UI) ---
const manager = new EmployeeManager();

// Elementos del DOM
const form = document.getElementById('employee-form');
const formTitle = document.getElementById('form-title');
const employeeIdInput = document.getElementById('employee-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const positionInput = document.getElementById('position');
const departmentInput = document.getElementById('department');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('employee-tbody');
const emptyMessage = document.getElementById('empty-message');

// Función para renderizar la tabla en pantalla
function renderTable() {
    tbody.innerHTML = '';
    
    if (manager.employees.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    } else {
        emptyMessage.style.display = 'none';
    }

    manager.employees.forEach(emp => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.email)}</td>
            <td>${escapeHtml(emp.position)}</td>
            <td>${escapeHtml(emp.department)}</td>
            <td>
                <button class="btn btn-edit" onclick="prepareEdit('${emp.id}')">Editar</button>
                <button class="btn btn-delete" onclick="deleteRecord('${emp.id}')">Borrar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Evitar inyección HTML básica en texto plano
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Manejar envío del formulario (Crear o Actualizar)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = employeeIdInput.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const position = positionInput.value.trim();
    const department = departmentInput.value;

    if (!name || !email || !position || !department) return;

    if (id === '') {
        // Operación CREATE
        manager.addEmployee(name, email, position, department);
    } else {
        // Operación UPDATE
        manager.updateEmployee(id, name, email, position, department);
        resetForm();
    }

    form.reset();
    renderTable();
});

// Preparar formulario para Editar (U)
window.prepareEdit = function(id) {
    const emp = manager.getEmployeeById(id);
    if (emp) {
        employeeIdInput.value = emp.id;
        nameInput.value = emp.name;
        emailInput.value = emp.email;
        positionInput.value = emp.position;
        departmentInput.value = emp.department;

        formTitle.textContent = 'Actualizar Empleado';
        btnSubmit.textContent = 'Actualizar';
        btnCancel.style.display = 'inline-block';
    }
};

// Borrar registro (D)
window.deleteRecord = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
        manager.deleteEmployee(id);
        renderTable();
        
        // Si estábamos editando justo el registro que se borró, limpiar formulario
        if (employeeIdInput.value === id) {
            resetForm();
            form.reset();
        }
    }
};

// Botón Cancelar edición
btnCancel.addEventListener('click', () => {
    resetForm();
    form.reset();
});

function resetForm() {
    employeeIdInput.value = '';
    formTitle.textContent = 'Agregar Nuevo Empleado';
    btnSubmit.textContent = 'Guardar Empleado';
    btnCancel.style.display = 'none';
}

// Inicializar la aplicación cargando los datos al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});

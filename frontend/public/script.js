const API_URL = '/api/users';

const userForm = document.getElementById('userForm');
const userIdInput = document.getElementById('userId');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const userTableBody = document.getElementById('userTableBody');
const loadingIndicator = document.getElementById('loadingIndicator');

let isEditing = false;

document.addEventListener('DOMContentLoaded', fetchUsers);
userForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);

async function fetchUsers() {
    try {
        loadingIndicator.classList.remove('hidden');
        const response = await fetch(API_URL);
        console.log('Response received:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load users. Please check your API connection.');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function displayUsers(users) {
    userTableBody.innerHTML = '';
    
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">No users found</td>';
        userTableBody.appendChild(row);
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id || 'N/A'}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td class="actions">
                <button type="button" class="edit" data-id="${user.id}">Edit</button>
                <button type="button" class="delete" data-id="${user.id}">Delete</button>
            </td>
        `;
        
        row.querySelector('.edit').addEventListener('click', () => editUser(user));
        row.querySelector('.delete').addEventListener('click', () => deleteUser(user.id));
        
        userTableBody.appendChild(row);
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const userData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim()
    };
    
    if (isEditing && userIdInput.value) {
        userData.id = parseInt(userIdInput.value);
    }
    
    try {
        let url = API_URL;
        let method = 'POST';
        
        if (isEditing && userData.id) {
            url = `${API_URL}/${userData.id}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('Response received:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        resetForm();
        fetchUsers();
        
        const actionText = isEditing ? 'updated' : 'added';
        alert(`User ${actionText} successfully!`);
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Failed to save user. Please try again.');
    }
}

function editUser(user) {
    userIdInput.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    
    submitBtn.textContent = 'Update User';
    cancelBtn.classList.remove('hidden');
    isEditing = true;
    
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        fetchUsers();
        alert('User deleted successfully!');
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
    }
}

function resetForm() {
    userForm.reset();
    userIdInput.value = '';
    submitBtn.textContent = 'Add User';
    cancelBtn.classList.add('hidden');
    isEditing = false;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
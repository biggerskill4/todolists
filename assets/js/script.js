// assets/js/script.js
// Updated main app with Supabase real-time sync

import { 
    supabase,
    addTask, 
    getTasks, 
    updateTask, 
    deleteTask,
    logOut,
    subscribeToTasks
} from './supabase-config.js';

// DOM Elements
const toDoListForm = document.querySelector('.tdlForm');
const itemField = document.querySelector('#itemField');
const itemBtn = document.querySelector('.tdlForm button[type="submit"]');
const itemLists = document.querySelector('.displayItems ul');
const displayItems = document.querySelector('.displayItems');
const logOutBtn = document.querySelector('.logOutBtn');

// State
let currentUser = null;
let subscription = null;
let isLoading = false;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = "./login-signup.html";
            return;
        }

        // Get current user from localStorage (set during login)
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            window.location.href = "./login-signup.html";
            return;
        }

        // Update UI with user name
        updateUserDisplay(currentUser);

        // Load initial tasks
        await loadTasks();

        // Subscribe to real-time updates
        subscribeToTaskUpdates();

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Error loading app. Please refresh.');
    }
});

// ============================================================
// USER DISPLAY
// ============================================================

function updateUserDisplay(user) {
    try {
        const userName = document.querySelector(".user_name .userName");
        const profilePanel = document.querySelector(".user_name .profilePanel");
        
        if (user.username) {
            const nameIndex = user.username.indexOf(' ');
            const nameFirstLetter = user.username[0];
            const nameSecondLetter = nameIndex > -1 ? user.username[nameIndex + 1] : user.username[1];
            const shortName = (nameFirstLetter + nameSecondLetter).toUpperCase();
            
            profilePanel.textContent = user.username;
            userName.textContent = shortName;
        } else if (user.email) {
            const shortName = user.email.substring(0, 2).toUpperCase();
            profilePanel.textContent = user.email;
            userName.textContent = shortName;
        }
    } catch (error) {
        console.error('Update user display error:', error);
    }
}

// ============================================================
// ADD TASK
// ============================================================

toDoListForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const itemFieldText = itemField.value.trim();

    if (itemFieldText === "") {
        alert('Please enter a task');
        return;
    }

    if (!currentUser) {
        alert('User not found. Please log in again.');
        window.location.href = "./login-signup.html";
        return;
    }

    try {
        isLoading = true;
        itemBtn.disabled = true;
        itemBtn.innerHTML = '<ion-icon name="hourglass"></ion-icon>';

        // Add task to Supabase
        const result = await addTask(currentUser.id, itemFieldText);

        if (result.success) {
            itemField.value = '';
            // Tasks will be updated via real-time subscription
        } else {
            alert(`Error adding task: ${result.error}`);
        }

    } catch (error) {
        console.error('Add task error:', error);
        alert('Error adding task. Please try again.');
    } finally {
        isLoading = false;
        itemBtn.disabled = false;
        itemBtn.innerHTML = '<ion-icon name="add-sharp"></ion-icon>';
    }
});

// ============================================================
// LOAD TASKS
// ============================================================

async function loadTasks() {
    try {
        if (!currentUser) return;

        const result = await getTasks(currentUser.id);

        if (result.success) {
            renderTasks(result.data);
        } else {
            console.error('Error loading tasks:', result.error);
            alert('Error loading tasks. Please refresh.');
        }
    } catch (error) {
        console.error('Load tasks error:', error);
    }
}

// ============================================================
// RENDER TASKS
// ============================================================

function renderTasks(tasks) {
    itemLists.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        displayItems.style.display = "none";
        return;
    }

    tasks.forEach((task) => {
        const statusClass = task.status === "completed" ? "completed" : "pending";
        const statusText = task.status === "completed" ? "Completed" : "Pending";

        const li = document.createElement("li");
        li.setAttribute('data-task-id', task.id);
        li.innerHTML = `
            <div class="text ${task.status === "completed" ? "done" : ""}">${escapeHtml(task.task)}</div>
            <div class="list_btn">
                <a href="#" class="cta_btn status-btn ${statusClass}" data-task-id="${task.id}">
                    <span class="taskStatus">${statusText}</span>
                </a>
                <a href="#" class="cta_btn edit-btn" data-task-id="${task.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                </a>
                <a href="#" class="cta_btn delete-btn" data-task-id="${task.id}">
                    <ion-icon name="trash-sharp"></ion-icon>
                </a>
            </div>`;

        itemLists.appendChild(li);
    });

    // Attach event listeners
    attachTaskEventListeners();

    // Show display items
    displayItems.style.display = "block";
}

// ============================================================
// ATTACH EVENT LISTENERS
// ============================================================

function attachTaskEventListeners() {
    // Status toggle
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', handleStatusChange);
    });

    // Delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });

    // Edit
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
}

// ============================================================
// HANDLE STATUS CHANGE
// ============================================================

async function handleStatusChange(e) {
    e.preventDefault();
    
    if (isLoading) return;

    const taskId = e.currentTarget.getAttribute('data-task-id');
    const taskElement = document.querySelector(`li[data-task-id="${taskId}"]`);
    const statusBtn = e.currentTarget;
    const taskStatusElement = statusBtn.querySelector('.taskStatus');

    // Get current status
    const isCompleted = taskStatusElement.textContent === "Completed";
    const newStatus = isCompleted ? "pending" : "completed";

    try {
        isLoading = true;
        statusBtn.disabled = true;

        const result = await updateTask(taskId, { status: newStatus });

        if (result.success) {
            // Update will come from real-time subscription
        } else {
            alert(`Error updating task: ${result.error}`);
        }

    } catch (error) {
        console.error('Status change error:', error);
        alert('Error updating task status.');
    } finally {
        isLoading = false;
        statusBtn.disabled = false;
    }
}

// ============================================================
// HANDLE DELETE
// ============================================================

async function handleDelete(e) {
    e.preventDefault();
    
    if (isLoading) return;

    const taskId = e.currentTarget.getAttribute('data-task-id');

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        isLoading = true;

        const result = await deleteTask(taskId);

        if (result.success) {
            // Update will come from real-time subscription
        } else {
            alert(`Error deleting task: ${result.error}`);
        }

    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting task.');
    } finally {
        isLoading = false;
    }
}

// ============================================================
// HANDLE EDIT
// ============================================================

async function handleEdit(e) {
    e.preventDefault();
    
    if (isLoading) return;

    const taskId = e.currentTarget.getAttribute('data-task-id');
    const taskElement = document.querySelector(`li[data-task-id="${taskId}"]`);
    const currentText = taskElement.querySelector('.text').textContent;

    const newValue = prompt("Edit your task", currentText);

    if (newValue === null || newValue.trim() === "") {
        return;
    }

    try {
        isLoading = true;

        const result = await updateTask(taskId, { task: newValue.trim() });

        if (result.success) {
            // Update will come from real-time subscription
        } else {
            alert(`Error updating task: ${result.error}`);
        }

    } catch (error) {
        console.error('Edit error:', error);
        alert('Error editing task.');
    } finally {
        isLoading = false;
    }
}

// ============================================================
// REAL-TIME SUBSCRIPTION
// ============================================================

function subscribeToTaskUpdates() {
    if (!currentUser) return;

    subscription = subscribeToTasks(currentUser.id, async (payload) => {
        console.log('Real-time update received:', payload.eventType);

        // Reload tasks on any change (INSERT, UPDATE, DELETE)
        await loadTasks();
    });
}

// ============================================================
// LOGOUT
// ============================================================

logOutBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        const result = await logOut();

        if (result.success) {
            // Clear local storage
            localStorage.removeItem("currentUser");
            sessionStorage.removeItem("currentUser");

            // Unsubscribe from real-time updates
            if (subscription) {
                subscription.unsubscribe?.();
            }

            // Redirect to login
            window.location.href = "./login-signup.html";
        } else {
            alert(`Logout failed: ${result.error}`);
        }

    } catch (error) {
        console.error('Logout error:', error);
        // Force logout anyway
        localStorage.removeItem("currentUser");
        window.location.href = "./login-signup.html";
    }
});

// ============================================================
// UTILITY: ESCAPE HTML
// ============================================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================================
// CLEANUP ON PAGE UNLOAD
// ============================================================

window.addEventListener('beforeunload', () => {
    if (subscription) {
        subscription.unsubscribe?.();
    }
});

// ============================================================
// CUSTOM CURSOR
// ============================================================

const cursor = document.createElement("div");
cursor.classList.add("custom-cursor");
document.body.appendChild(cursor);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const speed = 0.1;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
}

animateCursor();
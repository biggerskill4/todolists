const toDoListForm = document.querySelector('.tdlForm');
const itemField = document.querySelector('#itemField');
const itemBtn = document.querySelector('.tdlForm button[type="submit"]');
const itemLists = document.querySelector('.displayItems ul');
const displayItems = document.querySelector('.displayItems');
const logOutBtn = document.querySelector('.logOutBtn');

document.addEventListener("DOMContentLoaded", () => {
    myLists();

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        let userName = document.querySelector(".user_name .userName");
        let profilePanel = document.querySelector(".user_name .profilePanel");
        let nameIndex = currentUser.username.indexOf(' ');
        let nameFirstLetter = currentUser.username[0];
        let nameSecondLetter = currentUser.username[nameIndex + 1];
        let shortName = nameFirstLetter + nameSecondLetter;
        profilePanel.textContent = currentUser.username;
        userName.textContent = shortName;
    } else {
        window.location.href = "./login-signup.html"; 
    }

});


toDoListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemFieldText = itemField.value.trim();

    if (itemFieldText === "") {
        alert('Type something');
        return;
    }

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser) {
        return
    }

    let userToDoKey = `toDoLists_${currentUser.username}`; 

    let tasks = JSON.parse(localStorage.getItem(userToDoKey)) || [];
    tasks.push({task: itemFieldText, status: "pending"});
    localStorage.setItem(userToDoKey, JSON.stringify(tasks));

    itemField.value = '';
    myLists();
});


function myLists() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser) {
        return
    }

    let userToDoKey = `toDoLists_${currentUser.username}`; 

    let taskLists = JSON.parse(localStorage.getItem(userToDoKey)) || [];
    itemLists.innerHTML = "";

    taskLists.forEach((task, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div class="text">${task.task}</div>
            <div class="list_btn">
                <a href="#" class="cta_btn status-btn" data-index="${index}">
                    <span class="taskStatus"></span>
                </a>
                <a href="#" class="cta_btn edit-btn" data-index="${index}">
                    <ion-icon name="pencil-sharp"></ion-icon>
                </a>
                <a href="#" class="cta_btn delete-btn" data-index="${index}">
                    <ion-icon name="trash-sharp"></ion-icon>
                </a>
            </div>`;

        itemLists.appendChild(li);
    });

    if(itemLists.querySelector('li')) {
        displayItems.style.display = "block";
    } else {
        displayItems.style.display = "none";
    }

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', taskStatus);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editTask);
    });

}

function taskStatus(e) {
    e.preventDefault();
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let userToDoKey = `toDoLists_${currentUser.username}`; 
    let tasks = JSON.parse(localStorage.getItem(userToDoKey) || []);

    let index = e.target.closest('.status-btn').getAttribute('data-index');
    let statusBtn = e.target.closest('.status-btn');
    let taskStatusElement = statusBtn.querySelector('.taskStatus');

    if (tasks[index].status === "pending") {
        tasks[index].status = "completed";
        
    } else {
        tasks[index].status = "pending";
        
    }

    localStorage.setItem(userToDoKey, JSON.stringify(tasks));
    myLists();
}

function deleteTask(e) {
    e.preventDefault;

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let userToDoKey = `toDoLists_${currentUser.username}`; 
    let tasks = JSON.parse(localStorage.getItem(userToDoKey) || []);

    let index = e.target.closest('.delete-btn').getAttribute('data-index');
    tasks.splice(index, 1);
    localStorage.setItem(userToDoKey, JSON.stringify(tasks));
    myLists();
}

function editTask(e) {
    e.preventDefault();

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let userToDoKey = `toDoLists_${currentUser.username}`; 
    let tasks = JSON.parse(localStorage.getItem(userToDoKey) || []);

    let index = e.target.closest('.edit-btn').getAttribute('data-index');
    let newValue = prompt("Edit your Task", tasks[index].task);

    if(newValue !== null && newValue.trim() !== "") {
        tasks[index].task = newValue.trim() ;
        localStorage.setItem(userToDoKey, JSON.stringify(tasks));
        myLists();
    }
}


logOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    window.location.href = "./login-signup.html";
})




// Create cursor element
const cursor = document.createElement("div");
cursor.classList.add("custom-cursor");
document.body.appendChild(cursor);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const speed = 0.1; // Adjust this value for slower or faster movement

// Update target mouse position
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Animate cursor movement
function animateCursor() {
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
}

// Start animation loop
animateCursor();

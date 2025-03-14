const toDoListForm = document.querySelector('.tdlForm');
const itemField = document.querySelector('#itemField');
const itemBtn = document.querySelector('.tdlForm button[type="submit"]');
const itemLists = document.querySelector('.displayItems ul');
const displayItems = document.querySelector('.displayItems');

document.addEventListener("DOMContentLoaded", myLists);

document.addEventListener("DOMContentLoaded", () => {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        console.log(currentUser.signUpEmailAddress);
    }

});


toDoListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemFieldText = itemField.value.trim();

    if (itemFieldText === "") {
        alert('Type something');
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("toDoList")) || [];
    tasks.push(itemFieldText);
    localStorage.setItem("toDoList", JSON.stringify(tasks));

    itemField.value = '';
    myLists();
});


function myLists() {
    let taskLists = JSON.parse(localStorage.getItem("toDoList")) || [];
    itemLists.innerHTML = "";

    taskLists.forEach((task, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            <div class="text">${task}</div>
            <div class="list_btn">
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

        // Add event listeners for delete and edit buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editTask);
    });

}

function deleteTask(e) {
    e.preventDefault;
    let index = e.target.closest('.delete-btn').getAttribute('data-index');
    let tasks = JSON.parse(localStorage.getItem("toDoList") || []);
    tasks.splice(index, 1);
    localStorage.setItem("toDoList", JSON.stringify(tasks));
    myLists();
}


function editTask(e) {
    e.preventDefault();
    let index = e.target.closest('.edit-btn').getAttribute('data-index');
    let tasks = JSON.parse(localStorage.getItem("toDoList") || []);
    let newValue = prompt("Edit your Task", tasks[index]);

    if(newValue !== null && newValue.trim() !== "") {
        tasks[index] = newValue.trim() ;
        localStorage.setItem("toDoList", JSON.stringify(tasks));
        myLists();
    }
}


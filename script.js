const toDoListForm = document.querySelector('.tdlForm');
const itemField = document.querySelector('#itemField');
const itemBtn = document.querySelector('.tdlForm button[type="submit"]');
const itemLists = document.querySelector('.displayItems');



toDoListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemFieldText = itemField.value;
    if (itemFieldText === "") alert('Type something');

    let tasks = JSON.parse(localStorage.getItem("toDoList")) || [];
    tasks.push(itemFieldText);
    localStorage.setItem("toDoList", JSON.stringify(tasks));

   
    console.log(itemFieldText);
    itemField.value = '';
})

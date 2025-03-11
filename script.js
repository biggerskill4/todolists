const toDoListForm = document.querySelector('.tdlForm');
const itemField = document.querySelector('#itemField');
const itemBtn = document.querySelector('.tdlForm input[type="submit"]');
const itemLists = document.querySelector('.displayItems');

toDoListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemFieldText = itemField.value;

    
    console.log(itemFieldText);


    itemFieldText = '';
})
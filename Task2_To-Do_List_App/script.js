const InputTodo = document.getElementById('input-todo');
const ListDisplay = document.getElementById('list-display');

let AddTodo = ()=>{
    if (InputTodo.value === '') {
        alert('Please enter a to-do item');
    } else {
        let Todo_li = document.createElement('li');

        // Create checkbox element
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';

        // Create task text span
        let taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.innerHTML = InputTodo.value;

        // Create delete button
        let span = document.createElement('span');
        span.innerHTML = '\u00d7';
        span.className = 'delete-btn';

        // Append elements to the list item
        Todo_li.appendChild(checkbox);
        Todo_li.appendChild(taskText);
        Todo_li.appendChild(span);

        ListDisplay.appendChild(Todo_li);

        // Add event listener to checkbox to toggle completed state
        checkbox.addEventListener('change', function() {
            taskText.classList.toggle('checked', this.checked);
            saveTodo();
        });
    }
    InputTodo.value = ''; // Clear input after adding
    saveTodo();
}

ListDisplay.addEventListener('click', (event)=>{
    if(event.target.classList.contains('delete-btn')){
        event.target.parentElement.remove();
        saveTodo();
    }
});

let saveTodo = ()=>{
    localStorage.setItem('Data', ListDisplay.innerHTML);
}

let show_savedTodo = ()=>{
    const savedData = localStorage.getItem('Data');
    if (savedData) {
        // Check if the saved data contains the old format (without checkboxes)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = savedData;

        // If it contains old format (li elements without checkboxes), clear it
        const listItems = tempDiv.querySelectorAll('li');
        let hasOldDataFormat = false;

        for (let li of listItems) {
            // Check if the li doesn't have our new checkbox class
            if (!li.querySelector('.task-checkbox')) {
                hasOldDataFormat = true;
                break;
            }
        }

        if (hasOldDataFormat) {
            // Clear the old data
            localStorage.removeItem('Data');
        } else {
            ListDisplay.innerHTML = savedData;
            // Reattach event listeners to checkboxes in restored content
            document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const taskText = this.nextElementSibling;
                    taskText.classList.toggle('checked', this.checked);
                    saveTodo();
                });
            });
        }
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    show_savedTodo();
});
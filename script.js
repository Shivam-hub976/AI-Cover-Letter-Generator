// DOM Elements
const form = document.getElementById('coverLetterForm');

// State Logic: Capture form payload onSubmit
form.addEventListener('submit', function(event){

    // Prevent the default form submission (page reload)
    event.preventDefault();

    // Capture the current state of all inputs
    const formData = {
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        company: document.getElementById('company').value,
        skills: document.getElementById('skills').value
    };

    console.log("Captured Form State:", formData); //Temporary check
})
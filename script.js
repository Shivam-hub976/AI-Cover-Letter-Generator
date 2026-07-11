// Grab the DOM Elements
const form = document.getElementById('coverLetterForm');
const resultContainer = document.getElementById('resultContainer');
const letterOutput = document.getElementById('letterOutput');

// Controller function: Data Simulation via Template Literal
function generateTemplate(data) {
    return `Dear Hiring Manager at ${data.company},

My name is ${data.name} and I am writing to express my strong interest in the ${data.role} position at your company. 

I have a proven track record of delivering high-quality results and possess strong expertise in ${data.skills}. I admire the work ${data.company} is doing in the industry and I am eager to bring my technical background and collaborative spirit to your team.

Thank you for considering my application. I look forward to the possibility of discussing this exciting opportunity with you.

Sincerely,
${data.name}`;
}

// State Logic: Capture form payload onSubmit
form.addEventListener('submit', function(event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // Capture the inputs
    const formData = {
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        company: document.getElementById('company').value,
        skills: document.getElementById('skills').value
    };

    // Interpolate the state variables into the template
    const simulatedLetter = generateTemplate(formData);
    
    // Render the generated string to the UI
    letterOutput.textContent = simulatedLetter;
    
    // Unhide the result container
    resultContainer.classList.remove('hidden');
});
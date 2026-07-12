//Grab the DOM Elements
const form = document.getElementById('coverLetterForm');
const resultContainer = document.getElementById('resultContainer');
const letterOutput = document.getElementById('letterOutput');
const copyBtn = document.getElementById('copyBtn');

// State Logic & API Call
form.addEventListener('submit', async function(event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // UI State management: Show "Generating..."
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Generating...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.7;
    resultContainer.classList.add('hidden'); // Hide previous results if re-generating

    // Capture the inputs
    const formData = {
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        company: document.getElementById('company').value,
        skills: document.getElementById('skills').value
    };

    try {
        // API Integration : Sending data to secure node.js backend
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.letter) {
            //Render the Real ai generated string to the UI
            letterOutput.textContent = data.letter;

            //Unhide the result container
            resultContainer.classList.remove('hidden');

            //Smooth scroll down to the result container
            setTimeout(() => {
                resultContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
            }, 100);
            
        } else {
            alert("Failed to generate the cover letter. Please try again.");
        }

    } catch (error) {
        console.error('Error generating cover letter:', error);
        alert("An error occurred while generating the cover letter. Please try again.");
    } finally {
        // Reset the button back normal
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = 1;
    }

});

// UX Polish: Copy to Clipboard Utility
copyBtn.addEventListener('click', function() {
    // Grab the generated text from the DOM
    const textToCopy = letterOutput.textContent;
    
    // Utilize the modern Clipboard API
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback for the user
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied to Clipboard!";
        
        // Revert button text after 2 seconds
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy to clipboard. Please select the text and copy manually.");
    });
});
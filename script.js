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

    // Use FormData to package the text fields AND the PDF file together automatically
    const payload = new FormData(form);

    try {
        // API Integration : Sending data to secure node.js backend
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            body: payload 
        });

        const data = await response.json();

        if (data.letter) {
            // Format the markdown text into HTML paragraphs
            const formattedHTML = data.letter
                .split('\n\n')
                .filter(paragraph => paragraph.trim() !== '') 
                .map(paragraph => `<p style="margin-bottom: 15px;">${paragraph.replace(/\n/g, '<br>')}</p>`)
                .join('');

            // Render to the UI using innerHTML so the <p> tags actually act as HTML
            letterOutput.innerHTML = formattedHTML;

            // Unhide the result container
            resultContainer.classList.remove('hidden');

            // Smooth scroll down to the result container
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

// Copy to Clipboard Utility
copyBtn.addEventListener('click', function() { 
    // innerText respects the visual paragraph breaks created by our new HTML <p> tags.
    const textToCopy = letterOutput.innerText;
    
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
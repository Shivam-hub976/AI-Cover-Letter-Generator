// Grab the DOM Elements
const form = document.getElementById('coverLetterForm');
const resultContainer = document.getElementById('resultContainer');
const letterOutput = document.getElementById('letterOutput');
const copyBtn = document.getElementById('copyBtn');

// Security Utility: Prevent Cross-Site Scripting (XSS)
function sanitizeText(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

// State Logic & API Call
form.addEventListener('submit', async function(event) {
    // Prevent the page from refreshing
    event.preventDefault();

    // Frontend File Size Validation (Fail Fast)
    const fileInput = document.getElementById('resume');
    if (fileInput.files.length > 0) {
        const fileSize = fileInput.files[0].size; // Size in bytes
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        
        if (fileSize > maxSize) {
            alert("⚠️ Your resume is too large! Please upload a PDF smaller than 2MB.");
            fileInput.value = ''; // Instantly clear the invalid file from the input field
            return; // Stop the generation process completely
        }
    }

    // UI State management
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Analyzing & Generating...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    resultContainer.classList.add('hidden'); // Hide previous results if re-generating

    // Use FormData to package the text fields AND the PDF file together automatically
    const payload = new FormData(form);

    // DEPLOYMENT LOGIC: Determine if running locally or live on Netlify
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // IMPORTANT: Once you deploy to Render.com, paste your actual Render URL right here ↓
    const API_URL = isLocalhost 
        ? 'http://localhost:3000/generate' 
        : 'https://your-backend-name.onrender.com/generate';

    try {
        // API Integration: Sending data to secure Node.js backend
        const response = await fetch(API_URL, {
            method: 'POST',
            body: payload 
        });

        // Fetch doesn't throw on HTTP errors (like 400 or 500). We must check response.ok
        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }

        const data = await response.json();

        if (data.letter) {
            // Security: Sanitize the raw text first before injecting it as HTML
            const safeText = sanitizeText(data.letter);

            // Format the markdown text into HTML paragraphs
            const formattedHTML = safeText
                .split('\n\n')
                .filter(paragraph => paragraph.trim() !== '') 
                .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p><br>`)
                .join('');

            // Render to the UI
            letterOutput.innerHTML = formattedHTML;

            // Unhide the result container
            resultContainer.classList.remove('hidden');

            // Smooth scroll and set focus for screen readers
            setTimeout(() => {
                resultContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
                // Make the output box focusable temporarily for screen readers
                letterOutput.setAttribute('tabindex', '-1');
                letterOutput.focus();
            }, 100);
            
        } else {
            alert("Failed to generate the cover letter. Please try again.");
        }

    } catch (error) {
        alert("The AI servers are currently busy or unreachable. Please wait a moment and try again.");
    } finally {
        // Reset the button back to normal
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
});

// Copy to Clipboard Utility
copyBtn.addEventListener('click', function() {
    // innerText respects the visual paragraph breaks created by our HTML <p> tags.
    const textToCopy = letterOutput.innerText;
    
    // Utilize the modern Clipboard API
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback for the user
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied to Clipboard! ✓";
        copyBtn.style.backgroundColor = "#059669"; // Temporarily switch to success color
        
        // Revert button text after 2 seconds
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = ""; // Reset to CSS default
        }, 2000);
    }).catch(err => {
        alert("Failed to copy to clipboard. Please select the text and copy manually.");
    });
});
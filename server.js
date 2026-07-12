require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer'); //handles file uploads
const pdfParse = require('pdf-parse'); // Reads pdf text
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Set up the Express server
const app = express();
app.use(cors()); //Allows HTML frontend to communicate with this backend
app.use(express.json()); // Allows the server to read the incoming JSON data

// Configure multer to store the uploaded file temporarily in memory (RAM)
const upload = multer({storage: multer.memoryStorage()});


// Initialize the Gemini using the secure key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create the API endpoint that frontend will call
app.post('/generate', upload.single('resume'), async(req, res) => {
    try{
        //Capture the data sent from the frontend form
        const { name, role, company, skills} = req.body;

        // Parse the PDF file if it exists
        let resumeText = "";
        if (req.file){
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        }

        //Programmatic prompt engineering
        const prompt = `You are an expert career coach. Write a professional, concise, and compelling cover letter for the following candidate:
        - Candidate Name: ${name}
        - Target Role: ${role}
        - Target Company: ${company}
        - Key Skills: ${skills}
        
        Here is the candidate's actual resume text. Use this to highly contextualize the letter and highlight relevant achievements. 
        RESUME TEXT: 
        ${resumeText}
        
        STRICT FORMATTING RULES:
        1. Start immediately with the greeting (e.g., "Dear ${company} Hiring Team,").
        2. ABSOLUTELY NO HEADERS (No Date, Email, Phone, Address).
        3. DO NOT use brackets like [ ].
        4. Do not hallucinate experiences outside of the provided skills or resume.
        5. Use standard paragraph breaks.
        6. End exactly with: 
        Sincerely,
        ${name}
        
        Return ONLY the text of the letter, ready to copy.`;

        //Send the engineered prompt to Gemini
        const model = genAI.getGenerativeModel({model: 'gemini-2.5-flash'});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        //Send the finalized letter back to the frontend
        res.json({letter: generatedText});

       } catch (error) {
            console.error('Error generating cover letter:', error);
            res.status(500).json({ error: 'Failed to generate cover letter' });
        }
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Secure AI Server is running and listening on port ${PORT}`));

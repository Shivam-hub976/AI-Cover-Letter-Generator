require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Set up the Express server
const app = express();
app.use(cors()); //Allows HTML frontend to communicate with this backend
app.use(express.json()); // Allows the server to read the incoming JSON data

// Initialize the Gemini using the secure key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create the API endpoint that frontend will call
app.post('/generate', async(req, res) => {
    try{
        //Capture the data sent from the frontend form
        const { name, role, company, skills} = req.body;

        //Programmatic prompt engineering
        const prompt = `You are an expert career coach. Write a professional, concise, and compelling cover letter for the following candidate:
        
        - Candidate Name: ${name}
        - Target Role: ${role}
        - Target Company: ${company}
        - Key Skills: ${skills}

        The tone should be confident but humble. Do not hallucinate experiences outside of the provided skills. Do not include placehoders like "[Your Address]". Just return the letter content ready to copy.`;

        //Send the engineered prompt to Gemini
        const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
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

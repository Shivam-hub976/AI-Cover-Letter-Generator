require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', upload.single('resume'), async (req, res) => {
    try {
        const { name, role, company, skills } = req.body;
        
        // 1. Conditionally add the resume instruction
        let resumeInstruction = "";
        if (req.file) {
            resumeInstruction = "I am attaching the candidate's actual resume as a PDF file. Use it to highly contextualize the letter and highlight relevant achievements.";
        }

        // 2. Build the base text prompt
        const prompt = `You are an expert career coach. Write a professional, concise, and compelling cover letter for the following candidate:
        - Candidate Name: ${name}
        - Target Role: ${role}
        - Target Company: ${company}
        - Key Skills: ${skills}
        
        ${resumeInstruction}
        
        STRICT FORMATTING RULES:
        1. Start immediately with this EXACT greeting: "Dear ${company} Hiring Team," — do not change this.
        2. ABSOLUTELY NO HEADERS (No Date, Email, Phone, Address).
        3. DO NOT use brackets like [ ].
        4. Do not hallucinate experiences outside of the provided skills or resume.
        5. Use standard paragraph breaks.
        6. End exactly with: 
        Sincerely,
        ${name}
        
        Return ONLY the text of the letter, ready to copy.`;

        // 3. Prepare the Multimodal Payload
        const payload = [prompt];

        if (req.file) {
            console.log("--- DEBUG: PDF RECEIVED. SENDING DIRECTLY TO GEMINI ---");
            const pdfPart = {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            };
            payload.push(pdfPart);
        } else {
            console.log("--- DEBUG: NO PDF RECEIVED. GENERATING FROM TEXT ONLY ---");
        }

        // 4. Call the Model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(payload);
        const response = await result.response;
        const generatedText = response.text();

        res.json({ letter: generatedText });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate cover letter" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Secure AI Server is running and listening on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Limit file size to 2MB and STRICTLY enforce PDF only
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDFs are allowed.'));
        }
    }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', upload.single('resume'), async (req, res) => {
    try {
        const { name, role, company, skills } = req.body;
        
        // Backend Validation (Never trust the frontend)
        if (!name || !role || !company || !skills) {
            return res.status(400).json({ error: "Missing required text fields. Name, Role, Company, and Skills are mandatory." });
        }
        
        // Conditionally add the resume instruction
        let resumeInstruction = "";
        if (req.file) {
            resumeInstruction = "I am attaching the candidate's actual resume as a PDF file. Use it to highly contextualize the letter and highlight relevant achievements.";
        }

        // Build the base text prompt
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

        // Prepare the Multimodal Payload
        const payload = [prompt];

        if (req.file) {
            const pdfPart = {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            };
            payload.push(pdfPart);
        }

        // Call the Model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(payload);
        const response = await result.response;
        const generatedText = response.text();

        res.json({ letter: generatedText });

    } catch (error) {
        // Handle specific multer upload errors gracefully
        if (error.message.includes('Invalid file type') || error.message.includes('File too large')) {
            console.error("Upload Error:", error.message);
            return res.status(400).json({ error: error.message });
        }
        
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate cover letter due to an internal server error." });
    }
});

// Use environment port if available, otherwise default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure AI Server is running and listening on port ${PORT}`));
# AI Cover Letter Generator (SaaS)

A full-stack, AI-powered Software-as-a-Service (SaaS) application that dynamically generates highly contextualized, professional cover letters. This project ingests user parameters (Name, Role, Company, Skills) alongside an optional PDF resume upload, utilizing Google Gemini 2.5 Flash's multimodal capabilities to engineer tailored outputs.

**Live Demo:** https://ai-cover-letter-pro.netlify.app/

---

## Key Features

### Phase 1: Base MVP & UI Architecture

- **Pixel-Perfect Interface:** Fully responsive design tested across mobile and desktop breakpoints.
- **Accessibility (a11y) First:** Semantic HTML, ARIA live regions for dynamic content, and high-contrast CSS variables.
- **UX Polish:** Native `navigator.clipboard` integration for one-click copying with interactive visual feedback.
- **Fail-Fast Validation:** Frontend file size validation instantly rejects payloads > 2MB before triggering network requests.

### Phase 2: Security & LLM Integration

- **API Shielding:** Backend Node.js/Express proxy architecture. The Google Gemini API key is securely isolated via `.env` and `.gitignore`.
- **XSS Prevention:** Incoming AI payloads are fully sanitized to prevent Cross-Site Scripting before being parsed into clean HTML paragraphs.
- **State Management:** Disabled UI states and opacity toggles during the 2-5 second LLM latency window to prevent double-submissions.

### Phase 3: SaaS Capabilities & File Parsing

- **Dynamic Personalization:** Ingests raw PDF buffers via `multer` (RAM storage) to highly contextualize the cover letter with real applicant history.
- **Conditional Logic:** Seamlessly handles both "Text-Only" and "Text + PDF" generation workflows without server errors.

---

## Architecture Decision Record: Multimodal AI vs. Legacy Parsers

**The Challenge:** The initial technical specification suggested using `pdf-parse` (a standard Node-based OCR/text extraction library) to read uploaded resumes.

**The Decision:** We opted to completely bypass `pdf-parse` and instead engineer a **Multimodal AI Payload**, sending the raw PDF buffer directly to Gemini 2.5 Flash.

**Why we did not use `pdf-parse`:**

1. **Module Corruption:** The `pdf-parse` package is outdated and heavily incompatible with modern ES6 Node environments, resulting in fatal `TypeError` server crashes.
2. **Context Loss:** Traditional parsers scrape documents into a flat, unformatted string, stripping away visual hierarchy and nuance.

**What would happen if we used it?**
If we had forced the implementation of `pdf-parse`, the backend would be brittle, highly susceptible to memory leaks on complex PDFs, and prone to 500 Internal Server Errors. Furthermore, the AI would receive lower-quality context, resulting in generic cover letters. By utilizing Gemini's native vision/document engine via Base64 buffers, the architecture is faster, completely eliminates a vulnerable third-party dependency, and produces vastly superior contextual outputs.

---

## Tech Stack

- **Frontend:** HTML5, CSS3 (System UI Fonts, Mobile-First), Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Middleware:** Multer (Memory Storage, MIME-type validation)
- **AI Provider:** Google Generative AI SDK (`gemini-2.5-flash`)
- **Deployment & Cloud:** Netlify (Frontend CDN), Render (Backend Web Service)
- **Security:** `dotenv`, CORS, Custom Input Sanitization (XSS Prevention)

---

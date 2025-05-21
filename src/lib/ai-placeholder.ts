// Placeholder for AI-powered resume to static site conversion
// In a real application, this would involve a more sophisticated AI model
// and potentially a backend service to handle the processing.
import pdf from 'pdf-parse';
import { Buffer } from 'buffer'; // Import Buffer

interface ResumeData {
  name?: string;
  title?: string;
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
  skills?: string[];
  // Add more fields as needed based on common resume structures
}

// This is a very basic mock function.
// It does not actually parse the PDF.
async function parsePdfToStructuredData(fileBuffer: ArrayBuffer): Promise<ResumeData> {
  try {
    const buffer = Buffer.from(fileBuffer); // Convert ArrayBuffer to Buffer
    const data = await pdf(buffer);
    // This is a very basic extraction. A real AI model would be needed for robust parsing.
    // For now, we'll try to extract some common sections based on keywords.
    const text = data.text;

    // Basic extraction logic (highly simplified)
    let name = "";
    const nameMatch = text.match(/^([^\n\r]{5,50})$/m); // Try to get the first line as name if it's reasonable length
    if (nameMatch) {
      name = nameMatch[1].trim();
    }

    let title = "";
    const titleKeywords = ['Software Engineer', 'Developer', 'Designer', 'Manager', 'Analyst', 'Specialist', 'Consultant'];
    for (const keyword of titleKeywords) {
      const regex = new RegExp(`^.*${keyword}.*$`, 'im');
      const match = text.match(regex);
      if (match) {
        title = match[0].trim();
        break;
      }
    }

    let email = "";
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0];
    }

    let phone = "";
    const phoneMatch = text.match(/(\(\d{3}\)|\d{3})[- .]?\d{3}[- .]?\d{4}/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }

    let linkedin = "";
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
    if (linkedinMatch) {
      linkedin = linkedinMatch[0];
    }

    let github = "";
    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/);
    if (githubMatch) {
      github = githubMatch[0];
    }

    let summary = "";
    const summaryMatch = text.match(/(Summary|Profile|About Me)([\s\S]*?)(Experience|Skills|Projects|Education)/i);
    if (summaryMatch && summaryMatch[2]) {
      summary = summaryMatch[2].trim();
    }

    const experience: ResumeData['experience'] = [];
    const education: ResumeData['education'] = [];
    const skills: string[] = [];

    // Placeholder for more complex parsing of experience, education, skills
    // This would require a more sophisticated NLP approach

    console.log('Parsed PDF text length:', text.length);

    return {
      name: name || "Extracted Name (Fallback)",
      title: title || "Extracted Title (Fallback)",
      contact: {
        email: email || undefined,
        phone: phone || undefined,
        linkedin: linkedin || undefined,
        github: github || undefined,
      },
      summary: summary || "Could not extract summary.",
      experience: experience.length > 0 ? experience : [
        { title: "Sample Experience (Extraction Failed)", company: "N/A", period: "N/A", description: "Could not extract detailed experiences." }
      ],
      education: education.length > 0 ? education : [
        { degree: "Sample Education (Extraction Failed)", institution: "N/A", period: "N/A" }
      ],
      skills: skills.length > 0 ? skills : ["Could not extract skills"],
    };
  } catch (error) {
    console.error('Failed to parse PDF:', error);
    // Return a default error structure or the old mock data
    return {
      name: "Error Parsing PDF",
      title: "Please check PDF format",
      summary: `Error details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      experience: [],
      education: [],
      skills: [],
    };
  }
}

function generateHtml(data: ResumeData): string {
  // Basic HTML structure. This could be much more sophisticated with templates.
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${data.name || 'Your Name'}</h1>
        <h2>${data.title || 'Your Title'}</h2>
    </header>
    <main>
        <section id="contact">
            <h3>Contact</h3>
            <p>Email: ${data.contact?.email || 'N/A'}</p>
            <p>Phone: ${data.contact?.phone || 'N/A'}</p>
            ${data.contact?.linkedin ? `<p>LinkedIn: <a href="https://${data.contact.linkedin}" target="_blank">${data.contact.linkedin}</a></p>` : ''}
            ${data.contact?.github ? `<p>GitHub: <a href="https://${data.contact.github}" target="_blank">${data.contact.github}</a></p>` : ''}
        </section>
        <section id="summary">
            <h3>Summary</h3>
            <p>${data.summary || 'A brief professional summary.'}</p>
        </section>
        <section id="experience">
            <h3>Experience</h3>
            ${(data.experience || []).map(exp => `
            <article>
                <h4>${exp.title} at ${exp.company}</h4>
                <p class="period">${exp.period}</p>
                <p>${exp.description}</p>
            </article>
            `).join('')}
        </section>
        <section id="education">
            <h3>Education</h3>
            ${(data.education || []).map(edu => `
            <article>
                <h4>${edu.degree}</h4>
                <p>${edu.institution} (${edu.period})</p>
            </article>
            `).join('')}
        </section>
        <section id="skills">
            <h3>Skills</h3>
            <ul>
                ${(data.skills || []).map(skill => `<li>${skill}</li>`).join('')}
            </ul>
        </section>
    </main>
    <footer>
        <p>Generated by AI Resume to Portfolio Converter</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
  `;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateCss(_data: ResumeData): string {
  // Basic CSS. This would be much more sophisticated in a real app.
  return `
body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    color: #333;
}
header {
    background: #333;
    color: #fff;
    padding: 1rem 0;
    text-align: center;
}
header h1 {
    margin: 0;
    font-size: 2.5rem;
}
header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 300;
}
main {
    padding: 20px;
    max-width: 800px;
    margin: 20px auto;
    background: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}
section:last-child {
    border-bottom: none;
}
h3 {
    color: #333;
    margin-bottom: 10px;
}
article {
    margin-bottom: 15px;
}
article h4 {
    margin-bottom: 5px;
    color: #555;
}
.period {
    font-style: italic;
    color: #777;
    font-size: 0.9em;
}
ul {
    list-style: none;
    padding: 0;
}
ul li {
    background: #eef;
    padding: 5px;
    margin-bottom: 5px;
    border-radius: 3px;
}
footer {
    text-align: center;
    padding: 20px;
    background: #333;
    color: #fff;
    margin-top: 30px;
}
a {
    color: #3498db;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
  `;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateJs(_data: ResumeData): string {
  // Basic JS, e.g., for future interactivity.
  return `
console.log("Portfolio for User loaded.");
// Add any client-side interactivity here
// Example: Smooth scrolling for navigation links (if you add them)
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         document.querySelector(this.getAttribute('href')).scrollIntoView({
//             behavior: 'smooth'
//         });
//     });
// });
  `;
}

export async function generatePortfolioFromPdf(fileBuffer: ArrayBuffer): Promise<{ html: string; css: string; js: string }> {
  const structuredData = await parsePdfToStructuredData(fileBuffer);
  const html = generateHtml(structuredData);
  const css = generateCss(structuredData);
  const js = generateJs(structuredData);
  return { html, css, js };
}

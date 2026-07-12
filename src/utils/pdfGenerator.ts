import { jsPDF } from "jspdf";

interface PDFContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string;
  experienceBullets: string;
  education: string;
  certifications: string;
}

export function exportResumeToPDF(contact: PDFContact) {
  // Create PDF document (A4 size: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const margin = 15;
  const contentWidth = 210 - (margin * 2); // 180mm
  const maxY = pageHeight - margin;
  let y = 15;

  // Helper to handle automatic page breaking
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // 1. HEADER SECTION
  doc.setTextColor(17, 24, 39); // Slate 900
  
  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const nameWidth = doc.getTextWidth(contact.name);
  doc.text(contact.name, (210 - nameWidth) / 2, y);
  y += 7;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(225, 29, 72); // Rose 600
  const upperTitle = contact.title.toUpperCase();
  const titleWidth = doc.getTextWidth(upperTitle);
  doc.text(upperTitle, (210 - titleWidth) / 2, y);
  y += 6;

  // Contact Info Line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99); // Slate 600
  
  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github
  ].filter(Boolean);
  
  const contactStr = contactParts.join("   |   ");
  const contactWidth = doc.getTextWidth(contactStr);
  doc.text(contactStr, (210 - contactWidth) / 2, y);
  y += 5;

  // Horizontal Rule under Header
  doc.setDrawColor(229, 231, 235); // Grey 200
  doc.setLineWidth(0.4);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  // Section drawing helper
  const drawSectionHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 24, 39); // Slate 900
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    
    // Bottom thin line for section header
    doc.setDrawColor(225, 29, 72); // Rose 600 accent line
    doc.setLineWidth(0.35);
    doc.line(margin, y, 210 - margin, y);
    y += 5.5;
  };

  // 2. PROFESSIONAL SUMMARY
  if (contact.summary) {
    drawSectionHeader("Professional Summary");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81); // Slate 700
    
    const splitSummary = doc.splitTextToSize(contact.summary.trim(), contentWidth);
    splitSummary.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.8;
    });
    y += 4;
  }

  // 3. CORE TECHNICAL SKILLS
  if (contact.skills) {
    drawSectionHeader("Core Technical Skills");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81); // Slate 700
    
    const splitSkills = doc.splitTextToSize(contact.skills.trim(), contentWidth);
    splitSkills.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.8;
    });
    y += 4;
  }

  // 4. PROFESSIONAL EXPERIENCE (Michelin Rewritten Experience)
  if (contact.experienceBullets) {
    drawSectionHeader("Professional Experience");
    
    // We split by newline, handle bullets
    const bullets = contact.experienceBullets.split("\n").map(b => b.trim()).filter(Boolean);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81); // Slate 700
    
    bullets.forEach((bullet) => {
      // Clean up raw bullet point indicators
      let cleanBullet = bullet.replace(/^[•\s*-]+\s*/, "").trim();
      if (!cleanBullet) return;

      // Split bullet into wrapped lines
      const bulletWidth = contentWidth - 4; // slight padding for bullet point layout
      const splitBulletLines = doc.splitTextToSize(cleanBullet, bulletWidth);
      
      splitBulletLines.forEach((line: string, index: number) => {
        checkPageBreak(5);
        if (index === 0) {
          // Draw standard bullet point dot
          doc.setFont("helvetica", "bold");
          doc.setTextColor(225, 29, 72); // Rose 600 bullet
          doc.text("•", margin, y);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(55, 65, 81);
          doc.text(line, margin + 4, y);
        } else {
          doc.text(line, margin + 4, y);
        }
        y += 4.8;
      });
      y += 1.5; // space between bullets
    });
    y += 3;
  }

  // 5. EDUCATION
  if (contact.education) {
    drawSectionHeader("Education");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81); // Slate 700
    
    const educations = contact.education.split("\n").map(e => e.trim()).filter(Boolean);
    educations.forEach((edu) => {
      checkPageBreak(6);
      
      // Let's draw cleanly
      const splitEdu = doc.splitTextToSize(edu, contentWidth);
      splitEdu.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin, y);
        y += 4.8;
      });
      y += 1.5;
    });
    y += 3;
  }

  // 6. CERTIFICATIONS
  if (contact.certifications) {
    drawSectionHeader("Certifications");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81); // Slate 700
    
    const certs = contact.certifications.split("\n").map(c => c.trim()).filter(Boolean);
    certs.forEach((cert) => {
      checkPageBreak(6);
      
      const splitCert = doc.splitTextToSize(cert, contentWidth);
      splitCert.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin, y);
        y += 4.8;
      });
      y += 1.5;
    });
  }

  // Save the document
  const fileName = `${contact.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_michelin_resume.pdf`;
  doc.save(fileName);
}

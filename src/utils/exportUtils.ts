import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

// Export as PDF
export const exportToPDF = async (content: string, topic: string): Promise<void> => {
  try {
    // Create a temporary div to render markdown
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.color = '#000000';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    
    // Convert markdown to HTML (simple conversion)
    const htmlContent = convertMarkdownToHTML(content);
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Remove temp div
    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `${sanitizeFileName(topic)}_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export as PDF');
  }
};

// Export as Word
export const exportToWord = async (content: string, topic: string): Promise<void> => {
  try {
    const paragraphs = parseMarkdownToDocx(content, topic);
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${sanitizeFileName(topic)}_${Date.now()}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Word export error:', error);
    throw new Error('Failed to export as Word document');
  }
};

// Helper: Convert markdown to HTML (simple version)
const convertMarkdownToHTML = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraphs
  html = `<p>${html}</p>`;

  // Tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(cell => cell.trim());
    const cellsHtml = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
    return `<tr>${cellsHtml}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>)/s, '<table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0;">$1</table>');

  return html;
};

// Helper: Parse markdown to DOCX paragraphs
const parseMarkdownToDocx = (markdown: string, topic: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  // Add title
  paragraphs.push(
    new Paragraph({
      text: topic,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    })
  );

  const lines = markdown.split('\n');
  let inList = false;
  let tableRows: string[][] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inList) inList = false;
      if (inTable && tableRows.length > 0) {
        // Process table
        paragraphs.push(...createTableParagraphs(tableRows));
        tableRows = [];
        inTable = false;
      }
      continue;
    }

    // Tables
    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
      if (!cells.every(cell => cell.match(/^[-:]+$/))) { // Skip separator rows
        tableRows.push(cells);
      }
      continue;
    } else if (inTable && tableRows.length > 0) {
      paragraphs.push(...createTableParagraphs(tableRows));
      tableRows = [];
      inTable = false;
    }

    // Headers
    if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    }
    // Lists
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      inList = true;
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
    // Regular paragraphs
    else {
      const textRuns = parseInlineFormatting(line);
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Process remaining table
  if (inTable && tableRows.length > 0) {
    paragraphs.push(...createTableParagraphs(tableRows));
  }

  return paragraphs;
};

// Helper: Create table paragraphs
const createTableParagraphs = (rows: string[][]): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  
  rows.forEach((row, index) => {
    const isHeader = index === 0;
    const cellText = row.join(' | ');
    
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cellText,
            bold: isHeader,
          }),
        ],
        spacing: { after: 100 },
        border: {
          bottom: { style: 'single', size: 1, color: '000000' },
        },
      })
    );
  });

  paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  return paragraphs;
};

// Helper: Parse inline formatting (bold, italic)
const parseInlineFormatting = (text: string): TextRun[] => {
  const runs: TextRun[] = [];
  const regex = /(\*\*|__)(.*?)\1|\*(.*?)\*|_(.+?)_|([^*_]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Bold
      runs.push(new TextRun({ text: match[2], bold: true }));
    } else if (match[3] || match[4]) {
      // Italic
      runs.push(new TextRun({ text: match[3] || match[4], italics: true }));
    } else if (match[5]) {
      // Regular text
      runs.push(new TextRun({ text: match[5] }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
};

// Helper: Sanitize filename
const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
};

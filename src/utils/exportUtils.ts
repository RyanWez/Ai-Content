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
    tempDiv.style.color = '#1a1a1a';
    // Use system fonts that support Myanmar Unicode
    tempDiv.style.fontFamily = '"Pyidaungsu", "Myanmar Text", "Padauk", "Noto Sans Myanmar", Arial, sans-serif';
    tempDiv.style.fontSize = '16px';
    tempDiv.style.lineHeight = '1.8';

    // Add title
    const titleDiv = document.createElement('div');
    titleDiv.style.fontSize = '24px';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '20px';
    titleDiv.style.paddingBottom = '10px';
    titleDiv.style.borderBottom = '2px solid #333';
    titleDiv.textContent = topic || 'Generated Content';
    tempDiv.appendChild(titleDiv);

    // Convert markdown to HTML with better styling
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = convertMarkdownToHTML(content);

    // Apply styles to content
    const style = document.createElement('style');
    style.textContent = `
      h1, h2, h3, h4 { 
        color: #1a1a1a; 
        margin-top: 20px; 
        margin-bottom: 10px;
        font-weight: bold;
      }
      h1 { font-size: 22px; }
      h2 { font-size: 20px; }
      h3 { font-size: 18px; }
      p { 
        margin: 12px 0; 
        line-height: 1.8;
        text-align: justify;
      }
      ul, ol { 
        margin: 12px 0; 
        padding-left: 30px; 
      }
      li { 
        margin: 8px 0; 
        line-height: 1.8;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 20px 0;
        border: 2px solid #333;
      }
      th { 
        background-color: #f0f0f0; 
        padding: 12px; 
        border: 1px solid #666;
        font-weight: bold;
        text-align: left;
      }
      td { 
        padding: 10px; 
        border: 1px solid #999;
        line-height: 1.6;
      }
      strong { 
        font-weight: bold; 
        color: #000;
      }
      em { 
        font-style: italic; 
      }
      code {
        background-color: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
    `;
    tempDiv.appendChild(style);
    tempDiv.appendChild(contentDiv);
    document.body.appendChild(tempDiv);

    // Wait for fonts to load
    await document.fonts.ready;

    // Small delay to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert to canvas with higher quality
    const canvas = await html2canvas(tempDiv, {
      scale: 3, // Higher scale for better quality
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Remove temp div
    document.body.removeChild(tempDiv);

    // Create PDF with proper page handling
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // Margin in mm
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Calculate image dimensions to fit page with margins
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    let pageNumber = 1;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= contentHeight;

    // Add subsequent pages if needed
    while (heightLeft > 0) {
      position = -(contentHeight * pageNumber) + margin;
      pdf.addPage();
      pageNumber++;
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= contentHeight;
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

// Helper: Convert markdown to HTML (improved version)
const convertMarkdownToHTML = (markdown: string): string => {
  const lines = markdown.split('\n');
  const htmlLines: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];
  let isFirstTableRow = true;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Empty line
    if (!line.trim()) {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      if (inTable) {
        htmlLines.push('</tbody></table>');
        inTable = false;
        isFirstTableRow = true;
      }
      htmlLines.push('');
      continue;
    }

    // Tables
    if (line.trim().startsWith('|')) {
      if (!inTable) {
        htmlLines.push('<table>');
        inTable = true;
        isFirstTableRow = true;
      }

      // Skip separator line
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        htmlLines.push('</thead><tbody>');
        isFirstTableRow = false;
        continue;
      }

      const cells = line.split('|').filter(cell => cell.trim());
      const tag = isFirstTableRow ? 'th' : 'td';
      const cellsHtml = cells.map(cell => `<${tag}>${formatInline(cell.trim())}</${tag}>`).join('');

      if (isFirstTableRow) {
        htmlLines.push('<thead>');
      }
      htmlLines.push(`<tr>${cellsHtml}</tr>`);

      continue;
    }

    // Close table if we were in one
    if (inTable) {
      htmlLines.push('</tbody></table>');
      inTable = false;
      isFirstTableRow = true;
    }

    // Headers (check #### before ###, ## before #)
    if (line.startsWith('#### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h4>${formatInline(line.substring(5).trim())}</h4>`);
    } else if (line.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${formatInline(line.substring(4).trim())}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${formatInline(line.substring(3).trim())}</h2>`);
    } else if (line.startsWith('# ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h1>${formatInline(line.substring(2).trim())}</h1>`);
    }
    // Lists
    else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push(`<li>${formatInline(line.trim().substring(2))}</li>`);
    }
    // Numbered lists
    else if (line.trim().match(/^\d+\.\s/)) {
      const text = line.trim().replace(/^\d+\.\s/, '');
      if (!inList) {
        htmlLines.push('<ol>');
        inList = true;
      }
      htmlLines.push(`<li>${formatInline(text)}</li>`);
    }
    // Regular paragraphs
    else {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<p>${formatInline(line)}</p>`);
    }
  }

  // Close any open tags
  if (inList) htmlLines.push('</ul>');
  if (inTable) htmlLines.push('</tbody></table>');

  return htmlLines.join('\n');
};

// Helper: Format inline markdown (bold, italic, code)
const formatInline = (text: string): string => {
  // Code (before bold/italic to avoid conflicts)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold - use non-greedy matching
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic - use non-greedy matching
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');

  return text;
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

    // Headers (check #### before ###, ## before #)
    if (line.startsWith('#### ')) {
      paragraphs.push(
        new Paragraph({
          text: stripMarkdown(line.substring(5).trim()),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 150, after: 80 },
        })
      );
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: stripMarkdown(line.substring(4).trim()),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: stripMarkdown(line.substring(3).trim()),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: stripMarkdown(line.substring(2).trim()),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    }
    // Numbered lists
    else if (line.match(/^\d+\.\s/)) {
      inList = true;
      const text = stripMarkdown(line.replace(/^\d+\.\s/, ''));
      paragraphs.push(
        new Paragraph({
          text: text,
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 100 },
        })
      );
    }
    // Bullet Lists
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      inList = true;
      paragraphs.push(
        new Paragraph({
          text: stripMarkdown(line.substring(2)),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
    // Regular paragraphs
    else {
      try {
        const textRuns = parseInlineFormatting(line);
        paragraphs.push(
          new Paragraph({
            children: textRuns,
            spacing: { after: 200 },
          })
        );
      } catch (error) {
        // Fallback to plain text if parsing fails
        paragraphs.push(
          new Paragraph({
            text: stripMarkdown(line),
            spacing: { after: 200 },
          })
        );
      }
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
    const cellText = row.map(cell => stripMarkdown(cell)).join(' | ');

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

// Helper: Strip markdown formatting from text
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold
    .replace(/__(.+?)__/g, '$1')      // Remove bold
    .replace(/\*(.+?)\*/g, '$1')      // Remove italic
    .replace(/_(.+?)_/g, '$1')        // Remove italic
    .replace(/`(.+?)`/g, '$1');       // Remove code
};

// Helper: Parse inline formatting (bold, italic) - Simplified version
const parseInlineFormatting = (text: string): TextRun[] => {
  const runs: TextRun[] = [];

  // Simple approach: just strip markdown and return plain text
  // This avoids complex parsing issues
  const cleanText = stripMarkdown(text);

  // Check if original text had bold markers
  const hasBold = /\*\*(.+?)\*\*|__(.+?)__/.test(text);

  if (hasBold) {
    // Split by bold markers and create runs
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
    parts.forEach(part => {
      if (!part) return;

      if (part.startsWith('**') && part.endsWith('**')) {
        runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
      } else if (part.startsWith('__') && part.endsWith('__')) {
        runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
      } else {
        // Check for italic
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else if (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__')) {
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else {
          runs.push(new TextRun({ text: part }));
        }
      }
    });
  } else {
    // No formatting, just return plain text
    runs.push(new TextRun({ text: cleanText }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text: cleanText })];
};

// Helper: Sanitize filename
const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
};

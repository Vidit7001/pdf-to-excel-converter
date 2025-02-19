const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.array('pdfs'), async (req, res) => {
  try {
    const files = req.files;

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    let rowIndex = 1;

    // Process each PDF file
    for (const file of files) {
      const filePath = file.path;
      const pdfBytes = fs.readFileSync(filePath);

      // Load PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const textContent = pages.map(page => page.getTextContent()).flat();

      // Add PDF text to Excel
      textContent.forEach((text) => {
        worksheet.getCell(`A${rowIndex}`).value = text;
        rowIndex++;
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);
    }

    // Save Excel file
    const excelFilePath = path.join(__dirname, 'converted.xlsx');
    await workbook.xlsx.writeFile(excelFilePath);

    // Send Excel file as response
    res.download(excelFilePath, 'converted.xlsx', () => {
      fs.unlinkSync(excelFilePath); // Clean up generated Excel file
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Conversion failed.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
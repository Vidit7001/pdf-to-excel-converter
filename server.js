const app = express();
const upload = multer({ dest: 'uploads/' });
const express = require('express');
const cors = require('cors'); // Import the CORS package
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: 'https://vidit7001.github.io', // Replace with your GitHub Pages URL
  methods: ['POST'], // Allow POST requests
}));

const upload = multer({ dest: 'uploads/' });

// Your existing /convert route
app.post('/convert', upload.single('pdf'), async (req, res) => {
  // Your existing code
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
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

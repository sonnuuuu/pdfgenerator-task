import path from 'path';
import createPDF from "./services/PDFService";

const filePath = path.join(__dirname, '..','pdfFiles', 'pdfgenerator.pdf');
createPDF(filePath);

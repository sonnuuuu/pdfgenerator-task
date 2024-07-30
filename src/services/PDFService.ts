import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { Content, isImageContent, isTextContent } from './PDFContent';

export default async function createPDF(filePath: string) {
    const pdfDoc = await PDFDocument.create();

    await createFirstPage(pdfDoc);
    await createSecondPage(pdfDoc);

    await save(filePath, pdfDoc);
}

async function createFirstPage(pdfDoc: PDFDocument) {
    const page = pdfDoc.addPage();
    await addPageContent('If you look in the dictionary under perfectionist you see Henry Selick correcting the definition of perfectionist in the dictionary. I mean, he is so meticulous. DON DONNNNNNNNNNNN ', page, pdfDoc);
}

async function createSecondPage(pdfDoc: PDFDocument) {
    const page = pdfDoc.addPage();
    const imagePath = path.join(__dirname, '..', '..', 'images', 'channel.png');
    const imageBuffer = fs.readFileSync(imagePath);
    await addPageContent(imageBuffer, page, pdfDoc);
}

// async function addPageContent(content: Content, page: PDFpage, pdfDoc: PDFDocument) {
//     if (isTextContent(content)) {
//         addText(content, page, pdfDoc);

//     } else if (isImageContent(content)) {
//         addImage(content, page, pdfDoc);
//     }
// }

async function addPageContent(content: Content, page: PDFPage, pdfDoc: PDFDocument) {
    if (isTextContent(content)) {
        addParagraph(content, page, pdfDoc);
    } else if (isImageContent(content)) {
        addImage(content, page, pdfDoc);
    } else {
        throw new Error('Unknown content type');
    }
}

async function addImage(content: Buffer, page: PDFPage, pdfDoc: PDFDocument) {
    const embeddedImage = await pdfDoc.embedPng(content);
    const imageDimension = embeddedImage.scale(0.7);
    page.drawImage(embeddedImage, {
        x: page.getWidth() / 2 - imageDimension.width / 2,
        y: page.getHeight() / 2 - imageDimension.height / 2,
        width: imageDimension.width,
        height: imageDimension.height
    });
}

async function addText(text: string, page: PDFPage, pdfDoc: PDFDocument) {
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = 30;
    const { height } = page.getSize();
    const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
        x: page.getWidth() / 2 - textWidth / 2,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0.4, 0.71),
    });
}

async function addParagraph(text: string, page: PDFPage, pdfDoc: PDFDocument) {
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = 12;
    const lineHeight = fontSize + 2;
    const { width, height } = page.getSize();
    const margin = 50;
    const maxWidth = width - margin * 2;

    const words = text.split(' ');
    let line = '';
    let y = height - margin;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && n > 0) {
            page.drawText(line, {
                x: margin,
                y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            line = words[n] + ' ';
            y -= lineHeight;
        } else {
            line = testLine;
        }
    }
    page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });
}

async function save(filePath: string, pdfDoc: PDFDocument) {
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);
}

const fs = require('fs');
const sharp = require('sharp');

function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getSeconds()))
    throw new Error('formatDate\'s argument must be a string accepted as valid by Date() constructor');
  return date.toISOString().slice(0,7);
};

async function generateThumbnail(fileData, fileBuffer) {
  if (fileData.contentType === 'image/jpeg') {
    fs.writeFileSync(fileData.thumbnailPath, fileBuffer);
  
  } else if (fileData.contentType === 'image/png') {
    sharp(fileBuffer).toFile(fileData.thumbnailPath);
  
  } else if (fileData.contentType === 'application/pdf') {
    const mupdf = await import('mupdf');
      
    const doc = mupdf.Document.openDocument(
      fileBuffer,
      'application/pdf'
    );
    const page = doc.loadPage(0);
    const pixmap = page.toPixmap(
      mupdf.Matrix.identity, 
      mupdf.ColorSpace.DeviceRGB, 
      false, 
      true
    );
    const jpg = pixmap.asJPEG(90);
    fs.writeFileSync(fileData.thumbnailPath, Buffer.from(jpg));
  }
}

async function getFileUploadData(testimonyId, contentType) {
  const { nanoid } = await import('nanoid');

  const data = {};
  data.testimonyId = testimonyId;
  data.contentType = contentType;
  data.format = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf'
  }[data.contentType];
  data.name = nanoid() + '.' + data.format;
  data.path = '/documents/' + data.name
  data.thumbnailName = data.testimonyId + '.jpg';
  data.thumbnailPath = '/documents/' + data.thumbnailName;
  return data;
}

module.exports = {
  formatDate,
  generateThumbnail,
  getFileUploadData,
};
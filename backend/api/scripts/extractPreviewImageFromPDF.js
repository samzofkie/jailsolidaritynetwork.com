const mupdf = import('mupdf');

function extractPreviewImageFromPDF(pdf, previewPNGFilename) {
  const doc = mupdf.Document.openDocument(
    fs.readFileSync(pdf), 'application/pdf'
  );
  const page = doc.loadPage(0);
  const pixmap = page.toPixmap(mupdf.Matrix.identity, mupdf.ColorSpace.DeviceRGB, false, true);
  const pngImage = pixmap.asPNG();
  fs.writeFileSync(previewPNGFilename, Buffer.from(pngImage));
}
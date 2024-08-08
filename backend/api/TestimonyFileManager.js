const fs = require('fs');
const sharp = require('sharp');

class TestimonyFileUploadError extends Error {}

// The naming schema for the testimony files (in the /file directory) is
//   <id>-<fileNum>.<extension>
// File numbers start with 1.
// All thumbnails should be JPEGs, and should be named
//   <id>-thumbnail.jpg
class TestimonyFileManager {
  constructor(pool) {
    this.pool = pool;
    this.filesPath = 'files';
    this.validFileTypes = ['jpg', 'jpeg', 'pdf', 'png'];
    this.errorMessage = '';
  }

  async numberOfFilesForTestimony(testimonyId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM testimony_files WHERE testimony_id = $1', 
      [testimonyId]
    );
    return rows.length;
  }

  getFileExtension(fileObject) {
    return fileObject.originalname.split('.')[1];
  }

  validateFileType(fileExtension) {
    if (!(this.validFileTypes.includes(fileExtension)))
      throw new TestimonyFileUploadError(
        'Invalid file type! Supported file types are ' +
        this.validFileTypes.join(', ') + '.'
      );
  }

  async generateThumbnail(testimonyId, fileExtension, newFileName, newFilePath) {
    const thumbnailFileName = `${testimonyId}-thumbnail.jpg`;
    const thumbnailFilePath = `${this.filesPath}/${thumbnailFileName}`;
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      fs.copyFileSync(
        newFilePath,
        thumbnailFilePath
        `${this.filesPath}/${testimonyId}-thumbnail.jpg`
      );
    } else if (fileExtension === 'pdf') {
      // mupdf is only available as an ES6 module, so for now we're doing a
      // dynamic import each time we run this function
      const mupdf = await import('mupdf');
      
      const doc = mupdf.Document.openDocument(
        fs.readFileSync(newFilePath), 
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
      fs.writeFileSync(thumbnailFilePath, Buffer.from(jpg));
    } else if (fileExtension === 'png') {
      sharp(newFilePath).toFile(thumbnailFilePath);
    }
  }

  // insertNewFile returns the name of the newly uploaded file when successful,
  // the empty string when unsuccessful.
  async insertNewFile(testimonyId, fileObject) {
    try {
      const fileNum = (await this.numberOfFilesForTestimony(testimonyId)) + 1;
      const fileExtension = this.getFileExtension(fileObject);
      const newFileName = `${testimonyId}-${fileNum}.${fileExtension}`;
      const newFilePath = `${this.filesPath}/${newFileName}`;

      this.validateFileType(fileExtension);

      fs.renameSync(
        fileObject.path, 
        newFilePath,
      );

      // We need to await this insertion query to prevent a race between calls to
      // this method when uploading multiple files back to back
      await this.pool.query(
        'INSERT INTO testimony_files (testimony_id, file_name) VALUES ($1, $2)',
        [testimonyId, newFileName]
      );

      if (fileNum === 1) {
        this.generateThumbnail(testimonyId, fileExtension, newFileName, newFilePath);
      }

      return newFileName;

    } catch (error) {
      if (error instanceof TestimonyFileUploadError) {
        fs.unlinkSync(fileObject.path);

        this.errorMessage = error.message;
        return '';
      } else {
        throw error;
      }
    }
  }
}

module.exports = {
  TestimonyFileManager
}
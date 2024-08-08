const fs = require('fs');

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
    this.validFileTypes = ['jpg', 'jpeg'];
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

  generateThumbnail(testimonyId, fileExtension, newFileName) {
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      fs.copyFileSync(
        `${this.filesPath}/${newFileName}`,
        `${this.filesPath}/${testimonyId}-thumbnail.jpg`
      );
    }
  }

  // insertNewFile returns the name of the newly uploaded file when successful,
  // the empty string when unsuccessful.
  async insertNewFile(testimonyId, fileObject) {
    try {
      const fileNum = (await this.numberOfFilesForTestimony(testimonyId)) + 1;
      const fileExtension = this.getFileExtension(fileObject);
      const newFileName = `${testimonyId}-${fileNum}.${fileExtension}`;

      this.validateFileType(fileExtension);

      fs.renameSync(
        fileObject.path, 
        `${this.filesPath}/${newFileName}`,
      );

      // We need to await this insertion query to prevent a race between calls to
      // this method when uploading multiple files back to back
      await this.pool.query(
        'INSERT INTO testimony_files (testimony_id, file_name) VALUES ($1, $2)',
        [testimonyId, newFileName]
      );

      if (fileNum === 1) {
        this.generateThumbnail(testimonyId, fileExtension, newFileName);
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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { encryptedStorage } from '../storage/multer-config';

export const uploadDriverDocumentInterceptor = FileFieldsInterceptor(
  [
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ],
  {
    storage: encryptedStorage('permis'),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }
);

export const uploadCarDocumentInterceptor = FileFieldsInterceptor(
  [
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ],
  {
    storage: encryptedStorage('pasaport'),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }
);

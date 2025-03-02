import { diskStorage } from 'multer';
import { Request } from 'express';
import * as fs from 'fs';
import { extname } from 'path';
import { encryptFile } from '../storage/encryption';

export const encryptedStorage = (folderName: string) =>
  diskStorage({
    destination: (req: Request, file, callback) => {
      const userId = req.params.userId || 'unknown';
      const uploadPath = `./uploads/${userId}/${folderName}`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtName = extname(file.originalname);
      const rawFilePath = `${file.fieldname}-${uniqueSuffix}${fileExtName}`;
      const encryptedFilePath = `${rawFilePath}.enc`;

      callback(null, rawFilePath);

      setTimeout(() => {
        const fullRawPath = `./uploads/${req.params.userId}/${folderName}/${rawFilePath}`;
        const fullEncryptedPath = `./uploads/${req.params.userId}/${folderName}/${encryptedFilePath}`;

        encryptFile(fullRawPath, fullEncryptedPath);

        setTimeout(() => {
          if (fs.existsSync(fullEncryptedPath)) {
            fs.unlink(fullRawPath, (err) => {
              if (err) {
                console.error(`Failed to delete original file: ${fullRawPath}`, err);
              } else {
                console.log(`Successfully deleted original file: ${fullRawPath}`);
              }
            });
          }
        }, 5000);
      }, 1000);
    },
  });


export const rawStorage = (folderName: string) =>
  diskStorage({
    destination: (req: Request, file, callback) => {
      const userId = req.params.userId || 'unknown';
      const uploadPath = `./uploads/${userId}/${folderName}`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtName = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtName}`); // Save as raw image
    },
  });

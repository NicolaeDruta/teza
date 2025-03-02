import * as crypto from 'crypto';
import * as fs from 'fs';

const ENCRYPTION_KEY = Buffer.from(String(process.env.ENCRYPTION_KEY).slice(0, 32));
const IV_LENGTH = 16;

export function encryptFile(inputPath: string, outputPath: string): void {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  output.write(iv);
  input.pipe(cipher).pipe(output);

  output.on('finish', () => {
    console.log(`Encryption completed for ${inputPath}`);
  });

  output.on('error', (err) => {
    console.error(`Encryption failed for ${inputPath}:`, err);
  });
}

export function decryptFile(inputPath: string, outputPath: string): void {
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  let iv = Buffer.alloc(IV_LENGTH);
  input.read(iv.length);

  input.once('readable', () => {
    iv = input.read(IV_LENGTH);

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    input.pipe(decipher).pipe(output);

    output.on('finish', () => console.log('File decrypted successfully.'));
  });
}


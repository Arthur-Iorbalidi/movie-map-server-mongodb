import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
  async createImage(file): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.bmp',
        '.pdf',
        '.svg',
        '.webp',
      ];
      if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        throw new HttpException(
          'Unsupported file format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const fileName = uuid.v4() + fileExtension;
      const filePath = path.resolve(__dirname, '..', '..', 'static');

      try {
        await fs.promises.access(filePath);
      } catch {
        await fs.promises.mkdir(filePath, { recursive: true });
      }

      await fs.promises.writeFile(path.join(filePath, fileName), file.buffer);

      return fileName;
    } catch {
      throw new HttpException(
        'An error occurred while writing the file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

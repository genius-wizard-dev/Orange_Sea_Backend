import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadBufferToCloudinary(
    buffer: Buffer,
    fileName = 'avatar',
    folder = 'avatars',
  ): Promise<string> {
    this.logger.debug(`Uploading file: ${fileName} to folder: ${folder}`);
    this.logger.debug(`Buffer size: ${buffer.length} bytes`);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName,
          resource_type: 'image',
          overwrite: true, // Enable overwriting of existing images
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Upload error: ${error.message}`);
            return reject(error);
          }
          if (!result) {
            this.logger.error('Upload failed with no result');
            return reject(new Error('Upload failed with no result'));
          }
          this.logger.debug(`Upload successful. URL: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      const readable = new Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  }
}

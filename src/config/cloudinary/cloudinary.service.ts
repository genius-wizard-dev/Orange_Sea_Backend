import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  // Helper method to create a clean filename from the original filename
  private sanitizeFilename(filename: string): string {
    try {
      // Normalize Unicode characters first (important for Vietnamese characters)
      const normalizedName = filename.normalize('NFD');

      // Keep alphanumeric, dots, underscores, and hyphens
      // But preserve spaces (will be replaced with underscores later)
      return normalizedName
        .replace(/[^\p{L}\p{N}._\- ]/gu, '_')
        .replace(/\s+/g, '_')
        .toLowerCase();
    } catch (error) {
      this.logger.warn(`Error sanitizing filename: ${error.message}`);
      // Fallback to simple sanitization if Unicode normalization fails
      return filename
        .replace(/[^a-zA-Z0-9._\- ]/g, '_')
        .replace(/\s+/g, '_')
        .toLowerCase();
    }
  }

  // Helper method to preserve file extension and create unique filename that includes original name
  private getUniqueFilenameWithOriginal(originalFilename: string): string {
    // First ensure the originalFilename is properly decoded
    let decodedFilename;
    try {
      // Try to decode if it's already URI encoded
      decodedFilename = decodeURIComponent(originalFilename);
    } catch (e) {
      // If not encoded or there's an error, use as is
      decodedFilename = originalFilename;
    }

    // Extract the file extension and name
    const fileExtension = path.extname(decodedFilename);
    const baseFilename = path.basename(decodedFilename, fileExtension);

    // Sanitize the original filename to remove invalid characters
    const sanitizedName = this.sanitizeFilename(baseFilename);

    // Truncate the sanitized name if it's too long (max 50 chars)
    const truncatedName =
      sanitizedName.length > 50
        ? sanitizedName.substring(0, 50)
        : sanitizedName;

    // Generate a short unique ID (first 8 chars of UUID)
    const uniqueId = randomUUID().substring(0, 8);

    // Create a filename that includes original name for readability, but ensures uniqueness
    const uniqueFilename = `${truncatedName}_${uniqueId}${fileExtension}`;

    this.logger.debug(
      `Original: ${originalFilename}, Decoded: ${decodedFilename}, Sanitized: ${sanitizedName}, Generated: ${uniqueFilename}`,
    );

    return uniqueFilename;
  }

  async uploadBufferToCloudinary(
    buffer: Buffer,
    originalFilename: string = 'avatar.jpg',
    folder = 'avatars',
  ): Promise<{ url: string; fileSize: number; originalName: string }> {
    // Generate unique filename that includes original name and preserves extension
    const fileName = this.getUniqueFilenameWithOriginal(originalFilename);

    this.logger.debug(
      `Starting image upload: ${fileName} to folder: ${folder}`,
    );
    this.logger.debug(`Original filename: ${originalFilename}`);
    this.logger.debug(`Buffer size: ${buffer.length} bytes`);

    if (!buffer || buffer.length === 0) {
      this.logger.error('Empty buffer provided for upload');
      throw new Error('Empty file buffer');
    }

    return new Promise((resolve, reject) => {
      this.logger.debug('Creating upload stream for image');

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: path.parse(fileName).name, // Use filename without extension for public_id
          resource_type: 'image',
          overwrite: true,
          use_filename: true,
          unique_filename: false,
          display_name: originalFilename, // Store original filename as display name
          format: path.parse(originalFilename).ext.replace('.', ''), // Ensure extension is preserved
          context: {
            originalFilename: originalFilename, // Store the original filename in metadata
          },
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Image upload error: ${error.message}`, error);
            return reject(error);
          }
          if (!result) {
            this.logger.error('Image upload failed with no result');
            return reject(new Error('Upload failed with no result'));
          }

          this.logger.debug(
            `Image upload successful. URL: ${result.secure_url}`,
          );

          // Add a custom URL parameter with the original filename for better download experience
          const urlWithFilename = this.appendFilenameToUrl(
            result.secure_url,
            originalFilename,
          );

          this.logger.debug(`Final URL with filename: ${urlWithFilename}`);
          this.logger.debug(
            `Image details - format: ${result.format}, size: ${result.bytes}, dimensions: ${result.width}x${result.height}`,
          );

          resolve({
            url: urlWithFilename,
            fileSize: result.bytes,
            originalName: originalFilename,
          });
        },
      );

      try {
        this.logger.debug('Creating readable stream from buffer');
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);

        this.logger.debug('Piping buffer to upload stream');
        readable.pipe(stream);
      } catch (err) {
        this.logger.error(`Error creating stream: ${err.message}`, err.stack);
        reject(err);
      }
    });
  }

  async uploadVideoBufferToCloudinary(
    buffer: Buffer,
    originalFilename: string = 'video.mp4',
    folder = 'videos',
  ): Promise<{ url: string; fileSize: number; originalName: string }> {
    // Generate unique filename that includes original name and preserves extension
    const fileName = this.getUniqueFilenameWithOriginal(originalFilename);

    this.logger.debug(
      `Starting video upload: ${fileName} to folder: ${folder}`,
    );
    this.logger.debug(`Original filename: ${originalFilename}`);
    this.logger.debug(`Buffer size: ${buffer.length} bytes`);

    if (!buffer || buffer.length === 0) {
      this.logger.error('Empty buffer provided for video upload');
      throw new Error('Empty video buffer');
    }

    return new Promise((resolve, reject) => {
      this.logger.debug('Creating upload stream for video');

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: path.parse(fileName).name, // Use filename without extension for public_id
          resource_type: 'video',
          overwrite: true,
          use_filename: true,
          unique_filename: false,
          display_name: originalFilename,
          format: path.parse(originalFilename).ext.replace('.', ''), // Ensure extension is preserved
          context: {
            originalFilename: originalFilename, // Store the original filename in metadata
          },
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Video upload error: ${error.message}`, error);
            return reject(error);
          }
          if (!result) {
            this.logger.error('Video upload failed with no result');
            return reject(new Error('Upload failed with no result'));
          }

          this.logger.debug(
            `Video upload successful. URL: ${result.secure_url}`,
          );

          // Add a custom URL parameter with the original filename for better download experience
          const urlWithFilename = this.appendFilenameToUrl(
            result.secure_url,
            originalFilename,
          );

          this.logger.debug(`Final URL with filename: ${urlWithFilename}`);
          this.logger.debug(
            `Video details - format: ${result.format}, size: ${result.bytes}`,
          );

          resolve({
            url: urlWithFilename,
            fileSize: result.bytes,
            originalName: originalFilename,
          });
        },
      );

      try {
        this.logger.debug('Creating readable stream from video buffer');
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);

        this.logger.debug('Piping video buffer to upload stream');
        readable.pipe(stream);
      } catch (err) {
        this.logger.error(
          `Error creating video stream: ${err.message}`,
          err.stack,
        );
        reject(err);
      }
    });
  }

  async uploadRawFileToCloudinary(
    buffer: Buffer,
    originalFilename: string = 'document.pdf',
    folder = 'files',
  ): Promise<{ url: string; fileSize: number; originalName: string }> {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    // Generate unique filename that includes original name and preserves extension
    const fileName = this.getUniqueFilenameWithOriginal(originalFilename);

    this.logger.debug(
      `Starting raw file upload: ${fileName} to folder: ${folder}`,
    );
    this.logger.debug(`Original filename: ${originalFilename}`);
    this.logger.debug(
      `Buffer size: ${buffer.length} bytes, Max allowed: ${MAX_SIZE} bytes`,
    );

    if (!buffer || buffer.length === 0) {
      this.logger.error('Empty buffer provided for file upload');
      throw new Error('Empty file buffer');
    }

    if (buffer.length > MAX_SIZE) {
      this.logger.error(`File size (${buffer.length}) exceeds 10MB limit`);
      throw new Error('File size exceeds 10MB limit');
    }

    return new Promise((resolve, reject) => {
      this.logger.debug('Creating upload stream for raw file');

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: path.parse(fileName).name, // Use filename without extension for public_id
          resource_type: 'raw',
          overwrite: true,
          use_filename: true,
          unique_filename: false,
          display_name: originalFilename, // Store original filename as display name
          format: path.parse(originalFilename).ext.replace('.', ''), // Ensure extension is preserved
          context: {
            originalFilename: originalFilename, // Store the original filename in metadata
          },
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Raw file upload error: ${error.message}`, error);
            return reject(error);
          }
          if (!result) {
            this.logger.error('Raw file upload failed with no result');
            return reject(new Error('Upload failed with no result'));
          }

          this.logger.debug(
            `Raw file upload successful. URL: ${result.secure_url}`,
          );

          // Add a custom URL parameter with the original filename for better download experience
          const urlWithFilename = this.appendFilenameToUrl(
            result.secure_url,
            originalFilename,
          );

          this.logger.debug(`Final URL with filename: ${urlWithFilename}`);
          this.logger.debug(
            `File details - format: ${result.format || 'N/A'}, size: ${result.bytes}`,
          );

          resolve({
            url: urlWithFilename,
            fileSize: result.bytes,
            originalName: originalFilename,
          });
        },
      );

      try {
        this.logger.debug('Creating readable stream from file buffer');
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);

        this.logger.debug('Piping file buffer to upload stream');
        readable.pipe(stream);
      } catch (err) {
        this.logger.error(
          `Error creating file stream: ${err.message}`,
          err.stack,
        );
        reject(err);
      }
    });
  }

  // Helper method to append original filename as a query parameter
  private appendFilenameToUrl(url: string, originalFilename: string): string {
    try {
      // First, ensure we have the properly decoded original filename
      let decodedFilename;
      try {
        // Try to decode if it's already URI encoded
        decodedFilename = decodeURIComponent(originalFilename);
      } catch (e) {
        // If not encoded or there's an error, use as is
        decodedFilename = originalFilename;
      }

      // Ensure we have a valid filename
      const filename = decodedFilename || 'download';

      // For Vietnamese filenames, we need to carefully encode for URLs
      // Use encodeURIComponent but also ensure the filename is in a format
      // browsers will understand for downloads
      const encodedFilename = encodeURIComponent(filename);

      // Check if URL already has query parameters
      const separator = url.includes('?') ? '&' : '?';

      // Use Content-Disposition with attachment, which is better supported
      // for forcing downloads with proper filename
      return `${url}${separator}dl=${encodedFilename}`;
    } catch (error) {
      this.logger.error(`Error appending filename to URL: ${error.message}`);
      return url; // Return original URL if there's an error
    }
  }
}

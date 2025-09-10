import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export interface AudioFile {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export interface ImageFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadCallbacks {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export interface TrackMetadata {
  title: string;
  artist: string;
  genre: string;
  description?: string;
  fundingGoal: number;
  expectedROI: number;
  duration?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UploadData {
  audioFile: AudioFile;
  coverArt?: ImageFile;
  metadata: TrackMetadata;
}

class UploadService {
  // Audio file constraints
  private readonly AUDIO_MAX_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp3'];

  // Image file constraints
  private readonly IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];

  async pickAudioFile(): Promise<AudioFile | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const file = result.assets[0];
      
      // Validate file
      const validation = this.validateAudioFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      return {
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
        type: file.mimeType || 'audio/mpeg',
      };
    } catch (error) {
      console.error('Failed to pick audio file:', error);
      throw error;
    }
  }

  async pickImageFromLibrary(): Promise<ImageFile | null> {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access media library is required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for cover art
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      
      // Validate file
      const validation = this.validateImageFile({
        uri: asset.uri,
        size: fileInfo.size || 0,
        type: asset.type || 'image/jpeg',
      });
      
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      return {
        uri: asset.uri,
        name: `cover_art_${Date.now()}.jpg`,
        size: fileInfo.size || 0,
        type: asset.type || 'image/jpeg',
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error('Failed to pick image:', error);
      throw error;
    }
  }

  async takePhoto(): Promise<ImageFile | null> {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access camera is required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for cover art
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      return {
        uri: asset.uri,
        name: `photo_${Date.now()}.jpg`,
        size: fileInfo.size || 0,
        type: 'image/jpeg',
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.error('Failed to take photo:', error);
      throw error;
    }
  }

  validateAudioFile(file: any): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    // Check file size
    if (file.size && file.size > this.AUDIO_MAX_SIZE) {
      return { 
        isValid: false, 
        error: `File size too large. Maximum size is ${this.AUDIO_MAX_SIZE / (1024 * 1024)}MB` 
      };
    }

    // Check file type
    if (file.mimeType && !this.AUDIO_FORMATS.includes(file.mimeType)) {
      return { 
        isValid: false, 
        error: 'Invalid file format. Please select MP3 or WAV files only' 
      };
    }

    return { isValid: true };
  }

  validateImageFile(file: any): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    // Check file size
    if (file.size && file.size > this.IMAGE_MAX_SIZE) {
      return { 
        isValid: false, 
        error: `Image size too large. Maximum size is ${this.IMAGE_MAX_SIZE / (1024 * 1024)}MB` 
      };
    }

    // Check file type
    if (file.type && !this.IMAGE_FORMATS.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Invalid image format. Please select JPEG or PNG files only' 
      };
    }

    return { isValid: true };
  }

  async getAudioDuration(uri: string): Promise<number> {
    try {
      // This is a placeholder - in a real implementation, you might use
      // a library like react-native-audio-recorder-player or expo-av
      // to get the actual duration
      return 0;
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      return 0;
    }
  }

  // Mock upload function - replace with actual API call
  async uploadFile(
    file: AudioFile | ImageFile, 
    callbacks: UploadCallbacks = {}
  ): Promise<string> {
    try {
      // Simulate upload progress
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const progress: UploadProgress = {
          loaded: (file.size * i) / totalSteps,
          total: file.size,
          percentage: (i / totalSteps) * 100,
        };
        
        callbacks.onProgress?.(progress);
      }

      // Mock successful upload - return a fake URL
      const mockUrl = `https://murex-streams.com/uploads/${file.name}`;
      callbacks.onSuccess?.(mockUrl);
      
      return mockUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Comprehensive form validation
  validateTrackMetadata(metadata: TrackMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!metadata.title || metadata.title.trim().length === 0) {
      errors.push('Track title is required');
    } else if (metadata.title.length < 2) {
      errors.push('Track title must be at least 2 characters long');
    } else if (metadata.title.length > 100) {
      errors.push('Track title must be less than 100 characters');
    }

    // Artist validation
    if (!metadata.artist || metadata.artist.trim().length === 0) {
      errors.push('Artist name is required');
    } else if (metadata.artist.length < 2) {
      errors.push('Artist name must be at least 2 characters long');
    } else if (metadata.artist.length > 50) {
      errors.push('Artist name must be less than 50 characters');
    }

    // Genre validation
    if (!metadata.genre || metadata.genre.trim().length === 0) {
      errors.push('Genre is required');
    }

    // Description validation (optional but with limits)
    if (metadata.description && metadata.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    // Funding goal validation
    if (!metadata.fundingGoal || metadata.fundingGoal <= 0) {
      errors.push('Funding goal must be greater than 0');
    } else if (metadata.fundingGoal < 100) {
      warnings.push('Low funding goal may limit investment interest');
    } else if (metadata.fundingGoal > 1000000) {
      warnings.push('Very high funding goal may be difficult to achieve');
    }

    // Expected ROI validation
    if (!metadata.expectedROI || metadata.expectedROI <= 0) {
      errors.push('Expected ROI must be greater than 0');
    } else if (metadata.expectedROI < 5) {
      warnings.push('Low ROI may not attract investors');
    } else if (metadata.expectedROI > 100) {
      warnings.push('Very high ROI claims may seem unrealistic');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Validate complete upload data
  validateUploadData(uploadData: UploadData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate audio file
    const audioValidation = this.validateAudioFile(uploadData.audioFile);
    if (!audioValidation.isValid && audioValidation.error) {
      errors.push(`Audio: ${audioValidation.error}`);
    }

    // Validate cover art if provided
    if (uploadData.coverArt) {
      const imageValidation = this.validateImageFile(uploadData.coverArt);
      if (!imageValidation.isValid && imageValidation.error) {
        errors.push(`Cover Art: ${imageValidation.error}`);
      }
    } else {
      warnings.push('No cover art provided - consider adding one for better visibility');
    }

    // Validate metadata
    const metadataValidation = this.validateTrackMetadata(uploadData.metadata);
    errors.push(...metadataValidation.errors);
    warnings.push(...metadataValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Upload complete track with metadata
  async uploadTrack(
    uploadData: UploadData,
    callbacks: UploadCallbacks = {}
  ): Promise<{ trackId: string; audioUrl: string; coverArtUrl?: string }> {
    try {
      // Validate all data first
      const validation = this.validateUploadData(uploadData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Upload audio file
      callbacks.onProgress?.({ loaded: 0, total: 100, percentage: 0 });
      const audioUrl = await this.uploadFile(uploadData.audioFile, {
        onProgress: (progress) => {
          callbacks.onProgress?.({
            loaded: progress.loaded * 0.7, // Audio takes 70% of progress
            total: 100,
            percentage: progress.percentage * 0.7,
          });
        },
      });

      // Upload cover art if provided
      let coverArtUrl: string | undefined;
      if (uploadData.coverArt) {
        coverArtUrl = await this.uploadFile(uploadData.coverArt, {
          onProgress: (progress) => {
            callbacks.onProgress?.({
              loaded: 70 + (progress.loaded * 0.2), // Cover art takes 20% of progress
              total: 100,
              percentage: 70 + (progress.percentage * 0.2),
            });
          },
        });
      }

      // Simulate metadata upload (10% of progress)
      callbacks.onProgress?.({ loaded: 90, total: 100, percentage: 90 });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate mock track ID
      const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      callbacks.onProgress?.({ loaded: 100, total: 100, percentage: 100 });
      
      const result = { trackId, audioUrl, coverArtUrl };
      callbacks.onSuccess?.(result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Retry upload with exponential backoff
  async uploadWithRetry(
    file: AudioFile | ImageFile,
    callbacks: UploadCallbacks = {},
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadFile(file, callbacks);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Upload failed');
        
        if (attempt < maxRetries) {
          // Exponential backoff: wait 2^attempt seconds
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          callbacks.onError?.(`Upload attempt ${attempt} failed, retrying in ${delay/1000}s...`);
        }
      }
    }

    throw lastError || new Error('Upload failed after all retries');
  }

  // Cancel upload (placeholder for real implementation)
  cancelUpload(): void {
    // In a real implementation, this would cancel ongoing uploads
    console.log('Upload cancelled');
  }

  // Get supported genres
  getSupportedGenres(): string[] {
    return [
      'Pop',
      'Rock',
      'Hip Hop',
      'R&B',
      'Country',
      'Electronic',
      'Jazz',
      'Classical',
      'Folk',
      'Reggae',
      'Blues',
      'Funk',
      'Indie',
      'Alternative',
      'Metal',
      'Punk',
      'Soul',
      'Gospel',
      'World',
      'Other',
    ];
  }

  // Format file size helper
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format duration helper
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const uploadService = new UploadService();
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-audio';
import {
  Upload,
  Music,
  CheckCircle,
  X,
  Play,
  Pause,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import { supportsAudio, safeCall } from '../../utils/platformUtils';

interface FileUploaderProps {
  onFileSelect: (file: any) => void;
  onFileRemove: () => void;
  selectedFile?: any;
  acceptedFormats?: string[];
  maxSizeInMB?: number;
  showPreview?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  acceptedFormats = ['mp3', 'wav', 'flac'],
  maxSizeInMB = 50,
  showPreview = true,
}) => {
  const { colors } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (sound && supportsAudio) {
        safeCall(
          () => sound.unloadAsync(),
          undefined,
          'Failed to cleanup audio preview'
        );
      }
    };
  }, [sound]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: any): boolean => {
    // Check if file exists and has required properties
    if (!file || !file.name || !file.size) {
      Alert.alert('Invalid File', 'The selected file appears to be corrupted or invalid.');
      return false;
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      Alert.alert(
        'Invalid Format',
        `Please select a file in one of these formats: ${acceptedFormats.join(', ').toUpperCase()}\n\nSelected file: ${file.name}`
      );
      return false;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      Alert.alert(
        'File Too Large',
        `File size must be less than ${maxSizeInMB}MB.\n\nYour file: ${fileSizeInMB.toFixed(1)}MB\nMaximum allowed: ${maxSizeInMB}MB`
      );
      return false;
    }

    // Check minimum file size (avoid empty files)
    if (file.size < 1024) { // Less than 1KB
      Alert.alert(
        'File Too Small',
        'The selected file appears to be too small to be a valid audio file.'
      );
      return false;
    }

    return true;
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    setDragActive(false);

    if (Platform.OS !== 'web') return;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Create a file object compatible with our validation
    const fileObject = {
      name: file.name,
      size: file.size,
      uri: URL.createObjectURL(file),
      type: file.type,
    };

    if (validateFile(fileObject)) {
      setIsUploading(true);
      setPreviewError(null);
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setIsUploading(false);
      onFileSelect(fileObject);
    }
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Create a file object with the required properties
        const fileObject = {
          name: file.name,
          size: file.size || 0,
          uri: file.uri,
          type: file.mimeType || 'audio/mpeg',
        };

        if (validateFile(fileObject)) {
          setIsUploading(true);
          setPreviewError(null);
          
          // Simulate upload progress (in real app, this would be actual upload)
          for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          setIsUploading(false);
          onFileSelect(fileObject);
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.error('File selection error:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const handleRemoveFile = () => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            // Clean up audio preview
            if (sound && supportsAudio) {
              await safeCall(
                () => sound.unloadAsync(),
                undefined,
                'Failed to cleanup audio preview'
              );
              setSound(null);
            }
            setIsPlaying(false);
            setUploadProgress(0);
            setPreviewError(null);
            onFileRemove();
          }
        },
      ]
    );
  };

  const togglePreview = async () => {
    if (!selectedFile?.uri) {
      Alert.alert('Error', 'No audio file available for preview');
      return;
    }

    if (!supportsAudio) {
      Alert.alert('Preview Unavailable', 'Audio preview is not supported on this platform');
      return;
    }

    try {
      if (isPlaying && sound) {
        // Stop current playback
        await safeCall(
          () => sound.pauseAsync(),
          undefined,
          'Failed to pause audio preview'
        );
        setIsPlaying(false);
      } else {
        // Start playback
        if (sound) {
          await safeCall(
            () => sound.playAsync(),
            undefined,
            'Failed to resume audio preview'
          );
          setIsPlaying(true);
        } else {
          // Load and play new sound
          const result = await safeCall(
            async () => {
              const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: selectedFile.uri },
                { shouldPlay: true, volume: 0.5 }
              );
              return newSound;
            },
            null,
            'Failed to load audio preview'
          );

          if (result) {
            setSound(result);
            setIsPlaying(true);
            setPreviewError(null);

            // Set up playback status update
            result.setOnPlaybackStatusUpdate((status: any) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
              }
            });
          } else {
            throw new Error('Failed to create audio preview');
          }
        }
      }
    } catch (error) {
      console.error('Audio preview error:', error);
      setPreviewError('Unable to preview this audio file');
      setIsPlaying(false);
      Alert.alert('Preview Error', 'Unable to preview this audio file. The file may be corrupted or in an unsupported format.');
    }
  };

  const renderUploadArea = () => (
    <TouchableOpacity
      style={[
        styles.uploadArea,
        {
          backgroundColor: dragActive ? colors.primary + '20' : colors.surface,
          borderColor: dragActive ? colors.primary : colors.border,
        }
      ]}
      onPress={handleFileSelect}
      disabled={isUploading}
      activeOpacity={0.7}
      {...(Platform.OS === 'web' && {
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
        onDragOver: (e: any) => e.preventDefault(),
        onDrop: handleDrop,
      })}
    >
      <LinearGradient
        colors={[
          colors.surface,
          colors.background + '80',
        ]}
        style={styles.uploadGradient}
      >
        <Upload size={48} color={colors.primary} />
        <Text style={[styles.uploadTitle, { color: colors.text }]}>
          {isUploading ? 'Uploading...' : 'Select Audio File'}
        </Text>
        <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
          Tap to browse or drag & drop your music file
        </Text>
        <Text style={[styles.uploadFormats, { color: colors.textSecondary }]}>
          Supported: {acceptedFormats.join(', ').toUpperCase()} • Max {maxSizeInMB}MB
        </Text>
        
        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${uploadProgress}%`,
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.primary }]}>
              {uploadProgress}%
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSelectedFile = () => (
    <View style={[styles.selectedFile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.fileInfo}>
        <View style={styles.fileIcon}>
          <Music size={24} color={colors.primary} />
        </View>
        <View style={styles.fileDetails}>
          <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
            {selectedFile.name}
          </Text>
          <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
            {formatFileSize(selectedFile.size)}
          </Text>
          <View style={styles.fileStatus}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={[styles.statusText, { color: colors.success }]}>
              {previewError ? 'Preview unavailable' : 'Ready to upload'}
            </Text>
            {previewError && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {previewError}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.fileActions}>
        {showPreview && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={togglePreview}
          >
            {isPlaying ? (
              <Pause size={20} color={colors.primary} />
            ) : (
              <Play size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
          onPress={handleRemoveFile}
        >
          <X size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderValidationInfo = () => (
    <View style={styles.validationInfo}>
      <View style={styles.validationItem}>
        <CheckCircle size={16} color={colors.success} />
        <Text style={[styles.validationText, { color: colors.textSecondary }]}>
          High quality audio (320kbps or higher) recommended
        </Text>
      </View>
      <View style={styles.validationItem}>
        <AlertCircle size={16} color={colors.warning} />
        <Text style={[styles.validationText, { color: colors.textSecondary }]}>
          Ensure you have rights to distribute this music
        </Text>
      </View>
      <View style={styles.validationItem}>
        <CheckCircle size={16} color={colors.success} />
        <Text style={[styles.validationText, { color: colors.textSecondary }]}>
          Files are processed securely and encrypted
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {selectedFile ? renderSelectedFile() : renderUploadArea()}
      {!selectedFile && renderValidationInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 200,
  },
  uploadGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadFormats: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  selectedFile: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    marginBottom: 4,
  },
  fileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationInfo: {
    marginTop: 16,
    gap: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 14,
    flex: 1,
  },
});
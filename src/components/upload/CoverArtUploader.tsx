import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  Crop,
  Palette,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = Math.min(screenWidth - 64, 300);

interface CoverArtUploaderProps {
  onImageSelect: (image: any) => void;
  onImageRemove: () => void;
  selectedImage?: any;
  showDefaultOptions?: boolean;
}

const defaultCovers = [
  { 
    id: 1, 
    uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center', 
    name: 'Abstract Blue' 
  },
  { 
    id: 2, 
    uri: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop&crop=center', 
    name: 'Neon Waves' 
  },
  { 
    id: 3, 
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center', 
    name: 'Gradient Sunset' 
  },
  { 
    id: 4, 
    uri: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=300&fit=crop&crop=center', 
    name: 'Geometric Pattern' 
  },
  { 
    id: 5, 
    uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center', 
    name: 'Dark Minimal' 
  },
  { 
    id: 6, 
    uri: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=300&fit=crop&crop=center', 
    name: 'Colorful Abstract' 
  },
];

export const CoverArtUploader: React.FC<CoverArtUploaderProps> = ({
  onImageSelect,
  onImageRemove,
  selectedImage,
  showDefaultOptions = true,
}) => {
  const { colors } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [showDefaults, setShowDefaults] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const validateImage = (image: any): boolean => {
    // Check if image object is valid
    if (!image || !image.uri) {
      Alert.alert('Invalid Image', 'The selected image appears to be invalid.');
      return false;
    }

    // Check file format if name is provided
    if (image.name) {
      const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
      const fileExtension = image.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension && !validFormats.includes(fileExtension)) {
        Alert.alert(
          'Invalid Format',
          'Please select a JPG, PNG, or WebP image file.'
        );
        return false;
      }
    }

    // Check file size (max 10MB) if size is provided
    if (image.size && image.size > 10 * 1024 * 1024) {
      const sizeMB = (image.size / (1024 * 1024)).toFixed(1);
      Alert.alert(
        'File Too Large',
        `Image size must be less than 10MB.\n\nYour image: ${sizeMB}MB`
      );
      return false;
    }

    // Check dimensions if provided
    if (image.width && image.height) {
      const aspectRatio = image.width / image.height;
      if (Math.abs(aspectRatio - 1) > 0.1) { // Allow 10% tolerance for square ratio
        Alert.alert(
          'Aspect Ratio Warning',
          'For best results, use a square image (1:1 aspect ratio). Your image will be cropped to fit.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => true }
          ]
        );
      }
    }

    return true;
  };

  const requestPermissions = async (source: 'camera' | 'gallery') => {
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take photos for your cover art.'
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please allow gallery access to select images for your cover art.'
        );
        return false;
      }
    }
    return true;
  };

  const processImage = async (imageUri: string) => {
    try {
      // Resize and optimize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1000, height: 1000 } }, // Ensure square format
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipulatedImage;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  };

  const handleImagePicker = async (source: 'camera' | 'gallery') => {
    try {
      setIsUploading(true);

      // Request permissions
      const hasPermission = await requestPermissions(source);
      if (!hasPermission) {
        setIsUploading(false);
        return;
      }

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1], // Square aspect ratio
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1], // Square aspect ratio
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Process the image
        const processedImage = await processImage(asset.uri);
        
        // Create image object with metadata
        const imageObject = {
          uri: processedImage.uri,
          name: `cover-art-${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          width: processedImage.width,
          height: processedImage.height,
          type: 'image/jpeg',
        };

        if (validateImage(imageObject)) {
          onImageSelect(imageObject);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDefaultSelect = (defaultCover: any) => {
    onImageSelect({
      uri: defaultCover.uri,
      name: defaultCover.name,
      isDefault: true,
    });
    setShowDefaults(false);
  };

  const handleEditImage = async () => {
    if (!selectedImage?.uri) return;

    try {
      setIsUploading(true);

      // Show editing options
      Alert.alert(
        'Edit Image',
        'Choose an editing option:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Crop to Square', 
            onPress: () => cropImageToSquare()
          },
          { 
            text: 'Adjust Quality', 
            onPress: () => adjustImageQuality()
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to edit image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const cropImageToSquare = async () => {
    try {
      if (!selectedImage?.uri) return;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [
          { resize: { width: 1000, height: 1000 } },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const updatedImage = {
        ...selectedImage,
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        name: `cropped-${selectedImage.name}`,
      };

      onImageSelect(updatedImage);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image.');
    }
  };

  const adjustImageQuality = async () => {
    try {
      if (!selectedImage?.uri) return;

      // Show quality options
      Alert.alert(
        'Adjust Quality',
        'Choose image quality:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'High (90%)', 
            onPress: () => compressImage(0.9)
          },
          { 
            text: 'Medium (70%)', 
            onPress: () => compressImage(0.7)
          },
          { 
            text: 'Low (50%)', 
            onPress: () => compressImage(0.5)
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to adjust image quality.');
    }
  };

  const compressImage = async (quality: number) => {
    try {
      if (!selectedImage?.uri) return;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        [],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const updatedImage = {
        ...selectedImage,
        uri: manipulatedImage.uri,
        name: `compressed-${selectedImage.name}`,
      };

      onImageSelect(updatedImage);
    } catch (error) {
      Alert.alert('Error', 'Failed to compress image.');
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Cover Art',
      'Are you sure you want to remove this cover art?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: onImageRemove
        },
      ]
    );
  };

  const renderUploadArea = () => (
    <View style={styles.uploadContainer}>
      <TouchableOpacity
        style={[
          styles.uploadArea,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            width: imageSize,
            height: imageSize,
          }
        ]}
        onPress={() => handleImagePicker('gallery')}
        disabled={isUploading}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[
            colors.surface,
            colors.background + '80',
          ]}
          style={styles.uploadGradient}
        >
          {isUploading ? (
            <>
              <Upload size={48} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.text }]}>
                Processing...
              </Text>
            </>
          ) : (
            <>
              <ImageIcon size={48} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.text }]}>
                Add Cover Art
              </Text>
              <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                Tap to select image
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.uploadOptions}>
        <Button
          title="Camera"
          onPress={() => handleImagePicker('camera')}
          variant="outline"
          leftIcon={<Camera size={16} color={colors.text} />}
          style={styles.optionButton}
          disabled={isUploading}
        />
        <Button
          title="Gallery"
          onPress={() => handleImagePicker('gallery')}
          variant="outline"
          leftIcon={<ImageIcon size={16} color={colors.text} />}
          style={styles.optionButton}
          disabled={isUploading}
        />
      </View>

      {showDefaultOptions && (
        <Button
          title="Use Default Cover"
          onPress={() => setShowDefaults(!showDefaults)}
          variant="secondary"
          leftIcon={<Palette size={16} color={colors.text} />}
          style={styles.defaultButton}
        />
      )}
    </View>
  );

  const renderSelectedImage = () => (
    <View style={styles.selectedContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: selectedImage.uri }}
          style={[
            styles.selectedImage,
            {
              width: imageSize,
              height: imageSize,
              borderColor: colors.border,
            }
          ]}
          resizeMode="cover"
          onError={() => {
            Alert.alert(
              'Image Load Error',
              'Failed to load the selected image. Please try selecting a different image.'
            );
          }}
        />
        
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={handleRemoveImage}
        >
          <X size={16} color={colors.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageInfo}>
        <Text style={[styles.imageName, { color: colors.text }]}>
          {selectedImage.name}
        </Text>
        {selectedImage.isDefault && (
          <Text style={[styles.defaultLabel, { color: colors.primary }]}>
            Default Cover
          </Text>
        )}
        {selectedImage.width && selectedImage.height && (
          <Text style={[styles.imageDimensions, { color: colors.textSecondary }]}>
            {selectedImage.width} × {selectedImage.height}px
          </Text>
        )}
      </View>

      <View style={styles.imageActions}>
        <Button
          title="Replace"
          onPress={() => handleImagePicker('gallery')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Edit"
          onPress={handleEditImage}
          variant="secondary"
          leftIcon={<Crop size={16} color={colors.text} />}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  const renderDefaultOptions = () => (
    <View style={styles.defaultOptions}>
      <Text style={[styles.defaultTitle, { color: colors.text }]}>
        Choose a Default Cover
      </Text>
      <View style={styles.defaultGrid}>
        {defaultCovers.map((cover) => (
          <TouchableOpacity
            key={cover.id}
            style={styles.defaultOption}
            onPress={() => handleDefaultSelect(cover)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: cover.uri }}
              style={[styles.defaultImage, { borderColor: colors.border }]}
              resizeMode="cover"
            />
            <Text style={[styles.defaultName, { color: colors.textSecondary }]} numberOfLines={1}>
              {cover.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button
        title="Cancel"
        onPress={() => setShowDefaults(false)}
        variant="outline"
        style={styles.cancelButton}
      />
    </View>
  );

  const renderRequirements = () => (
    <View style={styles.requirements}>
      <Text style={[styles.requirementsTitle, { color: colors.text }]}>
        Image Requirements
      </Text>
      <View style={styles.requirementsList}>
        <Text style={[styles.requirement, { color: colors.textSecondary }]}>
          • Recommended: 1000×1000px or higher
        </Text>
        <Text style={[styles.requirement, { color: colors.textSecondary }]}>
          • Square aspect ratio (1:1)
        </Text>
        <Text style={[styles.requirement, { color: colors.textSecondary }]}>
          • Formats: JPG, PNG, WebP
        </Text>
        <Text style={[styles.requirement, { color: colors.textSecondary }]}>
          • Maximum file size: 10MB
        </Text>
        <Text style={[styles.requirement, { color: colors.textSecondary }]}>
          • High contrast and clear text work best
        </Text>
      </View>
    </View>
  );

  if (showDefaults) {
    return renderDefaultOptions();
  }

  return (
    <View style={styles.container}>
      {selectedImage ? renderSelectedImage() : renderUploadArea()}
      {!selectedImage && renderRequirements()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  uploadGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  uploadSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    minWidth: 100,
  },
  defaultButton: {
    minWidth: 200,
  },
  selectedContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  selectedImage: {
    borderRadius: 16,
    borderWidth: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  defaultLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  imageDimensions: {
    fontSize: 14,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    minWidth: 100,
  },
  defaultOptions: {
    width: '100%',
    alignItems: 'center',
  },
  defaultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  defaultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  defaultOption: {
    alignItems: 'center',
    width: (screenWidth - 80) / 3,
  },
  defaultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  defaultName: {
    fontSize: 12,
    textAlign: 'center',
  },
  cancelButton: {
    minWidth: 120,
  },
  requirements: {
    marginTop: 24,
    width: '100%',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 4,
  },
  requirement: {
    fontSize: 14,
    lineHeight: 20,
  },
});
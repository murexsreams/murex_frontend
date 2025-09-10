import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Upload,
  Music,
  Image as ImageIcon,
  DollarSign,
  Info,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileUploader } from '../../components/upload/FileUploader';
import { CoverArtUploader } from '../../components/upload/CoverArtUploader';

interface UploadFormData {
  title: string;
  artist: string;
  genre: string;
  description: string;
  fundingGoal: string;
  expectedROI: string;
  audioFile: any;
  coverArt: any;
}

export const UploadScreen: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    artist: '',
    genre: '',
    description: '',
    fundingGoal: '',
    expectedROI: '',
    audioFile: null,
    coverArt: null,
  });

  const genres = [
    'Electronic', 'Hip-Hop', 'Pop', 'Rock', 'Jazz', 'Classical',
    'R&B', 'Country', 'Folk', 'Indie', 'Alternative', 'Blues'
  ];

  const steps = [
    { number: 1, title: 'Track Info', description: 'Basic track details' },
    { number: 2, title: 'Audio File', description: 'Upload your music' },
    { number: 3, title: 'Cover Art', description: 'Add visual appeal' },
    { number: 4, title: 'Funding', description: 'Set investment goals' },
    { number: 5, title: 'Review', description: 'Confirm and publish' },
  ];

  const updateFormData = (field: keyof UploadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.artist && formData.genre && formData.description);
      case 2:
        return !!formData.audioFile;
      case 3:
        return !!formData.coverArt;
      case 4:
        return !!(formData.fundingGoal && formData.expectedROI);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      Alert.alert('Incomplete', 'Please fill in all required fields before continuing.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // TODO: Implement actual upload logic
      await new Promise(resolve => setTimeout(resolve, 3000));
      Alert.alert('Success!', 'Your track has been uploaded successfully!');
      // Reset form or navigate away
    } catch (error) {
      Alert.alert('Error', 'Failed to upload track. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.number} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: currentStep >= step.number ? colors.primary : colors.border,
                borderColor: currentStep === step.number ? colors.primary : colors.border,
              }
            ]}
          >
            {currentStep > step.number ? (
              <CheckCircle size={16} color={colors.background} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  { color: currentStep >= step.number ? colors.background : colors.textSecondary }
                ]}
              >
                {step.number}
              </Text>
            )}
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                { backgroundColor: currentStep > step.number ? colors.primary : colors.border }
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Card style={styles.stepCard}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Track Information</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Tell us about your track
      </Text>

      <Input
        label="Track Title *"
        placeholder="Enter track title"
        value={formData.title}
        onChangeText={(value) => updateFormData('title', value)}
        style={styles.input}
      />

      <Input
        label="Artist Name *"
        placeholder="Enter artist name"
        value={formData.artist}
        onChangeText={(value) => updateFormData('artist', value)}
        style={styles.input}
      />

      <View style={styles.genreContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Genre *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreChip,
                {
                  backgroundColor: formData.genre === genre ? colors.primary : colors.surface,
                  borderColor: formData.genre === genre ? colors.primary : colors.border,
                }
              ]}
              onPress={() => updateFormData('genre', genre)}
            >
              <Text
                style={[
                  styles.genreText,
                  { color: formData.genre === genre ? colors.background : colors.text }
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Input
        label="Description *"
        placeholder="Describe your track, inspiration, or story behind it"
        value={formData.description}
        onChangeText={(value) => updateFormData('description', value)}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.textArea]}
      />
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.stepCard}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Audio File</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Upload your music file (MP3, WAV, FLAC)
      </Text>

      <FileUploader
        onFileSelect={(file) => updateFormData('audioFile', file)}
        onFileRemove={() => updateFormData('audioFile', null)}
        selectedFile={formData.audioFile}
        acceptedFormats={['mp3', 'wav', 'flac']}
        maxSizeInMB={50}
        showPreview={true}
      />
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.stepCard}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Cover Art</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Add an eye-catching cover for your track
      </Text>

      <CoverArtUploader
        onImageSelect={(image) => updateFormData('coverArt', image)}
        onImageRemove={() => updateFormData('coverArt', null)}
        selectedImage={formData.coverArt}
        showDefaultOptions={true}
      />
    </Card>
  );

  const renderStep4 = () => (
    <Card style={styles.stepCard}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Investment Goals</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Set your funding target and expected returns
      </Text>

      <Input
        label="Funding Goal (USDC) *"
        placeholder="e.g., 10000"
        value={formData.fundingGoal}
        onChangeText={(value) => updateFormData('fundingGoal', value)}
        keyboardType="numeric"
        leftIcon={<DollarSign size={20} color={colors.textSecondary} />}
        style={styles.input}
      />

      <Input
        label="Expected ROI (%) *"
        placeholder="e.g., 15"
        value={formData.expectedROI}
        onChangeText={(value) => updateFormData('expectedROI', value)}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.infoBox}>
        <Info size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Your funding goal should cover production, marketing, and distribution costs. 
          ROI is based on projected streaming revenue and should be realistic.
        </Text>
      </View>

      {formData.fundingGoal && formData.expectedROI && (
        <Card style={styles.projectionCard}>
          <Text style={[styles.projectionTitle, { color: colors.text }]}>Projection Summary</Text>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
              Funding Goal:
            </Text>
            <Text style={[styles.projectionValue, { color: colors.primary }]}>
              ${parseInt(formData.fundingGoal || '0').toLocaleString()} USDC
            </Text>
          </View>
          <View style={styles.projectionRow}>
            <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
              Expected Returns:
            </Text>
            <Text style={[styles.projectionValue, { color: colors.success }]}>
              ${Math.round(parseInt(formData.fundingGoal || '0') * (1 + parseInt(formData.expectedROI || '0') / 100)).toLocaleString()} USDC
            </Text>
          </View>
        </Card>
      )}
    </Card>
  );

  const renderStep5 = () => (
    <Card style={styles.stepCard}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Publish</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Review your track details before publishing
      </Text>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>Track Information</Text>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Title:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.title}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Artist:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.artist}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Genre:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>{formData.genre}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>Investment Details</Text>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Funding Goal:</Text>
          <Text style={[styles.reviewValue, { color: colors.primary }]}>
            ${parseInt(formData.fundingGoal || '0').toLocaleString()} USDC
          </Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Expected ROI:</Text>
          <Text style={[styles.reviewValue, { color: colors.success }]}>
            {formData.expectedROI}%
          </Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={[styles.reviewSectionTitle, { color: colors.text }]}>Files</Text>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Audio:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>
            {formData.audioFile?.name || 'No file selected'}
          </Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Cover Art:</Text>
          <Text style={[styles.reviewValue, { color: colors.text }]}>
            {formData.coverArt?.name || 'No image selected'}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Upload Track
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCurrentStep()}
          </ScrollView>

          {/* Navigation */}
          <View style={styles.navigation}>
            {currentStep > 1 && (
              <Button
                title="Previous"
                onPress={handlePrevious}
                variant="outline"
                style={styles.navButton}
              />
            )}
            {currentStep < 5 ? (
              <Button
                title="Next"
                onPress={handleNext}
                style={[styles.navButton, currentStep === 1 && styles.fullWidthButton]}
              />
            ) : (
              <Button
                title={isUploading ? "Publishing..." : "Publish Track"}
                onPress={handleSubmit}
                loading={isUploading}
                style={styles.navButton}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepCard: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 100,
  },
  genreContainer: {
    marginBottom: 16,
  },
  genreScroll: {
    marginTop: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  coverUploadArea: {
    aspectRatio: 1,
    maxWidth: 200,
    alignSelf: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  projectionCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginTop: 16,
  },
  projectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectionLabel: {
    fontSize: 14,
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewLabel: {
    fontSize: 14,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
});
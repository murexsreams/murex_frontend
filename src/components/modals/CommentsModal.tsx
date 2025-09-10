import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { CommentSection } from '../social/CommentSection';

interface CommentsModalProps {
  visible: boolean;
  trackId: string;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  trackId,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType=\"slide\"
      presentationStyle=\"pageSheet\"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Comments</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <CommentSection trackId={trackId} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
});"
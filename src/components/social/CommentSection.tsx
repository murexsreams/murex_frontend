import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Send,
  Heart,
  MoreVertical,
  Reply,
  Flag,
  Trash2,
  Edit3,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  isEdited?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface CommentSectionProps {
  trackId: string;
  comments: Comment[];
  onAddComment?: (content: string, parentId?: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onReportComment?: (commentId: string, reason: string) => Promise<void>;
  currentUserId?: string;
  maxLength?: number;
  placeholder?: string;
  showReplies?: boolean;
  isLoading?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  trackId,
  comments,
  onAddComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
  currentUserId,
  maxLength = 500,
  placeholder = "Add a comment...",
  showReplies = true,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment.trim(), replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await onLikeComment?.(commentId);
    } catch (error) {
      Alert.alert('Error', 'Failed to like comment. Please try again.');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await onEditComment?.(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      Alert.alert('Error', 'Failed to edit comment. Please try again.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteComment?.(commentId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReportComment = (commentId: string) => {
    Alert.alert(
      'Report Comment',
      'Why are you reporting this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => onReportComment?.(commentId, 'spam'),
        },
        {
          text: 'Inappropriate',
          onPress: () => onReportComment?.(commentId, 'inappropriate'),
        },
        {
          text: 'Harassment',
          onPress: () => onReportComment?.(commentId, 'harassment'),
        },
      ]
    );
  };

  const showCommentMenu = (comment: Comment) => {
    const options = [];

    if (comment.canEdit) {
      options.push({
        text: 'Edit',
        onPress: () => {
          setEditingComment(comment.id);
          setEditContent(comment.content);
        },
      });
    }

    if (comment.canDelete) {
      options.push({
        text: 'Delete',
        style: 'destructive' as const,
        onPress: () => handleDeleteComment(comment.id),
      });
    }

    options.push({
      text: 'Report',
      onPress: () => handleReportComment(comment.id),
    });

    options.push({ text: 'Cancel', style: 'cancel' as const });

    Alert.alert('Comment Options', '', options);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View
      key={comment.id}
      style={[
        styles.commentContainer,
        isReply && styles.replyContainer,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          {comment.avatar ? (
            <Image
              source={{ uri: comment.avatar }}
              style={[styles.avatar, { borderColor: colors.border }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {comment.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: colors.text }]}>
              {comment.username}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(comment.timestamp)}
              {comment.isEdited && ' • edited'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => showCommentMenu(comment)}
          activeOpacity={0.7}
        >
          <MoreVertical size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.commentContent}>
        {editingComment === comment.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[
                styles.editInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              maxLength={maxLength}
              placeholder="Edit your comment..."
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                variant="outline"
                style={styles.editButton}
                textStyle={{ fontSize: 12 }}
              />
              <Button
                title="Save"
                onPress={() => handleEditComment(comment.id)}
                style={styles.editButton}
                textStyle={{ fontSize: 12 }}
              />
            </View>
          </View>
        ) : (
          <Text style={[styles.commentText, { color: colors.text }]}>
            {comment.content}
          </Text>
        )}
      </View>

      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikeComment(comment.id)}
          activeOpacity={0.7}
        >
          <Heart
            size={14}
            color={comment.isLiked ? colors.error : colors.textSecondary}
            fill={comment.isLiked ? colors.error : 'transparent'}
          />
          {comment.likes > 0 && (
            <Text style={[
              styles.actionText,
              { color: comment.isLiked ? colors.error : colors.textSecondary }
            ]}>
              {comment.likes}
            </Text>
          )}
        </TouchableOpacity>

        {showReplies && !isReply && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setReplyingTo(comment.id);
              inputRef.current?.focus();
            }}
            activeOpacity={0.7}
          >
            <Reply size={14} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              Reply
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map(reply => renderComment(reply, true))}
        </View>
      )}
    </View>
  );

  const renderCommentInput = () => (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {replyingTo && (
        <View style={styles.replyingIndicator}>
          <Text style={[styles.replyingText, { color: colors.textSecondary }]}>
            Replying to comment...
          </Text>
          <TouchableOpacity
            onPress={() => setReplyingTo(null)}
            style={styles.cancelReply}
          >
            <Text style={[styles.cancelReplyText, { color: colors.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }
          ]}
          value={newComment}
          onChangeText={setNewComment}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={maxLength}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: newComment.trim() ? colors.primary : colors.border,
            }
          ]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Send
              size={16}
              color={newComment.trim() ? colors.background : colors.textSecondary}
            />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputFooter}>
        <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
          {newComment.length}/{maxLength}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.commentsScrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading comments...
            </Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        ) : (
          <View style={styles.commentsContainer}>
            {comments.map(comment => renderComment(comment))}
          </View>
        )}
      </ScrollView>
      
      {renderCommentInput()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsScrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  commentsContainer: {
    gap: 16,
  },
  commentContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  replyContainer: {
    marginLeft: 20,
    marginTop: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  commentContent: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  editContainer: {
    gap: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 8,
    gap: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    padding: 16,
  },
  replyingIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cancelReply: {
    padding: 4,
  },
  cancelReplyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputFooter: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 10,
  },
});
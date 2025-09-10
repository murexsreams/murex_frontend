import { useCallback, useEffect } from 'react';
import { useSocialStore } from '../store/socialStore';
import { useAuthStore } from '../store/authStore';
import { Comment, SocialStats } from '../services/socialService';

interface UseSocialReturn {
  // Comments
  comments: Comment[];
  commentCount: number;
  isLoadingComments: boolean;
  loadComments: () => Promise<void>;
  addComment: (content: string, parentId?: string) => Promise<void>;
  
  // Likes
  isLiked: boolean;
  likeCount: number;
  isTogglingLike: boolean;
  toggleLike: () => Promise<void>;
  
  // Follows (for artist)
  isFollowing: boolean;
  isTogglingFollow: boolean;
  toggleFollow: (artistId: string) => Promise<void>;
  
  // Sharing
  shareTrack: (platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => Promise<void>;
  
  // Social stats
  getSocialStats: () => Promise<SocialStats>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useSocial = (trackId: string, artistId?: string): UseSocialReturn => {
  const user = useAuthStore(state => state.user);
  const {
    // Comments
    getComments,
    getCommentCount,
    isLoadingComments,
    loadComments: loadCommentsAction,
    addComment: addCommentAction,
    
    // Likes
    getLikeStatus,
    isTogglingLike,
    toggleLike: toggleLikeAction,
    
    // Follows
    getFollowStatus,
    isTogglingFollow,
    toggleFollow: toggleFollowAction,
    
    // Sharing
    shareTrack: shareTrackAction,
    
    // Social stats
    getSocialStats: getSocialStatsAction,
    
    // Error handling
    error,
    clearError,
  } = useSocialStore();

  // Get current state
  const comments = getComments(trackId);
  const commentCount = getCommentCount(trackId);
  const { isLiked, count: likeCount } = getLikeStatus(trackId);
  const isFollowing = artistId ? getFollowStatus(artistId) : false;

  // Load comments on mount
  useEffect(() => {
    if (trackId && comments.length === 0) {
      loadCommentsAction(trackId);
    }
  }, [trackId, comments.length, loadCommentsAction]);

  // Comments
  const loadComments = useCallback(async () => {
    if (!trackId) return;
    await loadCommentsAction(trackId);
  }, [trackId, loadCommentsAction]);

  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!trackId || !user) {
      throw new Error('User must be logged in to comment');
    }
    
    await addCommentAction(trackId, user.id, user.username, content, user.avatar);
  }, [trackId, user, addCommentAction]);

  // Likes
  const toggleLike = useCallback(async () => {
    if (!trackId || !user) {
      throw new Error('User must be logged in to like');
    }
    
    await toggleLikeAction(trackId, user.id);
  }, [trackId, user, toggleLikeAction]);

  // Follows
  const toggleFollow = useCallback(async (targetArtistId: string) => {
    if (!user) {
      throw new Error('User must be logged in to follow');
    }
    
    await toggleFollowAction(targetArtistId, user.id);
  }, [user, toggleFollowAction]);

  // Sharing
  const shareTrack = useCallback(async (platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => {
    if (!trackId) return;
    await shareTrackAction(trackId, platform);
  }, [trackId, shareTrackAction]);

  // Social stats
  const getSocialStats = useCallback(async () => {
    if (!trackId || !user) {
      throw new Error('User must be logged in to get social stats');
    }
    
    return await getSocialStatsAction(trackId, user.id);
  }, [trackId, user, getSocialStatsAction]);

  return {
    // Comments
    comments,
    commentCount,
    isLoadingComments: isLoadingComments[trackId] || false,
    loadComments,
    addComment,
    
    // Likes
    isLiked,
    likeCount,
    isTogglingLike: isTogglingLike[trackId] || false,
    toggleLike,
    
    // Follows
    isFollowing,
    isTogglingFollow: artistId ? (isTogglingFollow[artistId] || false) : false,
    toggleFollow,
    
    // Sharing
    shareTrack,
    
    // Social stats
    getSocialStats,
    
    // Error handling
    error,
    clearError,
  };
};

// Hook for managing multiple tracks' social data
export const useMultiTrackSocial = (trackIds: string[]) => {
  const {
    getLikeStatus,
    getCommentCount,
    getSocialStats: getSocialStatsAction,
  } = useSocialStore();
  
  const user = useAuthStore(state => state.user);

  const getTrackSocialData = useCallback((trackId: string) => {
    const { isLiked, count: likeCount } = getLikeStatus(trackId);
    const commentCount = getCommentCount(trackId);
    
    return {
      trackId,
      isLiked,
      likeCount,
      commentCount,
    };
  }, [getLikeStatus, getCommentCount]);

  const loadAllSocialStats = useCallback(async () => {
    if (!user) return {};
    
    const results: Record<string, SocialStats> = {};
    
    await Promise.all(
      trackIds.map(async (trackId) => {
        try {
          const stats = await getSocialStatsAction(trackId, user.id);
          results[trackId] = stats;
        } catch (error) {
          console.error(`Failed to load social stats for track ${trackId}:`, error);
        }
      })
    );
    
    return results;
  }, [trackIds, user, getSocialStatsAction]);

  return {
    getTrackSocialData,
    loadAllSocialStats,
  };
};

// Hook for artist-specific social features
export const useArtistSocial = (artistId: string) => {
  const user = useAuthStore(state => state.user);
  const {
    getFollowStatus,
    isTogglingFollow,
    toggleFollow: toggleFollowAction,
    error,
    clearError,
  } = useSocialStore();

  const isFollowing = getFollowStatus(artistId);
  const isLoading = isTogglingFollow[artistId] || false;

  const toggleFollow = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in to follow');
    }
    
    await toggleFollowAction(artistId, user.id);
  }, [artistId, user, toggleFollowAction]);

  return {
    isFollowing,
    isLoading,
    toggleFollow,
    error,
    clearError,
  };
};
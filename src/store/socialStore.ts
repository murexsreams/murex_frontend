import { create } from 'zustand';
import { socialService, Comment, SocialStats } from '../services/socialService';

interface SocialState {
  // Comments
  comments: Record<string, Comment[]>; // trackId -> comments
  commentCounts: Record<string, number>; // trackId -> count
  
  // Likes
  likes: Record<string, boolean>; // trackId -> isLiked
  likeCounts: Record<string, number>; // trackId -> count
  
  // Follows
  follows: Record<string, boolean>; // artistId -> isFollowing
  
  // Loading states
  isLoadingComments: Record<string, boolean>; // trackId -> loading
  isTogglingLike: Record<string, boolean>; // trackId -> loading
  isTogglingFollow: Record<string, boolean>; // artistId -> loading
  
  // Error handling
  error: string | null;
}

interface SocialActions {
  // Comments
  loadComments: (trackId: string) => Promise<void>;
  addComment: (trackId: string, userId: string, username: string, content: string, userAvatar?: string) => Promise<void>;
  getComments: (trackId: string) => Comment[];
  getCommentCount: (trackId: string) => number;
  
  // Likes
  toggleLike: (trackId: string, userId: string) => Promise<void>;
  setLikeStatus: (trackId: string, isLiked: boolean, count: number) => void;
  getLikeStatus: (trackId: string) => { isLiked: boolean; count: number };
  
  // Follows
  toggleFollow: (artistId: string, userId: string) => Promise<void>;
  setFollowStatus: (artistId: string, isFollowing: boolean) => void;
  getFollowStatus: (artistId: string) => boolean;
  
  // Social stats
  getSocialStats: (trackId: string, userId: string) => Promise<SocialStats>;
  updateSocialStats: (trackId: string, stats: Partial<SocialStats>) => void;
  
  // Sharing
  shareTrack: (trackId: string, platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => Promise<void>;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

type SocialStore = SocialState & SocialActions;

const initialState: SocialState = {
  comments: {},
  commentCounts: {},
  likes: {},
  likeCounts: {},
  follows: {},
  isLoadingComments: {},
  isTogglingLike: {},
  isTogglingFollow: {},
  error: null,
};

export const useSocialStore = create<SocialStore>((set, get) => ({
  ...initialState,

  // Comments
  loadComments: async (trackId: string) => {
    set(state => ({
      isLoadingComments: { ...state.isLoadingComments, [trackId]: true }
    }));

    try {
      const comments = await socialService.getComments(trackId);
      const count = await socialService.getCommentCount(trackId);
      
      set(state => ({
        comments: { ...state.comments, [trackId]: comments },
        commentCounts: { ...state.commentCounts, [trackId]: count },
        isLoadingComments: { ...state.isLoadingComments, [trackId]: false }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      set(state => ({
        error: errorMessage,
        isLoadingComments: { ...state.isLoadingComments, [trackId]: false }
      }));
    }
  },

  addComment: async (trackId: string, userId: string, username: string, content: string, userAvatar?: string) => {
    try {
      const comment = await socialService.addComment(trackId, userId, username, content, userAvatar);
      
      set(state => {
        const existingComments = state.comments[trackId] || [];
        const newComments = [comment, ...existingComments];
        
        return {
          comments: { ...state.comments, [trackId]: newComments },
          commentCounts: { ...state.commentCounts, [trackId]: newComments.length }
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      set({ error: errorMessage });
      throw error;
    }
  },

  getComments: (trackId: string) => {
    const { comments } = get();
    return comments[trackId] || [];
  },

  getCommentCount: (trackId: string) => {
    const { commentCounts } = get();
    return commentCounts[trackId] || 0;
  },

  // Likes
  toggleLike: async (trackId: string, userId: string) => {
    set(state => ({
      isTogglingLike: { ...state.isTogglingLike, [trackId]: true }
    }));

    try {
      const result = await socialService.toggleLike(trackId, userId);
      
      set(state => ({
        likes: { ...state.likes, [trackId]: result.isLiked },
        likeCounts: { ...state.likeCounts, [trackId]: result.count },
        isTogglingLike: { ...state.isTogglingLike, [trackId]: false }
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle like';
      set(state => ({
        error: errorMessage,
        isTogglingLike: { ...state.isTogglingLike, [trackId]: false }
      }));
      throw error;
    }
  },

  setLikeStatus: (trackId: string, isLiked: boolean, count: number) => {
    set(state => ({
      likes: { ...state.likes, [trackId]: isLiked },
      likeCounts: { ...state.likeCounts, [trackId]: count }
    }));
  },

  getLikeStatus: (trackId: string) => {
    const { likes, likeCounts } = get();
    return {
      isLiked: likes[trackId] || false,
      count: likeCounts[trackId] || 0
    };
  },

  // Follows
  toggleFollow: async (artistId: string, userId: string) => {
    set(state => ({
      isTogglingFollow: { ...state.isTogglingFollow, [artistId]: true }
    }));

    try {
      const result = await socialService.toggleFollow(artistId, userId);
      
      set(state => ({
        follows: { ...state.follows, [artistId]: result.isFollowing },
        isTogglingFollow: { ...state.isTogglingFollow, [artistId]: false }
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle follow';
      set(state => ({
        error: errorMessage,
        isTogglingFollow: { ...state.isTogglingFollow, [artistId]: false }
      }));
      throw error;
    }
  },

  setFollowStatus: (artistId: string, isFollowing: boolean) => {
    set(state => ({
      follows: { ...state.follows, [artistId]: isFollowing }
    }));
  },

  getFollowStatus: (artistId: string) => {
    const { follows } = get();
    return follows[artistId] || false;
  },

  // Social stats
  getSocialStats: async (trackId: string, userId: string) => {
    try {
      const stats = await socialService.getSocialStats(trackId, userId);
      
      // Update local state with fetched stats
      set(state => ({
        likes: { ...state.likes, [trackId]: stats.isLiked },
        likeCounts: { ...state.likeCounts, [trackId]: stats.likes },
        commentCounts: { ...state.commentCounts, [trackId]: stats.comments }
      }));

      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get social stats';
      set({ error: errorMessage });
      throw error;
    }
  },

  updateSocialStats: (trackId: string, stats: Partial<SocialStats>) => {
    set(state => {
      const updates: Partial<SocialState> = {};
      
      if (stats.isLiked !== undefined) {
        updates.likes = { ...state.likes, [trackId]: stats.isLiked };
      }
      
      if (stats.likes !== undefined) {
        updates.likeCounts = { ...state.likeCounts, [trackId]: stats.likes };
      }
      
      if (stats.comments !== undefined) {
        updates.commentCounts = { ...state.commentCounts, [trackId]: stats.comments };
      }
      
      return updates;
    });
  },

  // Sharing
  shareTrack: async (trackId: string, platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => {
    try {
      await socialService.shareTrack(trackId, platform);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share track';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Error handling
  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Initialize social service callbacks
socialService.setCallbacks({
  onLikeUpdate: (trackId: string, isLiked: boolean, newCount: number) => {
    useSocialStore.getState().setLikeStatus(trackId, isLiked, newCount);
  },
  onFollowUpdate: (artistId: string, isFollowing: boolean) => {
    useSocialStore.getState().setFollowStatus(artistId, isFollowing);
  },
  onCommentAdded: (comment: Comment) => {
    const state = useSocialStore.getState();
    const existingComments = state.getComments(comment.trackId);
    const newComments = [comment, ...existingComments];
    
    useSocialStore.setState(prevState => ({
      comments: { ...prevState.comments, [comment.trackId]: newComments },
      commentCounts: { ...prevState.commentCounts, [comment.trackId]: newComments.length }
    }));
  },
  onError: (error: string) => {
    useSocialStore.getState().setError(error);
  },
});
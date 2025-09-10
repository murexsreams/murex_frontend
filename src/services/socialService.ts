export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  isEdited: boolean;
}

export interface SocialStats {
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isFollowing?: boolean;
}

export interface SocialCallbacks {
  onLikeUpdate?: (trackId: string, isLiked: boolean, newCount: number) => void;
  onFollowUpdate?: (artistId: string, isFollowing: boolean) => void;
  onCommentAdded?: (comment: Comment) => void;
  onError?: (error: string) => void;
}

class SocialService {
  private callbacks: SocialCallbacks = {};
  
  // Mock data storage - in real app, this would be API calls
  private likes: Map<string, Set<string>> = new Map(); // trackId -> Set of userIds
  private follows: Map<string, Set<string>> = new Map(); // artistId -> Set of userIds
  private comments: Map<string, Comment[]> = new Map(); // trackId -> Comments array

  setCallbacks(callbacks: SocialCallbacks): void {
    this.callbacks = callbacks;
  }

  // Like/Unlike functionality
  async toggleLike(trackId: string, userId: string): Promise<{ isLiked: boolean; count: number }> {
    try {
      if (!this.likes.has(trackId)) {
        this.likes.set(trackId, new Set());
      }

      const trackLikes = this.likes.get(trackId)!;
      const wasLiked = trackLikes.has(userId);

      if (wasLiked) {
        trackLikes.delete(userId);
      } else {
        trackLikes.add(userId);
      }

      const isLiked = !wasLiked;
      const count = trackLikes.size;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      this.callbacks.onLikeUpdate?.(trackId, isLiked, count);

      return { isLiked, count };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle like';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  async getLikeStatus(trackId: string, userId: string): Promise<{ isLiked: boolean; count: number }> {
    const trackLikes = this.likes.get(trackId) || new Set();
    return {
      isLiked: trackLikes.has(userId),
      count: trackLikes.size,
    };
  }

  // Follow/Unfollow functionality
  async toggleFollow(artistId: string, userId: string): Promise<{ isFollowing: boolean }> {
    try {
      if (!this.follows.has(artistId)) {
        this.follows.set(artistId, new Set());
      }

      const artistFollowers = this.follows.get(artistId)!;
      const wasFollowing = artistFollowers.has(userId);

      if (wasFollowing) {
        artistFollowers.delete(userId);
      } else {
        artistFollowers.add(userId);
      }

      const isFollowing = !wasFollowing;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      this.callbacks.onFollowUpdate?.(artistId, isFollowing);

      return { isFollowing };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle follow';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  async getFollowStatus(artistId: string, userId: string): Promise<{ isFollowing: boolean; count: number }> {
    const artistFollowers = this.follows.get(artistId) || new Set();
    return {
      isFollowing: artistFollowers.has(userId),
      count: artistFollowers.size,
    };
  }

  // Comment functionality
  async addComment(
    trackId: string, 
    userId: string, 
    username: string, 
    content: string,
    userAvatar?: string
  ): Promise<Comment> {
    try {
      if (!content.trim()) {
        throw new Error('Comment cannot be empty');
      }

      if (content.length > 500) {
        throw new Error('Comment is too long (max 500 characters)');
      }

      const comment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trackId,
        userId,
        username,
        userAvatar,
        content: content.trim(),
        createdAt: new Date(),
        isEdited: false,
      };

      if (!this.comments.has(trackId)) {
        this.comments.set(trackId, []);
      }

      const trackComments = this.comments.get(trackId)!;
      trackComments.unshift(comment); // Add to beginning for newest first

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));

      this.callbacks.onCommentAdded?.(comment);

      return comment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  async getComments(trackId: string, limit: number = 20, offset: number = 0): Promise<Comment[]> {
    const trackComments = this.comments.get(trackId) || [];
    return trackComments.slice(offset, offset + limit);
  }

  async getCommentCount(trackId: string): Promise<number> {
    const trackComments = this.comments.get(trackId) || [];
    return trackComments.length;
  }

  // Share functionality
  async shareTrack(trackId: string, platform: 'twitter' | 'facebook' | 'instagram' | 'copy'): Promise<void> {
    try {
      const shareUrl = `https://murex-streams.com/track/${trackId}`;
      
      switch (platform) {
        case 'copy':
          // In a real app, you'd use Clipboard API
          console.log('Copied to clipboard:', shareUrl);
          break;
        case 'twitter':
          console.log('Share to Twitter:', shareUrl);
          break;
        case 'facebook':
          console.log('Share to Facebook:', shareUrl);
          break;
        case 'instagram':
          console.log('Share to Instagram:', shareUrl);
          break;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share track';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Edit comment functionality
  async editComment(commentId: string, newContent: string): Promise<Comment> {
    try {
      if (!newContent.trim()) {
        throw new Error('Comment cannot be empty');
      }

      if (newContent.length > 500) {
        throw new Error('Comment is too long (max 500 characters)');
      }

      // Find and update comment
      for (const [trackId, comments] of this.comments.entries()) {
        const commentIndex = comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          const comment = comments[commentIndex];
          const updatedComment = {
            ...comment,
            content: newContent.trim(),
            isEdited: true,
          };
          comments[commentIndex] = updatedComment;

          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));

          return updatedComment;
        }
      }

      throw new Error('Comment not found');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit comment';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Delete comment functionality
  async deleteComment(commentId: string): Promise<void> {
    try {
      // Find and delete comment
      for (const [trackId, comments] of this.comments.entries()) {
        const commentIndex = comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          comments.splice(commentIndex, 1);

          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));

          return;
        }
      }

      throw new Error('Comment not found');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Report comment functionality
  async reportComment(commentId: string, reason: string): Promise<void> {
    try {
      // In a real app, this would send a report to moderation system
      console.log(`Comment ${commentId} reported for: ${reason}`);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to report comment';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Like comment functionality
  async likeComment(commentId: string, userId: string): Promise<{ isLiked: boolean; count: number }> {
    try {
      // In a real app, this would be stored separately
      // For now, we'll just simulate the response
      const isLiked = Math.random() > 0.5; // Random for demo
      const count = Math.floor(Math.random() * 10); // Random count for demo

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      return { isLiked, count };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to like comment';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  // Get social stats for a track
  async getSocialStats(trackId: string, userId: string): Promise<SocialStats> {
    const likeStatus = await this.getLikeStatus(trackId, userId);
    const commentCount = await this.getCommentCount(trackId);

    return {
      likes: likeStatus.count,
      comments: commentCount,
      shares: 0, // Mock data
      isLiked: likeStatus.isLiked,
    };
  }

  // Initialize with some mock data
  initializeMockData(): void {
    // Mock likes
    this.likes.set('track_1', new Set(['user_1', 'user_2', 'user_3']));
    this.likes.set('track_2', new Set(['user_1', 'user_4']));
    this.likes.set('track_3', new Set(['user_2', 'user_3', 'user_4', 'user_5']));

    // Mock follows
    this.follows.set('artist_1', new Set(['user_1', 'user_2']));
    this.follows.set('artist_2', new Set(['user_1', 'user_3', 'user_4']));

    // Mock comments
    this.comments.set('track_1', [
      {
        id: 'comment_1',
        trackId: 'track_1',
        userId: 'user_2',
        username: 'musiclover',
        content: 'This track is amazing! Love the beat 🔥',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isEdited: false,
      },
      {
        id: 'comment_2',
        trackId: 'track_1',
        userId: 'user_3',
        username: 'investor_pro',
        content: 'Great investment potential here. The production quality is top-notch.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isEdited: false,
      },
    ]);
  }

  // Clear all data (for testing)
  clearData(): void {
    this.likes.clear();
    this.follows.clear();
    this.comments.clear();
  }
}

// Export singleton instance
export const socialService = new SocialService();

// Initialize with mock data
socialService.initializeMockData();
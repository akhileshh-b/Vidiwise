// Dynamic API URL based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ApiService {
  // Process a video URL
  async processVideo(url) {
    try {
      const response = await fetch(`${API_BASE_URL}/process-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to process video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  // Check video processing status
  async getVideoStatus(videoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/video-status/${videoId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get video status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting video status:', error);
      throw error;
    }
  }

  // Get list of all processed videos
  async getProcessedVideos() {
    try {
      const response = await fetch(`${API_BASE_URL}/list-videos`);
      
      if (!response.ok) {
        throw new Error('Failed to get video list');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting video list:', error);
      throw error;
    }
  }

  // Delete a video
  async deleteVideo(videoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/delete-video/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // Send chat message
  async sendChatMessage(videoId, message) {
    try {
      const response = await fetch(`${API_BASE_URL}/start-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Update video title
  async updateVideoTitle(videoId, title) {
    try {
      const response = await fetch(`${API_BASE_URL}/update-video-title/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          title,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update title');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating video title:', error);
      throw error;
    }
  }

  // Utility function to extract video ID from YouTube URL
  extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }
}

export default new ApiService(); 
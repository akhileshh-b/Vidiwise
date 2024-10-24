import React from 'react';

export default function EmbeddedVideo({ videoId }) {
    // Extract video ID from URL if needed
    const getEmbedId = (videoId) => {
        if (!videoId) return '';
        if (videoId.includes('youtube.com')) {
            return videoId.split('v=')[1];
        }
        if (videoId.includes('youtu.be')) {
            return videoId.split('/').pop();
        }
        return videoId;
    };

    const embedId = getEmbedId(videoId);

    return (
      <div className="w-96 h-fit sticky top-4">
          <div className="glass-effect overflow-hidden rounded-xl">
              <iframe
                  width="384"
                  height="216"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-none"
              ></iframe>
          </div>
      </div>
  );}
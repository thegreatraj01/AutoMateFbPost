const deepAISupportedAspectRatios = {
    square: {
      name: "Square",
      ratio: "1:1",
      dimensions: { width: 1024, height: 1024 },
      description: "Perfect for profile pictures, thumbnails, and social media posts"
    },
    portrait: {
      name: "Portrait",
      ratio: "9:16",
      dimensions: { width: 720, height: 1280 },
      description: "Ideal for mobile wallpapers, stories, and reels"
    },
    landscape: {
      name: "Landscape",
      ratio: "16:9",
      dimensions: { width: 1920, height: 1080 },
      description: "Best for YouTube thumbnails, desktop wallpapers, and widescreen content"
    }
  };
  
  export default deepAISupportedAspectRatios;
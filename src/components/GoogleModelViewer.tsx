import React from 'react';

interface GoogleModelViewerProps {
  src: string;
  poster?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  cameraControls?: boolean;
  shadowIntensity?: number;
  environmentImage?: string;
  exposure?: number;
  className?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const GoogleModelViewer: React.FC<GoogleModelViewerProps> = ({
  src,
  poster,
  autoRotate = true,
  cameraControls = true,
  shadowIntensity = 1,
  environmentImage = 'neutral',
  exposure = 1,
  className = "w-full h-full"
}) => {
  return (
    <div className={className}>
      {React.createElement('model-viewer', {
        src,
        poster,
        'auto-rotate': autoRotate ? "" : undefined,
        'camera-controls': cameraControls ? "" : undefined,
        'shadow-intensity': shadowIntensity,
        'environment-image': environmentImage,
        exposure,
        'interaction-prompt': "none",
        'ar-status': "not-presenting",
        loading: "eager",
        style: { width: '100%', height: '100%', backgroundColor: 'transparent', '--poster-color': 'transparent' }
      })}
    </div>
  );
};

export default GoogleModelViewer;

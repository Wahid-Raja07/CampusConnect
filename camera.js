/**
 * Campus Connect 3D - Camera Access Utility
 * Handles secure camera access with proper permission handling for QR scanning and face verification
 */

// Camera permission states
export const CAMERA_STATES = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  ACTIVE: 'active',
  PERMISSION_DENIED: 'permission_denied',
  NOT_SUPPORTED: 'not_supported',
  NOT_SECURE: 'not_secure',
  ERROR: 'error',
};

// Get appropriate error message for camera errors
export function getCameraErrorMessage(error, isSecureContext, supportsMediaDevices) {
  if (!supportsMediaDevices) {
    return '📷 Your browser does not support camera access (getUserMedia). Please use a modern browser like Chrome, Firefox, or Safari.';
  }
  
  if (!isSecureContext) {
    return '🔒 Camera access requires HTTPS on the deployed site or localhost during development. File:// URLs are not supported for security reasons.';
  }
  
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
    return '❌ Camera permission denied. Please enable camera access in your browser settings and try again.';
  }
  
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return '⚠️ No camera device found on this device. Please check that a camera is connected.';
  }
  
  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return '⚠️ Camera is already in use by another application. Please close other camera apps and try again.';
  }
  
  if (error?.name === 'SecurityError') {
    return '🔒 Camera access was blocked for security reasons. This usually means the page is not running over HTTPS or there is a permissions policy issue.';
  }
  
  return `⚠️ Camera error: ${error?.message || 'Unknown error occurred'}. Please check your camera and try again.`;
}

// Request camera access with proper error handling
// facingMode: "environment" = rear camera (best for QR scanning)
// facingMode: "user" = front camera (best for face verification)
export async function requestCameraAccess(facingMode = 'environment') {
  // Validation
  if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      success: false,
      error: 'NOT_SUPPORTED',
      message: getCameraErrorMessage(null, true, false),
      stream: null,
    };
  }
  
  if (!window.isSecureContext) {
    return {
      success: false,
      error: 'NOT_SECURE',
      message: getCameraErrorMessage(null, false, true),
      stream: null,
    };
  }
  
  try {
    // Request camera with specific facing mode
    // For QR scanning on mobile: "environment" = rear/back camera
    // For face verification: "user" = front camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    
    return {
      success: true,
      error: null,
      message: 'Camera access granted',
      stream: stream,
    };
  } catch (error) {
    console.error('Camera access error:', error);
    
    // If the requested facingMode fails (e.g. no rear camera on some devices),
    // try without facingMode constraint as a fallback
    if (facingMode === 'environment') {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        return {
          success: true,
          error: null,
          message: 'Camera access granted (fallback mode)',
          stream: fallbackStream,
        };
      } catch (fallbackError) {
        console.error('Camera fallback error:', fallbackError);
      }
    }
    
    return {
      success: false,
      error: error?.name || 'UNKNOWN_ERROR',
      message: getCameraErrorMessage(error, window.isSecureContext, true),
      stream: null,
    };
  }
}

// Stop all camera tracks and cleanup
export function stopCameraStream(stream) {
  if (!stream) return;
  
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch (error) {
      console.error('Error stopping camera track:', error);
    }
  });
}

// Attach stream to video element with error handling
export function attachStreamToVideo(videoElement, stream) {
  if (!videoElement || !stream) {
    return false;
  }
  
  try {
    videoElement.srcObject = stream;
    
    // Auto-play with promise error handling
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error('Video play error:', error);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error attaching stream to video:', error);
    return false;
  }
}

// Detach stream from video element
export function detachStreamFromVideo(videoElement) {
  if (!videoElement) return;
  
  try {
    videoElement.srcObject = null;
  } catch (error) {
    console.error('Error detaching stream:', error);
  }
}

// Check camera permission status
export async function getCameraPermissionStatus() {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'camera' });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return 'unknown';
  }
}
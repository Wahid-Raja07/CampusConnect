/**
 * Campus Connect 3D - Environment & URL Configuration
 * Handles secure URL generation for QR codes and deployment scenarios
 */

// Set VITE_PUBLIC_APP_URL only when QR codes must use a fixed public URL.
export const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL || "";

// Get the appropriate base URL for QR code generation
// Always returns the public HTTPS URL so QR codes work on student phones
export function getAppBaseUrl() {
  // Use the deployed origin when the app is running over HTTPS.
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
    return window.location.origin;
  }
  return PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
}

// Generate a secure QR attendance link
export function generateAttendanceQRLink(sessionId, teacherId, classId) {
  const baseUrl = getAppBaseUrl();
  const params = new URLSearchParams({
    session: sessionId,
    teacher: teacherId,
    class: classId,
    timestamp: Date.now(),
  });
  
  return `${baseUrl}/student-attendance?${params.toString()}`;
}

// Validate if running in secure context (required for camera access)
export function isSecureContext() {
  if (typeof window !== 'undefined') {
    return window.isSecureContext || false;
  }
  return false;
}

// Check if browser supports MediaDevices API
export function supportsMediaDevices() {
  return !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Parse attendance session info from URL
export function parseAttendanceSessionFromUrl() {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return {
    session: params.get('session'),
    teacher: params.get('teacher'),
    class: params.get('class'),
    timestamp: params.get('timestamp'),
  };
}

// Development mode diagnostic info
export function getDevDiagnostics() {
  if (typeof window === 'undefined') {
    return {
      error: 'Not running in browser',
    };
  }
  
  return {
    pageUrl: window.location.href,
    isSecureContext: window.isSecureContext || false,
    protocol: window.location.protocol,
    host: window.location.host,
    supportsMediaDevices: supportsMediaDevices(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

// Development logging helper
export function logDevDiagnostics() {
  const devMode = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  if (!devMode) return;
  
  console.log('🎓 Campus Connect 3D - Development Diagnostics');
  console.log(getDevDiagnostics());
}
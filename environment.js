/**
 * Campus Connect 3D - Environment & URL Configuration
 * Handles secure URL generation for QR codes and deployment scenarios
 */

// Get the appropriate base URL for QR code generation
export function getAppBaseUrl() {
  return typeof window !== 'undefined' && window.location ? window.location.origin : "";
}

// Generate a secure QR attendance link
export function generateAttendanceQRLink(sessionId, teacherId, classId, token = "") {
  const baseUrl = getAppBaseUrl();
  const params = new URLSearchParams({
    session: sessionId,
    teacher: teacherId,
    class: classId,
    timestamp: Date.now(),
  });
  if (token) params.set("token", token);
  
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
    token: params.get('token'),
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
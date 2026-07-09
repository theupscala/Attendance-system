/**
 * Client-side image watermarking utility (Professional GPS Camera Style).
 * Uses the browser Canvas API to stamp attendance metadata onto a captured selfie.
 * 
 * Features:
 * - Semi-transparent black rounded overlay
 * - Modern typography and spacing
 * - Includes Accuracy and Department
 */

const stampAttendanceImage = (photoDataUrl, options) => {
  return new Promise((resolve, reject) => {
    const {
      employeeName = 'Unknown',
      employeeId = 'N/A',
      department = 'General',
      latitude = 0,
      longitude = 0,
      accuracy = 0,
      address = 'Address Not Available',
      punchType = 'Check In',
      timestamp = new Date(),
    } = options;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original photo
      ctx.drawImage(img, 0, 0);

      // Date & Time formatting
      const dateStr = timestamp.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      const timeStr = timestamp.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
      const dayStr = timestamp.toLocaleDateString('en-IN', { weekday: 'long' });

      // Layout calculations (Responsive to image size)
      const fontSize = Math.max(14, Math.floor(canvas.width / 45));
      const padding = fontSize * 1.5;
      const margin = fontSize * 1.5;
      
      const overlayWidth = canvas.width - (margin * 2);
      
      // Text lines
      const lines = [
        `${employeeName} (${employeeId})`,
        `Punch: ${punchType}`,
        `Date: ${dayStr}, ${dateStr} at ${timeStr}`,
        `Location: Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
        `Accuracy: ${Math.round(accuracy)} meters`,
        `Address: ${address}`
      ];

      const lineHeight = fontSize * 1.6;
      const totalTextHeight = lines.length * lineHeight;
      const overlayHeight = totalTextHeight + (padding * 2);
      const overlayY = canvas.height - overlayHeight - margin;
      const overlayX = margin;

      // Draw semi-transparent rounded rectangle background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      const radius = 16;
      ctx.moveTo(overlayX + radius, overlayY);
      ctx.lineTo(overlayX + overlayWidth - radius, overlayY);
      ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + radius);
      ctx.lineTo(overlayX + overlayWidth, overlayY + overlayHeight - radius);
      ctx.quadraticCurveTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX + overlayWidth - radius, overlayY + overlayHeight);
      ctx.lineTo(overlayX + radius, overlayY + overlayHeight);
      ctx.quadraticCurveTo(overlayX, overlayY + overlayHeight, overlayX, overlayY + overlayHeight - radius);
      ctx.lineTo(overlayX, overlayY + radius);
      ctx.quadraticCurveTo(overlayX, overlayY, overlayX + radius, overlayY);
      ctx.closePath();
      ctx.fill();

      // Draw a vertical accent line (left side of text)
      ctx.beginPath();
      ctx.moveTo(overlayX + 16, overlayY + 20);
      ctx.lineTo(overlayX + 16, overlayY + overlayHeight - 20);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#3b82f6'; // Blue accent
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'top';

      lines.forEach((line, index) => {
        const y = overlayY + padding + (index * lineHeight);
        // Make Employee Name and Date lines bold/larger
        if (index === 0) {
          ctx.font = `bold ${fontSize + 4}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#FFFFFF';
        } else if (index === 1 || index === 2) {
          ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#f8fafc'; // slightly off-white
        } else {
          ctx.font = `500 ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = '#e2e8f0'; // slate-200
        }
        
        ctx.fillText(line, overlayX + padding + 16, y);
      });

      // Export as JPEG with 0.85 quality
      const stampedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(stampedDataUrl);
    };

    img.onerror = (err) => {
      console.error('Failed to load image for stamping:', err);
      // Return original image if stamping fails
      resolve(photoDataUrl);
    };

    img.src = photoDataUrl;
  });
};

export default stampAttendanceImage;

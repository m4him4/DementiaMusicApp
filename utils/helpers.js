/**
 * Utility helper functions for the Music Therapy app
 */

/**
 * Format a date string or timestamp into a human-readable format
 * @param {string|number} date - Date string, ISO string, or timestamp
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Unknown date';
  
  try {
    // Handle if date is a timestamp number
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date as "Month Day, Year"
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
};

/**
 * Format a date string or timestamp into a human-readable format with time
 * @param {string|number} date - Date string, ISO string, or timestamp
 * @returns {string} Formatted date and time string
 */
export const formatDateString = (date) => {
  if (!date) return 'Unknown date';
  
  try {
    // Handle if date is a timestamp number
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date as "Month Day, Year at HH:MM AM/PM"
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date string:', error);
    return 'Unknown date';
  }
};

/**
 * Format time in milliseconds to a friendly duration format (MM:SS)
 * @param {number} timeMs - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatTime = (timeMs) => {
  if (!timeMs && timeMs !== 0) return '00:00';
  
  try {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '00:00';
  }
};

/**
 * Truncate text with ellipsis if it exceeds the specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}; 
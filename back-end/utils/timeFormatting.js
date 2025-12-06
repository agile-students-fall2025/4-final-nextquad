/**
 * Format timestamp to relative time (e.g., "2 hours ago") or absolute date for older posts
 * Used across feed and comments endpoints
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Less than 24 hours: show relative time
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    // More than 24 hours: show formatted date
    const postDate = new Date(date);
    const currentYear = now.getFullYear();
    const postYear = postDate.getFullYear();
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[postDate.getMonth()];
    const day = postDate.getDate();
    
    // Same year: "November 19, at 8:32 AM"
    if (postYear === currentYear) {
      let hours = postDate.getHours();
      const minutes = postDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${month} ${day}, at ${hours}:${minutes} ${ampm}`;
    } else {
      // Different year: "November 7, 2023"
      return `${month} ${day}, ${postYear}`;
    }
  }
}

module.exports = {
  formatRelativeTime
};

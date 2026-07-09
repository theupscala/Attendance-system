/**
 * Reverse Geocode utility using OpenStreetMap Nominatim API.
 * Free, no API key required. Rate limit: 1 req/sec (sufficient for attendance).
 */

const reverseGeocode = async (latitude, longitude) => {
  if (!latitude || !longitude) return 'Address Not Available';

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AttendanceSystem/1.0',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return 'Address Not Available';
    }

    const data = await response.json();

    if (data.error) {
      console.error('Nominatim error:', data.error);
      return 'Address Not Available';
    }

    // Build a readable address from the response
    const addr = data.address || {};
    const parts = [];

    // Add locality/village/town/city
    if (addr.village) parts.push(addr.village);
    else if (addr.town) parts.push(addr.town);
    else if (addr.city) parts.push(addr.city);
    else if (addr.suburb) parts.push(addr.suburb);

    // Add district
    if (addr.county || addr.state_district) {
      parts.push(addr.county || addr.state_district);
    }

    // Add state
    if (addr.state) parts.push(addr.state);

    // Add country
    if (addr.country) parts.push(addr.country);

    if (parts.length === 0) {
      return data.display_name || 'Address Not Available';
    }

    return parts.join(', ');
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return 'Address Not Available';
  }
};

module.exports = reverseGeocode;

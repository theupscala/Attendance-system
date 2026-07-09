import { useState, useEffect } from 'react';

// Default Office location (Example: Bangalore)
const OFFICE_LAT = 12.9716;
const OFFICE_LNG = 77.5946;
const MAX_RADIUS_METERS = 40000000; // 40,000 km (covers the entire earth for testing)

// Haversine formula to calculate distance between two lat/lngs in meters
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radius of the earth in m
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in m
  return d;
};

const useGeolocation = (isFieldWorker = false) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(true); // Default to true until checked
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const getLocation = () => {
    setIsLoadingLocation(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        setLocation({
          latitude: lat,
          longitude: lng,
          accuracy: accuracy,
          mapUrl: `https://www.google.com/maps?q=${lat},${lng}`
        });

        if (!isFieldWorker) {
          const distance = getDistanceFromLatLonInMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
          setIsWithinGeofence(distance <= MAX_RADIUS_METERS);
        } else {
          setIsWithinGeofence(true); // Field workers ignore geofencing
        }
        setIsLoadingLocation(false);
      },
      (err) => {
        let errorMsg = 'Unable to retrieve your location.';
        if (err.code === 1) errorMsg = 'Location permission denied. Please allow GPS access.';
        else if (err.code === 2) errorMsg = 'Location unavailable. Please check your GPS signal.';
        else if (err.code === 3) errorMsg = 'Location request timed out. Please try again.';
        setError(errorMsg);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getLocation();
  }, [isFieldWorker]);

  return { location, error, isWithinGeofence, isLoadingLocation, getLocation };
};

export default useGeolocation;

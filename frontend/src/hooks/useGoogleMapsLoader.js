import { useEffect, useState } from 'react';

let googleMapsLoaded = false;
let googleMapsLoadPromise = null;

export const useGoogleMapsLoader = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API Key is missing');
      return;
    }

    // If already loaded, just mark it as loaded
    if (googleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    // If currently loading, wait for it
    if (googleMapsLoadPromise) {
      googleMapsLoadPromise
        .then(() => {
          setIsLoaded(true);
        })
        .catch((err) => {
          setError('Failed to load Google Maps');
        });
      return;
    }

    // Start loading
    googleMapsLoadPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        googleMapsLoaded = true;
        setIsLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        googleMapsLoaded = true;
        setIsLoaded(true);
        resolve();
      };

      script.onerror = () => {
        setError('Failed to load Google Maps API');
        reject(new Error('Failed to load Google Maps'));
      };

      document.head.appendChild(script);
    });
  }, [apiKey]);

  return { isLoaded, error };
};

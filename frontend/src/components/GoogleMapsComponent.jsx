import React, { useState, useEffect, useRef } from 'react';
import { Navigation, AlertCircle } from 'lucide-react';
import { useGoogleMapsLoader } from '../hooks/useGoogleMapsLoader';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const GoogleMapsComponent = ({ 
  source, 
  destination, 
  title = "Route Map",
  showDirections = true
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, error: loadError } = useGoogleMapsLoader(apiKey);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;
    if (map) return;

    const mapCenter = 
      source && typeof source === 'object' && source.lat && source.lng
        ? { lat: source.lat, lng: source.lng }
        : defaultCenter;

    try {
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: mapCenter,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add source marker
      if (source && typeof source === 'object' && source.lat && source.lng) {
        new window.google.maps.Marker({
          position: { lat: source.lat, lng: source.lng },
          map: newMap,
          title: 'Location',
          label: 'A'
        });
      }

      setMap(newMap);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [isLoaded, mapRef, map]);

  // Handle directions
  useEffect(() => {
    if (!map || !isLoaded || !showDirections || !source || !destination) return;
    if (typeof source !== 'object' || typeof destination !== 'object') return;
    if (!source.lat || !source.lng || !destination.lat || !destination.lng) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({ map });

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(source.lat, source.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
          setError(null);
        }
      }
    );
  }, [map, isLoaded, source, destination, showDirections]);

  if (!apiKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">Google Maps API Key Missing</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700">Google Maps Error: {loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-700">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Navigation className="text-primary-600" size={20} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {distance && duration && (
        <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">Distance</p>
            <p className="text-lg font-bold text-blue-600">{distance}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className="text-lg font-bold text-blue-600">{duration}</p>
          </div>
        </div>
      )}

      <div ref={mapRef} style={mapContainerStyle}></div>
    </div>
  );
};

export default GoogleMapsComponent;

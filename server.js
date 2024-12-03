const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;  // Backend server port

// Enable Cross-Origin Requests (CORS) for frontend access
app.use(cors());

// Function to get coordinates from OpenStreetMap API
const fetchCoordinates = async (location) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
    if (response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    } else {
      throw new Error('Location not found');
    }
  } catch (error) {
    throw new Error('Error fetching coordinates');
  }
};

// Function to get the route from OpenRouteService API
const fetchRoute = async (startCoords, endCoords) => {
  const apiKey = "5b3ce3597851110001cf6248dea448deb206436abaa0ed089dd22ed1" ; // Replace with your OpenRouteService API key
  try {
    const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
      params: {
        api_key: apiKey,
        start: `${startCoords.lon},${startCoords.lat}`,
        end: `${endCoords.lon},${endCoords.lat}`,
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching route');
  }
};

// Endpoint to find route
app.get('/findRoute', async (req, res) => {
  const { startLocation, endLocation } = req.query;

  if (!startLocation || !endLocation) {
    return res.status(400).json({ error: 'Start and End locations are required' });
  }

  try {
    // Fetch coordinates for both start and end locations
    const startCoords = await fetchCoordinates(startLocation);
    const endCoords = await fetchCoordinates(endLocation);

    // Fetch the route data
    const routeData = await fetchRoute(startCoords, endCoords);

    // Extract relevant information
    const coordinates = routeData.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    const distance = routeData.features[0].properties.segments[0].distance / 1000; // Distance in km
    const duration = routeData.features[0].properties.segments[0].duration / 60; // Duration in minutes

    // Send back the route information
    res.json({
      distance: distance.toFixed(2),
      duration: duration.toFixed(2),
      coordinates: coordinates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

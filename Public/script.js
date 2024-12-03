document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([28.6139, 77.2090], 13); // Default to New Delhi

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    const findRouteBtn = document.getElementById('findRoute');

    const resultDiv = document.createElement('div'); // To show distance and time
    resultDiv.setAttribute('id', 'routeInfo');
    resultDiv.style.marginTop = "10px";
    resultDiv.style.textAlign = "center";
    document.querySelector('.container').appendChild(resultDiv);

    let currentRouteLine; // Store the current route line to remove old ones
    let startMarker, endMarker; // Markers for start and end points

    const fetchRouteData = async (startLocation, endLocation) => {
        try {
            const response = await fetch(`http://localhost:5000/findRoute?startLocation=${startLocation}&endLocation=${endLocation}`);
            const data = await response.json();

            if (data.error) {
                alert(data.error); // Alert if the backend sends an error
                return;
            }

            const { distance, duration, coordinates } = data;
            return { distance, duration, coordinates };
        } catch (error) {
            alert('Error fetching route data from backend.');
            console.error(error);
        }
    };

    const findRoute = async () => {
        const startLocation = startInput.value.trim();
        const endLocation = endInput.value.trim();

        if (!startLocation || !endLocation) {
            alert("Please enter both start and destination locations.");
            return;
        }

        const routeData = await fetchRouteData(startLocation, endLocation);
        if (!routeData) return; // Exit if there was an error in fetching data

        const { distance, duration, coordinates } = routeData;

        // Clear previous markers and route
        if (currentRouteLine) map.removeLayer(currentRouteLine);
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker) map.removeLayer(endMarker);

        // Add start and end markers
        startMarker = L.marker(coordinates[0]).addTo(map).bindPopup(`Start: ${startLocation}`).openPopup();
        endMarker = L.marker(coordinates[coordinates.length - 1]).addTo(map).bindPopup(`End: ${endLocation}`).openPopup();

        // Display Distance and Time
        resultDiv.innerHTML = `
            <p><strong>Distance:</strong> ${distance} km</p>
            <p><strong>Estimated Time:</strong> ${duration} minutes</p>
        `;

        // Draw the route on the map
        currentRouteLine = L.polyline(coordinates, { color: 'blue', weight: 5, opacity: 0.7 }).addTo(map);
        map.fitBounds(currentRouteLine.getBounds());
    };

    findRouteBtn.addEventListener('click', findRoute);
});

const fs = require('fs');

const generateCrimeData = (count, latRange, lonRange, severityRange) => {
    const data = [];
    for (let i = 0; i < count; i++) {
        const lat = Math.random() * (latRange[1] - latRange[0]) + latRange[0];
        const lon = Math.random() * (lonRange[1] - lonRange[0]) + lonRange[0];
        const severity = Math.ceil(Math.random() * severityRange[1]);
        data.push({ lat, lon, severity });
    }
    return data;
};

const latRange = [28.4685, 28.4985]; // Approx latitude range for Knowledge Park
const lonRange = [77.4920, 77.5320]; // Approx longitude range for Knowledge Park
const severityRange = [1, 5]; // Crime severity scale (1 to 5)

const crimeData = generateCrimeData(50, latRange, lonRange, severityRange);
fs.writeFileSync('crimeData.json', JSON.stringify(crimeData, null, 2));
console.log('crimeData.json created for Knowledge Park!');

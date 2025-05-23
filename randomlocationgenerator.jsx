import React, { useState } from 'react';

function RandomLocationGenerator() {
  const [coordinates, setCoordinates] = useState(null);
  const [code, setCode] = useState(null);
  const [history, setHistory] = useState([]);

  // Generate a random code in format [XXXX-XXXX]
  const generateRandomCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    
    // Generate first 4 characters
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    result += '-';
    
    // Generate last 4 characters
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };

  // Function to convert code to coordinates
  const codeToCoordinates = (code) => {
    if (!code) return null;
    
    // Use the code as a seed for a pseudo-random number generator
    const codeSeed = code.replace('-', '').split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Use a simple deterministic algorithm based on the seed
    const seedRandom = (seed, min, max) => {
      const x = Math.sin(seed) * 10000;
      const result = x - Math.floor(x);
      return min + result * (max - min);
    };
    
    // Generate latitude (-90 to 90) and longitude (-180 to 180)
    const lat = seedRandom(codeSeed, -90, 90);
    const lon = seedRandom(codeSeed + 1, -180, 180);
    
    return {
      lat: lat.toFixed(6),
      lon: lon.toFixed(6)
    };
  };

  const generateNewCode = () => {
    const newCode = generateRandomCode();
    setCode(newCode);
    setCoordinates(null); // Clear coordinates until "Take Me There" is clicked
  };

  const takeMeThere = () => {
    if (!code) return;
    
    const newCoordinates = codeToCoordinates(code);
    const timestamp = new Date().toLocaleTimeString();
    
    const locationData = {
      code: code,
      lat: newCoordinates.lat,
      lon: newCoordinates.lon,
      timestamp: timestamp
    };
    
    setCoordinates(newCoordinates);
    setHistory(prevHistory => [locationData, ...prevHistory].slice(0, 10));
  };

  const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}&t=k`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-xl">🌍</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Random Location Generator</h1>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <button 
            onClick={generateNewCode}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4 font-medium"
          >
            Generate Random Code
          </button>
          
          {code && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold tracking-wider text-gray-800">[{code}]</div>
              <div className="text-sm text-gray-500 mt-1">Your destination code</div>
            </div>
          )}
          
          {code && (
            <button 
              onClick={takeMeThere}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium flex items-center"
            >
              <span className="mr-2">📍</span>
              Take Me There
            </button>
          )}
        </div>
        
        {coordinates && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Current Location</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Code:</span>
                <span className="text-gray-800">[{code}]</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Latitude:</span>
                <span className="text-gray-800">{coordinates.lat}°</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Longitude:</span>
                <span className="text-gray-800">{coordinates.lon}°</span>
              </div>
            </div>
            <div className="mt-4">
              <a 
                href={getGoogleMapsUrl(coordinates.lat, coordinates.lon)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                View on Google Maps (Satellite)
              </a>
            </div>
          </div>
        )}
        
        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">History (Last 10)</h2>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-800">[{item.code}]</div>
                        <div className="text-sm text-gray-600">{item.lat}°, {item.lon}°</div>
                      </div>
                      <div className="text-xs text-gray-500">{item.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RandomLocationGenerator;
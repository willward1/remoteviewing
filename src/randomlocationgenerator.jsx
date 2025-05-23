import React, { useState, useRef } from 'react';

function RandomLocationGenerator() {
  const [coordinates, setCoordinates] = useState(null);
  const [code, setCode] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGestalt, setShowGestalt] = useState(false);
  const [gestaltText, setGestaltText] = useState('');
  const canvasRef = useRef(null);

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
    setCoordinates(null);
    setHasDrawn(false);
    setShowGestalt(false);
    setGestaltText('');
    // Clear the canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
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

  // Drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#9CA3AF'; // Light gray for dark mode
    
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvas.getContext('2d');
    
    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.beginPath();
    ctx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#9CA3AF'; // Light gray for dark mode
    
    ctx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleNext = () => {
    setShowGestalt(true);
  };

      return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <span className="text-3xl mr-3">🌍</span>
          <h1 className="text-xl font-bold text-white">Random Location Generator</h1>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <button 
            onClick={generateNewCode}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-medium transition-colors"
          >
            Generate Random Code
          </button>
          
          {code && (
            <div className="text-center mb-4">
              <div className="text-2xl font-bold tracking-wider text-white">[{code}]</div>
              <div className="text-sm text-gray-400 mt-1">Your destination code</div>
            </div>
          )}
          
          {/* Drawing Canvas - only show when code exists but coordinates don't */}
          {code && !coordinates && (
            <div className="w-full mb-4">
              <h3 className="text-lg font-semibold text-center mb-3 text-white">Draw your ideogram</h3>
              <div className="w-full">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={200}
                  className="border-2 border-gray-600 rounded-lg cursor-crosshair bg-gray-900 w-full touch-none"
                  style={{ width: '100%', height: '200px' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <div className="flex justify-center mt-2">
                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Next button - show when drawing is done */}
              {hasDrawn && (
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Gestalt text box */}
          {showGestalt && !coordinates && (
            <div className="w-full mb-4">
              <label htmlFor="gestalt" className="block text-lg font-semibold text-white mb-2">
                Gestalt:
              </label>
              <textarea
                id="gestalt"
                value={gestaltText}
                onChange={(e) => setGestaltText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400"
                rows="4"
                placeholder="Enter your gestalt..."
              />
              
              {/* Take Me There button - only show when gestalt text exists */}
              {gestaltText.trim() && (
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={takeMeThere}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium flex items-center transition-colors"
                  >
                    <span className="mr-2">📍</span>
                    Reveal Location & Take Me There
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {coordinates && (
          <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-750">
            <h2 className="text-lg font-semibold mb-3 text-white">Current Location</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Code:</span>
                <span className="text-white">[{code}]</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Latitude:</span>
                <span className="text-white">{coordinates.lat}°</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-300">Longitude:</span>
                <span className="text-white">{coordinates.lon}°</span>
              </div>
            </div>
            <div className="mt-4">
              <a 
                href={getGoogleMapsUrl(coordinates.lat, coordinates.lon)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                View on Google Maps (Satellite)
              </a>
            </div>
          </div>
        )}
        
        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-white">History (Last 10)</h2>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white">[{item.code}]</div>
                        <div className="text-sm text-gray-300">{item.lat}°, {item.lon}°</div>
                      </div>
                      <div className="text-xs text-gray-400">{item.timestamp}</div>
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

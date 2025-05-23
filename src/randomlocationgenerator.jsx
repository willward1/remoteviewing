import React, { useState, useRef } from 'react';

function RemoteViewingApp() {
  const [coordinates, setCoordinates] = useState(null);
  const [code, setCode] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [gestaltText, setGestaltText] = useState('');
  
  // RV Protocol states
  const [rvPhase, setRvPhase] = useState('waiting'); // waiting, coordinates, access, objectify, qualify, complete
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [coordinatesTimer, setCoordinatesTimer] = useState(0);
  const [breakTimer, setBreakTimer] = useState(0);
  const [currentBit, setCurrentBit] = useState(1);
  const [bits, setBits] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  
  const canvasRef = useRef(null);

  // RV Symbols from the manual
  const rvSymbols = [
    { name: 'Angular Lines', symbol: '⩚', meaning: 'Cliffs, structures' },
    { name: 'Curved Lines', symbol: '⌒', meaning: 'Water, channels' },
    { name: 'Straight Lines', symbol: '—', meaning: 'Boundaries, interfaces' },
    { name: 'Wavy Lines', symbol: '～', meaning: 'Rolling terrain, hills' },
    { name: 'Dots', symbol: '•••', meaning: 'Populated areas' },
    { name: 'Irregular', symbol: '⩙', meaning: 'Mountains, rough terrain' }
  ];

  // Generate a random code in format [XXXX-XXXX]
  const generateRandomCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    result += '-';
    
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };

  // Function to convert code to coordinates
  const codeToCoordinates = (code) => {
    if (!code) return null;
    
    const codeSeed = code.replace('-', '').split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const seedRandom = (seed, min, max) => {
      const x = Math.sin(seed) * 10000;
      const result = x - Math.floor(x);
      return min + result * (max - min);
    };
    
    const lat = seedRandom(codeSeed, -90, 90);
    const lon = seedRandom(codeSeed + 1, -180, 180);
    
    return {
      lat: lat.toFixed(6),
      lon: lon.toFixed(6)
    };
  };

  const startRVSession = () => {
    const newCode = generateRandomCode();
    setCode(newCode);
    setCoordinates(null);
    setHasDrawn(false);
    setGestaltText('');
    setBits([]);
    setCurrentBit(1);
    
    // Clear the canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Start coordinate flash sequence
    setRvPhase('coordinates');
    setShowCoordinates(true);
    setCoordinatesTimer(3);
    
    // Countdown timer for coordinates display
    const timer = setInterval(() => {
      setCoordinatesTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowCoordinates(false);
          startBreakPeriod();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBreakPeriod = () => {
    setRvPhase('break');
    setBreakTimer(10);
    
    const timer = setInterval(() => {
      setBreakTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRvPhase('access');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeAccessPhase = () => {
    if (hasDrawn) {
      setRvPhase('objectify');
    }
  };

  const addSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    setHasDrawn(true);
    
    // Draw the symbol on the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw different symbols based on type
    switch (symbol.name) {
      case 'Angular Lines':
        // Draw angular/cliff-like lines
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY + 20);
        ctx.lineTo(centerX - 10, centerY - 30);
        ctx.lineTo(centerX + 20, centerY - 25);
        ctx.lineTo(centerX + 40, centerY + 15);
        ctx.stroke();
        break;
        
      default:
        // Default: draw a simple line
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY);
        ctx.lineTo(centerX + 20, centerY);
        ctx.stroke();
        break;
        
      case 'Curved Lines':
        // Draw curved water-like lines
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY + 15, 25, 0, Math.PI, false);
        ctx.stroke();
        break;
        
      case 'Straight Lines':
        // Draw boundary/interface lines
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY);
        ctx.lineTo(centerX + 40, centerY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY + 15);
        ctx.lineTo(centerX + 30, centerY + 15);
        ctx.stroke();
        break;
        
      case 'Wavy Lines':
        // Draw rolling terrain
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY);
        ctx.quadraticCurveTo(centerX - 20, centerY - 15, centerX, centerY);
        ctx.quadraticCurveTo(centerX + 20, centerY + 15, centerX + 40, centerY);
        ctx.stroke();
        break;
        
      case 'Dots':
        // Draw populated area dots
        for (let i = 0; i < 8; i++) {
          const x = centerX - 30 + (i % 4) * 20;
          const y = centerY - 10 + Math.floor(i / 4) * 20;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
        
      case 'Irregular':
        // Draw mountains/rough terrain
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY + 20);
        ctx.lineTo(centerX - 25, centerY - 25);
        ctx.lineTo(centerX - 10, centerY - 5);
        ctx.lineTo(centerX + 5, centerY - 30);
        ctx.lineTo(centerX + 20, centerY - 10);
        ctx.lineTo(centerX + 40, centerY + 20);
        ctx.stroke();
        break;
    }
    
    // Add symbol to current bit
    const newBit = {
      id: currentBit,
      phase: 'access',
      symbol: symbol,
      drawing: symbol.name,
      timestamp: new Date().toLocaleTimeString()
    };
    setBits(prev => [...prev, newBit]);
  };

  const nextBit = () => {
    if (rvPhase === 'access') {
      setRvPhase('objectify');
    } else if (rvPhase === 'objectify') {
      setCurrentBit(prev => prev + 1);
      setHasDrawn(false);
      setSelectedSymbol(null);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setRvPhase('access');
    }
  };

  const proceedToQualify = () => {
    setRvPhase('qualify');
  };

  const takeMeThere = () => {
    if (!code) return;
    
    const newCoordinates = codeToCoordinates(code);
    const timestamp = new Date().toLocaleTimeString();
    
    const locationData = {
      code: code,
      lat: newCoordinates.lat,
      lon: newCoordinates.lon,
      timestamp: timestamp,
      bits: bits
    };
    
    setCoordinates(newCoordinates);
    setHistory(prevHistory => [locationData, ...prevHistory].slice(0, 10));
    setRvPhase('complete');
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
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#9CA3AF';
    
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch events
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvas.getContext('2d');
    
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
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#9CA3AF';
    
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

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 mr-3 relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative">
              {/* AOL logo */}
              <div className="text-blue-600 font-bold text-lg">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-blue-600 mr-1"></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="text-xs font-bold mt-0.5">AOL</div>
                </div>
              </div>
              {/* Red prohibition sign */}
              <div className="absolute inset-0 border-4 border-red-600 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-1 bg-red-600 transform rotate-45"></div>
              </div>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">Remote Viewing Training</h1>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          {rvPhase === 'waiting' && (
            <button 
              onClick={startRVSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
            >
              Begin RV Session
            </button>
          )}

          {rvPhase === 'coordinates' && (
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-2">Focus on coordinates in: {coordinatesTimer}s</div>
              {showCoordinates && code && (
                <div className="text-3xl font-bold tracking-wider text-green-400 animate-pulse">
                  [{code}]
                </div>
              )}
            </div>
          )}

          {rvPhase === 'break' && (
            <div className="text-center">
              <div className="text-lg text-gray-300 mb-2">Mental break period</div>
              <div className="text-2xl font-bold text-yellow-400">{breakTimer}s</div>
              <div className="text-sm text-gray-400 mt-2">Clear your mind</div>
            </div>
          )}

          {rvPhase === 'access' && (
            <div className="w-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Access Phase - Bit #{currentBit}
                </h3>
                <p className="text-sm text-gray-400">Capture your first impression quickly</p>
              </div>
              
              {/* RV Symbols */}
              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">Quick Symbol Selection:</div>
                <div className="grid grid-cols-3 gap-2">
                  {rvSymbols.map((sym, index) => (
                    <button
                      key={index}
                      onClick={() => addSymbol(sym)}
                      className={`p-2 text-sm rounded border transition-colors ${
                        selectedSymbol?.name === sym.name 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-bold">{sym.symbol}</div>
                      <div className="text-xs">{sym.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="w-full mb-4">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={150}
                  className="border-2 border-gray-600 rounded-lg cursor-crosshair bg-gray-900 w-full touch-none"
                  style={{ width: '100%', height: '150px' }}
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

              {(hasDrawn || selectedSymbol) && (
                <div className="flex justify-center">
                  <button 
                    onClick={completeAccessPhase}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors"
                  >
                    Complete Access Phase
                  </button>
                </div>
              )}
            </div>
          )}

          {rvPhase === 'objectify' && (
            <div className="w-full text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Objectify Phase</h3>
              <p className="text-sm text-gray-400 mb-4">
                Write down your first impression using simple words
              </p>
              
              <textarea
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400 mb-4"
                rows="3"
                placeholder="Quick description (water, structure, terrain, etc.)"
              />
              
              <div className="flex justify-center space-x-3">
                <button 
                  onClick={nextBit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                >
                  Next Bit
                </button>
                <button 
                  onClick={proceedToQualify}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium transition-colors"
                >
                  Proceed to Qualify
                </button>
              </div>
            </div>
          )}

          {rvPhase === 'qualify' && (
            <div className="w-full">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Qualify Phase</h3>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Describe the target in detail: texture, color, function, etc.
              </p>
              
              <textarea
                value={gestaltText}
                onChange={(e) => setGestaltText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400 mb-4"
                rows="6"
                placeholder="Detailed description of impressions, feelings, textures, functions, etc."
              />
              
              {gestaltText.trim() && (
                <div className="flex justify-center">
                  <button 
                    onClick={takeMeThere}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium flex items-center transition-colors"
                  >
                    <span className="mr-2">📍</span>
                    Reveal Target Location
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {coordinates && (
          <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-750">
            <h2 className="text-lg font-semibold mb-3 text-white">Target Revealed</h2>
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
                View Satellite Image
              </a>
            </div>
            
            {rvPhase === 'complete' && (
              <div className="mt-4">
                <button 
                  onClick={() => {
                    setRvPhase('waiting');
                    setCode(null);
                    setCoordinates(null);
                  }}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                >
                  Start New Session
                </button>
              </div>
            )}
          </div>
        )}
        
        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-white">Session History</h2>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white">[{item.code}]</div>
                        <div className="text-sm text-gray-300">{item.lat}°, {item.lon}°</div>
                        {item.bits && item.bits.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {item.bits.length} bits recorded
                          </div>
                        )}
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

export default RemoteViewingApp;

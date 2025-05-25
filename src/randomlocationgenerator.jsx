import React, { useState, useRef } from 'react';

function RandomLocationGenerator() {
  const [coordinates, setCoordinates] = useState(null);
  const [code, setCode] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [finalImage, setFinalImage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const canvasRef = useRef(null);
  const finalCanvasRef = useRef(null);
  const timerRef = useRef(null);

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
    setTitle('');
    setNotes('');
    setFinalImage(null);
    setTimeLeft(300); // Reset to 5 minutes
    setTimerActive(true);
    
    // Start the countdown timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setTimerActive(false);
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Clear the canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const takeMeThere = () => {
    if (!code) return;
    
    // Stop the timer
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const newCoordinates = codeToCoordinates(code);
    const timestamp = new Date().toLocaleTimeString();
    
    const locationData = {
      code: code,
      lat: newCoordinates.lat,
      lon: newCoordinates.lon,
      timestamp: timestamp,
      title: title,
      notes: notes
    };
    
    setCoordinates(newCoordinates);
    setHistory(prevHistory => [locationData, ...prevHistory].slice(0, 10));
    
    // Generate the final sharable image
    generateFinalImage();
  };

  const generateFinalImage = () => {
    const finalCanvas = finalCanvasRef.current;
    const ctx = finalCanvas.getContext('2d');
    
    // Set canvas size to 1200x675
    finalCanvas.width = 1200;
    finalCanvas.height = 675;
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 675);
    
    // Add border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 1200, 675);
    
    // Add title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title || 'Remote Viewing Session', 600, 50);
    
    // Add code
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`[${code}]`, 600, 90);
    
    // Add coordinates
    if (coordinates) {
      ctx.font = '20px Arial';
      ctx.fillText(`${coordinates.lat}°, ${coordinates.lon}°`, 600, 120);
    }
    
    // Draw the ideogram (scaled to fit left side)
    if (canvasRef.current) {
      const sourceCanvas = canvasRef.current;
      // Scale and position the drawing on the left side
      ctx.drawImage(sourceCanvas, 50, 150, 500, 350);
    }
    
    // Add notes section on the right side
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#374151';
    ctx.fillText('Notes and Impressions:', 600, 180);
    
    // Split notes into lines and draw
    if (notes) {
      const words = notes.split(' ');
      let line = '';
      let y = 210;
      const maxWidth = 540;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 600, y);
          line = words[n] + ' ';
          y += 25;
        } else {
          line = testLine;
        }
        
        if (y > 480) break; // Don't go beyond the canvas
      }
      ctx.fillText(line, 600, y);
    }
    
    // Add timestamp at bottom
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 600, 640);
    
    // Convert to data URL for display
    const dataURL = finalCanvas.toDataURL('image/png');
    setFinalImage(dataURL);
  };

  const downloadImage = () => {
    if (!finalImage) return;
    
    const link = document.createElement('a');
    link.download = `remote-viewing-${code}.png`;
    link.href = finalImage;
    link.click();
  };

  const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}&t=k`;
  };

  // Drawing functions
  const startDrawing = (e) => {
    setIsDrawing(true);
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
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#374151';
    
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: rect.left + (touch.clientX - rect.left) / scaleX,
      clientY: rect.top + (touch.clientY - rect.top) / scaleY
    });
    canvas.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: rect.left + (touch.clientX - rect.left) / scaleX,
      clientY: rect.top + (touch.clientY - rect.top) / scaleY
    });
    canvas.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);



  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-xl">🌍</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Associative Remote Viewing Experiment</h1>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <button 
            onClick={generateNewCode}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4 font-medium"
          >
            Start Remote Viewing Session
          </button>
          
          {code && (
            <div className="text-center mb-4">
              <div className="text-sm text-gray-500 mt-1">Session ready - enter your details below</div>
              {timerActive && (
                <div className={`text-2xl font-bold mt-2 ${timeLeft <= 60 ? 'text-red-500' : 'text-blue-600'}`}>
                  Time Remaining: {formatTime(timeLeft)}
                </div>
              )}
              {timeLeft === 0 && (
                <div className="text-xl font-bold text-red-500 mt-2">
                  Time's Up! Complete your session.
                </div>
              )}
            </div>
          )}
          
          {/* Title Input */}
          {code && !coordinates && (
            <div className="w-full max-w-md mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this session..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* Drawing Canvas - only show when code exists but coordinates don't */}
          {code && !coordinates && (
            <div className="w-full mb-4">
              <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">Draw your ideogram</h3>
              <div className="border-2 border-gray-300 rounded-lg p-2 bg-white overflow-x-auto">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={675}
                  className="border border-gray-200 rounded cursor-crosshair bg-white max-w-full"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                <div className="flex justify-between mt-2">
                  <button
                    onClick={clearCanvas}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                  <div className="text-xs text-gray-500 flex items-center">
                    🖌️ Draw your impressions
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notes Input */}
          {code && !coordinates && (
            <div className="w-full max-w-2xl mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes and Impressions
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your notes and impressions here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {/* Take Me There button - only show when title is entered */}
          {code && title && !coordinates && (
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
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Session Complete</h2>
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
            <div className="mt-4 flex gap-3">
              <a 
                href={getGoogleMapsUrl(coordinates.lat, coordinates.lon)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                View on Google Maps (Satellite)
              </a>
              {finalImage && (
                <button
                  onClick={downloadImage}
                  className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                  Download Session Image
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Final Image Preview */}
        {finalImage && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Session Summary</h2>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <img 
                src={finalImage} 
                alt="Session Summary" 
                className="w-full max-w-4xl mx-auto rounded-lg shadow-sm"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
        
        {/* Hidden canvas for generating final image */}
        <canvas
          ref={finalCanvasRef}
          style={{ display: 'none' }}
        />
        
        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">History (Last 10)</h2>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-800">[{item.code}] {item.title}</div>
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

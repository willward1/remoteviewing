const getGoogleMapsUrl = (lat, lon) => {
    return `https://www.google.com/maps?q=${lat},${lon}&t=k`;
  };import React, { useState, useRef } from 'react';

function RandomLocationGenerator() {
  const [coordinates, setCoordinates] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [finalImage, setFinalImage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const canvasRef = useRef(null);
  const finalCanvasRef = useRef(null);
  const timerRef = useRef(null);

  // Generate a random session ID for tracking
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Function to convert session ID to coordinates
  const sessionToCoordinates = (sessionId) => {
    if (!sessionId) return null;
    
    // Use the session ID as a seed for a pseudo-random number generator
    const seed = sessionId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Use a simple deterministic algorithm based on the seed
    const seedRandom = (seed, min, max) => {
      const x = Math.sin(seed) * 10000;
      const result = x - Math.floor(x);
      return min + result * (max - min);
    };
    
    // Generate latitude (-90 to 90) and longitude (-180 to 180)
    const lat = seedRandom(seed, -90, 90);
    const lon = seedRandom(seed + 1, -180, 180);
    
    return {
      lat: lat.toFixed(6),
      lon: lon.toFixed(6)
    };
  };

  const generateNewSession = () => {
    const sessionId = generateSessionId();
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
    
    // Store session ID for coordinate generation
    setCoordinates({ sessionId });
  };

  const completeSession = () => {
    if (!coordinates?.sessionId) return;
    
    // Stop the timer
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const finalCoordinates = sessionToCoordinates(coordinates.sessionId);
    
    setCoordinates(finalCoordinates);
    
    // Generate the final sharable image
    generateFinalImage(finalCoordinates);
  };

  const generateFinalImage = (coords) => {
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
    
    // Add title at the top
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title || 'Remote Viewing Session', 600, 50);
    
    // Draw the ideogram (larger, centered)
    if (canvasRef.current) {
      const sourceCanvas = canvasRef.current;
      // Center the drawing and make it larger
      ctx.drawImage(sourceCanvas, 100, 100, 1000, 450);
    }
    
    // Add notes at the bottom
    if (notes) {
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#374151';
      
      // Split notes into lines and center them at the bottom
      const words = notes.split(' ');
      let line = '';
      let lines = [];
      const maxWidth = 1100;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        lines.push(line.trim());
      }
      
      // Draw lines from bottom up
      let startY = 620;
      for (let i = Math.min(lines.length - 1, 2); i >= 0; i--) {
        ctx.fillText(lines[lines.length - 1 - i], 600, startY - (i * 20));
      }
    }
    
    // Add timestamp at very bottom
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 600, 660);
    
    // Convert to data URL for display
    const dataURL = finalCanvas.toDataURL('image/png');
    setFinalImage(dataURL);
  };

  const downloadImage = () => {
    if (!finalImage) return;
    
    const link = document.createElement('a');
    link.download = `remote-viewing-session-${Date.now()}.png`;
    link.href = finalImage;
    link.click();
  };

  const shareOnX = () => {
    const text = `Just completed a remote viewing session! ${title ? `"${title}"` : ''} Check out my results:`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
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
            onClick={generateNewSession}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4 font-medium"
          >
            Start Remote Viewing Session
          </button>
          
          {coordinates?.sessionId && !coordinates.lat && (
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
          {coordinates?.sessionId && !coordinates.lat && (
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
          
          {/* Drawing Canvas - only show when session started but not completed */}
          {coordinates?.sessionId && !coordinates.lat && (
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
          {coordinates?.sessionId && !coordinates.lat && (
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
          
          {/* Complete Session button - only show when title is entered */}
          {coordinates?.sessionId && title && !coordinates.lat && (
            <button 
              onClick={completeSession}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium flex items-center"
            >
              <span className="mr-2">📍</span>
              Complete Session
            </button>
          )}
        </div>
        
        {coordinates?.lat && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Session Complete</h2>
            <div className="mt-4 flex gap-3 flex-wrap">
              {finalImage && (
                <>
                  <button
                    onClick={downloadImage}
                    className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium"
                  >
                    Download Session Image
                  </button>
                  <button
                    onClick={shareOnX}
                    className="inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center"
                  >
                    <span className="mr-2">𝕏</span>
                    Share on X
                  </button>
                </>
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
      </div>
    </div>
  );
}

export default RandomLocationGenerator;

# Random Location Generator

A React-based web application that generates random location codes and maps them to specific geographic coordinates. Perfect for exploration, games, or remote viewing practice.

## Features

- Generate random location codes in [XXXX-XXXX] format
- Deterministic mapping of codes to geographic coordinates
- "Take Me There" functionality that reveals the location
- Google Maps satellite view integration
- Location history tracking (last 10 locations)
- Responsive design

## Live Demo

[Add your deployed URL here]

## Usage

1. Click "Generate Random Code" to create a random location code
2. The code will appear in [XXXX-XXXX] format
3. Click "Take Me There" to reveal the geographic coordinates
4. Click "View on Google Maps (Satellite)" to see the actual location
5. Your location history is saved at the bottom of the page

## How It Works

The application uses a deterministic algorithm to convert codes into coordinates:

1. Each code (e.g., [A53F-9K2B]) is used as a seed for a pseudo-random number generator
2. The seed determines a unique latitude (-90° to 90°) and longitude (-180° to 180°)
3. The same code will always map to the same coordinates
4. This allows sharing of codes with others to visit the same locations

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/random-location-generator.git

# Navigate to the project directory
cd random-location-generator

# Install dependencies
npm install

# Start the development server
npm start
```

## Technologies Used

- React
- Tailwind CSS (via CDN)
- HTML5 Geolocation API

## License

MIT License - See LICENSE file for details
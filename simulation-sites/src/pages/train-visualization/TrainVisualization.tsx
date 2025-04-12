import React, { useState, useEffect } from 'react';
import stationData from './l-stations.json';

interface Station {
  name: string;
  lat: number;
  lon: number;
  lines: string[];
}

const TrainVisualization: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    // Type assertion to ensure stationData is treated as Station[]
    setStations(stationData as Station[]);
  }, []);

  // Define SVG dimensions and padding
  const width = 800;
  const height = 600;
  const padding = 50;

  // Find the min/max lat and lon to scale the map
  const latValues = stations.map(s => s.lat);
  const lonValues = stations.map(s => s.lon);

  const minLat = Math.min(...latValues);
  const maxLat = Math.max(...latValues);
  const minLon = Math.min(...lonValues);
  const maxLon = Math.max(...lonValues);

  // Create scaling functions
  const scaleX = (lon: number): number => {
    return padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
  };

  const scaleY = (lat: number): number => {
    // Invert Y-axis because SVG origin is top-left
    return height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Train Visualization System</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        {stations.length > 0 ? (
          <svg width={width} height={height} className="border border-gray-300">
            {
              stations.map(station => (
                <circle
                  key={station.name} // Use a unique key, station name might not be unique across branches
                  cx={scaleX(station.lon)}
                  cy={scaleY(station.lat)}
                  r="3" // Radius of the circle
                  fill="blue" // Color of the circle
                  data-name={station.name} // Add name as data attribute for potential tooltips
                />
              ))
            }
          </svg>
        ) : (
          <p className="text-gray-600">Loading station data...</p>
        )}
      </div>
    </div>
  );
};

export default TrainVisualization; 
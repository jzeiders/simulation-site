import React, { useState, useEffect, useMemo } from 'react';
import stationData from './l-stations.json';

interface LineInfo {
  line: string;
  prior: string | null;
  next: string | null | { [key: string]: string }; // Handle Green line split, object maps branch name to next station name
}

interface Station {
  name: string;
  lat: number;
  lon: number;
  lines: LineInfo[];
}

// Define colors for each train line
const lineColors: { [key: string]: string } = {
  Red: '#c60c30',
  Blue: '#00a1de',
  Brown: '#62361b',
  Green: '#009b3a',
  Orange: '#f9461c',
  Pink: '#e27ea6',
  Purple: '#522398',
  Yellow: '#f9e300',
};

const TrainVisualization: React.FC = () => {
  const [stations] = useState<Station[]>(stationData as Station[]); // Load stations directly

  // Define SVG dimensions and padding
  const width = 800;
  const height = 600;
  const padding = 50;

  // Calculate scaling functions based on all stations
  const { scaleX, scaleY, minLat, maxLat, minLon, maxLon } = useMemo(() => {
    if (stations.length === 0) {
      // Return default scales if stations haven't loaded (though they load synchronously now)
      return {
        scaleX: (lon: number) => lon,
        scaleY: (lat: number) => lat,
        minLat: 0,
        maxLat: 0,
        minLon: 0,
        maxLon: 0,
      };
    }
    const latValues = stations.map(s => s.lat);
    const lonValues = stations.map(s => s.lon);
    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLon = Math.min(...lonValues);
    const maxLon = Math.max(...lonValues);

    const scaleX = (lon: number): number => {
      return padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
    };
    const scaleY = (lat: number): number => {
      return height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);
    };
    return { scaleX, scaleY, minLat, maxLat, minLon, maxLon };
  }, [stations, width, height, padding]);

  // Create a map for quick station lookup by name
  const stationMap = useMemo(() => {
    return stations.reduce((acc, station) => {
      acc[station.name] = station;
      return acc;
    }, {} as { [key: string]: Station });
  }, [stations]);

  // Generate SVG path segments based on prior/next connections
  const lineSegments = useMemo(() => {
    const segments: React.ReactNode[] = [];

    stations.forEach(currentStation => {
      currentStation.lines.forEach((lineInfo, lineIndex) => {
        const lineName = lineInfo.line;
        const lineColor = lineColors[lineName];
        if (!lineColor) return; // Skip if line color is not defined

        const processNextStation = (nextStationName: string | null) => {
            if (nextStationName && stationMap[nextStationName]) {
                const nextStation = stationMap[nextStationName];
                segments.push(
                <path
                    key={`${currentStation.name}-${nextStationName}-${lineName}-${lineIndex}`}
                    d={`M ${scaleX(currentStation.lon)},${scaleY(currentStation.lat)} L ${scaleX(nextStation.lon)},${scaleY(nextStation.lat)}`}
                    stroke={lineColor}
                    strokeWidth="2"
                    fill="none"
                />
                );
            }
        };

        if (typeof lineInfo.next === 'string') {
            processNextStation(lineInfo.next);
        } else if (typeof lineInfo.next === 'object' && lineInfo.next !== null) {
            // Handle branches (like Green Line split)
            Object.values(lineInfo.next).forEach(nextStationName => {
                 processNextStation(nextStationName);
            });
        }
         // If lineInfo.next is null, it's a terminus, no segment to draw forward.
      });
    });

    return segments;
  }, [stations, stationMap, scaleX, scaleY]);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Train Visualization System</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        {(stations.length > 0 && minLat !== maxLat) ? (
          <svg width={width} height={height} className="border border-gray-300">
            <g> {/* Group for paths */} 
              {lineSegments}
            </g>
            <g> {/* Group for stations */} 
            {
              stations.map((station, index) => (
                <circle
                  key={`${station.name}-${index}`} // Use index for potentially non-unique names
                  cx={scaleX(station.lon)}
                  cy={scaleY(station.lat)}
                  r="3"
                  fill="#333" // Darker color for stations to stand out on lines
                  data-name={station.name}
                />
              ))
            }
            </g>
          </svg>
        ) : (
          <p className="text-gray-600">Loading or calculating station data...</p>
        )}
      </div>
    </div>
  );
};

export default TrainVisualization; 
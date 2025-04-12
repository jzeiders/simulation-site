import React, { useState, useMemo } from 'react';
import stationData from './l-stations.json';
import GenericGraphRenderer from './GenericGraphRenderer'; // Import the new component

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

// Define colors for each train line (Keep for potential future use, e.g., coloring edges)
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

// Define types for the generic renderer
interface GenericNode {
  id: string; // Use station name as ID for simplicity, ensure uniqueness
  x: number;
  y: number;
  name: string;
}

interface GenericEdge {
  sourceId: string;
  targetId: string;
  // Optional: Add line color if needed later
  // color?: string;
}

type LayoutStyle = 'geographic' | 'orthogonal';

const TrainVisualization: React.FC = () => {
  const [stations] = useState<Station[]>(stationData as Station[]);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('geographic'); // State for layout style

  // Define SVG dimensions and padding
  const width = 800;
  const height = 600;
  const padding = 50;

  // --- Transformation Step (now depends on layoutStyle) ---
  const { nodes, edges } = useMemo(() => {
    if (stations.length === 0) {
        return { nodes: [], edges: [] };
    }

    const genericNodes: GenericNode[] = [];
    const genericEdges: GenericEdge[] = [];
    const stationIdSet = new Set<string>();

    // Calculate bounds for orthogonal grid scaling
    const latValues = stations.map(s => s.lat);
    const lonValues = stations.map(s => s.lon);
    const minLat = Math.min(...latValues);
    const maxLat = Math.max(...latValues);
    const minLon = Math.min(...lonValues);
    const maxLon = Math.max(...lonValues);

    // Determine grid size (e.g., based on approximate square root)
    const gridSize = Math.max(10, Math.ceil(Math.sqrt(stations.length))); // Ensure a minimum grid size
    const lonStep = maxLon > minLon ? (maxLon - minLon) / gridSize : 1;
    const latStep = maxLat > minLat ? (maxLat - minLat) / gridSize : 1;

    // Keep track of nodes added per grid cell for basic collision avoidance
    const gridCellOccupancy: { [key: string]: number } = {};

    stations.forEach(station => {
      let nodeX: number;
      let nodeY: number;

      if (layoutStyle === 'orthogonal') {
          // --- Basic Orthogonal Logic (Grid Snapping) ---
          const gridX = lonStep > 0 ? Math.round((station.lon - minLon) / lonStep) : 0;
          const gridY = latStep > 0 ? Math.round((station.lat - minLat) / latStep) : 0;

          // Basic collision handling: slightly offset subsequent nodes in the same cell
          // This is very rudimentary and might still lead to overlaps visually.
          const cellKey = `${gridX}-${gridY}`;
          const cellCount = gridCellOccupancy[cellKey] || 0;
          const offsetFactor = 0.1 * cellCount; // Small offset

          nodeX = gridX + offsetFactor; // Use grid indices as coordinates
          nodeY = gridY + offsetFactor; // GenericGraphRenderer will scale these

          gridCellOccupancy[cellKey] = cellCount + 1;
          // --- End Orthogonal Logic ---
      } else {
          // --- Geographic Logic ---
          nodeX = station.lon;
          nodeY = station.lat;
          // --- End Geographic Logic ---
      }

      if (!stationIdSet.has(station.name)) {
        genericNodes.push({
          id: station.name,
          x: nodeX,
          y: nodeY,
          name: station.name,
        });
        stationIdSet.add(station.name);
      }

      // Create edges based on 'next' connections
      station.lines.forEach(lineInfo => {
        const processNextStation = (nextStationName: string | null) => {
          if (nextStationName && stations.some(s => s.name === nextStationName)) {
            genericEdges.push({
              sourceId: station.name,
              targetId: nextStationName,
            });
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
      });
    });

    const uniqueEdges = Array.from(new Map(genericEdges.map(edge => [`${edge.sourceId}-${edge.targetId}`, edge])).values());

    console.log(`Generated ${genericNodes.length} nodes and ${uniqueEdges.length} edges for ${layoutStyle} layout.`);

    return { nodes: genericNodes, edges: uniqueEdges };
  }, [stations, layoutStyle]); // Rerun transformation when style changes
  // --- End Transformation Step ---

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Train Visualization System</h1>

      {/* Layout Style Toggle Buttons */}
      <div className="mb-4">
        <span className="mr-2 font-semibold">Layout Style:</span>
        <button
          onClick={() => setLayoutStyle('geographic')}
          className={`px-3 py-1 rounded mr-2 ${layoutStyle === 'geographic' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          Geographic
        </button>
        <button
          onClick={() => setLayoutStyle('orthogonal')}
          className={`px-3 py-1 rounded ${layoutStyle === 'orthogonal' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          Orthogonal (Basic Grid)
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        {nodes.length > 0 ? (
          <GenericGraphRenderer
            nodes={nodes}
            edges={edges}
            width={width}
            height={height}
            padding={padding}
            // Customize edge/node appearance for orthogonal if desired
            // edgeColor={layoutStyle === 'orthogonal' ? '#888' : '#ccc'}
            // nodeRadius={layoutStyle === 'orthogonal' ? 4 : 3}
          />
        ) : (
          <p className="text-gray-600">Loading or processing station data...</p>
        )}
      </div>
    </div>
  );
};

export default TrainVisualization; 
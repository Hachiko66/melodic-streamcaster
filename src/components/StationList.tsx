import React from 'react';

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  genre: string;
}

interface StationListProps {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  onStationSelect: (station: RadioStation) => void;
}

const StationList = ({ stations, currentStation, onStationSelect }: StationListProps) => {
  return (
    <div className="grid gap-2 w-full max-w-md">
      {stations.map((station) => (
        <button
          key={station.id}
          onClick={() => onStationSelect(station)}
          className={`
            w-full text-left p-4 rounded-lg transition-all
            ${currentStation?.id === station.id
              ? 'bg-white/20 backdrop-blur-lg'
              : 'bg-white/10 hover:bg-white/15 backdrop-blur-lg'
            }
          `}
        >
          <div className="font-medium text-white">{station.name}</div>
          <div className="text-sm text-white/60">{station.genre}</div>
        </button>
      ))}
    </div>
  );
};

export default StationList;
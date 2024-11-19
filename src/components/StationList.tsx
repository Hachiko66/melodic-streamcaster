import React from 'react';

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  genre: string;
  tipAddress?: string;
  waveInfo?: string;
}

interface StationListProps {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  onStationSelect: (station: RadioStation) => void;
}

const StationList = ({ stations, currentStation, onStationSelect }: StationListProps) => {
  return (
    <div className="bg-[#232323] text-[#C0C0C0] font-mono text-sm">
      {stations.map((station) => (
        <button
          key={station.id}
          onClick={() => onStationSelect(station)}
          className={`w-full text-left p-1 hover:bg-[#000080] ${
            currentStation?.id === station.id ? 'bg-[#000080]' : ''
          }`}
        >
          {station.name} - {station.genre}
        </button>
      ))}
    </div>
  );
};

export default StationList;
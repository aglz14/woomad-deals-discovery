
import { Slider } from "@/components/ui/slider";

interface RadiusSliderProps {
  searchRadius: number;
  onRadiusChange: (value: number[]) => void;
  minDistance: number;
  maxDistance: number;
}

export function RadiusSlider({ searchRadius, onRadiusChange, minDistance, maxDistance }: RadiusSliderProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="radius-slider" className="text-sm font-medium text-gray-700">
          Ajustar radio de búsqueda
        </label>
        <span className="text-sm text-gray-500">{searchRadius} km</span>
      </div>
      <Slider
        id="radius-slider"
        min={minDistance}
        max={maxDistance}
        step={1}
        value={[searchRadius]}
        onValueChange={onRadiusChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{minDistance}km</span>
        <span>{maxDistance}km</span>
      </div>
    </div>
  );
}

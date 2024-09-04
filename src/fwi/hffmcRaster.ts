import * as geotiff from 'geotiff';
import { rasterCalculator } from 'geoblaze';
import { computeFFMC, computeISI, computeFWI, computeDSR } from './fireWeatherIndexFunctions';

interface WeatherStream {
  temp: number[][];
  rh: number[][];
  ws: number[][];
  prec: number[][];
  bui?: number[][];
}

interface Raster {
  [key: string]: number[][];
}

async function hffmcRaster(
  weatherstream: WeatherStream,
  ffmc_old: number | number[][] = 85,
  timeStep: number = 1,
  hourlyFWI: boolean = false
): Promise<Raster> {
  const { temp, rh, ws, prec, bui } = weatherstream;

  if (!temp || !rh || !ws || !prec) {
    throw new Error("One of the required inputs (temp, rh, ws, prec) is missing!");
  }

  let ffmcOldRaster: number[][];

  if (typeof ffmc_old === 'number') {
    ffmcOldRaster = Array(temp.length).fill(Array(temp[0].length).fill(ffmc_old));
  } else {
    ffmcOldRaster = ffmc_old;
  }

  const ffmcRaster = rasterCalculator([temp, rh, ws, prec, ffmcOldRaster], computeFFMC, { timeStep });

  if (hourlyFWI && bui) {
    const isiRaster = rasterCalculator([ffmcRaster, ws], computeISI, { fbpMod: false });
    const fwiRaster = rasterCalculator([isiRaster, bui], computeFWI);
    const dsrRaster = fwiRaster.map(row => row.map(value => 0.0272 * Math.pow(value, 1.77)));

    return {
      hffmc: ffmcRaster,
      hisi: isiRaster,
      hfwi: fwiRaster,
      hdsr: dsrRaster
    };
  } else if (hourlyFWI && !bui) {
    throw new Error("Daily BUI is required to calculate hourly FWI");
  } else {
    return { hffmc: ffmcRaster };
  }
}

// Example placeholder functions for fire weather index calculations
function computeFFMC(temp: number, rh: number, ws: number, prec: number, ffmcOld: number, options: { timeStep: number }): number {
  // Placeholder function logic here
  return ffmcOld; // Replace with actual FFMC calculation
}

function computeISI(ffmc: number, ws: number, options: { fbpMod: boolean }): number {
  // Placeholder function logic here
  return ffmc; // Replace with actual ISI calculation
}

function computeFWI(isi: number, bui: number): number {
  // Placeholder function logic here
  return isi; // Replace with actual FWI calculation
}

// Test the function
(async () => {
  const weatherData: WeatherStream = {
    temp: [[20, 21], [22, 23]],
    rh: [[50, 55], [60, 65]],
    ws: [[10, 12], [14, 16]],
    prec: [[0, 0], [0, 0]],
    bui: [[50, 50], [50, 50]] // Optional
  };

  try {
    const result = await hffmcRaster(weatherData, 85, 1, true);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
})();

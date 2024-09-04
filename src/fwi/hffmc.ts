const FFMC_COEFFICIENT = 0.5; // Adjust this value to match the one used in R

interface WeatherInput {
  temp: number[];
  rh: number[];
  ws: number[];
  prec: number[];
  hr?: number[];
  bui?: number[];
  id?: number[];
}

/**
 * Calculate the hourly fine fuel moisture code.
 * 
 * @param temp - Temperature
 * @param ws - Wind Speed
 * @param rh - Relative Humidity
 * @param prec - Precipitation
 * @param Fo - Previous FFMC
 * @param t0 - Time step
 * @returns The calculated FFMC
 */
function hourlyFineFuelMoistureCode(
  temp: number,
  ws: number,
  rh: number,
  prec: number,
  Fo: number,
  t0: number
): number {
  // Implement the detailed calculation logic here
  // Placeholder implementation
  return Fo; // Placeholder return, replace with actual calculation logic
}

/**
 * Calculate the initial spread index.
 * 
 * @param f - FFMC
 * @param ws - Wind Speed
 * @param flag - Boolean flag (not used here)
 * @returns The calculated ISI
 */
function initialSpreadIndex(f: number[], ws: number[], flag: boolean): number[] {
  // Implement the detailed calculation logic here
  return f.map((ffmc, index) => 0); // Placeholder return, replace with actual calculation logic
}

/**
 * Calculate the fire weather index.
 * 
 * @param isi - Initial Spread Index
 * @param bui - Build Up Index
 * @returns The calculated FWI
 */
function fireWeatherIndex(isi: number[], bui: number[]): number[] {
  // Implement the detailed calculation logic here
  return isi.map((isiValue, index) => 0); // Placeholder return, replace with actual calculation logic
}

/**
 * Main function to calculate the Hourly Fine Fuel Moisture Code (hffmc).
 * 
 * @param input - Input weather data
 * @param ffmcOld - Initial FFMC
 * @param timeStep - Time step (default is 1 hour)
 * @param calcStep - Calculate time step between observations (default is false)
 * @param batch - Iterative computation flag (default is true)
 * @param hourlyFWI - Compute hourly ISI, FWI, and DSR (default is false)
 * @returns A vector of hourly or sub-hourly FFMC values
 */
function hffmc(
  input: WeatherInput,
  ffmcOld: number | number[] = 85,
  timeStep: number = 1,
  calcStep: boolean = false,
  batch: boolean = true,
  hourlyFWI: boolean = false
): number[] | any {
  let t0 = timeStep;
  const names = Object.keys(input).map(name => name.toLowerCase());
  let n: number;
  
  if (batch) {
    if (names.includes('id')) {
      const ids = Array.from(new Set(input.id));
      n = ids.length;
      if (ids.length !== n) {
        throw new Error(
          "Multiple stations have to start and end at the same dates/time, and the data must be sorted by date/time and id"
        );
      }
    } else {
      n = 1;
    }
  } else {
    n = input.temp.length;
  }

  let Fo = Array.isArray(ffmcOld) && ffmcOld.length === 1 && n > 1 ? Array(n).fill(ffmcOld[0]) : ffmcOld;

  if (calcStep) {
    const hr = input.hr;
    if (!hr) {
      console.warn("hour value is missing!");
    }
  }

  const requiredCols = ['temp', 'prec', 'ws', 'rh'];

  for (const col of requiredCols) {
    if (!names.includes(col)) {
      throw new Error(`${col} is missing!`);
    }
  }

  if (input.prec.some(prec => prec < 0)) {
    console.warn("precipitation (prec) cannot be negative!");
  }
  if (input.ws.some(ws => ws < 0)) {
    console.warn("wind speed (ws) cannot be negative!");
  }
  if (input.rh.some(rh => rh < 0)) {
    console.warn("relative humidity (rh) cannot be negative!");
  }
  if (input.rh.length % n !== 0) {
    console.warn("input do not match with number of weather stations");
  }

  const n0 = input.rh.length / n;
  let f: number[] = [];

  for (let i = 0; i < n0; i++) {
    const k = ((i * n)); // zero-based index

    if (calcStep && i > 0 && input.hr) {
      t0 = n0 > 1 ? input.hr[k] - input.hr[k - n] : t0;
      t0 = t0 === -23 ? 1 : t0;
      t0 = t0 < 0 ? -t0 : t0;
    }

    const f1 = hourlyFineFuelMoistureCode(
      input.temp[k],
      input.ws[k],
      input.rh[k],
      input.prec[k],
      Array.isArray(Fo) ? Fo[i % Fo.length] : Fo, // Ensure Fo is correctly indexed
      t0
    );

    Fo = Array.isArray(Fo) ? [...Fo.slice(0, i), f1, ...Fo.slice(i + 1)] : f1;
    f.push(f1);
  }

  if (hourlyFWI) {
    const bui = input.bui;
    const ws = input.ws;

    if (!bui) {
      console.warn("Daily BUI is required to calculate hourly FWI");
    } else {
      const isi = initialSpreadIndex(f, ws, false);
      const fwi = fireWeatherIndex(isi, bui);
      const dsr = fwi.map(fwiValue => 0.0272 * Math.pow(fwiValue, 1.77));
      const output = {
        ...input,
        ffmc: f,
        isi,
        fwi,
        dsr
      };
      return output;
    }
  } else {
    return f;
  }
}

// Example usage
const weatherData: WeatherInput = {
  temp: [20, 21, 22],
  rh: [50, 55, 60],
  ws: [10, 12, 14],
  prec: [0, 0, 0]
};
const result = hffmc(weatherData);
console.log(result);

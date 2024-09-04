/**
 * Sheltered Duff Moisture Code
 *
 * @description Computes the Sheltered Duff Moisture Code (sDMC) based on daily noon weather
 * observations of temperature, relative humidity, wind speed, 24-hour rainfall,
 * and a previous day's calculated or estimated value of sDMC.
 *
 * @param input An array of objects containing input variables of daily noon weather observations.
 * Variable names have to be the same as in the following list, but they are case insensitive.
 * The order in which the input variables are entered is not important either.
 * - temp: Temperature (centigrade)
 * - rh: Relative humidity (%)
 * - ws: 10-m height wind speed (km/h)
 * - prec: 1-hour rainfall (mm)
 * - mon: Month of the observations (integer 1-12)
 * - day: Day of the observations (integer)
 * @param sdmc_old Previous day's value of SDMC. If null, initial SDMC values will be calculated based on the initial DMC.
 * @param batch Whether the computation is iterative or single step, default is true.
 * @returns A single value or a vector of SDMC values.
 */

interface WeatherData {
    temp: number;
    rh: number;
    ws: number;
    prec: number;
    mon?: number;
    day?: number;
    id?: number;
    dmc: number;
  }
  
  function sdmc(input: WeatherData[], sdmc_old: number | number[] | null = null, batch: boolean = true): number[] {
    // Convert input array of objects to lowercase keys
    const lowerCaseInput = input.map(entry => {
      const keys = Object.keys(entry) as (keyof WeatherData)[];
      const newEntry: any = {};
      keys.forEach(key => newEntry[key.toLowerCase()] = entry[key]);
      return newEntry as WeatherData;
    });
  
    // Order dataset by month and day
    lowerCaseInput.sort((a, b) => (a.mon! - b.mon!) || (a.day! - b.day!));
  
    let n = 1;
    if (batch && lowerCaseInput.some(entry => entry.id !== undefined)) {
      lowerCaseInput.sort((a, b) => (a.mon! - b.mon!) || (a.day! - b.day!) || (a.id! - b.id!));
      n = new Set(lowerCaseInput.map(entry => entry.id)).size;
      const ids = lowerCaseInput.slice(0, n).map(entry => entry.id);
      if (ids.length !== n) {
        throw new Error("Multiple stations have to start and end at the same dates, and input data must be sorted by date/time and id");
      }
    } else {
      n = lowerCaseInput.length;
    }
  
    const temp = lowerCaseInput.map(entry => entry.temp);
    const prec = lowerCaseInput.map(entry => entry.prec);
    const ws = lowerCaseInput.map(entry => entry.ws);
    const rh = lowerCaseInput.map(entry => entry.rh);
    const mon = lowerCaseInput.map(entry => entry.mon!);
    const dmc = lowerCaseInput.map(entry => entry.dmc);
  
    if (!dmc.length) {
      console.warn("dmc is missing!");
    }
    if (!temp.length) {
      console.warn("temperature (temp) is missing!");
    }
    if (!prec.length) {
      console.warn("precipitation (prec) is missing!");
    }
    if (!ws.length) {
      console.warn("wind speed (ws) is missing!");
    }
    if (!rh.length) {
      console.warn("relative humidity (rh) is missing!");
    }
    if (temp.length % n !== 0) {
      console.warn("Input data do not match with number of weather stations");
    }
  
    const el = [6.5, 7.5, 9.0, 12.8, 13.9, 13.9, 12.4, 10.9, 9.4, 8.0, 7.0, 6.0];
  
    const constrainedRh = rh.map(val => Math.min(Math.max(val, 0), 99.9));
    const constrainedWs = ws.map(val => Math.max(val, 0));
    const constrainedPrec = prec.map(val => Math.max(val, 0));
  
    const n0 = Math.floor(temp.length / n);
    let SDMC: number[] = [];
  
    for (let i = 0; i < n0; i++) {
      const k = Array.from({ length: n }, (_, idx) => n * i + idx);
      
      if (sdmc_old === null) {
        sdmc_old = k.map(idx => {
          let initial_sdmc = 2.6 + (1.7 * dmc[idx]) - 6.0;
          return Math.max(initial_sdmc, 12);
        });
      }
  
      const t0 = k.map(idx => Math.max(temp[idx], -1.1));
      const rk = k.map((idx, j) => 4.91 / 3.57 * 1.894 * (t0[j] + 1.1) * (100 - constrainedRh[idx]) * el[mon[idx] - 1] * 0.0001);
      const rw = k.map(idx => constrainedPrec[idx] < 7.69 ? 0.218 * constrainedPrec[idx] - 0.094 : 0.83 * constrainedPrec[idx] - 4.8);
      const wmi = k.map((_, j) => 20.0 + 280.0 / Math.exp(0.023 * sdmc_old![j]));
      const b = k.map((_, j) => {
        let b_val = sdmc_old![j] <= 33 ? 100.0 / (0.5 + 0.3 * sdmc_old![j]) : 14.0 - 1.3 * Math.log(sdmc_old![j]);
        if (sdmc_old![j] > 65) {
          b_val = 6.2 * Math.log(sdmc_old![j]) - 17.2;
        }
        return b_val;
      });
      const wmr = k.map((_, j) => wmi[j] + 1000.0 * rw[j] / (48.77 + b[j] * rw[j]));
      const pr = k.map((idx, j) => constrainedPrec[idx] <= 0.44 ? sdmc_old![j] : 43.43 * (5.6348 - Math.log(wmr[j] - 20)));
      const constrainedPr = pr.map(val => Math.max(val, 0));
      const SDMC0 = k.map((_, j) => Math.max(constrainedPr[j] + rk[j], 0));
  
      SDMC = SDMC.concat(SDMC0);
      sdmc_old = SDMC0;
    }
  
    return SDMC;
  }
  
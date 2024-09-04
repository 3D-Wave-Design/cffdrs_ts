const FFMC_COEFFICIENT = 250.0 * 59.5 / 101.0;

/**
 * Fine Fuel Moisture Code Calculation
 *
 * @param ffmc_yda The Fine Fuel Moisture Code from the previous iteration
 * @param temp Temperature (centigrade)
 * @param rh Relative Humidity (%)
 * @param ws Wind speed (km/h)
 * @param prec Precipitation (mm)
 *
 * @return A single fine fuel moisture code value
 */
function fineFuelMoistureCode(ffmc_yda: number, temp: number, rh: number, ws: number, prec: number): number {
  let wmo = FFMC_COEFFICIENT * (101 - ffmc_yda) / (59.5 + ffmc_yda);
  
  const ra = prec > 0.5 ? prec - 0.5 : prec;

  if (prec > 0.5) {
    if (wmo > 150) {
      wmo = wmo + 0.0015 * (wmo - 150) * (wmo - 150) * Math.sqrt(ra)
          + 42.5 * ra * Math.exp(-100 / (251 - wmo)) * (1 - Math.exp(-6.93 / ra));
    } else {
      wmo = wmo + 42.5 * ra * Math.exp(-100 / (251 - wmo)) * (1 - Math.exp(-6.93 / ra));
    }
  }
  
  wmo = wmo > 250 ? 250 : wmo;

  const ed = 0.942 * Math.pow(rh, 0.679) + 11 * Math.exp((rh - 100) / 10)
    + 0.18 * (21.1 - temp) * (1 - 1 / Math.exp(rh * 0.115));
  
  const ew = 0.618 * Math.pow(rh, 0.753) + 10 * Math.exp((rh - 100) / 10)
    + 0.18 * (21.1 - temp) * (1 - 1 / Math.exp(rh * 0.115));

  let z = (wmo < ed && wmo < ew) ? 
    (0.424 * (1 - Math.pow((100 - rh) / 100, 1.7)) + 0.0694 * Math.sqrt(ws) * (1 - Math.pow((100 - rh) / 100, 8))) : 
    0;

  let x = z * 0.581 * Math.exp(0.0365 * temp);

  let wm = (wmo < ed && wmo < ew) ? ew - (ew - wmo) / Math.pow(10, x) : wmo;

  z = (wmo > ed) ? 
    (0.424 * (1 - Math.pow(rh / 100, 1.7)) + 0.0694 * Math.sqrt(ws) * (1 - Math.pow(rh / 100, 8))) : 
    z;

  x = z * 0.581 * Math.exp(0.0365 * temp);

  wm = (wmo > ed) ? ed + (wmo - ed) / Math.pow(10, x) : wm;

  let ffmc1 = (59.5 * (250 - wm)) / (FFMC_COEFFICIENT + wm);

  ffmc1 = ffmc1 > 101 ? 101 : (ffmc1 < 0 ? 0 : ffmc1);

  return ffmc1;
}

// Dummy function to simulate .ffmcCalc in TypeScript
function ffmcCalc(...args: [number, number, number, number, number]): number {
  console.warn("Deprecated: fineFuelMoistureCode");
  return fineFuelMoistureCode(...args);
}

// Exporting the functions for external usage
export { fineFuelMoistureCode, ffmcCalc };

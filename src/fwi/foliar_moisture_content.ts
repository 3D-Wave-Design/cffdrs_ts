/**
 * Foliar Moisture Content Calculator
 *
 * @description Calculate Foliar Moisture Content on a specified day.
 * All variables names are laid out in the same manner as Forestry Canada
 * Fire Danger Group (FCFDG) (1992). Development and Structure of the
 * Canadian Forest Fire Behavior Prediction System." Technical Report
 * ST-X-3, Forestry Canada, Ottawa, Ontario.
 *
 * @param LAT Latitude (decimal degrees)
 * @param LONG Longitude (decimal degrees)
 * @param ELV Elevation (metres)
 * @param DJ Day of year (often referred to as Julian date)
 * @param D0 Date of minimum foliar moisture content. If D0, date of min
 *            FMC, is not known then D0 = null.
 *
 * @return FMC: Foliar Moisture Content value
 */

function foliarMoistureContent(LAT: number[], LONG: number[], ELV: number[], DJ: number[], D0: (number | null)[]): number[] {
    const FMC: number[] = new Array(LAT.length).fill(-1);
    let LATN: number[] = new Array(LAT.length).fill(0);
  
    // Calculate Normalized Latitude
    // Eqs. 1 & 3 (FCFDG 1992)
    LATN = LAT.map((lat, i) => {
      if (D0[i] !== null && D0[i]! > 0) return LATN[i];
      return (ELV[i] <= 0)
        ? 46 + 23.4 * Math.exp(-0.0360 * (150 - LONG[i]))
        : 43 + 33.7 * Math.exp(-0.0351 * (150 - LONG[i]));
    });
  
    // Calculate Date of minimum foliar moisture content
    // Eqs. 2 & 4 (FCFDG 1992)
    D0 = D0.map((d0, i) => {
      if (d0 !== null && d0 > 0) return d0;
      return (ELV[i] <= 0)
        ? 151 * (LAT[i] / LATN[i])
        : 142.1 * (LAT[i] / LATN[i]) + 0.0172 * ELV[i];
    });
  
    // Round D0 to the nearest integer because it is a date
    D0 = D0.map(d0 => Math.round(d0!));
  
    // Number of days between day of year and date of min FMC
    // Eq. 5 (FCFDG 1992)
    const ND = DJ.map((dj, i) => Math.abs(dj - D0[i]!));
  
    // Calculate final FMC
    // Eqs. 6, 7, & 8 (FCFDG 1992)
    ND.forEach((nd, i) => {
      FMC[i] = (nd < 30)
        ? 85 + 0.0189 * Math.pow(nd, 2)
        : (nd >= 30 && nd < 50)
          ? 32.9 + 3.17 * nd - 0.0288 * Math.pow(nd, 2)
          : 120;
    });
  
    return FMC;
  }
  
  // Dummy function to simulate .FMCcalc in TypeScript
  function FMCcalc(...args: [number[], number[], number[], number[], (number | null)[]]): number[] {
    console.warn("Deprecated: foliarMoistureContent");
    return foliarMoistureContent(...args);
  }
  
  // Exporting the functions for external usage
  export { foliarMoistureContent, FMCcalc };

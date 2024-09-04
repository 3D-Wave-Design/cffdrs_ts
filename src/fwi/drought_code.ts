/**
 * Drought Code Calculator
 *
 * @description Drought Code Calculation. All code is based on a C code library
 * that was written by Canadian Forest Service Employees, which was originally
 * based on the Fortran code listed in the reference below.
 * All equations in this code refer to that document. Equations and FORTRAN
 * program for the Canadian Forest Fire Weather Index System. 1985. Van Wagner,
 * C.E.; Pickett, T.L. Canadian Forestry Service, Petawawa National Forestry
 * Institute, Chalk River, Ontario. Forestry Technical Report 33. 18 p.
 * Additional reference on FWI system Development and structure of the Canadian
 * Forest Fire Weather Index System. 1987. Van Wagner, C.E. Canadian Forestry
 * Service, Headquarters, Ottawa. Forestry Technical Report 35. 35 p.
 *
 * @param dc_yda     The Drought Code from previous iteration
 * @param temp       Temperature (centigrade)
 * @param rh         Relative Humidity (%)
 * @param prec       Precipitation(mm)
 * @param lat        Latitude (decimal degrees)
 * @param mon        Month (1-12)
 * @param latAdjust Latitude adjustment (TRUE, FALSE, default=TRUE)
 *
 * @return A single drought code value
 */

function droughtCode(dc_yda: number, temp: number, rh: number, prec: number, lat: number, mon: number, latAdjust: boolean = true): number {
    // Day length factor for DC Calculations
    // 20N: North of 20 degrees N
    const fl01: number[] = [-1.6, -1.6, -1.6, 0.9, 3.8, 5.8, 6.4, 5, 2.4, 0.4, -1.6, -1.6];
    // 20S: South of 20 degrees S
    const fl02: number[] = [6.4, 5, 2.4, 0.4, -1.6, -1.6, -1.6, -1.6, -1.6, 0.9, 3.8, 5.8];
    // Constrain temperature
    temp = temp < -2.8 ? -2.8 : temp;

    // Eq. 22 - Potential Evapotranspiration
    let pe = (0.36 * (temp + 2.8) + fl01[mon - 1]) / 2;

    // Daylength factor adjustment by latitude for Potential Evapotranspiration
    if (latAdjust) {
        if (lat <= -20) {
            pe = (0.36 * (temp + 2.8) + fl02[mon - 1]) / 2;
        } else if (lat > -20 && lat <= 20) {
            pe = (0.36 * (temp + 2.8) + 1.4) / 2;
        }
    }

    // Cap potential evapotranspiration at 0 for negative winter DC values
    pe = pe < 0 ? 0 : pe;

    const ra = prec;
    // Eq. 18 - Effective Rainfall
    const rw = 0.83 * ra - 1.27;
    // Eq. 19
    const smi = 800 * Math.exp(-1 * dc_yda / 400);
    // Alteration to Eq. 21
    let dr0 = dc_yda - 400 * Math.log(1 + 3.937 * rw / smi);
    dr0 = dr0 < 0 ? 0 : dr0;
    // if precip is less than 2.8 then use yesterday's DC
    const dr = prec <= 2.8 ? dc_yda : dr0;
    // Alteration to Eq. 23
    let dc1 = dr + pe;
    dc1 = dc1 < 0 ? 0 : dc1;

    return dc1;
}

function dcCalc(...args: [number, number, number, number, number, number, boolean?]): number {
    console.warn("Deprecated: droughtCode");
    return droughtCode(...args);
}

// Exporting functions for external usage
export { droughtCode, dcCalc };

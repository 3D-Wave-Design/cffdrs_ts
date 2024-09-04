/**
 * Fire Weather Index Calculation.
 *
 * @description All code is based on a C code library that was written by
 * Canadian Forest Service Employees, which was originally based on the Fortran
 * code listed in the reference below. All equations in this code refer to that
 * document.
 *
 * Equations and FORTRAN program for the Canadian Forest Fire
 * Weather Index System. 1985. Van Wagner, C.E.; Pickett, T.L.
 * Canadian Forestry Service, Petawawa National Forestry
 * Institute, Chalk River, Ontario. Forestry Technical Report 33.
 * 18 p.
 *
 * Additional reference on FWI system
 *
 * Development and structure of the Canadian Forest Fire Weather
 * Index System. 1987. Van Wagner, C.E. Canadian Forestry Service,
 * Headquarters, Ottawa. Forestry Technical Report 35. 35 p.
 *
 * @param isi Initial Spread Index
 * @param bui Buildup Index
 *
 * @return A single fwi value
 */

function fireWeatherIndex(isi: number, bui: number): number {
    // Eqs. 28b, 28a, 29
    const bb = bui > 80
      ? 0.1 * isi * (1000 / (25 + 108.64 / Math.exp(0.023 * bui)))
      : 0.1 * isi * (0.626 * Math.pow(bui, 0.809) + 2);
  
    // Eqs. 30b, 30a
    const fwi = bb <= 1 ? bb : Math.exp(2.72 * Math.pow(0.434 * Math.log(bb), 0.647));
    return fwi;
  }
  
  // Dummy function to simulate .fwiCalc in TypeScript
  function fwiCalc(...args: [number, number]): number {
    console.warn("Deprecated: fireWeatherIndex");
    return fireWeatherIndex(...args);
  }
  
  // Exporting the functions for external usage
  export { fireWeatherIndex, fwiCalc };

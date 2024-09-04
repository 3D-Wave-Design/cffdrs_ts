/**
 * Buildup Index Calculator
 *
 * @description Buildup Index Calculation. Based on the equations and FORTRAN program 
 * for the Canadian Forest Fire Weather Index System (Van Wagner, C.E.; Pickett, T.L. 1985).
 *
 * @param dmc Duff Moisture Code
 * @param dc Drought Code
 *
 * @return A single Buildup Index (BUI) value
 */

function buildupIndex(dmc: number, dc: number): number {
    // Eq. 27a
    let bui1 = (dmc === 0 && dc === 0) ? 0 : 0.8 * dc * dmc / (dmc + 0.4 * dc);

    // Eq. 27b - next 3 lines
    const p = (dmc === 0) ? 0 : (dmc - bui1) / dmc;
    const cc = 0.92 + Math.pow(0.0114 * dmc, 1.7);
    let bui0 = dmc - cc * p;

    // Constraints
    bui0 = Math.max(0, bui0);
    bui1 = Math.min(dmc, bui1);

    return bui1;
}

// Deprecated wrapper function
function buiCalc(...args: any[]): number {
    console.warn(".Deprecated: 'buildupIndex' function is deprecated");
    return buildupIndex(args[0], args[1]);
}

export { buildupIndex, buiCalc };

/**
 * Back Fire Rate of Spread Calculator
 *
 * Calculate the Back Fire Spread Rate. All variables names are
 * laid out in the same manner as Forestry Canada Fire Danger Group (FCFDG)
 * (1992).
 *
 * @param FUELTYPE    The Fire Behaviour Prediction FuelType
 * @param FFMC        Fine Fuel Moisture Code
 * @param BUI         Buildup Index
 * @param WSV         Wind Speed Vector
 * @param FMC         Foliar Moisture Content
 * @param SFC         Surface Fuel Consumption
 * @param PC          Percent Conifer
 * @param PDF         Percent Dead Balsam Fir
 * @param CC          Degree of Curing
 * @param CBH         Crown Base Height
 *
 * @return BROS: Back Fire Rate of Spread
 */

import { rateOfSpread } from "./rate_of_spread";


function backRateOfSpread(
    FUELTYPE: string[],
    FFMC: number[],
    BUI: number[],
    WSV: number[],
    FMC: number[],
    SFC: number[],
    PC: number[],
    PDF: number[],
    CC: number[],
    CBH: number[]
): number[] {
    // Eq. 46 (FCFDG 1992)
    // Calculate the FFMC function from the ISI equation
    const FFMC_COEFFICIENT = 1; // Define the appropriate coefficient value
    const m = FFMC_COEFFICIENT * (101 - FFMC[0]) / (59.5 + FFMC[0]);

    // Eq. 45 (FCFDG 1992)
    const fF = 91.9 * Math.exp(-0.1386 * m) * (1.0 + Math.pow(m, 5.31) / 4.93e7);

    // Eq. 75 (FCFDG 1992)
    // Calculate the Back fire wind function
    const BfW = Math.exp(-0.05039 * WSV[0]);

    // Calculate the ISI associated with the back fire spread rate
    // Eq. 76 (FCFDG 1992)
    const BISI = [0.208 * BfW * fF];

    // Eq. 77 (FCFDG 1992)
    // Calculate final Back fire spread rate FUELTYPE, ISI: ISZ, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH
    const BROS = rateOfSpread({FUELTYPE, ISI: BISI, BUI, FMC, SFC, PC, PDF, CC, CBH});
    return BROS;
}

function BROScalc(
    FUELTYPE: string[],
    FFMC: number[],
    BUI: number[],
    WSV: number[],
    FMC: number[],
    SFC: number[],
    PC: number[],
    PDF: number[],
    CC: number[],
    CBH: number[]
): number[] {
    console.warn("Deprecated: backRateOfSpread");
    return backRateOfSpread(FUELTYPE, FFMC, BUI, WSV, FMC, SFC, PC, PDF, CC, CBH);
}


// Exporting functions for external usage
export { backRateOfSpread, BROScalc };

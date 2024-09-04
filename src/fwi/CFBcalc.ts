/**
 * Crown Fraction Burned Calculator
 *
 * Calculate Calculate Crown Fraction Burned. To calculate CFB, we
 * also need to calculate Critical surface intensity (CSI), and Surface fire
 * rate of spread (RSO). The value of each of these equations can be returned
 * to the calling function without unnecessary additional calculations.
 *
 * All variables names are laid out in the same manner as Forestry Canada Fire
 * Danger Group (FCFDG) (1992). Development and Structure of the Canadian
 * Forest Fire Behavior Prediction System." Technical Report ST-X-3, Forestry
 * Canada, Ottawa, Ontario.
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param FMC      Foliar Moisture Content
 * @param SFC      Surface Fuel Consumption
 * @param CBH      Crown Base Height
 * @param ROS      Rate of Spread
 * @param option   Which variable to calculate ("ROS", "RSC", "RSI", or "CFB" (the default).)
 * @returns        CFB, CSI, RSO depending on which option was selected.
 */

/**
 * Calculate Critical Surface Intensity (CSI).
 *
 * @param FMC Foliar Moisture Content
 * @param CBH Crown Base Height
 * @returns   Critical Surface Intensity (CSI)
 */
function criticalSurfaceIntensity(FMC: number, CBH: number): number {
    return 0.001 * (Math.pow(CBH, 1.5)) * Math.pow((460 + 25.9 * FMC), 1.5);
}

/**
 * Calculate Surface Fire Rate of Spread (RSO).
 *
 * @param CSI Critical Surface Intensity
 * @param SFC Surface Fuel Consumption
 * @returns   Surface Fire Rate of Spread (RSO)
 */
function surfaceFireRateOfSpread(CSI: number, SFC: number): number {
    return CSI / (300 * SFC);
}

/**
 * Calculate Crown Fraction Burned (CFB).
 *
 * @param ROS Rate of Spread
 * @param RSO Surface Fire Rate of Spread
 * @returns   Crown Fraction Burned (CFB)
 */
function crownFractionBurned(ROS: number, RSO: number): number {
    return ROS > RSO ? 1 - Math.exp(-0.23 * (ROS - RSO)) : 0;
}

/**
 * Main function to calculate various fire behavior metrics.
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param FMC      Foliar Moisture Content
 * @param SFC      Surface Fuel Consumption
 * @param ROS      Rate of Spread
 * @param CBH      Crown Base Height
 * @param option   Which variable to calculate ("ROS", "RSC", "RSI", or "CFB" (the default).)
 * @returns        CFB, CSI, RSO depending on which option was selected.
 */
function CFBcalc(
    FUELTYPE: string, 
    FMC: number, 
    SFC: number, 
    ROS: number, 
    CBH: number, 
    option: string = "CFB"
): number {
    const CSI = criticalSurfaceIntensity(FMC, CBH);
    
    if (option === "CSI") {
        console.warn("Deprecated: criticalSurfaceIntensity");
        return CSI;
    }
    
    const RSO = surfaceFireRateOfSpread(CSI, SFC);
    
    if (option === "RSO") {
        console.warn("Deprecated: surfaceFireRateOfSpread");
        return RSO;
    }
    
    const CFB = crownFractionBurned(ROS, RSO);
    console.warn("Deprecated: crownFractionBurned");
    return CFB;
}

// Export the function for external usage
export { CFBcalc, criticalSurfaceIntensity, surfaceFireRateOfSpread, crownFractionBurned };

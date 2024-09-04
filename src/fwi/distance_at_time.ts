/**
 * Distance at time t calculator
 *
 * @description Calculate the Head fire spread distance at time t. In the
 * documentation this variable is just "D".
 *
 * All variables names are laid out in the same manner as Forestry Canada Fire
 * Danger Group (FCFDG) (1992). Development and Structure of the  Canadian
 * Forest Fire Behavior Prediction System." Technical Report ST-X-3,
 * Forestry Canada, Ottawa, Ontario.
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param ROSeq    The predicted equilibrium rate of spread (m/min)
 * @param HR       The elapsed time (min)
 * @param CFB      Crown Fraction Burned
 *
 * @return DISTt - Head fire spread distance at time t
 */

function distanceAtTime(FUELTYPE: string, ROSeq: number, HR: number, CFB: number): number {
    // Eq. 72 (FCFDG 1992)
    // Calculate the alpha constant for the DISTt calculation
    let alpha: number;
    if (["C1", "O1A", "O1B", "S1", "S2", "S3", "D1"].includes(FUELTYPE)) {
        alpha = 0.115;
    } else {
        alpha = 0.115 - 18.8 * Math.pow(CFB, 2.5) * Math.exp(-8 * CFB);
    }

    // Eq. 71 (FCFDG 1992) Calculate Head fire spread distance
    const DISTt = ROSeq * (HR + Math.exp(-alpha * HR) / alpha - 1 / alpha);
    return DISTt;
}

function DISTtcalc(...args: [string, number, number, number]): number {
    console.warn("Deprecated: distanceAtTime");
    return distanceAtTime(...args);
}

// Exporting functions for external usage
export { distanceAtTime, DISTtcalc };

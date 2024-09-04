/**
 * Build Up Effect Calculator
 *
 * Computes the Buildup Effect on Fire Spread Rate. All variables
 * names are laid out in the same manner as Forestry Canada Fire Danger Group
 * (FCFDG)(1992).
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param BUI The Buildup Index value
 *
 * @return BE: Build up effect
 */

function buildupEffect(FUELTYPE: string, BUI: number): number {
    // Fuel Type String representations
    const d = [
        "C1", "C2", "C3", "C4", "C5", "C6", "C7",
        "D1", "M1", "M2", "M3", "M4", "S1", "S2", "S3", "O1A", "O1B"
    ];
    
    // The average BUI for the fuel type - as referenced by the "d" list above
    const BUIo: { [key: string]: number } = {
        "C1": 72, "C2": 64, "C3": 62, "C4": 66, "C5": 56, "C6": 62, "C7": 106,
        "D1": 32, "M1": 50, "M2": 50, "M3": 50, "M4": 50, "S1": 38, "S2": 63,
        "S3": 31, "O1A": 1, "O1B": 1
    };
    
    // Proportion of maximum possible spread rate that is reached at a standard BUI
    const Q: { [key: string]: number } = {
        "C1": 0.9, "C2": 0.7, "C3": 0.75, "C4": 0.8, "C5": 0.8, "C6": 0.8, "C7": 0.85,
        "D1": 0.9, "M1": 0.8, "M2": 0.8, "M3": 0.8, "M4": 0.8, "S1": 0.75, "S2": 0.75,
        "S3": 0.75, "O1A": 1.0, "O1B": 1.0
    };

    // Eq. 54 (FCFDG 1992) The Buildup Effect
    let BE: number;
    if (BUI > 0 && BUIo[FUELTYPE] > 0) {
        BE = Math.exp(50 * Math.log(Q[FUELTYPE]) * (1 / BUI - 1 / BUIo[FUELTYPE]));
    } else {
        BE = 1;
    }

    return BE;
}

function BEcalc(FUELTYPE: string, BUI: number): number {
    console.warn("Deprecated: buildupEffect");
    return buildupEffect(FUELTYPE, BUI);
}

// Exporting functions for external usage
export { buildupEffect, BEcalc };

/**
 * Crown Fuel Load function
 *
 * @param FUELTYPE Character fuel type indicator
 * @param CFL Crown Fuel Load
 * 
 * @return Adjusted Crown Fuel Load
 */

function crownFuelLoad(FUELTYPE: string, CFL: number): number {
    // Default Crown Fuel Loads for different fuel types
    const CFLs: { [key: string]: number } = {
        "C1": 0.75, "C2": 0.8, "C3": 1.15, "C4": 1.2, "C5": 1.2, "C6": 1.8, "C7": 0.5,
        "D1": 0, "M1": 0.8, "M2": 0.8, "M3": 0.8, "M4": 0.8, "S1": 0, "S2": 0,
        "S3": 0, "O1A": 0, "O1B": 0
    };

    // Adjust Crown Fuel Load based on conditions
    if (CFL <= 0 || CFL > 2 || isNaN(CFL)) {
        CFL = CFLs[FUELTYPE] !== undefined ? CFLs[FUELTYPE] : CFL;
    }

    return CFL;
}

// Exporting function for external usage
export { crownFuelLoad };

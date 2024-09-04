/**
 * Crown Base Height Calculator
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param CBH Crown Base Height
 * @param SD Stand Density
 * @param SH Stand Height
 *
 * @return CBH: Adjusted Crown Base Height
 */

function crownBaseHeight(FUELTYPE: string, CBH: number, SD: number, SH: number): number {
    // Default Crown Base Heights for different fuel types
    const CBHs: { [key: string]: number } = {
        "C1": 2, "C2": 3, "C3": 8, "C4": 4, "C5": 18, "C6": 7, "C7": 10,
        "D1": 0, "M1": 6, "M2": 6, "M3": 6, "M4": 6, "S1": 0, "S2": 0,
        "S3": 0, "O1A": 0, "O1B": 0
    };

    // Adjust Crown Base Height based on conditions
    if (CBH <= 0 || CBH > 50 || isNaN(CBH)) {
        if (FUELTYPE === "C6" && SD > 0 && SH > 0) {
            CBH = -11.2 + 1.06 * SH + 0.0017 * SD;
        } else {
            CBH = CBHs[FUELTYPE] !== undefined ? CBHs[FUELTYPE] : CBH;
        }
    }

    // Ensure CBH is not less than a very small positive number
    CBH = CBH < 0 ? 1e-07 : CBH;

    return CBH;
}

// Exporting function for external usage
export { crownBaseHeight };

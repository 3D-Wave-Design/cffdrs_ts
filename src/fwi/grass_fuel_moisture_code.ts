// Define the constant used in the calculation
const FFMC_COEFFICIENT = 0.5; // Adjust this value to match the one used in R

/**
 * Calculates the Grass Fuel Moisture Code (GFMC).
 * 
 * @param MC0 - An output from the mcCalc function
 * @returns The calculated GFMC
 */
function grassFuelMoistureCode(MC0: number): number {
  // Calculate GFMC
  const GFMC0 = 59.5 * ((250 - MC0) / (FFMC_COEFFICIENT + MC0));
  return GFMC0;
}

// Example usage
const MC0 = 100; // Example value
const GFMC = grassFuelMoistureCode(MC0);
console.log(GFMC); // Output the GFMC

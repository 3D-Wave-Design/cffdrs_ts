/**
 * Flank Fire Rate of Spread Calculator
 *
 * @description Calculate the Flank Fire Spread Rate.
 *
 * All variables names are laid out in the same manner as Forestry Canada
 * Fire Danger Group (FCFDG) (1992). Development and Structure of the
 * Canadian Forest Fire Behavior Prediction System." Technical Report
 * ST-X-3, Forestry Canada, Ottawa, Ontario.
 *
 * @param ROS Fire Rate of Spread (m/min)
 * @param BROS Back Fire Rate of Spread (m/min)
 * @param LB Length to breadth ratio
 *
 * @return FROS Flank Fire Spread Rate (m/min) value
 */

function flankRateOfSpread(ROS: number, BROS: number, LB: number): number {
    // Eq. 89 (FCFDG 1992)
    const FROS = (ROS + BROS) / LB / 2;
    return FROS;
  }
  
  // Dummy function to simulate .FROScalc in TypeScript
  function FROScalc(...args: [number, number, number]): number {
    console.warn("Deprecated: flankRateOfSpread");
    return flankRateOfSpread(...args);
  }
  
  // Exporting the functions for external usage
  export { flankRateOfSpread, FROScalc };
  
/**
 * Fire Intensity Calculator
 *
 * @description Calculate the Predicted Fire Intensity
 *
 * All variables names are laid out in the same manner as Forestry Canada Fire
 * Danger Group (FCFDG) (1992). Development and Structure of the Canadian Forest
 * Fire Behavior Prediction System." Technical Report ST-X-3, Forestry Canada,
 * Ottawa, Ontario.
 *
 * @param FC Fuel Consumption (kg/m^2)
 * @param ROS Rate of Spread (m/min)
 *
 * @return FI: Fire Intensity (kW/m)
 */
function fireIntensity(FC: number, ROS: number): number {
    // Eq. 69 (FCFDG 1992) Fire Intensity (kW/m)
    const FI = 300 * FC * ROS;
    return FI;
  }
  
  // Dummy function to simulate .FIcalc in TypeScript
  function FIcalc(...args: [number, number]): number {
    console.warn("Deprecated: fireIntensity");
    return fireIntensity(...args);
  }
  
  // Exporting the functions for external usage
  export { fireIntensity, FIcalc };
  
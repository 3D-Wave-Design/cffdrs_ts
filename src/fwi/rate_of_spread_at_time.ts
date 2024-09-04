/**
 * Rate of Spread at time t calculation
 *
 * Computes the Rate of Spread prediction based on fuel type and
 * FWI conditions at elapsed time since ignition. Equations are from listed
 * FCFDG (1992).
 *
 * All variables names are laid out in the same manner as Forestry Canada
 * Fire Danger Group (FCFDG) (1992). Development and Structure of the
 * Canadian Forest Fire Behavior Prediction System." Technical Report
 * ST-X-3, Forestry Canada, Ottawa, Ontario.
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param ROSeq Equilibrium Rate of Spread (m/min)
 * @param HR Time since ignition (hours)
 * @param CFB Crown Fraction Burned
 * @returns Rate of Spread at time since ignition value
 */

function rateOfSpreadAtTime(FUELTYPE: string, ROSeq: number, HR: number, CFB: number): number {
    // Eq. 72 - alpha constant value, dependent on fuel type
    const alpha = ["C1", "O1A", "O1B", "S1", "S2", "S3", "D1"].includes(FUELTYPE)
      ? 0.115
      : 0.115 - 18.8 * Math.pow(CFB, 2.5) * Math.exp(-8 * CFB);
  
    // Eq. 70 - Rate of Spread at time since ignition
    const ROSt = ROSeq * (1 - Math.exp(-alpha * HR));
  
    return ROSt;
  }
  
  function ROStCalc(...args: any[]): number {
    console.warn(".Deprecated: 'rate_of_spread_at_time' function is deprecated");
    return rateOfSpreadAtTime(args[0], args[1], args[2], args[3]);
  }
  
  export { rateOfSpreadAtTime };
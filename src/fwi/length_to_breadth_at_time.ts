/**
 * Length-to-Breadth ratio at time t
 * 
 * @description Computes the Length to Breadth ratio of an elliptically shaped
 * fire at elapsed time since ignition. Equations are from FCFDG (1992)
 * and Wotton et. al. (2009), and are marked as such.
 * 
 * All variables names are laid out in the same manner as Forestry Canada
 * Fire Danger Group (FCFDG) (1992). Development and Structure of the
 * Canadian Forest Fire Behavior Prediction System. Technical Report
 * ST-X-3, Forestry Canada, Ottawa, Ontario.
 * 
 * Wotton, B.M., Alexander, M.E., Taylor, S.W. 2009. Updates and revisions to
 * the 1992 Canadian forest fire behavior prediction system. Nat. Resour.
 * Can., Can. For. Serv., Great Lakes For. Cent., Sault Ste. Marie, Ontario,
 * Canada. Information Report GLC-X-10, 45p.
 * 
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param LB Length to Breadth ratio
 * @param HR Time since ignition (hours)
 * @param CFB Crown Fraction Burned
 * 
 * @returns Length to Breadth ratio at time since ignition
 */

function lengthToBreadthAtTime(FUELTYPE: string, LB: number, HR: number, CFB: number): number {
    // Eq. 72 (FCFDG 1992) - alpha constant value, dependent on fuel type
    const alpha: number = ["C1", "O1A", "O1B", "S1", "S2", "S3", "D1"].includes(FUELTYPE)
      ? 0.115
      : 0.115 - 18.8 * Math.pow(CFB, 2.5) * Math.exp(-8 * CFB);
  
    // Eq. 81 (Wotton et.al. 2009) - LB at time since ignition
    const LBt: number = (LB - 1) * (1 - Math.exp(-alpha * HR)) + 1;
  
    return LBt;
  }

export { lengthToBreadthAtTime };
  
  // Example usage
  /* const fuelType = "C1";
  const lengthBreadthRatio = 2.5;
  const hoursSinceIgnition = 5;
  const crownFractionBurned = 0.3;
  const lbAtTime = lengthToBreadthAtTime(fuelType, lengthBreadthRatio, hoursSinceIgnition, crownFractionBurned);
  console.log(`Length-to-Breadth ratio at time: ${lbAtTime}`); */
  
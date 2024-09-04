/**
 * Length-to-Breadth ratio
 * 
 * @description Computes the Length to Breadth ratio of an elliptically shaped
 * fire. Equations are from FCFDG (1992) except for errata 80 from
 * Wotton et. al. (2009).
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
 * @param WSV The Wind Speed (km/h)
 * 
 * @returns Length to Breadth ratio value
 */

function lengthToBreadth(FUELTYPE: string, WSV: number): number {
    let LB: number;
  
    if (["O1A", "O1B"].includes(FUELTYPE)) {
      // Correction to original Equation 80 is made here
      // Eq. 80a / 80b from Wotton 2009
      LB = WSV >= 1.0 ? 1.1 * Math.pow(WSV, 0.464) : 1.0; // Eq. 80/81
    } else {
      LB = 1.0 + Math.pow(8.729 * (1 - Math.exp(-0.030 * WSV)), 2.155); // Eq. 79
    }
  
    return LB;
  }
  
  // Example usage
/*   const fuelType = "O1A";
  const windSpeed = 10;
  const lbRatio = lengthToBreadth(fuelType, windSpeed);
  console.log(`Length-to-Breadth ratio: ${lbRatio}`); */

  export { lengthToBreadth };
  
/**
 * Rate of Spread at a point along the perimeter calculator
 *
 * Computes the Rate of Spread at any point along the perimeter of an elliptically shaped fire.
 * Equations are from Wotton et. al. (2009).
 *
 * Wotton, B.M., Alexander, M.E., Taylor, S.W. 2009. Updates and revisions to
 * the 1992 Canadian forest fire behavior prediction system. Nat. Resour.
 * Can., Can. For. Serv., Great Lakes For. Cent., Sault Ste. Marie, Ontario,
 * Canada. Information Report GLC-X-10, 45p.
 *
 * @param ROS Rate of Spread (m/min)
 * @param FROS Flank Fire Rate of Spread (m/min)
 * @param BROS Back Fire Rate of Spread (m/min)
 * @param THETA Angle in radians
 * @returns Rate of spread at point theta (m/min)
 */

function rateOfSpreadAtTheta(ROS: number, FROS: number, BROS: number, THETA: number): number {
    let c1 = Math.cos(THETA);
    const s1 = Math.sin(THETA);
    c1 = c1 === 0 ? Math.cos(THETA + 0.001) : c1;
  
    // Eq. 94 - Calculate the Rate of Spread at point THETA
    // large equation, view the paper to see a better representation
    const ROStheta = (((ROS - BROS) / (2 * c1) + (ROS + BROS) / (2 * c1)) *
      ((FROS * c1 * Math.sqrt(FROS * FROS * c1 * c1 + (ROS * BROS) * s1 * s1) -
        ((ROS * ROS - BROS * BROS) / 4) * s1 * s1) /
        (FROS * FROS * c1 * c1 + ((ROS + BROS) / 2) * ((ROS + BROS) / 2) * s1 * s1)));
  
    return ROStheta;
  }
  
  function ROSthetaCalc(...args: any[]): number {
    console.warn(".Deprecated: 'rate_of_spread_at_theta' function is deprecated");
    return rateOfSpreadAtTheta(args[0], args[1], args[2], args[3]);
  }
  
  export { rateOfSpreadAtTheta };
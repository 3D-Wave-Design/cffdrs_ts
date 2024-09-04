/**
 * Surface Fuel Consumption Calculator
 *
 * @description Computes the Surface Fuel Consumption by Fuel Type.
 * All variable names are laid out in the same manner as FCFDG (1992) or
 * Wotton et. al (2009).
 *
 * Forestry Canada Fire Danger Group (FCFDG) (1992). "Development and
 * Structure of the Canadian Forest Fire Behavior Prediction System."
 * Technical Report ST-X-3, Forestry Canada, Ottawa, Ontario.
 *
 * Wotton, B.M., Alexander, M.E., Taylor, S.W. 2009. Updates and revisions to
 * the 1992 Canadian forest fire behavior prediction system. Nat. Resour.
 * Can., Can. For. Serv., Great Lakes For. Cent., Sault Ste. Marie, Ontario,
 * Canada. Information Report GLC-X-10, 45p.
 *
 * @param FUELTYPE The Fire Behaviour Prediction FuelType
 * @param FFMC     Fine Fuel Moisture Code
 * @param BUI      Buildup Index
 * @param PC       Percent Conifer (%)
 * @param GFL      Grass Fuel Load (kg/m^2)
 *
 * @returns SFC Surface Fuel Consumption (kg/m^2)
 */

function surfaceFuelConsumption(FUELTYPE: string[], FFMC: number[], BUI: number[], PC: number[], GFL: number[]): number[] {
    const SFC: number[] = Array(FFMC.length).fill(-999);
  
    for (let i = 0; i < FFMC.length; i++) {
      switch (FUELTYPE[i]) {
        case "C1":
          SFC[i] = FFMC[i] > 84 ?
            0.75 + 0.75 * Math.sqrt(1 - Math.exp(-0.23 * (FFMC[i] - 84))) :
            0.75 - 0.75 * Math.sqrt(1 - Math.exp(-0.23 * (84 - FFMC[i])));
          break;
        case "C2":
        case "M3":
        case "M4":
          SFC[i] = 5.0 * (1 - Math.exp(-0.0115 * BUI[i]));
          break;
        case "C3":
        case "C4":
          SFC[i] = Math.pow(5.0 * (1 - Math.exp(-0.0164 * BUI[i])), 2.24);
          break;
        case "C5":
        case "C6":
          SFC[i] = Math.pow(5.0 * (1 - Math.exp(-0.0149 * BUI[i])), 2.48);
          break;
        case "C7":
          SFC[i] = (FFMC[i] > 70 ? 2 * (1 - Math.exp(-0.104 * (FFMC[i] - 70))) : 0) +
            1.5 * (1 - Math.exp(-0.0201 * BUI[i]));
          break;
        case "D1":
          SFC[i] = 1.5 * (1 - Math.exp(-0.0183 * BUI[i]));
          break;
        case "M1":
        case "M2":
          SFC[i] = (PC[i] / 100 * 5.0 * (1 - Math.exp(-0.0115 * BUI[i]))) +
            ((100 - PC[i]) / 100 * 1.5 * (1 - Math.exp(-0.0183 * BUI[i])));
          break;
        case "O1A":
        case "O1B":
          SFC[i] = GFL[i];
          break;
        case "S1":
          SFC[i] = 4.0 * (1 - Math.exp(-0.025 * BUI[i])) + 4.0 * (1 - Math.exp(-0.034 * BUI[i]));
          break;
        case "S2":
          SFC[i] = 10.0 * (1 - Math.exp(-0.013 * BUI[i])) + 6.0 * (1 - Math.exp(-0.060 * BUI[i]));
          break;
        case "S3":
          SFC[i] = 12.0 * (1 - Math.exp(-0.0166 * BUI[i])) + 20.0 * (1 - Math.exp(-0.0210 * BUI[i]));
          break;
        default:
          SFC[i] = -999;
      }
    }
  
    // Constrain SFC values to be greater than 0
    return SFC.map(value => Math.max(value, 0.000001));
  }
  
  function deprecatedSurfaceFuelConsumption(FUELTYPE: string[], FFMC: number[], BUI: number[], PC: number[], GFL: number[]) {
    console.warn("surfaceFuelConsumption is deprecated. Use surfaceFuelConsumption instead.");
    return surfaceFuelConsumption(FUELTYPE, FFMC, BUI, PC, GFL);
  }

  export { surfaceFuelConsumption };
  
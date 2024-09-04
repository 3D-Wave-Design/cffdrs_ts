/**
 * Total Fuel Consumption calculation
 *
 * @description Computes the Total (Surface + Crown) Fuel Consumption by Fuel
 * Type.
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
 * @param CFL      Crown Fuel Load (kg/m^2)
 * @param CFB      Crown Fraction Burned (0-1)
 * @param SFC      Surface Fuel Consumption (kg/m^2)
 * @param PC       Percent Conifer (%)
 * @param PDF      Percent Dead Balsam Fir (%)
 * @param option   Type of output (TFC, CFC, default="TFC")
 *
 * @returns TFC Total (Surface + Crown) Fuel Consumption (kg/m^2) OR
 * CFC Crown Fuel Consumption (kg/m^2)
 */

type FuelType = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "D1" | "M1" | "M2" | "M3" | "M4" | "O1A" | "O1B" | "S1" | "S2" | "S3";
type Option = "TFC" | "CFC";

function crownFuelConsumption(FUELTYPE: FuelType[], CFL: number[], CFB: number[], PC: number[], PDF: number[]): number[] {
  return CFL.map((cfl, index) => {
    let cfc = cfl * CFB[index];
    if (["M1", "M2"].includes(FUELTYPE[index])) {
      cfc = (PC[index] / 100) * cfc;
    } else if (["M3", "M4"].includes(FUELTYPE[index])) {
      cfc = (PDF[index] / 100) * cfc;
    }
    return cfc;
  });
}

function totalFuelConsumption(FUELTYPE: FuelType[], CFL: number[], CFB: number[], SFC: number[], PC: number[], PDF: number[], option: Option = "TFC"): number[] {
  const CFC = crownFuelConsumption(FUELTYPE, CFL, CFB, PC, PDF);
  
  if (option === "CFC") {
    return CFC;
  }

  return SFC.map((sfc, index) => sfc + CFC[index]);
}

function deprecatedTotalFuelConsumption(FUELTYPE: FuelType[], CFL: number[], CFB: number[], SFC: number[], PC: number[], PDF: number[], option: Option = "TFC") {
  console.warn("totalFuelConsumption is deprecated. Use totalFuelConsumption instead.");
  return totalFuelConsumption(FUELTYPE, CFL, CFB, SFC, PC, PDF, option);
}

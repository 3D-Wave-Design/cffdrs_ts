/**
 * Slope Adjusted wind speed or slope direction of spread calculation
 *
 * Calculate the net effective windspeed (WSV), the net effective
 * wind direction (RAZ) or the wind azimuth (WAZ).
 *
 * All variables names are laid out in the same manner as FCFDG (1992) and
 * Wotton (2009).
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
 * @param FUELTYPE  The Fire Behaviour Prediction FuelType
 * @param FFMC      Fine Fuel Moisture Code
 * @param BUI       The Buildup Index value
 * @param WS        Windspeed (km/h)
 * @param WAZ       Wind Azimuth
 * @param GS        Ground Slope (%)
 * @param SAZ       Slope Azimuth
 * @param FMC       Foliar Moisture Content
 * @param SFC       Surface Fuel Consumption (kg/m^2)
 * @param PC        Percent Conifer (%)
 * @param PDF       Percent Dead Balsam Fir (%)
 * @param CC        Constant
 * @param CBH       Crown Base Height (m)
 * @param ISI       Initial Spread Index
 *
 * @returns  RAZ and WSV
 *    - Rate of spread azimuth (degrees) and Wind Slope speed (km/hr)
 */

import { initialSpreadIndex } from "./initial_spread_index";
import { rateOfSpread } from "./rate_of_spread";

interface SlopeAdjustmentResult {
  WSV: number | null;
  RAZ: number | null;
}

interface ROSResult {
  ROS: number[];
  CFB: number[];
  CSI: number[];
  RSO: number[];
}

/**
 * Helper function to check if an element is in an array
 */
function inArray<T>(element: T, array: T[]): boolean {
  return array.includes(element);
}

function slopeAdjustment(
  FUELTYPE: string[],
  FFMC: number[],
  BUI: number[],
  WS: number[],
  WAZ: number[],
  GS: number[],
  SAZ: number[],
  FMC: number[],
  SFC: number[],
  PC: number[],
  PDF: number[],
  CC: number[],
  CBH: number[],
  ISI: number[]
): SlopeAdjustmentResult[] {
  const NoBUI = FFMC.map(() => -1);

  const SF = GS.map(gs => gs >= 70 ? 10 : Math.exp(3.533 * Math.pow(gs / 100, 1.2)));
  const ISZ = FFMC.map(ffmc => initialSpreadIndex(ffmc, 0));
  const RSZ = rateOfSpread({ FUELTYPE, ISI: ISZ, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH });
  const RSF = RSZ.map((rsz, i) => rsz * SF[i]);

  type FuelType = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" |
  "D1" | "M1" | "M2" | "M3" | "M4" | "S1" | "S2" | "S3" | "O1A" | "O1B";

  const d: FuelType[] = [
  "C1", "C2", "C3", "C4", "C5", "C6", "C7",
  "D1", "M1", "M2", "M3", "M4", "S1", "S2", "S3", "O1A", "O1B"
  ];

  const a: Record<FuelType, number> = {
  "C1": 90, "C2": 110, "C3": 110, "C4": 110, "C5": 30, "C6": 30, "C7": 45,
  "D1": 30, "M1": 0, "M2": 0, "M3": 120, "M4": 100, "S1": 75, "S2": 40, "S3": 55,
  "O1A": 190, "O1B": 250
  };

  const b: Record<FuelType, number> = {
  "C1": 0.0649, "C2": 0.0282, "C3": 0.0444, "C4": 0.0293, "C5": 0.0697, "C6": 0.0800,
  "C7": 0.0305, "D1": 0.0232, "M1": 0, "M2": 0, "M3": 0.0572, "M4": 0.0404,
  "S1": 0.0297, "S2": 0.0438, "S3": 0.0829, "O1A": 0.0310, "O1B": 0.0350
  };

  const c0: Record<FuelType, number> = {
  "C1": 4.5, "C2": 1.5, "C3": 3.0, "C4": 1.5, "C5": 4.0, "C6": 3.0, "C7": 2.0,
  "D1": 1.6, "M1": 0, "M2": 0, "M3": 1.4, "M4": 1.48, "S1": 1.3, "S2": 1.7,
  "S3": 3.2, "O1A": 1.4, "O1B": 1.7
  };

  const isBasic = FUELTYPE.map(fuel => ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "D1", "S1", "S2", "S3"].includes(fuel));

  let ISF = new Array(FFMC.length).fill(-99);

  ISF = ISF.map((isf, i) => {
    if (isBasic[i]) {
    const rsf = RSF[i];
    const fuel = FUELTYPE[i] as FuelType;
    const expValue = 1 - Math.pow(rsf / a[fuel], 1 / c0[fuel]);
    return expValue >= 0.01 ? Math.log(expValue) / -b[fuel] : Math.log(0.01) / -b[fuel];
    }
    return isf;
  });

  // When calculating the M1/M2 types, we are going to calculate for both C2 and D1 types, and combine
  if (FUELTYPE.includes("M1") || FUELTYPE.includes("M2")) {
    const RSZ_C2 = rateOfSpread({
      FUELTYPE: FUELTYPE.map(fuel => (fuel === "M1" || fuel === "M2" ? "C2" : fuel)),
      ISI: ISZ,
      BUI: NoBUI,
      FMC,
      SFC,
      PC,
      PDF,
      CC,
      CBH
    });
    const RSF_C2 = RSZ_C2.map((rsz, i) => rsz * SF[i]);

    const RSZ_D1 = rateOfSpread({
      FUELTYPE: FUELTYPE.map(fuel => (fuel === "M1" || fuel === "M2" ? "D1" : fuel)),
      ISI: ISZ,
      BUI: NoBUI,
      FMC,
      SFC,
      PC,
      PDF,
      CC,
      CBH
    });
    const RSF_D1 = RSZ_D1.map((rsz, i) => rsz * SF[i]);

    ISF = ISF.map((isf, i) => {
      if (FUELTYPE[i] === "M1" || FUELTYPE[i] === "M2") {
        const RSF0_C2 = 1 - Math.pow(RSF_C2[i] / a["C2"], 1 / c0["C2"]);
        const ISF_C2 = RSF0_C2 >= 0.01 ? Math.log(RSF0_C2) / -b["C2"] : Math.log(0.01) / -b["C2"];

        const RSF0_D1 = 1 - Math.pow(RSF_D1[i] / a["D1"], 1 / c0["D1"]);
        const ISF_D1 = RSF0_D1 >= 0.01 ? Math.log(RSF0_D1) / -b["D1"] : Math.log(0.01) / -b["D1"];

        return PC[i] / 100 * ISF_C2 + (1 - PC[i] / 100) * ISF_D1;
      }
      return isf;
    });
  }

  // Set % Dead Balsam Fir to 100% for M3/M4 types
  const PDF100 = ISI.map(() => 100);

  if (FUELTYPE.includes("M3")) {
    const RSZ_M3 = rateOfSpread({
      FUELTYPE: FUELTYPE.map(fuel => (fuel === "M3" ? "M3" : fuel)),
      ISI: ISZ,
      BUI: NoBUI,
      FMC,
      SFC,
      PC,
      PDF: PDF100,
      CC,
      CBH
    });
    const RSF_M3 = RSZ_M3.map((rsz, i) => rsz * SF[i]);

    const RSZ_D1 = rateOfSpread({
      FUELTYPE: FUELTYPE.map(fuel => (fuel === "M3" ? "D1" : fuel)),
      ISI: ISZ,
      BUI: NoBUI,
      FMC,
      SFC,
      PC,
      PDF: PDF100,
      CC,
      CBH
    });
    const RSF_D1 = RSZ_D1.map((rsz, i) => rsz * SF[i]);

    ISF = ISF.map((isf, i) => {
      if (FUELTYPE[i] === "M3") {
        const RSF0_M3 = 1 - Math.pow(RSF_M3[i] / a["M3"], 1 / c0["M3"]);
        const ISF_M3 = RSF0_M3 >= 0.01 ? Math.log(RSF0_M3) / -b["M3"] : Math.log(0.01) / -b["M3"];

        const RSF0_D1 = 1 - Math.pow(RSF_D1[i] / a["D1"], 1 / c0["D1"]);
        const ISF_D1 = RSF0_D1 >= 0.01 ? Math.log(RSF0_D1) / -b["D1"] : Math.log(0.01) / -b["D1"];

        return PDF[i] / 100 * ISF_M3 + (1 - PDF[i] / 100) * ISF_D1;
      }
      return isf;
    });
  }

  if (FUELTYPE.includes("M4")) {
    const RSZ_M4 = rateOfSpread({
      FUELTYPE: FUELTYPE.map(fuel => (fuel === "M4" ? "M4" : fuel)),
      ISI: ISZ,
      BUI: NoBUI,
      FMC,
      SFC,
      PC,
      PDF: PDF100,
      CC,
      CBH
    });
    const RSF_M4 = RSZ_M4.map((rsz, i) => rsz * SF[i]);

    const RSZ_D1 = rateOfSpread({
      FUELTYPE: FUELTYPE.map(fuel => (fuel === "M4" ? "D1" : fuel)),
      ISI: ISZ,
      BUI: NoBUI,
      FMC,
      SFC,
      PC,
      PDF: PDF100,
      CC,
      CBH
    });
    const RSF_D1 = RSZ_D1.map((rsz, i) => rsz * SF[i]);

    ISF = ISF.map((isf, i) => {
      if (FUELTYPE[i] === "M4") {
        const RSF0_M4 = 1 - Math.pow(RSF_M4[i] / a["M4"], 1 / c0["M4"]);
        const ISF_M4 = RSF0_M4 >= 0.01 ? Math.log(RSF0_M4) / -b["M4"] : Math.log(0.01) / -b["M4"];

        const RSF0_D1 = 1 - Math.pow(RSF_D1[i] / a["D1"], 1 / c0["D1"]);
        const ISF_D1 = RSF0_D1 >= 0.01 ? Math.log(RSF0_D1) / -b["D1"] : Math.log(0.01) / -b["D1"];

        return PDF[i] / 100 * ISF_M4 + (1 - PDF[i] / 100) * ISF_D1;
      }
      return isf;
    });
  }

  const CF = FUELTYPE.map((fuel, i) => {
    if (fuel === "O1A" || fuel === "O1B") {
      return CC[i] < 58.8 ? 0.005 * (Math.exp(0.061 * CC[i]) - 1) : 0.176 + 0.02 * (CC[i] - 58.8);
    }
    return -99;
  });

  ISF = ISF.map((isf, i) => {
    if (FUELTYPE[i] === "O1A" || FUELTYPE[i] === "O1B") {
      const rsf = RSF[i];
      const fuel = FUELTYPE[i];
      const expValue = 1 - Math.pow(rsf / (CF[i] * a[fuel]), 1 / c0[fuel]);
      return expValue >= 0.01 ? Math.log(expValue) / -b[fuel] : Math.log(0.01) / -b[fuel];
    }
    return isf;
  });

  if (FUELTYPE.includes("NF") || FUELTYPE.includes("WA")) {
    return FFMC.map(() => ({
      WSV: null,
      RAZ: null
    }));
  }

  const m = FFMC.map(ffmc => 101 - ffmc);
  const fF = m.map(mVal => 91.9 * Math.exp(-0.1386 * mVal) * (1 + Math.pow(mVal, 5.31) / 4.93e7));
  const WSE = fF.map((ff, i) => 1 / 0.05039 * Math.log(ISF[i] / (0.208 * ff)));

  const adjustedWSE = WSE.map((wse, i) => {
    if (wse > 40 && ISF[i] < (0.999 * 2.496 * fF[i])) {
      return 28 - (1 / 0.0818 * Math.log(1 - ISF[i] / (2.496 * fF[i])));
    } else if (wse > 40 && ISF[i] >= (0.999 * 2.496 * fF[i])) {
      return 112.45;
    }
    return wse;
  });

  const WSX = WS.map((ws, i) => ws * Math.sin(WAZ[i]) + adjustedWSE[i] * Math.sin(SAZ[i]));
  const WSY = WS.map((ws, i) => ws * Math.cos(WAZ[i]) + adjustedWSE[i] * Math.cos(SAZ[i]));
  const WSV = WSX.map((wsx, i) => Math.sqrt(wsx * wsx + WSY[i] * WSY[i]));
  const RAZ = WSV.map((wsv, i) => Math.acos(WSY[i] / wsv));
  const adjustedRAZ = WSX.map((wsx, i) => wsx < 0 ? 2 * Math.PI - RAZ[i] : RAZ[i]);

  return FFMC.map((_, i) => ({
    WSV: WSV[i],
    RAZ: adjustedRAZ[i]
  }));
}

function Slopecalc(
  FUELTYPE: string[],
  FFMC: number[],
  BUI: number[],
  WS: number[],
  WAZ: number[],
  GS: number[],
  SAZ: number[],
  FMC: number[],
  SFC: number[],
  PC: number[],
  PDF: number[],
  CC: number[],
  CBH: number[],
  ISI: number[],
  output: string = "RAZ"
): SlopeAdjustmentResult[] | null {

  const validOutTypes = ["RAZ", "WAZ", "WSV"];
  if (!validOutTypes.includes(output)) {
    console.warn("Deprecated: slopeAdjustment");
    throw new Error(`In 'Slopecalc()', '${output}' is an invalid 'output' type.`);
  }

  const values = slopeAdjustment(FUELTYPE, FFMC, BUI, WS, WAZ, GS, SAZ, FMC, SFC, PC, PDF, CC, CBH, ISI);
  values[0][output as keyof SlopeAdjustmentResult] || null;
  return values;
}

// Exporting functions for external usage
export { slopeAdjustment, Slopecalc };
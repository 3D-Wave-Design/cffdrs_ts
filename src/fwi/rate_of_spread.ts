/* #' Rate of Spread Calculation
#'
#'
#' @description Computes the Rate of Spread prediction based on fuel type and
#' FWI conditions. Equations are from listed FCFDG (1992) and Wotton et. al.
#' (2009), and are marked as such.
#'
#' All variables names are laid out in the same manner as Forestry Canada
#' Fire Danger Group (FCFDG) (1992). Development and Structure of the
#' Canadian Forest Fire Behavior Prediction System." Technical Report
#' ST-X-3, Forestry Canada, Ottawa, Ontario.
#'
#' Wotton, B.M., Alexander, M.E., Taylor, S.W. 2009. Updates and revisions to
#' the 1992 Canadian forest fire behavior prediction system. Nat. Resour.
#' Can., Can. For. Serv., Great Lakes For. Cent., Sault Ste. Marie, Ontario,
#' Canada. Information Report GLC-X-10, 45p. */

import { criticalSurfaceIntensity, surfaceFireRateOfSpread, crownFractionBurned } from "./CFBcalc";
import { intermediateSurfaceRateOfSpreadC6, surfaceRateOfSpreadC6, crownRateOfSpreadC6, crownFractionBurnedC6, rateOfSpreadC6 } from "./C6calc";
import { buildupEffect } from "./buildup_effect";

interface InputParams {
  FUELTYPE: string[];
  ISI: number[];
  BUI: number[];
  FMC: number[];
  SFC: number[];
  PC: number[];
  PDF: number[];
  CC: number[];
  CBH: number[];
}

interface ROSResult {
  ROS: number[];
  CFB: number[];
  CSI: number[];
  RSO: number[];
}

function rateOfSpreadExtended(params: InputParams): ROSResult {
  const { FUELTYPE, ISI, BUI, FMC, SFC, PC, PDF, CC, CBH } = params;
  const NoBUI = Array(ISI.length).fill(-1);
  const d = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "D1", "M1", "M2", "M3", "M4", "S1", "S2", "S3", "O1A", "O1B"];
  const a = [90, 110, 110, 110, 30, 30, 45, 30, 0, 0, 120, 100, 75, 40, 55, 190, 250];
  const b = [0.0649, 0.0282, 0.0444, 0.0293, 0.0697, 0.0800, 0.0305, 0.0232, 0, 0, 0.0572, 0.0404, 0.0297, 0.0438, 0.0829, 0.0310, 0.0350];
  const c0 = [4.5, 1.5, 3.0, 1.5, 4.0, 3.0, 2.0, 1.6, 0, 0, 1.4, 1.48, 1.3, 1.7, 3.2, 1.4, 1.7];

  const names = Object.fromEntries(d.map((key, i) => [key, i]));

  let RSI = Array(ISI.length).fill(-1);

  RSI = RSI.map((_, i) => {
    if (["C1", "C2", "C3", "C4", "C5", "C7", "D1", "S1", "S2", "S3"].includes(FUELTYPE[i])) {
      return a[names[FUELTYPE[i]]] * Math.pow(1 - Math.exp(-b[names[FUELTYPE[i]]] * ISI[i]), c0[names[FUELTYPE[i]]]);
    } else if (FUELTYPE[i] === "M1") {
      return (PC[i] / 100) * rateOfSpread({ FUELTYPE: Array(ISI.length).fill("C2"), ISI, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH })[i] +
        ((100 - PC[i]) / 100) * rateOfSpread({ FUELTYPE: Array(ISI.length).fill("D1"), ISI, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH })[i];
    } else if (FUELTYPE[i] === "M2") {
      return (PC[i] / 100) * rateOfSpread({ FUELTYPE: Array(ISI.length).fill("C2"), ISI, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH })[i] +
        0.2 * ((100 - PC[i]) / 100) * rateOfSpread({ FUELTYPE: Array(ISI.length).fill("D1"), ISI, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH })[i];
    }
    return -1;
  });

  const RSI_m3 = RSI.map((rsi, i) => (FUELTYPE[i] === "M3" ? a[names["M3"]] * Math.pow(1 - Math.exp(-b[names["M3"]] * ISI[i]), c0[names["M3"]]) : rsi));
  RSI = RSI.map((rsi, i) => (FUELTYPE[i] === "M3" ? (PDF[i] / 100 * RSI_m3[i] + (1 - PDF[i] / 100) * rateOfSpread({ FUELTYPE: Array(ISI.length).fill("D1"), ISI, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH })[i]) : rsi));

  const RSI_m4 = RSI.map((rsi, i) => (FUELTYPE[i] === "M4" ? a[names["M4"]] * Math.pow(1 - Math.exp(-b[names["M4"]] * ISI[i]), c0[names["M4"]]) : rsi));
  RSI = RSI.map((rsi, i) => (FUELTYPE[i] === "M4" ? (PDF[i] / 100 * RSI_m4[i] + 0.2 * (1 - PDF[i] / 100) * rateOfSpread({ FUELTYPE: Array(ISI.length).fill("D1"), ISI, BUI: NoBUI, FMC, SFC, PC, PDF, CC, CBH })[i]) : rsi));

  const CF = RSI.map((rsi, i) => (["O1A", "O1B"].includes(FUELTYPE[i]) ? (CC[i] < 58.8 ? 0.005 * (Math.exp(0.061 * CC[i]) - 1) : 0.176 + 0.02 * (CC[i] - 58.8)) : -99));
  RSI = RSI.map((rsi, i) => (["O1A", "O1B"].includes(FUELTYPE[i]) ? a[names[FUELTYPE[i]]] * Math.pow(1 - Math.exp(-b[names[FUELTYPE[i]]] * ISI[i]), c0[names[FUELTYPE[i]]]) * CF[i] : rsi));

  const CSI = FMC.map((fmc, i) => criticalSurfaceIntensity(fmc, CBH[i]));
  const RSO = SFC.map((sfc, i) => surfaceFireRateOfSpread(CSI[i], sfc));

  RSI = RSI.map((rsi, i) => (FUELTYPE[i] === "C6" ? intermediateSurfaceRateOfSpreadC6(ISI[i]) : rsi));
  const RSC = FUELTYPE.map((ftype, i) => (ftype === "C6" ? crownRateOfSpreadC6(ISI[i], FMC[i]) : NaN));

  const RSS = RSI.map((rsi, i) => (FUELTYPE[i] === "C6" ? surfaceRateOfSpreadC6(RSI[i], BUI[i]) : buildupEffect(FUELTYPE[i], BUI[i]) * rsi));

  const CFB = RSI.map((rsi, i) => (FUELTYPE[i] === "C6" ? crownFractionBurnedC6(RSC[i], RSS[i], RSO[i]) : crownFractionBurned(RSS[i], RSO[i])));
  const ROS = RSI.map((rsi, i) => (FUELTYPE[i] === "C6" ? rateOfSpreadC6(RSC[i], RSS[i], CFB[i]) : RSS[i]));

  const constrainedROS = ROS.map(ros => (ros <= 0 ? 0.000001 : ros));

  return { ROS: constrainedROS, CFB, CSI, RSO };
}

function rateOfSpread(params: InputParams): number[] {
  const { FUELTYPE, ISI, BUI, FMC, SFC, PC, PDF, CC, CBH } = params;
  const rosVars = rateOfSpreadExtended({ FUELTYPE, ISI, BUI, FMC, SFC, PC, PDF, CC, CBH });
  return rosVars.ROS;
}

function ROScalc(...args: any[]): number[] {
  console.warn(".Deprecated: 'rate_of_spread' function is deprecated");
  return rateOfSpread(args[0]);
}

export { rateOfSpread, InputParams };
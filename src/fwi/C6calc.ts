/**
 * C-6 Conifer Plantation Fire Spread Calculator
 *
 * Calculate C6 (Conifer plantation) Fire Spread. C6 is a special
 * case, and thus has its own function. To calculate C6 fire spread, this
 * function also calculates and can return ROS, CFB, RSC, or RSI by specifying
 * in the option parameter.
 * All variables names are laid out in the same manner as Forestry Canada Fire
 * Danger Group (FCFDG) (1992). Development and Structure of the Canadian
 * Forest Fire Behavior Prediction System." Technical Report ST-X-3, Forestry
 * Canada, Ottawa, Ontario.
 *
 * @param FUELTYPE    The Fire Behaviour Prediction FuelType
 * @param ISI         Initial Spread Index
 * @param BUI         Buildup Index
 * @param FMC         Foliar Moisture Content
 * @param SFC         Surface Fuel Consumption
 * @param CBH         Crown Base Height
 * @param ROS         Rate of Spread
 * @param CFB         Crown Fraction Burned
 * @param RSC         Crown Fire Spread Rate (m/min)
 * @param option      Which variable to calculate ("ROS", "RSC", "RSI", or "CFB" (the default).)
 *
 * @return ROS, CFB, RSC or RSI depending on which option was selected
 */

import { criticalSurfaceIntensity, surfaceFireRateOfSpread, crownFractionBurned } from "./CFBcalc"
import { buildupEffect } from "./buildup_effect";

function intermediateSurfaceRateOfSpreadC6(ISI: number): number {
    // Eq. 62 (FCFDG 1992) Intermediate surface fire spread rate
    return 30 * Math.pow(1 - Math.exp(-0.08 * ISI), 3.0);
}

function surfaceRateOfSpreadC6(RSI: number, BUI: number): number {
    // Eq. 63 (FCFDG 1992) Surface fire spread rate (m/min)
    return RSI * buildupEffect("C6", BUI);
}

function crownRateOfSpreadC6(ISI: number, FMC: number): number {
    // Average foliar moisture effect
    const FMEavg = 0.778;
    // Eq. 59 (FCFDG 1992) Crown flame temperature (degrees K)
    const tt = 1500 - 2.75 * FMC;
    // Eq. 60 (FCFDG 1992) Head of ignition (kJ/kg)
    const H = 460 + 25.9 * FMC;
    // Eq. 61 (FCFDG 1992) Average foliar moisture effect
    const FME = Math.pow(1.5 - 0.00275 * FMC, 4.0) / (460 + 25.9 * FMC) * 1000;
    // Eq. 64 (FCFDG 1992) Crown fire spread rate (m/min)
    return 60 * (1 - Math.exp(-0.0497 * ISI)) * FME / FMEavg;
}

function crownFractionBurnedC6(RSC: number, RSS: number, RSO: number): number {
    return (RSC > RSS) && (RSS > RSO) ? crownFractionBurned(RSS, RSO) : 0;
}

function rateOfSpreadC6(RSC: number, RSS: number, CFB: number): number {
    // Eq. 65 (FCFDG 1992) Calculate Rate of spread (m/min)
    return RSC > RSS ? RSS + CFB * (RSC - RSS) : RSS;
}

export function C6calc(
    FUELTYPE: string, 
    ISI: number, 
    BUI: number, 
    FMC: number, 
    SFC: number, 
    CBH: number, 
    option: string = "CFB"
): number {
    // This should be validated for the FUELTYPE
    // if (FUELTYPE !== "C6") {
    //     throw new Error("Invalid FUELTYPE for C6 calculation");
    // }

    const RSI = intermediateSurfaceRateOfSpreadC6(ISI);
    if (option === "RSI") {
        console.warn("Deprecated: intermediateSurfaceRateOfSpreadC6");
        return RSI;
    }

    const RSC = crownRateOfSpreadC6(ISI, FMC);
    if (option === "RSC") {
        console.warn("Deprecated: crownRateOfSpreadC6");
        return RSC;
    }

    const RSS = surfaceRateOfSpreadC6(RSI, BUI);
    const CSI = criticalSurfaceIntensity(FMC, CBH);
    const RSO = surfaceFireRateOfSpread(CSI, SFC);
    const CFB = crownFractionBurnedC6(RSC, RSS, RSO);
    if (option === "CFB") {
        console.warn("Deprecated: crownFractionBurnedC6");
        return CFB;
    }

    console.warn("Deprecated: rateOfSpreadC6");
    const ROS = rateOfSpreadC6(RSC, RSS, CFB);
    return ROS;
}

// Exporting functions for external usage
export { intermediateSurfaceRateOfSpreadC6, surfaceRateOfSpreadC6, crownRateOfSpreadC6, crownFractionBurnedC6, rateOfSpreadC6 };

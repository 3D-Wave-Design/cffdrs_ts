/* #' @title Grass Fuel Moisture Raster Calculation
#'
#' @description Calculation of the Grass Fuel Moisture Code. This calculates the
#' moisture content of both the surface of a fully cured matted grass layer and
#' also an equivalent Grass Fuel Moisture Code. All equations come from Wotton
#' (2009) as cited below unless otherwise specified.
#'
#' @references
#' Wotton, B.M. 2009. A grass moisture model for the Canadian
#' Forest Fire Danger Rating System. In: Proceedings 8th Fire and
#' Forest Meteorology Symposium, Kalispell, MT Oct 13-15, 2009.
#' Paper 3-2. \url{https://ams.confex.com/ams/pdfpapers/155930.pdf}
#'
#' @param input [SpatRast stack]
#' \tabular{lll}{
#' \var{temp} \tab (required) \tab Temperature (centigrade)\cr
#' \var{rh}   \tab (required) \tab Relative humidity (\%)\cr
#' \var{ws}   \tab (required) \tab 10-m height wind speed (km/h)\cr
#' \var{prec} \tab (required) \tab 1-hour rainfall (mm)\cr
#' \var{isol} \tab (required) \tab Solar radiation (kW/m^2)\cr } */

import * as terra from "terra"; // Assuming terra library is available in JS/TS
import { dataTable } from "data.table"; // Assuming a suitable data table library

interface GFMInput {
  temp: terra.Raster;
  rh: terra.Raster;
  ws: terra.Raster;
  prec: terra.Raster;
  isol: terra.Raster;
}

type OutputType = "GFMCandMC" | "MC" | "GFMC" | "ALL";

function grassFuelMoisture(
  temp: number,
  rh: number,
  ws: number,
  prec: number,
  isol: number,
  GFMCold: number,
  timeStep: number,
  roFL: number
): number {
  // Placeholder for the actual calculation logic
  return Math.random() * 100; // Placeholder
}

function grassFuelMoistureCode(MC: number): number {
  // Placeholder for the actual calculation logic
  return 101 - MC; // Example conversion logic
}

function gfmcRaster(
  input: GFMInput,
  GFMCold: number | terra.Raster = 85,
  timeStep: number = 1,
  roFL: number | terra.Raster = 0.3,
  out: OutputType = "GFMCandMC"
): terra.Raster | terra.Raster[] {
  // Convert input to SpatRaster if necessary
  if (!(input.temp instanceof terra.Raster)) {
    input = {
      temp: terra.rast(input.temp),
      rh: terra.rast(input.rh),
      ws: terra.rast(input.ws),
      prec: terra.rast(input.prec),
      isol: terra.rast(input.isol),
    };
  }
  const inputNames = Object.keys(input);
  const requiredCols = {
    full: ["temperature", "precipitation", "wind speed", "relative humidity", "insolation"],
    short: ["temp", "prec", "ws", "rh", "isol"],
  };

  const missingCols = requiredCols.short.filter(col => !inputNames.includes(col));
  if (missingCols.length > 0) {
    throw new Error(`${missingCols.join(", ")} is missing!`);
  }

  // Convert GFMCold to SpatRaster if necessary
  if (typeof GFMCold === "number") {
    GFMCold = terra.setValues(input.temp, GFMCold);
  }
  if (GFMCold instanceof terra.Raster) {
    terra.names(GFMCold, "GFMCold");
  }

  // Convert roFL to SpatRaster if necessary
  if (typeof roFL === "number") {
    roFL = terra.setValues(input.temp, roFL);
  }
  if (roFL instanceof terra.Raster) {
    terra.names(roFL, "roFL");
  }

  // Ensure valid output type
  const validOutTypes = ["GFMCandMC", "MC", "GFMC", "ALL"];
  if (!validOutTypes.includes(out)) {
    throw new Error(`'${out}' is an invalid 'out' type.`);
  }

  // Calculate MC and GFMC rasters
  const mcRaster = terra.lapp(
    [
      input.temp,
      input.rh,
      input.ws,
      input.prec,
      input.isol,
      GFMCold,
      roFL
    ],
    (temp, rh, ws, prec, isol, GFMCold, roFL) => grassFuelMoisture(temp, rh, ws, prec, isol, GFMCold, timeStep, roFL)
  );
  terra.names(mcRaster, "MC");

  const gfmcRaster = terra.lapp(mcRaster, (mc) => grassFuelMoistureCode(mc));
  terra.names(gfmcRaster, "GFMC");

  // Return requested output
  switch (out) {
    case "ALL":
      return [...Object.values(input), gfmcRaster, mcRaster];
    case "GFMC":
      return gfmcRaster;
    case "MC":
      return mcRaster;
    case "GFMCandMC":
    default:
      return [gfmcRaster, mcRaster];
  }
}

// Example usage
const testInput: GFMInput = {
  temp: terra.rast({ nrows: 25, ncols: 25, vals: Array(25 * 25).fill(20) }),
  rh: terra.rast({ nrows: 25, ncols: 25, vals: Array(25 * 25).fill(50) }),
  ws: terra.rast({ nrows: 25, ncols: 25, vals: Array(25 * 25).fill(10) }),
  prec: terra.rast({ nrows: 25, ncols: 25, vals: Array(25 * 25).fill(0) }),
  isol: terra.rast({ nrows: 25, ncols: 25, vals: Array(25 * 25).fill(0.5) })
};

console.log(gfmcRaster(testInput, 85, 1, 0.3, "GFMCandMC"));

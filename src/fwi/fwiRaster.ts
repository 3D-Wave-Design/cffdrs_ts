/* #' Raster-based Fire Weather Index System
#'
#' @description \code{fwiRaster} is used to calculate the outputs of the
#' Canadian Forest Fire Weather Index (FWI) System for one day based on noon
#' local standard time (LST) weather observations of temperature, relative
#' humidity, wind speed, and 24-hour rainfall, as well as the previous day's
#' fuel moisture conditions. This function takes rasterized input and generates
#' raster maps as outputs.
#'
#' The Canadian Forest Fire Weather Index (FWI) System is a major subsystem of
#' the Canadian Forest Fire Danger Rating System, which also includes Canadian
#' Forest Fire Behavior Prediction (FBP) System. The modern FWI System was
#' first issued in 1970 and is the result of work by numerous researchers from
#' across Canada. It evolved from field research which began in the 1930's and
#' regional fire hazard and fire danger tables developed from that early
#' research.
#'
#' The modern System (Van Wagner 1987) provides six output indices which
#' represent fuel moisture and potential fire behavior in a standard pine
#' forest fuel type. Inputs are a daily noon observation of fire weather, which
#' consists of screen-level air temperature and relative humidity, 10 meter
#' open wind speed and 24 accumulated precipitation.
#'
#' The first three outputs of the system (the Fire Fuel Moisture Code, the Duff
#' Moisture Code, and the Drought Code) track moisture in different layers of
#' the fuel making up the forest floor. Their calculation relies on the daily
#' fire weather observation and also, importantly, the code value from the
#' previous day as they are in essence bookkeeping systems tracking the amount
#' of moisture (water) in to and out of the layer.  It is therefore important
#' that when calculating FWI System outputs over an entire fire season, an
#' uninterrupted daily weather stream is provided; one day is the assumed time
#' step in the models and thus missing data must be filled in.
#'
#' The next three outputs of the System are relative (unitless) indicators of
#' aspects of fire behavior potential: spread rate (the Initial Spread Index),
#' fuel consumption (the Build-up Index) and fire intensity per unit length of
#' fire front (the Fire Weather Index).  This final index, the fwi, is the
#' component of the System used to establish the daily fire danger level for a
#' region and communicated to the public.  This final index can be transformed
#' to the Daily Severity Rating (dsr) to provide a more reasonably-scaled
#' estimate of fire control difficulty.
#'
#' Both the Duff Moisture Code (dmc) and Drought Code (dc) are influenced by
#' day length (see Van Wagner, 1987). Day length adjustments for different
#' ranges in latitude can be used (as described in Lawson and Armitage 2008
#' (\url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/29152.pdf})) and are included
#' in this R function; latitude must be positive in the northern hemisphere and
#' negative in the southern hemisphere.
#'
#' The default initial (i.e., "start-up") fuel moisture code values (FFMC=85,
#' DMC=6, DC=15) provide a reasonable set of conditions for most springtime
#' conditions in Canada, the Northern U.S., and Alaska. They are not suitable
#' for particularly dry winters and are presumably not appropriate for
#' different parts of the world.
#'
#' @param input A stack or brick containing rasterized daily weather
#' observations taken at noon LST. Variable names have to be the same as in the
#' following list, but they are case insensitive. The order in which the inputs
#' are entered is not important.
#'
#' \tabular{lll}{
#' \var{lat} \tab (recommended) \tab Latitude (decimal degree,
#' __default=55__)\cr
#' \var{temp} \tab (required) \tab Temperature (centigrade)\cr
#' \var{rh} \tab (required) \tab Relative humidity (\%)\cr
#' \var{ws} \tab
#' (required) \tab 10-m height wind speed (km/h)\cr
#' \var{prec} \tab (required)
#' \tab 24-hour rainfall (mm)\cr }
#' @param init A vector that contains the initial values for FFMC, DMC, and DC
#' or a stack that contains raster maps of the three moisture codes calculated
#' for the previous day, which will be used for the current day's calculation.
#' Defaults are the standard initial values for FFMC, DMC, and DC defined as
#' the following:
#'
#' \tabular{lll}{
#' \bold{Variable} \tab \bold{Description} \tab \bold{Default} \cr
#' \var{ffmc}
#'    \tab Previous day Fine Fuel Moisture Code (FFMC; unitless) \tab 85 \cr
#' \var{dmc} \tab Previous day Duff Moisture Code (DMC; unitless)\tab 6 \cr
#' \var{dc} \tab Previous Day Drought Code (DC; unitless) \tab 15\cr
#' \var{lat} \tab Latitude of the weather station (\emph{Optional})\tab 55 \cr}
#'
#' @param mon Month of the year (integer 1~12, default=7). Month is used in
#' latitude adjustment (\code{lat.adjust}), it is therefore recommended when
#' \code{lat.adjust=TRUE} was chosen.
#' @param out The function offers two output options, \code{out="all"} will
#' produce a raster stack include both the input and the FWI System outputs;
#' \code{out="fwi"} will generate a stack with only the FWI system components.
#' @param lat.adjust The function offers options for whether latitude
#' adjustments to day lengths should be applied to the calculations. The
#' default value is "TRUE".
#' @param uppercase Output in upper cases or lower cases would be decided by
#' this argument. Default is TRUE.
#' @return By default, \code{fwi} returns a raster stack which includes both
#' the input and the FWI System variables, as describe below: \item{Inputs
#' }{Including \code{temp}, \code{rh}, \code{ws}, and \code{prec} with
#' \code{lat} as optional.} \item{ffmc }{Fine Fuel Moisture Code} \item{dmc
#' }{Duff Moisture Code} \item{dc }{Drought Code} \item{isi }{Initial Spread
#' Index} \item{bui }{Buildup Index} \item{fwi }{Fire Weather Index} \item{dsr
#' }{Daily Severity Rating}
#'
#' @author Xianli Wang, Alan Cantin, Marc-André Parisien, Mike Wotton, Kerry
#' Anderson, and Mike Flannigan
#'
#' @seealso \code{\link{fbp}}, \code{\link{fbpRaster}}, \code{\link{fwi}},
#' \code{\link{hffmc}}, \code{\link{hffmcRaster}}
#'
#' @references 1. Van Wagner, C.E. and T.L. Pickett. 1985. Equations and
#' FORTRAN program for the Canadian Forest Fire Weather Index System. Can. For.
#' Serv., Ottawa, Ont. For. Tech. Rep. 33. 18 p.
#' \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/19973.pdf}
#'
#' 2. Van Wagner, C.E. 1987. Development and structure of the Canadian forest
#' fire weather index system. Forest Technology Report 35. (Canadian Forestry
#' Service: Ottawa). \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/19927.pdf}
#'
#' 3.  Lawson, B.D. and O.B. Armitage. 2008. Weather guide for the Canadian
#' Forest Fire Danger Rating System. Nat. Resour. Can., Can. For. Serv., North.
#' For. Cent., Edmonton, AB.
#' \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/29152.pdf} */

interface RasterInput {
    [key: string]: number[] | undefined;
    lat?: number[];
    temp: number[];
    rh: number[];
    ws: number[];
    prec: number[];
  }
  
  interface InitValues {
    ffmc: number;
    dmc: number;
    dc: number;
    lat?: number;
  }
  
  interface FWIOutput {
    ffmc: number[];
    dmc: number[];
    dc: number[];
    isi: number[];
    bui: number[];
    fwi: number[];
    dsr: number[];
  }
  
  function fineFuelMoistureCode(
    ffmc_yda: number, temp: number, rh: number, ws: number, prec: number
  ): number {
    return Math.random() * 100; // Placeholder
  }
  
  function duffMoistureCode(
    dmc_yda: number, temp: number, rh: number, prec: number, lat: number, mon: number, latAdjust: boolean
  ): number {
    return Math.random() * 100; // Placeholder
  }
  
  function droughtCode(
    dc_yda: number, temp: number, rh: number, prec: number, lat: number, mon: number, latAdjust: boolean
  ): number {
    return Math.random() * 100; // Placeholder
  }
  
  function initialSpreadIndex(ffmc: number, ws: number, fbpMod: boolean): number {
    return Math.random() * 100; // Placeholder
  }
  
  function buildupIndex(dmc: number, dc: number): number {
    return Math.random() * 100; // Placeholder
  }
  
  function fireWeatherIndex(isi: number, bui: number): number {
    return Math.random() * 100; // Placeholder
  }
  
  function fwiRaster(
    input: RasterInput,
    init: InitValues = { ffmc: 85, dmc: 6, dc: 15, lat: 55 },
    mon: number = 7,
    out: string = "all",
    latAdjust: boolean = true,
    uppercase: boolean = true
  ): FWIOutput | (FWIOutput & RasterInput) {
    const requiredVars = ["temp", "rh", "ws", "prec"];
    for (const varName of requiredVars) {
      if (!input[varName]) {
        throw new Error(`${varName} is missing!`);
      }
    }
  
    if (input.prec.some((val: number) => val < 0)) {
      throw new Error("precipitation (prec) cannot be negative!");
    }
    if (input.ws.some((val: number) => val < 0)) {
      throw new Error("wind speed (ws) cannot be negative!");
    }
    if (input.rh.some((val: number) => val < 0)) {
      throw new Error("relative humidity (rh) cannot be negative!");
    }
  
    const lat = input.lat ?? Array(input.temp.length).fill(init.lat ?? 55);
    const ffmc_yda = Array(input.temp.length).fill(init.ffmc);
    const dmc_yda = Array(input.temp.length).fill(init.dmc);
    const dc_yda = Array(input.temp.length).fill(init.dc);
  
    input.rh = input.rh.map((val: number) => (val >= 100 ? 99.9999 : val));
  
    const ffmc = input.temp.map((_, i) =>
      fineFuelMoistureCode(ffmc_yda[i], input.temp[i], input.rh[i], input.ws[i], input.prec[i])
    );
  
    const dmc = input.temp.map((_, i) =>
      duffMoistureCode(dmc_yda[i], input.temp[i], input.rh[i], input.prec[i], lat[i], mon, latAdjust)
    );
  
    const dc = input.temp.map((_, i) =>
      droughtCode(dc_yda[i], input.temp[i], input.rh[i], input.prec[i], lat[i], mon, latAdjust)
    );
  
    const isi = input.temp.map((_, i) =>
      initialSpreadIndex(ffmc[i], input.ws[i], false)
    );
  
    const bui = input.temp.map((_, i) =>
      buildupIndex(dmc[i], dc[i])
    );
  
    const fwi = input.temp.map((_, i) =>
      fireWeatherIndex(isi[i], bui[i])
    );
  
    const dsr = fwi.map(val => 0.0272 * Math.pow(val, 1.77));
  
    const newFWI: FWIOutput = {
      ffmc,
      dmc,
      dc,
      isi,
      bui,
      fwi,
      dsr
    };
  
    if (uppercase) {
      return {
        ffmc: newFWI.ffmc,
        dmc: newFWI.dmc,
        dc: newFWI.dc,
        isi: newFWI.isi,
        bui: newFWI.bui,
        fwi: newFWI.fwi,
        dsr: newFWI.dsr
      };
    }
  
    if (out === "fwi") {
      return newFWI;
    }
  
    if (out === "all") {
      return { ...input, ...newFWI };
    }
  
    return newFWI;
  }
  
  // Example usage
  /* const testInput: RasterInput = {
    temp: [17, 20, 8.5, 6.5, 13],
    rh: [42, 21, 40, 25, 34],
    ws: [25, 25, 17, 6, 24],
    prec: [0, 2.4, 0, 0, 0]
  }; */
  
  //console.log(fwiRaster(testInput, { ffmc: 85, dmc: 6, dc: 15, lat: 55 }, 7, "all", true, true));
  
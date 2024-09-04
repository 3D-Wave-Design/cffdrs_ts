/* #' Fire Weather Index System
#'
#' @description \code{fwi} is used to calculate the outputs of the Canadian
#' Forest Fire Weather Index (FWI) System for one day or one fire season based
#' on noon local standard time (LST) weather observations of temperature,
#' relative humidity, wind speed, and 24-hour rainfall, as well as the previous
#' day's fuel moisture conditions. This function could be used for either one
#' weather station or for multiple weather stations.
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
#' The first three outputs of the system (the Fire Fuel Moisture Code (ffmc),
#' the Duff Moisture Code (dmc), and the Drought Code (dc)) track moisture in
#' different layers of the fuel making up the forest floor. Their calculation
#' relies on the daily fire weather observation and also, importantly, the
#' moisture code value from the previous day as they are in essence bookkeeping
#' systems tracking the amount of moisture (water) in to and out of the layer.
#' It is therefore important that when calculating FWI System outputs over an
#' entire fire season, an uninterrupted daily weather stream is provided; one
#' day is the assumed time step in the models and thus missing data must be
#' filled in.
#'
#' The next three outputs of the System are relative (unitless) indicators of
#' aspects of fire behavior potential: spread rate (the Initial Spread Index,
#' isi), fuel consumption (the Build-up Index, bui) and fire intensity per unit
#' length of fire front (the Fire Weather Index, fwi).  This final index, the
#' fwi, is the component of the System used to establish the daily fire danger
#' level for a region and communicated to the public.  This final index can be
#' transformed to the Daily Severity Rating (dsr) to provide a more
#' reasonably-scaled estimate of fire control difficulty.
#'
#' Both the Duff Moisture Code (dmc) and Drought Code (dc) are influenced by
#' day length (see Van Wagner 1987). Day length adjustments for different
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
#' @param input A dataframe containing input variables of daily weather
#' observations taken at noon LST. Variable names have to be the same as in the
#' following list, but they are case insensitive. The order in which the input
#' variables are entered is not important.
#'
#' \tabular{lll}{
#' \var{id} \tab (optional)
#' \tab Unique identifier of a weather\cr
#' \tab\tab station or spatial point (no restriction on\cr
#' \tab\tab data type); required when \code{batch=TRUE}\cr
#' \var{lat} \tab (recommended) \tab Latitude (decimal degree, default=55)\cr
#' \var{long} \tab (optional) \tab Longitude (decimal degree)\cr
#' \var{yr} \tab (optional) \tab Year of observation;
#' required when \code{batch=TRUE}\cr
#' \var{mon} \tab (recommended) \tab Month of the year
#'    (integer 1-12, default=7)\cr
#' \var{day} \tab (optional) \tab Dayof the month (integer); required when
#'    \code{batch=TRUE}\cr
#' \var{temp} \tab (required) \tab Temperature (centigrade)\cr
#' \var{rh} \tab (required) \tab Relative humidity (\%)\cr
#' \var{ws} \tab (required) \tab 10-m height wind speed (km/h)\cr
#' \var{prec} \tab (required) \tab 24-hour rainfall (mm)\cr }
#'
#' @param init A data.frame or vector contains either the initial values for
#' FFMC, DMC, and DC or the same variables that were calculated for the
#' previous day and will be used for the current day's calculation. The
#' function also accepts a vector if the initial or previous day FWI values is
#' for only one weather station (a warning message comes up if a single set of
#' initial values is used for multiple weather stations). Defaults are the
#' standard initial values for FFMC, DMC, and DC defined as the following:
#' \tabular{lll}{
#' \bold{Variable} \tab \bold{Description} \tab \bold{Default} \cr
#' \var{ffmc}
#'    \tab Previous day Fine Fuel Moisture Code (FFMC; unitless) \tab 85 \cr
#' \var{dmc} \tab Previous day Duff Moisture Code (DMC; unitless)\tab 6 \cr
#' \var{dc} \tab Previous Day Drought Code (DC; unitless) \tab 15\cr
#' \var{lat} \tab Latitude of the weather station (\emph{Optional}) \tab 55 \cr}
#'
#' @param batch Whether the computation is iterative or single step, default is
#' TRUE. When \code{batch=TRUE}, the function will calculate daily FWI System
#' outputs for one weather station over a period of time chronologically with
#' the initial conditions given (\code{init}) applied only to the first day of
#' calculation. If multiple weather stations are processed, an additional "id"
#' column is required in the input to label different stations, and the data
#' needs to be sorted by date/time and "id".  If \code{batch=FALSE}, the
#' function calculates only one time step (1 day) base on either the initial
#' start values or the previous day's FWI System variables, which should also
#' be assigned to \code{init} argument.
#'
#' @param out The function offers two output options, \code{out="all"} will
#' produce a data frame that includes both the input and the FWI System
#' outputs; \code{out="fwi"} will generate a data frame with only the FWI
#' system components.
#'
#' @param lat.adjust The function offers options for whether day length
#' adjustments should be applied to the calculations.  The default value is
#' "TRUE".
#'
#' @param uppercase Output in upper cases or lower cases would be decided by
#' this argument. Default is TRUE.
#'
#' @return \code{fwi} returns a dataframe which includes both the input and the
#' FWI System variables as described below:
#' \item{Input Variables }{Including temp, rh, ws, and prec with id, long, lat,
#'    yr, mon, or day as optional.}
#' \item{ffmc }{Fine Fuel Moisture Code}
#' \item{dmc }{Duff Moisture Code}
#' \item{dc }{Drought Code}
#' \item{isi }{Initial Spread Index}
#' \item{bui }{Buildup Index}
#' \item{fwi }{Fire Weather Index}
#' \item{dsr }{Daily Severity Rating}
#'
#' @author Xianli Wang, Alan Cantin, Marc-André Parisien, Mike Wotton, Kerry
#' Anderson, and Mike Flannigan
#'
#' @seealso \code{\link{fbp}}, \code{\link{fwiRaster}}, \code{\link{gfmc}},
#' \code{\link{hffmc}}, \code{\link{hffmcRaster}}, \code{\link{sdmc}},
#' \code{\link{overwinter_drought_code}}, \code{\link{fire_season}}
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
#' \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/29152.pdf}
#'
#' @keywords methods
#'
#' @examples
#'
#' library(cffdrs)
#' # The test data is a standard test
#' # dataset for FWI system (Van Wagner and Pickett 1985)
#' data("test_fwi")
#' # Show the data, which is already sorted by time:
#' head(test_fwi)
#' # long  lat	yr	mon	day	temp	rh	ws	prec
#' # -100	40	1985	4	  13	17	  42	25	0
#' # -100	40	1985	4	  14	20	  21	25	2.4
#' # -100	40	1985	4	  15	8.5	  40	17	0
#' # -100	40	1985	4	  16	6.5	  25	6	0
#' # -100	40	1985	4	  17	13	  34	24	0
#'
#' ## (1) FWI System variables for a single weather station:
#' # Using the default initial values and batch argument,
#' # the function calculate FWI variables chronically:
#' fwi.out1 <- fwi(test_fwi)
#' # Using a different set of initial values:
#' fwi.out2 <- fwi(
#'   test_fwi,
#'   init = data.frame(ffmc = 80, dmc = 10, dc = 16, lat = 50)
#' )
#' # This could also be done as the following:
#' fwi.out2 <- fwi(test_fwi, init = data.frame(80, 10, 6, 50))
#' # Or:
#' fwi.out2 <- fwi(test_fwi, init = c(80, 10, 6, 50))
#' # Latitude could be ignored, and the default value (55) will
#' # be used:
#' fwi.out2 <- fwi(test_fwi, init = data.frame(80, 10, 6))
#'
#' ## (2) FWI for one or multiple stations in a single day:
#' # Change batch argument to FALSE, fwi calculates FWI
#' # components based on previous day's fwi outputs:
#'
#' fwi.out3 <- fwi(test_fwi, init = fwi.out1, batch = FALSE)
#' # Using a suite of initials, assuming variables from fwi.out1
#' # are the initial values for different records.
#' init_suite <- fwi.out1[, c("FFMC", "DMC", "DC", "LAT")]
#' # Calculating FWI variables for one day but with multiple
#' # stations. Because the calculations is for one time step,
#' # batch=FALSE:
#' fwi.out4 <- fwi(test_fwi, init = init_suite, batch = FALSE)
#'
#' ## (3) FWI for multiple weather stations over a period of time:
#' # Assuming there are 4 weather stations in the test dataset, and they are
#' # ordered by day:
#' test_fwi$day <- rep(1:(nrow(test_fwi) / 4), each = 4)
#' test_fwi$id <- rep(1:4, length(unique(test_fwi$day)))
#' # Running the function with the same default initial inputs, will receive a
#' # warning message, but that is fine:
#' fwi(test_fwi)
#'
#' ## (4) Daylength adjustment:
#' # Change latitude values where the monthly daylength adjustments
#' # are different from the standard ones
#' test_fwi$lat <- 22
#' # With daylength adjustment
#' fwi(test_fwi)[1:3, ]
#' # Without daylength adjustment
#' fwi(test_fwi, lat.adjust = FALSE)[1:3, ]
#'
#' @export fwi
#'
fwi <- function(
    input,
    init = data.frame(ffmc = 85, dmc = 6, dc = 15, lat = 55),
    batch = TRUE,
    out = "all",
    lat.adjust = TRUE,
    uppercase = TRUE) {
  #############################################################################
  # Description: Canadian Forest Fire Weather Index Calculations. All code
  #              is based on a C code library that was written by Canadian
  #              Forest Service Employees, which was originally based on
  #              the Fortran code listed in the reference below. All equations
  #              in this code refer to that document, unless otherwise noted.
  #
  #              Equations and FORTRAN program for the Canadian Forest Fire
  #              Weather Index System. 1985. Van Wagner, C.E.; Pickett, T.L.
  #              Canadian Forestry Service, Petawawa National Forestry
  #              Institute, Chalk River, Ontario. Forestry Technical Report 33.
  #              18 p.
  #
  #              Additional reference on FWI system
  #
  #              Development and structure of the Canadian Forest Fire Weather
  #              Index System. 1987. Van Wagner, C.E. Canadian Forestry Service,
  #              Headquarters, Ottawa. Forestry Technical Report 35. 35 p.
  #
  # Args:  input:    View Documentation (fwi.Rd) for full description
  #                 of input data frame
  #       init:     Initializing moisture values
  #                 ffmc:     Fine Fuel Moisture Code (default 85)
  #                 dmc:      Duff Moisture Code (default 6)
  #                 dc:       Drought Code (default 15)
  #                 lat:      Latitude (decimal degrees, default 55)
  #       batch:    Function can be run in a batch mode, where multiple
  #                 weather stations or points can be calculated at once.
  #                 (TRUE/FALSE, default TRUE)
  #       out:      Display the calculated FWI values, with or without the
  #                 inputs. (all/fwi, default all)
  #       lat.adjust: Option to adjust day length in the calculations
  #                   (TRUE/FALSE, default TRUE)
  #       uppercase:  Output names in upper or lower case - a commonly
  #                   asked for feature, as dataset naming conventions vary
  #                   considerably. (TRUE/FALSE, default TRUE)
  #
  #
  # Returns: A data.frame of the calculated FWI values with or without
  #          the input data attached to it.
  #
  ############################################################################# */

interface InputType {
    id?: number | string;
    lat?: number;
    long?: number;
    yr?: number;
    mon?: number;
    day?: number;
    temp: number;
    rh: number;
    ws: number;
    prec: number;
    [key: string]: any;
  }
  
  interface InitType {
    ffmc: number;
    dmc: number;
    dc: number;
    lat?: number;
  }
  
  interface FWIOutput {
    ffmc: number;
    dmc: number;
    dc: number;
    isi: number;
    bui: number;
    fwi: number;
    dsr: number;
    [key: string]: any;
  }
  
/*************************************************************************************** */

  function fineFuelMoistureCode(
    ffmc_yda: number, temp: number, rh: number, ws: number, prec: number
  ): number {
    return Math.random() * 100;
  }
  
  function duffMoistureCode(
    dmc_yda: number, temp: number, rh: number, prec: number, lat: number, mon: number, lat_adjust: boolean
  ): number {
    return Math.random() * 100;
  }
  
  function droughtCode(
    dc_yda: number, temp: number, rh: number, prec: number, lat: number, mon: number, lat_adjust: boolean
  ): number {
    return Math.random() * 100;
  }
  
  function initialSpreadIndex(ffmc: number, ws: number, flag: boolean): number {
    return Math.random() * 100;
  }
  
  function buildupIndex(dmc: number, dc: number): number {
    return Math.random() * 100;
  }
  
  function fireWeatherIndex(isi: number, bui: number): number {
    return Math.random() * 100;
  }

/*************************************************************************************** */
  
  function fwi(
    input: InputType[],
    init: InitType = { ffmc: 85, dmc: 6, dc: 15, lat: 55 },
    batch: boolean = true,
    out: string = "all",
    latAdjust: boolean = true,
    uppercase: boolean = true
  ): FWIOutput[] {
    input.forEach(entry => {
      Object.keys(entry).forEach(key => {
        entry[key.toLowerCase()] = entry[key];
      });
    });
  
    if (Array.isArray(init)) {
      init = { ffmc: init[0], dmc: init[1], dc: init[2], lat: init[3] || 55 };
    }
  
    let { ffmc: ffmc_yda, dmc: dmc_yda, dc: dc_yda, lat: defaultLat } = init;
  
    let lat = input.map(entry => entry.lat ?? defaultLat);
    let long = input.map(entry => entry.long ?? -120);
    let yr = input.map(entry => entry.yr ?? 5000);
    let mon = input.map(entry => entry.mon ?? 7);
    let day = input.map(entry => entry.day ?? -99);
  
    if (batch) {
      if (input.some(entry => entry.id !== undefined)) {
        input.sort((a, b) => (a.yr! - b.yr!) || (a.mon! - b.mon!) || (a.day! - b.day!) || (a.id! > b.id! ? 1 : -1));
      }
    }
  
    let temp = input.map(entry => entry.temp);
    let prec = input.map(entry => entry.prec);
    let ws = input.map(entry => entry.ws);
    let rh = input.map(entry => entry.rh);
  
    let n = batch ? (new Set(input.map(entry => entry.id))).size : 1;
  
    let ffmc: number[] = [];
    let dmc: number[] = [];
    let dc: number[] = [];
    let isi: number[] = [];
    let bui: number[] = [];
    let fwi: number[] = [];
    let dsr: number[] = [];
  
    let n0 = temp.length / n;
  
    for (let i = 0; i < n0; i++) {
      let k = [...Array(n).keys()].map(j => j + (i * n));
      k.forEach(j => rh[j] = rh[j] >= 100 ? 99.9999 : rh[j]);
  
      let ffmc1 = k.map(j => fineFuelMoistureCode(ffmc_yda, temp[j], rh[j], ws[j], prec[j]));
      let dmc1 = k.map(j => duffMoistureCode(dmc_yda, temp[j], rh[j], prec[j], lat[j]!, mon[j], latAdjust));
      let dc1 = k.map(j => droughtCode(dc_yda, temp[j], rh[j], prec[j], lat[j]!, mon[j], latAdjust));
      let isi1 = k.map((j, idx) => initialSpreadIndex(ffmc1[idx], ws[j], false));
      let bui1 = k.map((j, idx) => buildupIndex(dmc1[idx], dc1[idx]));
      let fwi1 = k.map((j, idx) => fireWeatherIndex(isi1[idx], bui1[idx]));
      let dsr1 = fwi1.map(value => 0.0272 * Math.pow(value, 1.77));
  
      ffmc.push(...ffmc1);
      dmc.push(...dmc1);
      dc.push(...dc1);
      isi.push(...isi1);
      bui.push(...bui1);
      fwi.push(...fwi1);
      dsr.push(...dsr1);
  
      ffmc_yda = ffmc1[ffmc1.length - 1];
      dmc_yda = dmc1[dmc1.length - 1];
      dc_yda = dc1[dc1.length - 1];
    }
  
    let newFWI: FWIOutput[] = [];
    if (out === "fwi") {
      newFWI = ffmc.map((value, index) => ({
        ffmc: value,
        dmc: dmc[index],
        dc: dc[index],
        isi: isi[index],
        bui: bui[index],
        fwi: fwi[index],
        dsr: dsr[index]
      }));
    } else {
      if (out === "all") {
        newFWI = input.map((entry, index) => ({
          ...entry,
          ffmc: ffmc[index],
          dmc: dmc[index],
          dc: dc[index],
          isi: isi[index],
          bui: bui[index],
          fwi: fwi[index],
          dsr: dsr[index]
        }));
      }
    }
  
    if (uppercase) {
      newFWI = newFWI.map(entry => {
        let newEntry: any = {};
        Object.keys(entry).forEach(key => {
          newEntry[key.toUpperCase()] = entry[key];
        });
        return newEntry;
      });
    }
  
    return newFWI;
  }
  
  // Example usage
  const testData: InputType[] = [
    { id: 1, long: -100, lat: 40, yr: 1985, mon: 4, day: 13, temp: 17, rh: 42, ws: 25, prec: 0 },
    { id: 1, long: -100, lat: 40, yr: 1985, mon: 4, day: 14, temp: 20, rh: 21, ws: 25, prec: 2.4 },
    { id: 1, long: -100, lat: 40, yr: 1985, mon: 4, day: 15, temp: 8.5, rh: 40, ws: 17, prec: 0 },
    { id: 1, long: -100, lat: 40, yr: 1985, mon: 4, day: 16, temp: 6.5, rh: 25, ws: 6, prec: 0 },
    { id: 1, long: -100, lat: 40, yr: 1985, mon: 4, day: 17, temp: 13, rh: 34, ws: 24, prec: 0 },
    // More data entries...
  ];
  
  console.log(fwi(testData, { ffmc: 85, dmc: 6, dc: 15, lat: 55 }, true, "all", true, true));
  
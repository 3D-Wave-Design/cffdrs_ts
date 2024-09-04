/* #' Grass Fuel Moisture Code
#'
#' @description \code{gfmc} calculates both the moisture content of the surface
#' of a fully cured matted grass layer and also an equivalent Grass Fuel
#' Moisture Code (gfmc) (Wotton, 2009) to create a parallel with the hourly ffmc
#' (see the \code{\link{fwi}} and \code{\link{hffmc}}functions). The calculation
#' is based on hourly (or sub-hourly) weather observations of temperature,
#' relative humidity, wind speed, rainfall, and solar radiation. The user must
#' also estimate an initial value of the gfmc for the layer. This function
#' could be used for either one weather station or multiple weather stations.
#'
#' The Canadian Forest Fire Danger Rating System (CFFDRS) is used throughout
#' Canada, and in a number of countries throughout the world, for estimating
#' fire potential in wildland fuels. This new Grass Fuel Moisture Code (GFMC)
#' is an addition (Wotton 2009) to the CFFDRS and retains the structure of that
#' System's hourly Fine Fuel Moisture Code (HFFMC) (Van Wagner 1977). It tracks
#' moisture content in the top 5 cm of a fully-cured and fully-matted layer of
#' grass and thus is representative of typical after winter conditions in areas
#' that receive snowfall.  This new moisture calculation method outputs both
#' the actual moisture content of the layer and also the transformed moisture
#' Code value using the FFMC's FF-scale.  In the CFFDRS the moisture codes are
#' in fact relatively simple transformations of actual moisture content such
#' that decreasing moisture content (increasing dryness) is indicated by an
#' increasing Code value. This moisture calculation uses the same input weather
#' observations as the hourly FFMC, but also requires an estimate of solar
#' radiation incident on the fuel.
#'
#' @param input A dataframe containing input variables of daily noon weather
#' observations. Variable names have to be the same as in the following list,
#' but they are case insensitive. The order in which the input variables are
#' entered is not important.
#'
#' \tabular{lll}{
#' \var{id} \tab (optional) \tab Batch Identification\cr
#' \var{temp} \tab (required) \tab Temperature (centigrade)\cr
#' \var{rh} \tab (required) \tab Relative humidity (\%)\cr
#' \var{ws} \tab (required) \tab 10-m height wind speed (km/h)\cr
#' \var{prec} \tab (required) \tab 1-hour rainfall (mm)\cr
#' \var{isol} \tab (required) \tab Solar radiation (kW/m^2)\cr
#' \var{mon} \tab (recommended) \tab Month of the year (integer' 1-12)\cr
#' \var{day} \tab (optional) \tab Day of the month (integer)\cr }
#' @param GFMCold Previous value of GFMC (i.e. value calculated at the previous
#' time step)[default is 85 (which corresponds to a moisture content of about
#' 16\%)]. On the first calculation this is the estimate of the GFMC value at
#' the start of the time step. The \code{GFMCold} argument can accept a single
#' initial value for multiple weather stations, and also accept a vector of
#' initial values for multiple weather stations.  NOTE: this input represents
#' the CODE value, not a direct moisture content value. The CODE values in the
#' Canadian FWI System increase within decreasing moisture content. To roughly
#' convert a moisture content value to a CODE value on the FF-scale (used in
#' the FWI Systems FFMC) use \code{GFMCold} =101-gmc (where gmc is moisture
#' content in \%)
#'
#' @param time.step Time step (hour) [default 1 hour]
#' @param roFL The nominal fuel load of the fine fuel layer, default is 0.3
#' kg/m^2
#' @param batch Whether the computation is iterative or single step, default is
#' TRUE. When \code{batch=TRUE}, the function will calculate hourly or
#' sub-hourly GFMC for one weather station over a period of time iteratively.
#' If multiple weather stations are processed, an additional "id" column is
#' required in the input to label different stations, and the data needs to be
#' sorted by time sequence and "id".  If \code{batch=FALSE}, the function
#' calculates only one time step (1 hour) base on either the previous hourly
#' GFMC or the initial start value.
#' @param out Output format, default is "GFMCandMC", which contains both GFMC
#' and moisture content (MC) in a data.frame format. Other choices include:
#' "GFMC", "MC", and "ALL", which include both the input and GFMC and MC.
#' @return \code{gfmc} returns GFMC and moisture content (MC) values
#' collectively (default) or separately.
#' @author Xianli Wang, Mike Wotton, Alan Cantin, and Mike Flannigan
#' @seealso \code{\link{fwi}}, \code{\link{hffmc}}
#' @references Wotton, B.M. 2009. A grass moisture model for the Canadian
#' Forest Fire Danger Rating System. In: Proceedings 8th Fire and Forest
#' Meteorology Symposium, Kalispell, MT Oct 13-15, 2009. Paper 3-2.
#' \url{https://ams.confex.com/ams/pdfpapers/155930.pdf}
#'
#' Van Wagner, C.E. 1977. A method of computing fine fuel moisture content
#' throughout the diurnal cycle. Environment Canada, Canadian Forestry Service,
#' Petawawa Forest Experiment Station, Chalk River, Ontario. Information Report
#' PS-X-69. \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/25591.pdf}
#' @keywords methods
#' @importFrom data.table data.table
#' @export gfmc
#' @examples
#'
#' library(cffdrs)
#' # load the test data
#' data("test_gfmc")
#' # show the data format:
#' head(test_gfmc)
#' #     yr mon day hr temp   rh   ws prec  isol
#' # 1 2006   5  17 10 15.8 54.6  5.0    0 0.340
#' # 2 2006   5  17 11 16.3 52.9  5.0    0 0.380
#' # 3 2006   5  17 12 18.8 45.1  5.0    0 0.626
#' # 4 2006   5  17 13 20.4 40.8  9.5    0 0.656
#' # 5 2006   5  17 14 20.1 41.7  8.7    0 0.657
#' # 6 2006   5  17 15 18.6 45.8 13.5    0 0.629
#' # (1) gfmc default:
#' # Re-order the data by year, month, day, and hour:
#' dat <- test_gfmc[with(test_gfmc, order(yr, mon, day, hr)), ]
#' # Because the test data has 24 hours input variables
#' # it is possible to calculate the hourly GFMC continuously
#' # through multiple days(with the default initial GFMCold=85):
#' dat$gfmc_default <- gfmc(dat,out="GFMC")
#' # two variables will be added to the input, GFMC and MC
#' head(dat)
#' # (2) For multiple weather stations:
#' # One time step (1 hour) with default initial value:
#' foo <- gfmc(dat, batch = FALSE)
#' # Chronological hourly GFMC with only one initial
#' # value (GFMCold=85), but multiple weather stations.
#' # Note: data is ordered by date/time and the station id. Subset
#' # the data by keeping only the first 10 hours of observations
#' # each day:
#' dat1 <- subset(dat, hr %in% c(0:9))
#' # assuming observations were from the same day but with
#' # 9 different weather stations:
#' dat1$day <- NULL
#' dat1 <- dat1[with(dat1, order(yr, mon, hr)), ]
#' dat1$id <- rep(1:8, nrow(dat1) / 8)
#' # check the data:
#' head(dat1)
#' # Calculate GFMC for multiple stations:
#' dat1$gfmc01 <- gfmc(dat1, batch = TRUE)
#' # We can provide multiple initial GFMC (GFMCold) as a vector:
#' dat1$gfmc02 <- gfmc(
#'   dat1,
#'   GFMCold = sample(70:100, 8, replace = TRUE),
#'   batch = TRUE
#' )
#' # (3)output argument
#' ## include all inputs and outputs:
#' dat0 <- dat[with(dat, order(yr, mon, day, hr)), ]
#' foo <- gfmc(dat, out = "ALL")
#' ## subhourly time step:
#' gfmc(dat0, time.step = 1.5) */

interface GFMInput {
    id?: number[];
    temp: number[];
    rh: number[];
    ws: number[];
    prec: number[];
    isol: number[];
    mon?: number[];
    day?: number[];
  }
  
  interface GFMOutput {
    GFMC: number[];
    MC: number[];
  }
  
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
  
  function gfmc(
    input: GFMInput,
    GFMCold: number | number[] = 85,
    batch: boolean = true,
    timeStep: number = 1,
    roFL: number = 0.3,
    out: string = "GFMCandMC"
  ): GFMOutput | (GFMInput & GFMOutput) | { GFMC: number[] } | { MC: number[] } {
    const requiredCols = [
      { full: "temperature", short: "temp" },
      { full: "precipitation", short: "prec" },
      { full: "wind speed", short: "ws" },
      { full: "relative humidity", short: "rh" },
      { full: "insolation", short: "isol" }
    ];
  
    for (const col of requiredCols) {
      if (!(col.short in input)) {
        throw new Error(`${col.full} is missing!`);
      }
    }
  
    let n: number;
    if (batch) {
      if (input.id) {
        n = new Set(input.id).size;
        if (n !== input.id.length) {
          throw new Error(
            "Multiple stations have to start and end at the same dates/time, and input data must be sorted by date/time and id"
          );
        }
      } else {
        n = 1;
      }
    } else {
      n = input.temp.length;
    }
  
    if (input.temp.length % n !== 0) {
      console.warn("Input data do not match with the number of weather stations");
    }
  
    if (typeof GFMCold === "number") {
      GFMCold = Array(n).fill(GFMCold);
    }
  
    if (GFMCold.length !== n) {
      throw new Error("Number of GFMCold doesn't match number of weather stations");
    }
  
    const validOutTypes = ["GFMCandMC", "MC", "GFMC", "ALL"];
    if (!validOutTypes.includes(out)) {
      throw new Error(`'${out}' is an invalid 'out' type.`);
    }
  
    const n0 = Math.floor(input.temp.length / n);
    let GFMC_out: number[] = [];
    let MC_out: number[] = [];
  
    for (let i = 0; i < n0; i++) {
      const k = Array.from({ length: n }, (_, index) => n * i + index);
  
      const MCStep = k.map(index =>
        grassFuelMoisture(
          input.temp[index],
          input.rh[index],
          input.ws[index],
          input.prec[index],
          input.isol[index],
          GFMCold[index],
          timeStep,
          roFL
        )
      );
  
      const GFMCStep = MCStep.map(moistureContent => grassFuelMoistureCode(moistureContent));
  
      GFMCold = GFMCStep;
      GFMC_out = GFMC_out.concat(GFMCStep);
      MC_out = MC_out.concat(MCStep);
    }
  
    switch (out) {
      case "GFMC":
        return { GFMC: GFMC_out };
      case "MC":
        return { MC: MC_out };
      case "ALL":
        return { ...input, GFMC: GFMC_out, MC: MC_out };
      default:
        return { GFMC: GFMC_out, MC: MC_out };
    }
  }
  
  // Example usage
  const testInput: GFMInput = {
    temp: [15.8, 16.3, 18.8, 20.4, 20.1, 18.6],
    rh: [54.6, 52.9, 45.1, 40.8, 41.7, 45.8],
    ws: [5.0, 5.0, 5.0, 9.5, 8.7, 13.5],
    prec: [0, 0, 0, 0, 0, 0],
    isol: [0.340, 0.380, 0.626, 0.656, 0.657, 0.629]
  };
  
  console.log(gfmc(testInput, 85, true, 1, 0.3, "GFMCandMC"));
  
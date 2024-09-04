/* #' Fire Season Start and End
#'
#' @description \code{\link{fire_season}} calculates the start and end fire
#' season dates for a given weather station. The current method used in the
#' function is based on three consecutive daily maximum temperature thresholds
#' (Wotton and Flannigan 1993, Lawson and Armitage 2008). This function process
#' input from a single weather station.
#'
#' An important aspect to consider when calculating Fire Weather Index (FWI)
#' System variables is a definition of the fire season start and end dates
#' (Lawson and Armitage 2008). If a user starts calculations on a fire season
#' too late in the year, the FWI System variables may take too long to reach
#' equilibrium, thus throwing off the resulting indices. This function presents
#' two method of calculating these start and end dates, adapted from Wotton and
#' Flannigan (1993), and Lawson and Armitage (2008). The approach taken in this
#' function starts the fire season after three days of maximum temperature
#' greater than 12 degrees Celsius. The end of the fire season is determined
#' after three consecutive days of maximum temperature less than 5 degrees
#' Celsius.  The two temperature thresholds can be adjusted as parameters in
#' the function call. In regions where temperature thresholds will not end a
#' fire season, it is possible for the fire season to span multiple years, in
#' this case setting the multi.year parameter to TRUE will allow these
#' calculations to proceed.
#'
#' This fire season length definition can also feed in to the overwinter DC
#' calculations (\link{overwinter_drought_code}). View the cffdrs package help
#' files for an example of using the \code{fire_season},
#' \link{overwinter_drought_code}, and \link{fwi} functions in conjunction.
#'
#' @param input A data.frame containing input variables of including the
#' date/time and daily maximum temperature. Variable names have to be the same
#' as in the following list, but they are case insensitive. The order in which
#' the input variables are entered is not important either.
#'
#' \tabular{lll}{
#' \var{yr} \tab (required) \tab Year of the observations\cr
#' \var{mon} \tab (required) \tab Month of the observations\cr
#' \var{day} \tab (required) \tab Day of the observations\cr
#' \var{tmax} \tab (required) \tab Maximum Daily Temperature (degrees C)\cr
#' \var{snow_depth}
#'  \tab (optional) \tab Is consistent snow data in the input?\cr
#' }.
#'
#' @param fs.start Temperature threshold (degrees C) to start the fire season
#' (default=12)
#' @param fs.end Temperature threshold (degrees C) to end the fire season
#' (default=5)
#' @param method Method of fire season calculation. Options are "wf93"" or
#' "la08" (default=WF93)
#' @param consistent.snow Is consistent snow data in the input? (default=FALSE)
#' @param multi.year Should the fire season span multiple years?
#' (default=FALSE)
#' @return \link{fire_season} returns a data frame of season and start and end
#' dates. Columns in data frame are described below.
#'
#' Primary FBP output includes the following 8 variables:
#' \item{yr }{Year of the fire season start/end date}
#' \item{mon }{Month of the fire season start/end date}
#' \item{day }{Day of the fire season start/end date}
#' \item{fsdatetype }{
#'  Fire season date type (values are either "start" or "end")}
#' \item{date}{Full date value}
#'
#' @author Alan Cantin, Xianli Wang, Mike Wotton, and Mike Flannigan
#'
#' @seealso \code{\link{fwi}, \link{overwinter_drought_code}}
#'
#' @references Wotton, B.M. and Flannigan, M.D. (1993). Length of the fire
#' season in a changing climate. Forestry Chronicle, 69, 187-192.
#'
#' \url{https://www.ualberta.ca/~flanniga/publications/1993_Wotton_Flannigan.pdf}
#'
#' Lawson, B.D. and O.B. Armitage. 2008. Weather guide for the Canadian Forest
#' Fire Danger Rating System. Nat. Resour. Can., Can. For. Serv., North. For.
#' Cent., Edmonton, AB \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/29152.pdf}
#' @keywords methods
#' @examples
#'
#' library(cffdrs)
#' # The standard test data:
#' data("test_wDC")
#' print(head(test_wDC))
#' ## Sort the data:
#' input <- with(test_wDC, test_wDC[order(id, yr, mon, day), ])
#'
#' # Using the default fire season start and end temperature
#' # thresholds:
#' a_fs <- fire_season(input[input$id == 1, ])
#'
#' # Check the result:
#' a_fs
#'
#' #    yr mon day fsdatetype
#' # 1 1999   5   4      start
#' # 2 1999   5  12        end
#' # 3 1999   5  18      start
#' # 4 1999   5  25        end
#' # 5 1999   5  30      start
#' # 6 1999  10   6        end
#' # 7 2000   6  27      start
#' # 8 2000  10   7        end
#'
#' # In the resulting data frame, the fire season starts
#' # and ends multiple times in the first year. It is up to the user for how
#' # to interpret this.
#'
#' # modified fire season start and end temperature thresholds
#' a_fs <- fire_season(input[input$id == 1, ], fs.start = 10, fs.end = 3)
#' a_fs
#' #    yr mon day fsdatetype
#' # 1 1999   5   2      start
#' # 2 1999  10  20        end
#' # 3 2000   6  16      start
#' # 4 2000  10   7        end
#' # select another id value, specify method explicitly
#' b_fs <- fire_season(input[input$id == 2, ], method = "WF93")
#' # print the calculated fire_season
#' b_fs
#' #   yr mon day fsdatetype
#' # 1 1980   4  21      start
#' # 2 1980   9  19        end
#' # 3 1980  10   6      start
#' # 4 1980  10  16        end
#' # 5 1981   5  21      start
#' # 6 1981  10  13        end
#'
#' @export fire_season

fire_season <- function(
    input,
    fs.start = 12,
    fs.end = 5,
    method = "WF93",
    consistent.snow = FALSE,
    multi.year = FALSE) {
  #############################################################################
  # Description:
  #   Calculation of fire season. The intent of this function is to allow
  #   for calculation of the start and end dates of a fire season. Knowledge
  #   of the start and end dates allows for more accurate calculation of Fire
  #   Weather Indices. Only 1 method is presented here, however future
  #   modifications will allow the inclusion of other methods.
  #
  #   The current method contained within are contained in the following
  #   article:
  #
  #   Wotton B.M. and Flannigan, M.D. 1993. Length of the fire season in a
  #     changing climate. Forestry Chronicle, 69: 187-192.

  #   **Note that snow depth/cover is not currently included due to a lack of
  #     widespread snow coverage data, however this will be a future addition.
  #
  # Args:
  #   input:    Single station weather data input stream - view fire_season.Rd
  #             documentation for full description.
  #   fs.start: Temperature threshold to start the fire season (deg celcius)
  #   fs.end:   Temperature threshold to end the fire season (deg celcius)
  #   method:   Fire Season calculation method. The default and only current
  #             method being used is "WF93".
  #   consistent.snow  TRUE/FALSE value if consistent snow data is available
  #             if it is not, then we will default to WF93.
  #
  #
  # Returns:
  #   seasonStartEnd: data.frame containing start and end dates of fire
  #                   seasons for a particular weather station.
  #
  ############################################################################# */
  
type InputType = {
    yr: number[];
    mon: number[];
    day: number[];
    tmax: number[];
    snow_depth?: number[];
  };
  
  type SeasonStartEndType = {
    yr: number;
    mon: number;
    day: number;
    fsdatetype: string;
    date?: Date;
  };
  
  function fireSeason(
    input: InputType,
    fsStart = 12,
    fsEnd = 5,
    method = "WF93",
    consistentSnow = false,
    multiYear = false
  ): SeasonStartEndType[] {
    const names = Object.keys(input).map(key => key.toLowerCase());
    const yr = input.yr;
    const mon = input.mon;
    const day = input.day;
    const tmax = input.tmax;
    const snowDepth = input.snow_depth || [];
  
    if (!yr) throw new Error("Year was not provided, year is required for this function.");
    if (!mon) throw new Error("Month was not provided, month is required for this function.");
    if (!day) throw new Error("Day was not provided, day is required for this function.");
    if (!tmax) throw new Error("Maximum Daily Temperature (tmax) was not provided, daily tmax is required for this function.");
  
    method = method.toLowerCase();
    if (method !== "wf93" && method !== "la08") {
      throw new Error(`Selected method "${method}" is unavailable, read documentation for available methods.`);
    }
  
    const n0 = tmax.length;
    let seasonActive = false;
    let seasonStartEnd: SeasonStartEndType[] = [];
  
    if (method === "wf93") {
      for (let k = 3; k < n0; k++) {
        if (!seasonActive && tmax.slice(k - 3, k).every(temp => temp > fsStart)) {
          seasonActive = true;
          let theday = day[k];
          if (!multiYear && mon[k] === 1 && day[k] === 4) {
            theday = day[k - 3];
          }
          seasonStartEnd.push({
            yr: yr[k],
            mon: mon[k],
            day: theday,
            fsdatetype: "start"
          });
        }
  
        if (seasonActive && tmax.slice(k - 3, k).every(temp => temp < fsEnd)) {
          seasonActive = false;
          seasonStartEnd.push({
            yr: yr[k],
            mon: mon[k],
            day: day[k],
            fsdatetype: "end"
          });
        }
      }
    } else if (method === "la08") {
      if (consistentSnow) {
        if (!snowDepth.length) {
          throw new Error(`Snow depth is required for the selected method "${method}", read documentation for appropriate use.`);
        }
  
        for (let k = 3; k < n0; k++) {
          if (!seasonActive && snowDepth.slice(k - 2, k + 1).every(depth => depth <= 0)) {
            seasonActive = true;
            let theday = day[k];
            if (!multiYear && mon[k] === 1 && day[k] === 4) {
              theday = day[k - 3];
            }
            seasonStartEnd.push({
              yr: yr[k],
              mon: mon[k],
              day: theday,
              fsdatetype: "start"
            });
          }
  
          if (seasonActive && (snowDepth[k] > 0 || (mon[k] === 12 && tmax.slice(k - 2, k + 1).every(temp => temp < fsEnd)))) {
            seasonActive = false;
            seasonStartEnd.push({
              yr: yr[k],
              mon: mon[k],
              day: day[k],
              fsdatetype: "end"
            });
          }
        }
      } else {
        return fireSeason(input, fsStart, fsEnd, "WF93", consistentSnow, multiYear);
      }
    }
  
    seasonStartEnd = seasonStartEnd.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.yr === value.yr && t.mon === value.mon && t.day === value.day
      ))
    );
  
    seasonStartEnd.forEach(record => {
      record.date = new Date(`${record.yr}-${record.mon}-${record.day}`);
    });
  
    return seasonStartEnd;
  }
  
  export { fireSeason };
  
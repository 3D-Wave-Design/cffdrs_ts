/* #' Line-based input for Simard Rate of Spread and Direction
#'
#' @description \code{lros} is used to calculate the rate of spread and
#' direction given one set of three point-based observations of fire arrival
#' time. The function requires that the user specify the time that the fire
#' crossed each point, along with the measured lengths between each pair of
#' observational points, and a reference bearing (one specified side of the
#' triangle). This function allows quick input of a dataframe specifying one or
#' many triangles.
#'
#' \code{lros} Allows R users to calculate the rate of spread and direction of
#' a fire across a triangle, given three time measurements and details about
#' the orientation and distance between observational points. The algorithm is
#' based on the description from Simard et al. (1984). See \code{pros} for more
#' information.
#'
#' The functions require the user to arrange the input dataframe so that each
#' triangle of interest is identified based on a new row in the dataframe. The
#' input format forces the user to identify the triangles, one triangle per row
#' of input dataframe. Very complex arrangements of field plot layouts are
#' possible, and the current version of these functions do not attempt to
#' determine each triangle of interest automatically.
#'
#' @param input A dataframe containing input variables of time fire front
#' crossed points 1, 2, 3, and latitude/longitude for those same points.
#' Variable names have to be the same as in the following list, but they are
#' case insensitive. The order in which the input variables are entered is not
#' important.
#'
#' \tabular{lll}{
#' \var{T1}
#' \tab (required)
#' \tab Time that the fire front crossed point 1.\cr
#' \tab\tab Time entered in fractional format. \cr
#' \tab\tab Output ROS will depend on the level \cr
#' \tab\tab of precision entered \cr
#' \tab\tab (minute, second, decisecond)\cr
#' \var{T2}
#' \tab (required)
#' \tab Time that the fire front crossed point 2.\cr
#' \tab\tab Time entered in fractional format. \cr
#' \tab\tab Output ROS will depend on the level \cr
#' \tab\tab of precision entered \cr
#' \tab\tab (minute, second, decisecond)\cr
#' \var{T3}
#' \tab (required)
#' \tab Time that the fire front crossed point 3. \cr
#' \tab\tab Time entered in fractional format. \cr
#' \tab\tab Output ROS will depend on the level \cr
#' \tab\tab of precision entered \cr
#' \tab\tab (minute, second, decisecond)\cr
#' \var{LengthT1T2}
#' \tab (required) \tab Length between each pair of\cr
#' \tab\tab observation points T1 and T2 (subscripts \cr
#' \tab\tab denote time-ordered pairs). (meters)\cr
#' \var{LengthT2T3}
#' \tab (required)
#' \tab Length between each pair of\cr
#' \tab\tab observation points T2 and T3 (subscripts \cr
#' \tab\tab denote time-ordered pairs). (meters)\cr
#' \var{LengthT1T3}
#' \tab (required)
#' \tab Length between each pair of\cr
#' \tab\tab observation points T1 and T3 (subscripts \cr
#' \tab\tab denote time-ordered pairs). (meters)\cr
#' \var{BearingT1T2}
#' \tab (required)
#' \tab Reference bearing. For reference,\cr
#' \tab\tab North = 0, West = -90, East = 90 (degrees)\cr
#' \var{BearingT1T3}
#' \tab (required)
#' \tab Reference bearing. For reference,\cr
#' \tab\tab North = 0, West = -90, East = 90 (degrees)\cr
#' }
#' @return \code{lros} returns a dataframe which includes the rate of spread
#' and spread direction. Output units depend on the user’s inputs for
#' distance (typically meters) and time (seconds or minutes).
#' @author Tom Schiks, Xianli Wang, Alan Cantin
#' @seealso \code{\link{pros}},
#' @references 1. Simard, A.J., Eenigenburg, J.E., Adams, K.B., Nissen, R.L.,
#' Deacon, and Deacon, A.G. 1984. A general procedure for sampling and
#' analyzing wildland fire spread.
#'
#' 2. Byram, G.M. 1959. Combustion of forest fuels. In: Davis, K.P. Forest Fire
#' Control and Use. McGraw-Hill, New York.
#'
#' 3. Curry, J.R., and Fons, W.L. 1938. Rate of spread of surface fires in the
#' Ponderosa Pine Type of California. Journal of Agricultural Research 57(4):
#' 239-267.
#'
#' 4. Simard, A.J., Deacon, A.G., and Adams, K.B. 1982. Nondirectional sampling
#' wildland fire spread. Fire Technology: 221-228.
#' @keywords ros */

interface LrosInput {
    T1: number;
    LengthT1T2: number;
    T2: number;
    LengthT1T3: number;
    T3: number;
    LengthT2T3: number;
    BearingT1T2: number;
    BearingT1T3: number;
  }
  
  interface LrosOutput {
    Ros: number;
    Direction: number;
  }
  
  function direction(bearingT1T2: number, bearingT1T3: number, thetaAdeg: number): number {
    // Placeholder for the actual direction calculation
    // Replace this with the actual logic from the R function .direction
    return bearingT1T2 + bearingT1T3 + thetaAdeg; // Adjust this logic accordingly
  }
  
  function lros(input: LrosInput[]): LrosOutput[] {
    // Check if input is an array of objects with the required properties
    const requiredColumns = [
      "T1", "LengthT1T2", "T2", "LengthT1T3", "T3",
      "LengthT2T3", "BearingT1T2", "BearingT1T3"
    ];
  
    input.forEach(row => {
      const missingColumns = requiredColumns.filter(col => !(col in row));
      if (missingColumns.length > 0) {
        throw new Error(`cffdrs::lros Column ${missingColumns.join(", ")} is required in column list.`);
      }
    });
  
    return input.map(row => {
      const AngleArad = Math.acos(
        (Math.pow(row.LengthT1T3, 2) + Math.pow(row.LengthT1T2, 2) - Math.pow(row.LengthT2T3, 2)) /
        (2 * row.LengthT1T3 * row.LengthT1T2)
      );
  
      const AngleAdeg = (AngleArad * 180) / Math.PI;
  
      const ThetaArad = Math.atan(
        ((row.T3 - row.T1) / (row.T2 - row.T1)) * 
        (row.LengthT1T2 / (row.LengthT1T3 * Math.sin(AngleArad))) - 
        (1 / Math.tan(AngleArad))
      );
  
      const ThetaAdeg = (ThetaArad * 180) / Math.PI;
  
      const DIR = direction(row.BearingT1T2, row.BearingT1T3, ThetaAdeg);
  
      const ROS = (row.LengthT1T2 * Math.cos(ThetaArad)) / (row.T2 - row.T1);
  
      return { Ros: ROS, Direction: DIR };
    });
  }
  
  // Example usage
  const inputData: LrosInput[] = [
    {
      T1: 0,
      LengthT1T2: 24.5,
      T2: 22.6,
      LengthT1T3: 120,
      T3: 20.0,
      LengthT2T3: 35,
      BearingT1T2: 90,
      BearingT1T3: -90
    }
  ];
  
  const outputData = lros(inputData);
  console.log(outputData);
  
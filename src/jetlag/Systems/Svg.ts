import { b2Vec2 } from "@box2d/core";
import { stage } from "../Stage";

/**
 * The parser states for an SVG path's "d" data: reading the very first point
 * of the path (its x, then its y), and then reading each subsequent point
 * (its x, then its y).
 */
const enum SvgParseState { READ_FIRST_X = -2, READ_FIRST_Y = -1, READ_X = 0, READ_Y = 1 }

/**
 * The Svg System is for loading SVG line drawings into a game.  SVG line
 * drawings can be made in InkScape. In JetLag, we do not use line drawings to
 * their full potential. We only use them to define a set of lines for a simple,
 * stationary Actor. You should draw a picture on top of your line drawing, so
 * that the player knows that there is an actor on the screen.
 *
 * Note that SVG supports *curves*, but JetLag does not.  You can instruct
 * InkScape not to make curves.  If you forget, JetLag will turn your curves
 * into straight lines.
 */
export class SvgSystem {
  /** Coordinate of the last point we drew */
  private last = new b2Vec2(0, 0);

  /** Coordinate of the first point we drew */
  private first = new b2Vec2(0, 0);

  /** Coordinate of the current point being drawn */
  private curr = new b2Vec2(0, 0);

  /** The computed top and left boundaries of the SVG, in pixels */
  private top_left?: b2Vec2;

  /** The parser is essentially a finite state machine; this is its state */
  private state: SvgParseState = SvgParseState.READ_X;

  /**
   * We can't actually draw curves. When we encounter a curve, we use this
   * field to swallow a fixed number of values, so that the curve definition
   * becomes a line definition
   */
  private swallow?: number;

  /** Are we currently parsing a curve (true) or a line (false)? */
  private inCurve = false;

  /**
   * Construct an object for drawing entities based on an SVG.  The arguments to
   * actorMaker define a box via its center x, center y, width, and rotation.
   * You'll probably want a very narrow height.
   *
   * @param translate   The user-specified top left corner
   * @param stretch     The requested stretch factors
   * @param actorMaker  A function for building an actor for each line of the
   *                    SVG
   */
  private constructor(private translate: b2Vec2, private userStretch: b2Vec2, private actorMaker: (cx: number, cy: number, width: number, rotation: number) => void) { }

  /**
   * Process an SVG file and go through all of the "path" elements in the file.
   * For each path, create a thin obstacle, and then run the provided callback
   * on the obstacle.
   *
   * Note that we ignore SVG /translate/ directives... we let the programmer
   * translate the drawing instead.
   *
   * @param file        The name of the file to load
   * @param x           The X coordinate of the top left corner of the bounding
   *                    box for the SVG
   * @param y           The Y coordinate of the top left corner of the bounding
   *                    box for the SVG
   * @param stretchX    The factor by which to stretch in the X dimension
   * @param stretchY    The factor by which to stretch in the Y dimension
   * @param actorMaker  A callback for making each line as an actor
   */
  public static processFile(file: string, x: number, y: number, stretchX: number, stretchY: number, actorMaker: (cx: number, cy: number, width: number, rotation: number) => void) {
    let svg = new SvgSystem(new b2Vec2(x, y), new b2Vec2(stretchX, stretchY), actorMaker);
    // send the request.  On completion, we'll be in onFileLoaded
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", (aa: ProgressEvent) => svg.onFileLoaded(aa));
    if (!stage.config.resources)
      throw "Error: to use SVG resources, you must provide a 'resources' field in your game's configuration";
    xhr.open("GET", stage.config.resources.prefix + file, true);
    xhr.send();
  }

  /**
   * When the SVG file is fetched from the server, it will run this to parse
   * the result. The job of this code is to find all of the "g" elements in
   * the received file, and operate on them
   *
   * @param event The XHR event that fetched the file
   */
  private onFileLoaded(event: ProgressEvent) {
    let file_contents = (event.currentTarget as XMLHttpRequest).response;
    let dp = new DOMParser();
    let doc = dp.parseFromString(file_contents, "text/xml");
    for (let g of doc.getElementsByTagName("g")) {
      for (let path of g.getElementsByTagName("path")) {
        let d = path.getAttribute("d");
        if (d) {
          // We process it twice: first time is to get the top and
          // left, second time is to actually draw it
          this.processD(d, true);
          this.processD(d, false);
        }
      }
    }
  }

  /**
   * The root of an SVG drawing will have a g element, which will have some
   * number of path elements. Each path will have a "d=" attribute, which stores
   * the points and information about how to connect them. The "d" is a single
   * string, which we parse in this function.
   *
   * @param d            The string that describes the path
   * @param readonlyMode Are we in read-only mode (true), where we are computing
   *                     the top/left pixel bound, or are we in draw mode
   *                     (false), where we actually draw the lines
   */
  private processD(d: string, readonlyMode: boolean) {
    // Each call walks a whole "d" string from scratch, so the parser state
    // must not leak in from a previous call (a previous <path>, or the other
    // pass -- readonly vs. draw -- over this same <path>).
    this.inCurve = false;
    this.swallow = undefined;
    // split the string into characters and floating point values
    // Note: we need to split on ' ' and ',', so we'll do a replace first
    let z = d.replace(/,/g, " ");
    let points = z.split(" ");
    // SVG can give point coordinates in absolute or relative terms
    let absolute = false;
    for (let s0 of points) {
      let s = s0.trim();
      switch (s) {
        // start of the path, relative mode
        case "m":
          this.state = SvgParseState.READ_FIRST_X;
          absolute = false;
          break;
        // start of the path, absolute mode
        case "M":
          this.state = SvgParseState.READ_FIRST_X;
          absolute = true;
          break;
        // beginning of a (set of) curve definitions, relative mode
        //
        // NB: we coerce curves into lines by ignoring the first four
        // parameters... this leaves us with just the endpoints
        case "c":
          this.inCurve = true;
          this.swallow = 4;
          break;
        // end of path, relative mode
        case "z":
          // draw a connecting line to complete the shape
          if (readonlyMode) this.updateTL(this.last, this.first);
          else this.addLine(this.last, this.first);
          break;
        // beginning of a (set of) line definitions, relative mode
        case "l":
          this.inCurve = false;
          absolute = false;
          this.swallow = 0;
          break;
        // beginning of a (set of) line definitions, absolute mode
        case "L":
          this.inCurve = false;
          absolute = true;
          this.swallow = 0;
          break;
        // floating point data that defines an endpoint of a line or
        // curve
        default:
          // if it's a curve, we might need to swallow this value
          if (this.swallow && this.swallow > 0) {
            this.swallow--;
          }
          // get the next point
          else {
            // convert next point to float
            let val = parseFloat(s);
            // if it's the initial x, save it
            if (this.state == SvgParseState.READ_FIRST_X) {
              this.state = SvgParseState.READ_FIRST_Y;
              this.last.x = val;
              this.first.x = val;
            }
            // if it's the initial y, save it... can't draw a line
            // yet, because we have one endpoint
            else if (this.state == SvgParseState.READ_FIRST_Y) {
              this.state = SvgParseState.READ_X;
              this.last.y = val;
              this.first.y = val;
            }
            // if it's an X value, save it
            else if (this.state == SvgParseState.READ_X) {
              if (absolute) this.curr.x = val;
              else this.curr.x = this.last.x + val;
              this.state = SvgParseState.READ_Y;
            }
            // if it's a Y value, save it and draw a line
            else if (this.state == SvgParseState.READ_Y) {
              this.state = SvgParseState.READ_X;
              if (absolute) this.curr.y = val;
              else this.curr.y = this.last.y - val;
              // draw the line
              if (readonlyMode) this.updateTL(this.last, this.first);
              else this.addLine(this.last, this.curr);
              this.last.x = this.curr.x;
              this.last.y = this.curr.y;
              // if we are in curve mode, reinitialize the swallower
              if (this.inCurve) this.swallow = 4;
            }
          }
          break;
      }
    }
  }

  /**
   * Reflect a line's endpoints over the first point drawn (to convert SVG's
   * "down is minus" Y axis to our "down is plus" Y axis), and apply the
   * user-requested stretch.  Shared by `addLine` (which goes on to also
   * normalize by the bounding box and convert to meters) and `updateTL`
   * (which uses these same pixel coordinates to compute that bounding box in
   * the first place).
   *
   * @param start The point from which the line originates
   * @param stop  The point to which the line extends
   */
  private reflectAndStretch(start: b2Vec2, stop: b2Vec2) {
    let x1 = start.x, x2 = stop.x, y1 = this.first.y - start.y, y2 = this.first.y - stop.y;
    x1 *= this.userStretch.x;
    y1 *= this.userStretch.y;
    x2 *= this.userStretch.x;
    y2 *= this.userStretch.y;
    return { x1, y1, x2, y2 };
  }

  /**
   * Transform a line from raw SVG pixel coordinates all the way to meters
   * (see `reflectAndStretch`/`pixelToMeters`), and draw it.
   *
   * @param start The point from which the line originates
   * @param stop  The point to which the line extends
   */
  private addLine(start: b2Vec2, stop: b2Vec2) {
    let { x1, y1, x2, y2 } = this.reflectAndStretch(start, stop);
    let p1 = this.pixelToMeters(x1, y1);
    let p2 = this.pixelToMeters(x2, y2);
    this.drawLine(p1.x, p1.y, p2.x, p2.y);
  }

  /**
   * Convert a point from SVG pixel space to meters: normalize it by the
   * bounding box's top-left pixel, scale by the screen scaling factor, and
   * add in the user's translate.
   *
   * @param px The point's X coordinate, in pixels
   * @param py The point's Y coordinate, in pixels
   */
  private pixelToMeters(px: number, py: number) {
    let scale = stage.svgScaling / stage.pixelMeterRatio;
    return {
      x: (px - this.top_left!.x) * scale + this.translate.x,
      y: (py - this.top_left!.y) * scale + this.translate.y,
    };
  }

  /**
   * Internal method used by the SVG parser to draw a line. We actually just
   * draw a really skinny Actor and rotate it
   *
   * @param x1 X coordinate of first endpoint
   * @param y1 Y coordinate of first endpoint
   * @param x2 X coordinate of second endpoint
   * @param y2 Y coordinate of second endpoint
   */
  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    // compute center and length
    let centerX = (x1 + x2) / 2;
    let centerY = (y1 + y2) / 2;
    let len = Math.hypot(x1 - x2, y1 - y2);
    let rot = Math.atan2(y2 - y1, x2 - x1);
    this.actorMaker(centerX, centerY, len, rot);
  }

  /**
   * During the first pass through a d element, we don't draw, we just compute
   * the smallest X and Y values, so we know the top left of the bounding box.
   * This is the code that takes each line that we would draw, and uses its
   * endpoints to update the top/left estimates.
   *
   * @param start The point from which the line originates
   * @param stop  The point to which the line extends
   */
  private updateTL(start: b2Vec2, stop: b2Vec2) {
    let { x1, y1, x2, y2 } = this.reflectAndStretch(start, stop);

    // If this is the first line, we need to initialize our top/left storage
    if (!this.top_left) this.top_left = new b2Vec2(x1, y1);

    // Update our estimates of top/left
    this.top_left.x = Math.min(this.top_left.x, x1, x2);
    this.top_left.y = Math.min(this.top_left.y, y1, y2);
  }
}

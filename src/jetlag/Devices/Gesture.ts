import { Actor } from "../Entities/Actor";
import { Scene } from "../Entities/Scene";
import { Stage } from "../Stage";
import Hammer from "hammerjs";

/** GestureDevice routes gesture events (as defined by hammerjs) to a Stage */
export class GestureDevice {
  /**
   * The DOM element that receives gesture events
   *
   * NB:  hammerjs needs this, but since we always have a game with a single div
   *      that fills the screen, it's kind of trivial.
   */
  private elt: HTMLElement;

  /** Should gestures go to the HUD first, or to the WORLD first? */
  public gestureHudFirst = true;

  /** All the actors who had a mouseHover in the last tick */
  private mouseHoverActors = new Set<Actor>();

  /**
   * There's a small issue in hammer.js, where swipe handlers aren't
   * canvas-relative, but page-relative.  This helper unifies all systems that
   * need to work with canvas-relative coordinates but might get page-relative
   * coordinates.
   *
   * @param clientX The x coordinate on the page
   * @param clientY The y coordinate on the page
   */
  private canvasCoords(clientX: number, clientY: number) {
    const canvas = this.elt as HTMLCanvasElement;
    const box = canvas.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top };
  }

  /**
   * Create the device by providing the name of an HTML element (typically
   * a DIV) that should begin receiving gestures.
   *
   * @param domId The Id of the DOM element that will receive gesture events
   * @param stage The stage that should receive the events
   */
  constructor(domId: string, stage: Stage) {
    let tmp = document.getElementById(domId);
    if (tmp === null) throw `Element ${domId} cannot be found`;
    this.elt = tmp.getElementsByTagName("canvas")[0];

    // Since we are using gestures, turn off left clicking of the whole page
    this.elt.oncontextmenu = () => false;

    let mouseFunc = (ev: MouseEvent) => {
      let world_coords = stage.world.camera.screenToMeters(this.canvasCoords(ev.clientX, ev.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(ev.clientX, ev.clientY));
      // If we have an overlay scene right now, let it handle the tap
      if (stage.overlay) {
        let overlay_coords = stage.overlay.camera.screenToMeters(this.canvasCoords(ev.clientX, ev.clientY));
        this.mouseHover(stage.overlay, overlay_coords);
      }
      // Handle in hud or world
      else if (this.gestureHudFirst) {
        if (this.mouseHover(stage.hud, hud_coords)) return;
        this.mouseHover(stage.world, world_coords);
      } else {
        if (this.mouseHover(stage.world, world_coords)) return;
        this.mouseHover(stage.hud, hud_coords);
      }
    }

    this.elt.onmouseover = mouseFunc;
    this.elt.onmousemove = mouseFunc;

    // Set up handlers for all the Hammer events
    let hammer = new Hammer(this.elt);
    hammer.on("tap", (ev: HammerInput) => {
      let e = ev.srcEvent as PointerEvent;
      let overlay_coords = stage.overlay?.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let world_coords = stage.world.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      // Log the coordinates, to aid in debugging
      stage.console.log("World Touch: (" + world_coords.x + ", " + world_coords.y + ")");
      stage.console.log("HUD Touch: (" + hud_coords.x + ", " + hud_coords.y + ")");
      // If we have an overlay scene right now, let it handle the tap
      if (stage.overlay) {
        this.tap(stage.overlay, overlay_coords!);
      }
      // Handle in hud or world
      else if (this.gestureHudFirst) {
        if (this.tap(stage.hud, hud_coords)) return;
        this.tap(stage.world, world_coords);
      } else {
        if (this.tap(stage.world, world_coords)) return;
        this.tap(stage.hud, hud_coords);
      }
    });

    hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
    hammer.on("panstart", (ev: HammerInput) => {
      let e = ev.srcEvent as PointerEvent;
      let overlay_coords = stage.overlay?.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      if (stage.overlay) this.panStart(stage.overlay, overlay_coords!);
      else this.panStart(stage.hud, hud_coords);
    });
    hammer.on("panmove", (ev: HammerInput) => {
      let e = ev.srcEvent as PointerEvent;
      let overlay_coords = stage.overlay?.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      if (stage.overlay) this.panMove(stage.overlay, overlay_coords!);
      else this.panMove(stage.hud, hud_coords);
    });
    hammer.on("panend", (ev: HammerInput) => {
      let e = ev.srcEvent as PointerEvent;
      let overlay_coords = stage.overlay?.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      if (stage.overlay) this.panStop(stage.overlay, overlay_coords!);
      else this.panStop(stage.hud, hud_coords);
    });
    hammer.on("pancancel", (ev: HammerInput) => {
      let e = ev.srcEvent as PointerEvent;
      let overlay_coords = stage.overlay?.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      if (stage.overlay) this.panStop(stage.overlay, overlay_coords!);
      else this.panStop(stage.hud, hud_coords);
    });

    // this gets us 'downpress' and 'release'.  See "input events" on
    // http://hammerjs.github.io/api/
    hammer.on("hammer.input", (ev: HammerInput) => {
      let e = ev.srcEvent as PointerEvent;
      let overlay_coords = stage.overlay?.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      let hud_coords = stage.hud.camera.screenToMeters(this.canvasCoords(e.clientX, e.clientY));
      if (ev.eventType == 1) {
        if (stage.overlay) this.touchDown(stage.overlay, overlay_coords!);
        else this.touchDown(stage.hud, hud_coords);
      } else if (ev.eventType == 4) {
        if (stage.overlay) this.touchUp(stage.overlay, overlay_coords!);
        else this.touchUp(stage.hud, hud_coords);
      }
    });

    // NB:  swipe also registers pans, so you probably don't want swipe and pan
    //      at the same time.
    //
    // NB:  This could be split into swipeup, swipeleft, swiperight, swipedown,
    //      but that's probably not worth it.
    hammer.on("swipe", (ev: HammerInput) => {
      let start_coord = stage.hud.camera.screenToMeters(this.canvasCoords(ev.center.x - ev.deltaX, ev.center.y - ev.deltaY));
      let end_coord = stage.hud.camera.screenToMeters(this.canvasCoords(ev.center.x, ev.center.y));
      this.swipe(stage.hud, start_coord, end_coord, ev.deltaTime);
    });
    hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
  }

  /** Reset the gesture system to its default state */
  public reset() {
    this.gestureHudFirst = true;
    this.mouseHoverActors.clear();
  }

  /**
   * Handle a tap action
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private tap(scene: Scene, coords: { x: number, y: number }) {
    // NB: some() stops after the first thing that returns true
    return scene.physics!.actorsAt(coords).some(actor => actor.gestures?.onTap?.(actor, coords));
  }

  /**
   * Handle a mouse over or mouse move action
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private mouseHover(scene: Scene, coords: { x: number, y: number }) {
    // NB: Be sure to call the stop handlers for things that are no longer being
    // hovered, then save those that are hovered so they can be un-hovered later
    const found = new Set(scene.physics!.actorsAt(coords).filter(actor => actor.gestures?.onMouseHover?.(actor, coords)));
    this.mouseHoverActors.forEach(a => { if (!found.has(a)) a.gestures?.onMouseUnHover?.(a); });
    this.mouseHoverActors = found;
    return found.size > 0;
  }

  /**
   * Run this when a pan event starts
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private panStart(scene: Scene, coords: { x: number, y: number }) {
    return scene.physics!.actorsAt(coords).some(actor => actor.gestures?.onPanStart?.(actor, coords));
  }

  /**
   * This runs when a pan produces a "move" event
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private panMove(scene: Scene, coords: { x: number, y: number }) {
    return scene.physics!.actorsAt(coords).some(actor => actor.gestures?.onPanMove?.(actor, coords));
  }

  /**
   * This runs when a pan event stops
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private panStop(scene: Scene, coords: { x: number, y: number }) {
    return scene.physics!.actorsAt(coords).some(actor => actor.gestures?.onPanStop?.(actor, coords));
  }

  /**
   * This runs in response to a down-press
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private touchDown(scene: Scene, coords: { x: number, y: number }) {
    return scene.physics!.actorsAt(coords).some(actor => actor.gestures.onTouchDown?.(actor, coords));
  }

  /**
   * This runs when a down-press is released
   *
   * @param scene   The scene that should receive the gesture
   * @param coords  The coordinates (within the scene) of the gesture
   */
  private touchUp(scene: Scene, coords: { x: number, y: number }) {
    return scene.physics!.actorsAt(coords).some(actor => actor.gestures.onTouchUp?.(actor, coords));
  }

  /**
   * This runs in response to a screen swipe event
   *
   * @param scene         The scene that should receive the gesture
   * @param start_coords  The coordinates (within the scene) where the swipe
   *                      began
   * @param end_coords    The coordinates (within the scene) where the swipe
   *                      ended
   * @param time          The time it took for the swipe to happen
   */
  private swipe(scene: Scene, start_coord: { x: number, y: number }, end_coord: { x: number, y: number }, time: number) {
    const eActors = scene.physics!.actorsAt(end_coord);
    return scene.physics!.actorsAt(start_coord).some(sActor =>
      sActor.gestures?.onSwipe && eActors.includes(sActor) && sActor.gestures.onSwipe(sActor, start_coord, end_coord, time)
    );
  }
}

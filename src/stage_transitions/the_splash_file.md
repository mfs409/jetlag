## The `splash.ts` File

The first thing the player will see is our "splash" screen.  It's just a menu.
In truth, it's a "playable" level, except that there is no notion of winning or
losing.

Since this is the first thing that will be shown (we used it in
`initializeAndLaunch`), it's a great place to set the `stage.gameMusic`.  This
music will keep playing until we manually pause it, or the game exits.  Calling
`play()` on music that is already playing does not do anything, so we can start
the music by (1) making sure it's set, and (2) playing it.

```typescript
import { FilledBox, TextSprite } from "../jetlag/Components/Appearance";
import { Actor } from "../jetlag/Entities/Actor";
import { stage } from "../jetlag/Stage";
import { BoxBody } from "../jetlag/Components/RigidBody";
import { MusicComponent } from "../jetlag/Components/Music";
import { chooserBuilder } from "./chooser";
import { helpBuilder } from "./help";
import { drawMuteButton } from "./common";

/**
 * splashBuilder will draw the scene that we see when the game starts. In our
 * case, it's just a menu and some branding.
 *
 * There is usually only one splash screen, but JetLag allows for many, so there
 * is a `level` parameter.  In this code, we just ignore it.
 *
 * @param level Which splash screen should be displayed
 */
export function splashBuilder(_level: number) {
  // start the music
  if (stage.gameMusic === undefined)
    stage.gameMusic = new MusicComponent(stage.musicLibrary.getMusic("tune2.ogg"));
  stage.gameMusic.play();

  // Paint the background white
  stage.backgroundColor = "#FFFFFF";

  // Draw a brown box at the top of the screen, put some text in it
  new Actor({
    appearance: new FilledBox({ width: 16, height: 3, fillColor: "#523216" }),
    rigidBody: new BoxBody({ cx: 8, cy: 1.5, width: 16, height: 3 }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 120, color: "#FFFFFF" }, "JetLag Demo"),
    rigidBody: new BoxBody({ cx: 8, cy: 1.25, width: .1, height: .1 }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 56, color: "#FFFFFF" }, "2D Games for Web and Mobile"),
    rigidBody: new BoxBody({ cx: 8, cy: 2.4, width: .1, height: .1 }),
  });

  // Draw some text.  Tapping its *rigidBody* will go to the first page of the
  // level chooser
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 96, color: "#000000" }, "Play"),
    rigidBody: new BoxBody({ cx: 8, cy: 5.625, width: 2.5, height: 1.25 }),
    gestures: { tap: () => { stage.switchTo(chooserBuilder, 1); return true; } }
  });

  // Make some text for going to the help screen
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 72, color: "#000000" }, "Help"),
    rigidBody: new BoxBody({ cx: 3.2, cy: 6.15, width: 1.8, height: 0.9 }),
    gestures: { tap: () => { stage.switchTo(helpBuilder, 1); return true; } }
  });

  // Make a quit button.  This is probably not useful in browser games, only
  // mobile/desktop.
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 72, color: "#000000" }, "Quit"),
    rigidBody: new BoxBody({ cx: 12.75, cy: 6.15, width: 1.8, height: 0.9 }),
    gestures: { tap: () => { stage.exit(); return true; } }
  });

  // And a mute button...
  drawMuteButton({ cx: 15, cy: 8, width: .75, height: .75, scene: stage.world });
}
```

Other than that, the code should be pretty familiar.  We have some buttons that
can be pressed to cause the game to jump to another screen, and we use
`stage.switchTo` to say which builder to use (and which level to pass to that
builder).

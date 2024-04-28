## The `game.ts` File

We're in a weird situation here... almost every file depends on some other file!
Rather than make some edits, then make more later, we'll look at one file at a
time.  The easiest is `game.ts`:

```typescript
import { JetLagGameConfig } from "../jetlag/Config";
import { initializeAndLaunch } from "../jetlag/Stage";
import { splashBuilder } from "./splash";
import { AccelerometerMode } from "../jetlag/Services/Accelerometer";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
    pixelMeterRatio = 100;
    screenDimensions = { width: 1600, height: 900 };
    adaptToScreenSize = true;
    canVibrate = true;
    accelerometerMode = AccelerometerMode.DISABLED;
    storageKey = "--no-key--";
    hitBoxes = true;
    resourcePrefix = "./assets/";
    musicNames = ["tune.ogg", "tune2.ogg"];
    soundNames = [];
    imageNames = ["sprites.json"];
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), splashBuilder);
```

Hopefully, this file is familiar.  In order for it to work, you'll need the  spritesheet that we've seen from other tutorials.  You'll also need these two sound files, which we will use as background music:

- [tune.ogg](stage_transitions/tune.ogg)
- [tune2.ogg](stage_transitions/tune2.ogg)

Neither is a particularly good bit of music.  We're going to use them to show
how we can have per-level music, or have music that is consistent (and doesn't
restart) while we move among parts of the game.  Other than these new imports,
the only tricky part of the code is that `splashBuilder` is not defined in the
file, but instead is imported.  We'll get to it soon.

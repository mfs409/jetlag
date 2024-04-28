## Importing Your Own Code

In this tutorial, we're going to have our `game.ts` file, and then a few more
files: `common.ts`, `splash.ts`, `help.ts`, `chooser.ts`, and `play.ts`.  Each
of these will include some functions that some of the other files will need.  To
get this to work, you'll need to do two things:

1. If a function in one file needs to be used in another file, then in the file
   where you make the function, you need to put the word `export` before the
   function declaration (for example, `export function toggleMute() {...}`).
2. In the file that uses that function, you'll need to import it.  For example,
   `import { toggleMute } from "./common";`.  Notice that we don't include the
   `.ts` part of the file name.

The end state for this tutorial will be several files:

- `game.ts` will just have the `Config` object and the call to
  `initializeAndLaunch`
- `common.ts` will export some helper functions
- `splash.ts` will export a builder function for the welcome screen / main menu
- `chooser.ts` will export a builder function for a level chooser
- `help.ts` will export a builder function for the help screens
- `play.ts` will export a builder function for the playable levels of the game

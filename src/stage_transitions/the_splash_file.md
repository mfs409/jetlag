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
{{#include splash.ts}}
```

Other than that, the code should be pretty familiar.  We have some buttons that
can be pressed to cause the game to jump to another screen, and we use
`stage.switchTo` to say which builder to use (and which level to pass to that
builder).

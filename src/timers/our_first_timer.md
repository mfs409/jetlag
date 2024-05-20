## Our First Timer

In the following [game](game_01.ts), we'll use a timer to make some code run after five
seconds elapse:

<iframe src="./game_01.iframe.html"></iframe>

First let's set up tilt, and make a hero who can jump:

```typescript
{{#include game_01.ts:27:29}}

{{#include game_01.ts:41:48}}
```

Now we'll add a timer.  The `stage.world` and `stage.hud` each have a timer
object that counts milliseconds.  We can use either one, by giving it a new
`TimedEvent` that runs in 5 seconds.  `false` indicates that the timer does not
repeat.  The code for making a destination won't run until 5 seconds transpire.
At that time, a new destination will be put on the screen, and we'll tell JetLag
that reaching the destination wins the level:

```typescript
{{#include game_01.ts:31:39}}
```

Finally, we need to make sure that JetLag knows what to do when the level is won
or lost:

```typescript
{{#include game_01.ts:50:52}}
```

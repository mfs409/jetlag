## Winning And Losing Via Timers

In the following game, there is a timer, and the level wins after 5 seconds:

<iframe src="./game_01.iframe.html"></iframe>

The full code for the game is [here](game_01.ts).  There'The only interesting
part is this:

```typescript
{{#include game_01.ts:33:34}}
```

Here's another game, where we lose after 5 seconds.  

<iframe src="./game_02.iframe.html"></iframe>

The [code](game_02.ts) is similarly simple, with the interesting part being just one line:

```typescript
{{#include game_02.ts:33:34}}
```

## Controlling Movement In One Dimension

Manual movement lets us control everything... or decide not to control things.
So, for example, in this level we put a fixed X velocity on the actor, and only
use the arrows to control up and down.  Of course, without boundaries on the
camera, or borders on the world, this is going to be pretty glitchy.  You should
test your understanding by applying ideas from the "Camera" chapter to make
this nicer.

<iframe src="game_07.iframe.html"></iframe>

The code can be found [here](game_07.ts).  We give the hero a fixed horizontal velocity:

```typescript
{{#include game_07.ts:35}}
```

Then we make sure that our keyboard handlers only change the Y velocity:

```typescript
{{#include game_07.ts:39:42}}
```

## Using The Z Index

Every appearance component in JetLag has an optional "z" argument.  Z lets us
control how things overlap.  There are 5 Z levels: -2, -1, 0, 1, and 2. By
default, everything goes in Z=0.  Also, by default, things within a Z index
appear on top of things that were made before them in the same block of code.

Let's make things easy, by using the [common.ts](common.ts) file that we made earlier.  Once we have it, we can test out the Z index feature like this:

```typescript
{{#include game_05.ts}}
```

As you test the game, be sure to try to make the hero collide with both arrows.
Since they have no role, they both get the `Passive` role, which means the hero
won't collide with them.  Because of the rules about Z, the hero will seem to go
over one, and under the other.

<iframe src="./game_05.iframe.html"></iframe>

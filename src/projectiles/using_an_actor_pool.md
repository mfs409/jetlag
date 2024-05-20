## Using An Actor Pool

Now we'll add an actor pool, and pre-populate it with 10 projectiles.  At first,
this feels exactly the same as our last example, but then we run out of
projectiles!

<iframe src="./game_02.iframe.html"></iframe>

Similarly, most of the [code](game_02.ts) is the same.  Here's the part for
setting up the hero, world, and hero movement:

```typescript
{{#include game_02.ts:30:31}}
{{#include game_02.ts:43:52}}
```

The differences only deal with the projectiles.  We start by making a pool (an
`ActorPoolSystem`) and putting ten projectiles in it.  Notice that the x,y
coordinates don't really matter, so I opted to draw them off screen.  When we
put actors in a pool, they will automatically be disabled; when we take them
out, they'll be re-enabled.  Thus they won't be expensive for Box2D to manage.

```typescript
{{#include game_02.ts:32:42}}
```

When we want to toss a projectile, we use `projectiles.get()` to get it.  If the
pool is empty, this will return `undefined`, so we do a quick check (`if (p)`
means the same thing as `if (p != undefined)`), and only toss the projectile if
it is valid:

```typescript
{{#include game_02.ts:54:57}}
```

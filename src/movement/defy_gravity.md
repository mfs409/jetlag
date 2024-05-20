## Defying Gravity

We've seen that dynamic bodies are subject to gravity.  But we also require at
least one body in a collision to be dynamic, or the collision won't happen.
These requirements can be at odds with each other, so Box2D (and hence JetLag)
lets us defy gravity.  Here's a simple demonstration:

<iframe src="game_10.iframe.html"></iframe>

You can find the code [here](game_10.ts).  You'll also need the
[mustard_ball.png](../assets/mustard_ball.png) image.

Below is the code for the demonstration.  This is the interesting line:

```typescript
{{#include game_10.ts:44}}
```

You'll notice that there is some strangeness in the code. The issue is that
`Destination` is a role that doesn't collide with other things.  It achieves
this by internally calling `setCollisionsEnabled(false)` on its `rigidBody`.  If
we want collisions, we need to turn them on *after* we make the actor.  That's
why we need this line:

```typescript
{{#include game_10.ts:40}}
```

Every now and then, you'll find that JetLag is doing this sort of thing...
changing properties of a rigidBody during the `Actor.new()` call.  When that
happens, you can always change things back after the actor has been created.

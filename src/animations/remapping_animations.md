## Re-mapping Animations

In the previous example, things looked quite odd when we tried to make the hero walk in a diagonal line... in every case, it defaulted to `IDLE_E`.  Worse, when the hero stopped moving, sometimes it bounced out of `IDLE_E`.

One solution would be to add eight more animations (IDLE_NE, IDLE_NW, IDLE_SE
IDLE_SW, WALK_NE, WALK_NW, WALK_SE, and WALK_SW).  But that would bring a new
problem: when the hero switched from walking west to walking northwest, its
animation would reset.  In the following code, see if you can detect the subtle
visual glitch:

<iframe src="./game_12.iframe.html"></iframe>

JetLag lets us "re-map" animations.  This gives us a way of saying "when the
state moves to Y, use the animation from state X, and if it was in X, don't
restart the animation".  In the following mini-game, you should not see the
glitch anymore:

<iframe src="./game_13.iframe.html"></iframe>

The way we get this behavior is by making another map, the "remap", and
including it in the line for making the `AnimatedSprite`.  For starters, you'll
want to add these lines of code:

```typescript
    let remap = new Map();
    remap.set(AnimationState.WALK_NE, AnimationState.WALK_E);
    remap.set(AnimationState.WALK_SE, AnimationState.WALK_E);
    remap.set(AnimationState.WALK_NW, AnimationState.WALK_W);
    remap.set(AnimationState.WALK_SW, AnimationState.WALK_W);

    remap.set(AnimationState.IDLE_NE, AnimationState.IDLE_E);
    remap.set(AnimationState.IDLE_SE, AnimationState.IDLE_E);
    remap.set(AnimationState.IDLE_NW, AnimationState.IDLE_W);
    remap.set(AnimationState.IDLE_SW, AnimationState.IDLE_W);
```

Then you can add `remap` when making a `new AnimatedSprite`:

```typescript
    let hero = new Actor({
      rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 2 }),
      appearance: new AnimatedSprite({ width: 2, height: 2, animations, remap }),
      role: new Hero(),
      movement: new ManualMovement(),
    });
```

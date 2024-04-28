## Destinations

In maze-like games, a hero usually needs to reach a destination.  We can see
such behavior in the following game:

<iframe src="game_03.iframe.html"></iframe>

It takes very little code to get this behavior in JetLag.  The default behavior
for the destination role is to accept one hero, and the default behavior of the
`score` (which we haven't really discussed yet) is that a level is won once one
hero reaches a destination.  Putting it together, all we need to do is make a
hero and a destination, and make sure the hero has some kind of movement (in
this case, tilt) so that we can get it to collide with the destination.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 3, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 12, cy: 3, radius: 0.4 }),
      role: new Destination(),
    });
```

Of course, you might want to have a nice fade-out or other visual effect, instead of immediately restarting.  We'll get to that in a later tutorial.

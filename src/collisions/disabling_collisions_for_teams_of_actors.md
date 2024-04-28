## Disabling Collisions For Teams Of Actors

Another way we can change the behavior of collisions is by indicating that
certain combinations of actors simply do not collide with each other.  In this
example, the hero is able to move through the red wall, but the enemy cannot:

<iframe src="./game_03.iframe.html"></iframe>

JetLag achieves this behavior via an extra field, called `passThroughId`.  It is
an array of numbers.  If two actors have any number in common between their two
arrays, then JetLag will turn off collisions between those two actors.

```typescript
    enableTilt(10, 10);
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }, { passThroughId: [7] }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    // the enemy chases the hero, but can't get through the wall
    new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 14, cy: 2, radius: 0.25 }, { dynamic: true }),
      movement: new ChaseMovement({ speed: 1, target: h, chaseInX: true, chaseInY: true }),
      role: new Enemy(),
    });
    // Remember to make it dynamic, or it *will* go through the wall

    new Actor({
      appearance: new FilledBox({ width: 0.1, height: 7, fillColor: "#FF0000" }),
      rigidBody: new BoxBody({ cx: 12, cy: 1, width: 0.1, height: 7 }, { passThroughId: [7] }),
      role: new Obstacle(),
    });
```

A nice aspect of this design is that you can use many different numbers to
represent many different rules.  For example, maybe enemies should pass through
obstacles, obstacles through heroes, heroes through goodies, and goodies through
destinations.  Using a different number for each rule, and two numbers per
actor, would let you express these behaviors.

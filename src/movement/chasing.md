## Chasing An Actor

Another way of moving things is via "chase".  Chase isn't incredibly
complicated... we just cast a line from the chasing actor to the actor it is
chasing, and tell the chasing actor to move along that line.  Surprisingly, this
can seem like a really smart "AI" in some games.  Here's an example:

<iframe src="game_03.iframe.html"></iframe>

Here's the code for the example.  There is one important thing to point out in
this code.  Up to this point, when we made actors we usually just said `new
Actor(...)`.  But here, when we make the hero (the one who is being chased), we
say `let h = new Actor(...)`.  We didn't have to call it `h`.  We could have
called it `hero` or `h123` or `the_hero_to_chase` or quite a few other things.
What matters is that we created a *variable* (that is, we made up a name for our
code to use).  In later code, we can use that variable when we need to think
about the hero.  So, when we made the `ChaseMovement`, we could say that the
target of the chase was `h`, and JetLag would know who to chase.

```typescript

    boundingBox();
    enableTilt(10, 10);

    // Make a hero who we control via tilt
    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 5.25, radius: 0.4 }),
      movement: new TiltMovement(),
      role: new Hero(),
    });

    // create an enemy who chases the hero
    new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 15, cy: 1, radius: 0.25 }),
      movement: new ChaseMovement({ speed: 1, target: h }),
      role: new Enemy(),
    });

    stage.score.onLose = { level, builder }
```


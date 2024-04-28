## Coordinating With Hover

Sometimes, the interaction between a gesture and a style of movement is
complex, and needs special attention.  As an example, a few years ago a
student wanted to have an actor who hovered at some spot until it was
flicked.  The `HoverMovement` didn't really work with `swipe` gestures, so I
had to make some changes to JetLag.  This mini-game shows how to get hovering
and swiping to work together.

<iframe src="./game_09.iframe.html"></iframe>

In the game, we start by setting up gravity and making our first hero.  This one
hovers until it is tapped.  Since `HoverMovement` is a limited movement
component, we have to put velocity directly on the body, instead of using the
(more convenient) movement component.

```typescript
    stage.world.setGravity(0, 10);
    boundingBox();

    // make a hero who doesn't start moving until it is touched
    let hover_walk = new Actor({
      appearance: new ImageSprite({ width: 0.75, height: 0.75, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 0.5, cy: 8.25, radius: 0.375 }, { density: 1, friction: 0, disableRotation: true }),
      movement: new HoverMovement(0.5, 8.25),
      role: new Hero(),
    });
    // The `HoverMovement` isn't a full-fledged movement component, so if you
    // want to make its actor move, you'll need to work with the body directly.
    hover_walk.gestures.tap = () => {
      (hover_walk.movement as HoverMovement).stopHover();
      hover_walk.rigidBody.body.SetLinearVelocity({ x: 5, y: 0 });
      hover_walk.gestures.tap = undefined;
      return true;
    }
```

Our next hero will also hover, but we'll set up swipe gestures like in one of
the earlier mini-games.

```typescript
    // Make a hero who is hovering, but who we will eventually flick
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: 1, cy: 7, radius: .5 }),
      movement: new HoverMovement(1, 7),
      role: new Hero(),
      extra: { flickSpeed: .5 }
    });

    // Set up a "swipe" zone on the HUD, for swiping that hero
    let swipe = (_actor: Actor, hudCoord1: { x: number; y: number }, hudCoord2: { x: number; y: number }, time: number) => {
      // Convert starting coordinates from hud to world
      let screenCoord1 = stage.hud.camera.metersToScreen(hudCoord1.x, hudCoord1.y);
      let worldCoord1 = stage.world.camera.screenToMeters(screenCoord1.x, screenCoord1.y);
      // Is there a flickable actor there?
      let foundActor: Actor | undefined = undefined;
      for (let actor of stage.world.physics!.actorsAt(worldCoord1)) {
        if (actor.extra.flickSpeed != undefined) {
          foundActor = actor;
          break;
        }
      }
      if (!foundActor) return false;

      // Figure out the velocity to apply, then apply it
      let v = new b2Vec2(hudCoord2.x, hudCoord2.y)
      v = v.Subtract(hudCoord1);
      v.Normalize();
      v.Scale(foundActor.extra.flickSpeed * 2000 / time);
      // Don't forget to turn off hovering!
      (foundActor.movement as HoverMovement).stopHover();
      foundActor.rigidBody.body.SetLinearVelocity(v);
      return true;
    };
    new Actor({
      appearance: new FilledBox({ width: 16, height: 9, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9, }, { scene: stage.hud }),
      gestures: { swipe },
    });
```

This code is almost the same as what we did before, but now we have to call
`stopHover()`, and we have to work with the rigid body directly.

The real lesson here is that JetLag tries to make things easy, but it also tries
not to hide things too aggressively.  So, in this case, when the `HoverMovement`
proved to be inadequate, the solution was to work directly with the `rigidBody`.
We also could have made a new movement component.  When you're faced with these
kinds of decisions, you'll grow to develop a style and preference that work best
for you.

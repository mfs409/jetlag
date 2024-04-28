## Long Presses

Sometimes we want to work with long presses.  These aren't quite the same as
`pan`: they show up as a touch-down event and a touch-up event.  Typically, what
we'll want to do is have some function that runs on every clock tick (so 45
times per second).  When the button is pressed, it should set some variable
true, and when it is released, that variable should become false.  The function
that runs every clock tick should check that variable, and only run the button's
true action if the variable is true.

<iframe src="./game_08.iframe.html"></iframe>

It turns out that this is some pretty complex behavior.  Fortunately, we're
using TypeScript, which means that we can put this behavior in a helper
function, and things will get easier:

```typescript
    // There is some complexity to how this works, because each button needs to
    // know if it is active.  We could do that via "extra" on each button, but
    // instead we'll use the idea of "capturing" the `active` variable in each
    // call to this function.
    function addToggleButton(actor: Actor, whileDownAction: () => void, onUpAction: (coords: { x: number; y: number }) => void) {
      let active = false; // will be captured by lambdas below
      let touchDown = () => { active = true; return true; };
      let touchUp = (_actor: Actor, hudCoords: { x: number; y: number }) => {
        if (!active) return false;
        active = false;
        onUpAction(hudCoords);
        return true;
      };
      // Put the control and events in the appropriate lists
      stage.world.repeatEvents.push(() => { if (active && whileDownAction) whileDownAction(); });
      actor.gestures.touchDown = touchDown;
      actor.gestures.touchUp = touchUp;
    }
```

Next, let's put a border on the world, and draw a hero.  We'll use dampened
motion as a way to see that the toggle buttons really are working:

```typescript
    boundingBox();

    let h = new Actor({
      appearance: new ImageSprite({ width: 0.8, height: 0.8, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .4, cy: .4, radius: 0.4 }),
      movement: new ManualMovement(),
      role: new Hero(),
    });
    // If we just gave it a velocity once, it would slow down...
    (h.movement as ManualMovement).setDamping(5);
```

Now we can draw some buttons for moving the hero.  These are "toggle" buttons:
they run some code when they are pressed, and other code when they are released.

```typescript
    let l = new Actor({
      appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 1, cy: 4.5, width: 2, height: 5 }, { scene: stage.hud }),
    });
    addToggleButton(l, () => (h.movement as ManualMovement).updateXVelocity(-5), () => { });
    let r = new Actor({
      appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 15, cy: 4.5, width: 2, height: 5 }, { scene: stage.hud }),
    });
    addToggleButton(r, () => (h.movement as ManualMovement).updateXVelocity(5), () => { });
    let d = new Actor({
      appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 8, width: 12, height: 2 }, { scene: stage.hud }),
    });
    addToggleButton(d, () => (h.movement as ManualMovement).updateYVelocity(5), () => { });
    let u = new Actor({
      appearance: new FilledBox({ width: .1, height: .1, fillColor: "#00000000" }),
      rigidBody: new BoxBody({ cx: 8, cy: 1, width: 12, height: 2 }, { scene: stage.hud }),
    });
    addToggleButton(u, () => (h.movement as ManualMovement).updateYVelocity(-5), () => { });
```

One thing you'll notice about these buttons is that unexpected things happen if
you slide your finger off of them.  Be sure to try to do things like that when
testing your code.  Maybe you'll decide you like the unexpected behavior.  Maybe
you'll decide that you need to make changes to JetLag to fix the problem...

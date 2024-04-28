## Side-View Animations

A lot of what we've seen so far has been specific to games with an overhead
view.  Let's now make a side-view game, to see how remapping works a little bit
differently.  Here's the game we'll make:

<iframe src="./game_14.iframe.html"></iframe>

In the game, tilt moves the actor left/right, but there is a lot of friction to
slow things down.  This will let us really see the animations in detail.

We'll start by setting up gravity, tilt, a bounding box, and a background:

```typescript
    stage.world.setGravity(0, 10);
    enableTilt(10, 0);
    boundingBox()
    stage.backgroundColor = "#17b4ff";
    stage.background.addLayer({ anchor: { cx: 8, cy: 4.5, }, imageMaker: () => new ImageSprite({ width: 16, height: 9, img: "mid.png" }), speed: 0 });
```

The hero has one animation when it is not in the air, another when it is.  Note
that "jump_right" will also be used when jumping to the left, if there is no
"jump_left".  With that as our plan, we can make the two animations like this:

```typescript
    let idle_right = AnimationSequence.makeSimple({ timePerFrame: 150, repeat: true, images: ["color_star_1.png", "color_star_2.png"] })
    let jump_right = AnimationSequence.makeSimple({ timePerFrame: 150, repeat: true, images: ["color_star_4.png", "color_star_6.png"] });
    let animations = new Map();
    animations.set(AnimationState.IDLE_E, idle_right);
    animations.set(AnimationState.JUMP_E, jump_right);
```

You probably guessed that we'll want to do some re-mapping:

```typescript
    // Remap JUMP_W to JUMP_E
    let remap = new Map();
    remap.set(AnimationState.JUMP_W, AnimationState.JUMP_E);
```

But in truth, there's a lot more remapping that it seems like we need.
Fortunately, there is another way.  JetLag understands that there are two
dominant views (overhead and side), and that there are different (but still
reasonable) default re-mappings for each.  Let's make our hero:

```typescript
    let h = new Actor({
      appearance: new AnimatedSprite({ width: 0.8, height: 0.8, animations, remap }),
      rigidBody: new CircleBody({ cx: 0.25, cy: 7, radius: 0.4 }, { density: 5, friction: 0.6, disableRotation: true }),
      movement: new TiltMovement(),
      role: new Hero(),
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (h.role as Hero).jump(0, -5); });
```

Instead of remapping JUMP_NE, JUMP_SE, JUMP_NW, JUMP_SW, we can tell the
AnimatedSprite that this is a side-view game, and it will do the work for us.

```typescript
    (h.appearance[0] as AnimatedSprite).stateSelector = AnimatedSprite.sideViewAnimationTransitions;
```

Note that you can make your own transition maps and assign them to the
`stateSelector`.  The default one is for overhead view, and JetLag only provides
one more, for side view.  If you need something else, you've probably advanced to a point where you don't need a tutorial to help you figure it out :)

The last thing we'll do in our game is add a disappearance animation.  We'll add
a goodie, and give it an `onDisappear` component.  The component will draw a new
actor (with `Passive` role) and give it an animation that does not repeat.  The
last frame of the animation will be a blank image.

```typescript
    new Actor({
      appearance: new ImageSprite({ width: 0.5, height: 0.5, img: "star_burst_3.png" }),
      rigidBody: new CircleBody({ cx: 2, cy: 7.5, radius: 0.25 }),
      role: new Goodie(),
      onDisappear: (a: Actor) => {
        let animations = new Map();
        animations.set(AnimationState.IDLE_E, new AnimationSequence(false).to("star_burst_3.png", 200).to("star_burst_2.png", 200).to("star_burst_1.png", 200).to("star_burst_4.png", 200));
        new Actor({
          appearance: new AnimatedSprite({ animations, width: .5, height: .5 }),
          rigidBody: new BoxBody({ cx: a.rigidBody.getCenter().x, cy: a.rigidBody.getCenter().y, width: .5, height: .5 }, { collisionsEnabled: false }),
        })
      }
    });
```

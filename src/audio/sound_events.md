## Sound Events

To use sound effects, we just add a sound component to an actor.  There are six
sounds.  Note that some of them only make sense for certain kinds of roles:

- Disappear: We assign this to any role, so it will make a sound when it
  disappears.
- Toss: We assign this to a projectile, so it will make a sound when it is
  tossed.
- Arrive: We assign this to a destination, so it will make a sound when a hero
  arrives at it.
- Defeat: We assign this to an enemy, so it will make a sound when it is
  defeated.
- Jump: We assign this to a hero, so it will make a sound when it jumps.
- Collide: We assign this to an obstacle, so it will make a sound when a hero
  collides with it.

Here's a mini-game that shows all of the behaviors:

<iframe src="./game_15.iframe.html"></iframe>

The remarkable thing about this mini-game is that the hardest part is not
configuring the sounds, but creating the kinds of actors who can have the sorts
of interactions that will lead to the sound effects happening:

```typescript
    boundingBox();
    enableTilt(10, 0);
    stage.world.setGravity(0, 10);

    // First: you always need a gesture before a web page will play audio, so
    // let's put a mute/unmute button on the HUD:
    drawMuteButton({ cx: 15.5, cy: 0.5, width: 1, height: 1, scene: stage.hud });

    // disappear and collide sounds will both be attached to this obstacle
    let o = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "purple_ball.png" }),
      rigidBody: new CircleBody({ cx: 2.5, cy: 8.5, radius: .5 }),
      role: new Obstacle(),
      sounds: new SoundEffectComponent({ collide: "flap_flap.ogg", disappear: "high_pitch.ogg" }),
      gestures: { tap: () => { o.remove(); return true; } }
    });

    // The hero will have a jump sound
    let h = new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      rigidBody: new CircleBody({ cx: .5, cy: 8.5, radius: .5 }),
      role: new Hero(),
      movement: new TiltMovement(),
      sounds: new SoundEffectComponent({ jump: "slow_down.ogg" }),
      gestures: {
        tap: () => {
          // These projectiles will have toss sounds
          let p = new Actor({
            appearance: new ImageSprite({ width: .2, height: .2, img: "grey_ball.png" }),
            rigidBody: new CircleBody({ cx: h.rigidBody.getCenter().x + .2, cy: h.rigidBody.getCenter().y, radius: .1 }),
            movement: new ProjectileMovement(),
            role: new Projectile(),
            sounds: new SoundEffectComponent({ toss: "low_pitch.ogg" })
          });
          // We can use "tossFrom" to throw in a specific direction, starting at
          // a point, such as the hero's center.
          (p.role as Projectile).tossFrom(h, .2, 0, 5, 0);
          return false;
        }
      }
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_SPACE, () => { (h.role as Hero).jump(0, -7.5) });

    // Defeat the enemy to get a defeat sound
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "red_ball.png" }),
      rigidBody: new CircleBody({ cx: 4.5, cy: 8.5, radius: .5 }),
      role: new Enemy(),
      sounds: new SoundEffectComponent({ defeat: "lose_sound.ogg" }),
    });

    // Reach the destination for an arrive sound
    new Actor({
      appearance: new ImageSprite({ width: 1, height: 1, img: "mustard_ball.png" }),
      rigidBody: new CircleBody({ cx: 14.5, cy: 8.5, radius: .5 }),
      role: new Destination(),
      sounds: new SoundEffectComponent({ arrive: "win_sound.ogg" }),
    });

    stage.score.onLose = { level, builder };
    stage.score.onWin = { level, builder };
```

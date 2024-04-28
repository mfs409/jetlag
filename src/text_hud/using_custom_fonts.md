## Using Custom Fonts

Up until now, this tutorial has only used the Arial font.  Arial is on pretty
much every device, so it's an easy choice.  However, you might want to use other
fonts, so let's look at two ways of doing so.

The first option is to let your game fetch a font from the web when it starts.
If you visit the [Google Fonts](https://fonts.google.com/) website, you'll
find lots of nice fonts that you can use (be sure to read the licensing rules).
Once you've found one, you can edit your `game.html` file to put a `<link>` into
the `<head>`.  This will cause your game to load that font:

```html
  <link href='https://fonts.googleapis.com/css?family=Lato:400,700' rel='stylesheet' type='text/css'>
```

Once you've done that, you can use the font's name (in my example, "Lato") as
the `face` when you make a `TextSprite`.  Let's try it, by putting more text on
the last mini-game:

```typescript
    let hero = new Actor({
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .5 }),
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      movement: new ManualMovement({ rotateByDirection: true }),
    });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).addVelocity(-1, 0))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).addVelocity(1, 0))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).addVelocity(0, -1))
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).addVelocity(0, 1))
    stage.world.camera.setCameraFocus(hero);

    // Text with the Arial font
    new Actor({
      rigidBody: new CircleBody({ cx: .5, cy: .5, radius: .001 }, { scene: stage.hud }),
      appearance: new TextSprite(
        { center: false, face: "Arial", size: 20, color: "#FF0000aa" },
        () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
    });

    // The same text, with the Lato font
    new Actor({
      rigidBody: new CircleBody({ cx: .5, cy: 1.5, radius: .001 }, { scene: stage.hud }),
      appearance: new TextSprite(
        { center: false, face: "Lato", size: 20, color: "#FF0000aa" },
        () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
    });
```

Sometimes, you don't want to have to request files over the network.
Fortunately, we can also download fonts into our asset folder and add them to
`game.html`.  At the beginning of this tutorial, you should have copied a font
file called `Roboto-Black.ttf` into your assets folder.  This, too, was
downloaded from the Google Fonts website.  It's a little more complicated to get
this font into the game.  We need to put all of the following text into the
`<head>` tag of the `game.html` file:

```html
  <style>
    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      src: url(assets/Roboto-Black.ttf);
    }
  </style>
```

Now we can use the name that we provided as `font-family` as the `face` for our
`TextSprite`:

```typescript
    new Actor({
      rigidBody: new CircleBody({ cx: .5, cy: 1, radius: .001 }, { scene: stage.hud }),
      appearance: new TextSprite(
        { center: false, face: "Roboto", size: 20, color: "#FF0000aa" },
        () => `${hero.rigidBody.getCenter().x.toFixed(2)}, ${hero.rigidBody.getCenter().y.toFixed(2)}, ${hero.rigidBody.getRotation().toFixed(2)}`),
    });
```

To wrap up this example, let's notice one more thing: since the HUD is a full physics simulation, we can put moving actors onto it.  This usually looks bad, but in the following example, I also added this line:

```typescript
    new Actor({
      rigidBody: new CircleBody({ cx: 3, cy: 3, radius: .5 }, { scene: stage.hud }),
      appearance: new ImageSprite({ width: 1, height: 1, img: "green_ball.png" }),
      movement: new PathMovement(new Path().to(1, 1).to(15, 1).to(15, 8).to(1, 8).to(1, 1), 4, true)
    });
```

The result is that there is an actor moving on the HUD, text on the hud, and an
actor that can navigate the world:

<iframe src="./game_08.iframe.html"></iframe>

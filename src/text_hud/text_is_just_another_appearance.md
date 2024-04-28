## Text Is Just Another Appearance

JetLag uses the "Entity-Component-System" pattern, which means that as much as
possible, the different components should be interchangeable.  Since
`appearance` is a component, we should expect that actors with a text appearance
should only differ from other actors in their `appearance` itself.  Here's a
mini-game to illustrate this point:

<iframe src="./game_01.iframe.html"></iframe>

There are four actors in the mini-game, and when we make them, the only thing
that really makes them seem different from other actors is their appearance.
This does raise an interesting question though: how does the text relate to the
rigid body?  Let's look at our first actor, the red "JetLag" text in the top
left corner:

```typescript
    new Actor({
      rigidBody: new CircleBody({ cx: 1, cy: 1, radius: .01 }),
      appearance: new TextSprite({ center: true, face: "Arial", size: 22, color: "#FF0000" }, "JetLag")
    });
```

The rigid body is *tiny*, and the text is *centered* on the body.  This is
probably the easiest way to make text.

Every `TextSprite` must have a face, size, and color.  It can also have a
"stroke" (outline), described by the `strokeColor` and `strokeWidth`.  Colors
are usually 6-digit values (see [HTML Color
Codes](https://www.w3schools.com/html/html_colors.asp) for more information). We
can add a fourth pair of digits to the color to make it semi-transparent.

To show all of this, we'll make another text actor.  This time, we'll make the
color semi-transparent. Then we'll make a green ball, and use the "z" field of
its appearance to put it behind the text.  If you look carefully, you'll see
that the green ball is slightly visible through the text.  The value `FF` for
transparency actually means 255 (it's expressed as a number in base 16).  `00`
means 0. Bigger values mean "less transparent", and smaller values mean "more
transparent".

Regarding the Z value, JetLag supports five values: -2, -1, 0, 1, or 2.  This
lets us control how things stack on top of each other.  The default is 0.  If
two things have the same Z, the one we made second is the one on top.

```typescript
    new Actor({
      rigidBody: new CircleBody({ cx: 4, cy: 4, radius: .01 }),
      appearance: new TextSprite({ center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 }, "JetLag")
    });
    new Actor({
      rigidBody: new CircleBody({ cx: 4, cy: 4, radius: .5 }),
      appearance: new ImageSprite({ width: 1, height: 1, z: -1, img: "green_ball.png" })
    });
```

Since every actor has a body, we can make Text move, just like anything else.
The key thing is that the text's *body* is what is matters, not its appearance.
When we make a moving actor with text appearance, and we attach a tap gesture to
it, the tap will only be detected on the rigid body, not the whole text box.  In
this case, the green box inside of the "Tap Me" text is the only part that is
interactive.  Be sure to press `F12` and watch for output in the console to
convince yourself that only tapping the green box causes the `tap` code to run.

```typescript
    new Actor({
      rigidBody: new BoxBody({ cx: 1, cy: 1, width: .5, height: .5 }),
      appearance: new TextSprite({ center: true, face: "Arial", size: 64, color: "#FF0000aa", strokeColor: "#0000FF", strokeWidth: 2 }, "Tap Me"),
      movement: new PathMovement(new Path().to(1, 1).to(15, 1).to(15, 8).to(1, 8).to(1, 1), 4, true),
      gestures: {tap: ()=> {console.log("Tapped"); return true;}}
    });
```

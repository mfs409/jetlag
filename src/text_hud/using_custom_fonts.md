## Using Custom Fonts

Up until now, this chapter has only used the Arial font.  Arial is on pretty
much every device, so it's an easy choice.  However, you might want to use other
fonts, so let's look at two ways of doing so.

The first option is to let your game fetch a font from the web when it starts.
If you visit the [Google Fonts](https://fonts.google.com/) website, you'll
find lots of nice fonts that you can use (be sure to read the licensing rules).
Once you've found one, you can edit your `game.html` file to put a `<link>` into
the `<head>`.  This will cause your game to load that font:

```html
{{#include game.html:18}}
```

Once you've done that, you can use the font's name (in my example, "Lato") as
the `face` when you make a `TextSprite`.  Let's try it, by putting more text on
the last mini-game:

```typescript
{{#include game.ts:28:33}}
{{#include game.ts:39:55}}
{{#include game.ts:67:72}}
```

Sometimes, you don't want to have to request files over the network.
Fortunately, we can also download fonts into our asset folder and add them to
`game.html`.  At the beginning of this chapter, you should have copied a font
file called `Roboto-Black.ttf` into your assets folder.  This, too, was
downloaded from the Google Fonts website.  It's a little more complicated to get
this font into the game.  We need to put all of the following text into the
`<head>` tag of the `game.html` file:

```html
  <style>
{{#include game.html:20:25}}
  </style>
```

Now we can use the name that we provided as `font-family` as the `face` for our
`TextSprite`:

```typescript
{{#include game.ts:60:65}}
```

To wrap up this example, let's notice one more thing: since the HUD is a full
physics simulation, we can put moving actors onto it.  This usually looks bad,
but in the following example, I also added this line:

```typescript
{{#include game.ts:34:38}}
```

The result is that there is an actor moving on the HUD, text on the hud, and an
actor that can navigate the world:

<iframe src="./game.iframe.html"></iframe>

Just in case you've been having trouble getting this example to work, here are
the [HTML file](game.html) and [code](game.ts).

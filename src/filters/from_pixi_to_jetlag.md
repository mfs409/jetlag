## From Pixi.js Filters To JetLag Filters

Since JetLag introduces concepts of HUD, World, Overlay, Background, and
Foreground, the code for the Pixi.js filter demos can't just be copied into your
game... some more work is needed.  In addition, your game might need you to turn
a filter on and off, add and remove filters during the game, or even change a
filter while it is in use.  To make this work, JetLag introduces a
`FilterComponent`.  While this book doesn't usually look at JetLag's internal
code, this is one time where it can be quite useful:

```typescript
{{#include ../jetlag/Components/FilterComponent.ts}}
```

This code says that the `FilterComponent` only needs to have two pieces to it: a
method that returns all of the JetLag filters, and a method that runs each time
the game is drawn to the screen.

Let's unpack this a bit.  A `FilterComponent` should wrap one or more Pixi.js
filters.  The `onRender` method will let us update the filters, and also decide
whether they should be shown or not.  Then the `getFilters` method will be used
by JetLag to get the filters and attach them to part of the game.

The other important piece is how we attach a filter to the game.  For this, we
have a few methods:

- `stage.renderer.addZFilter()` adds a filter to a specific Z layer
- `stage.renderer.addFilter()` adds a filter to all Z layers
- `stage.renderer.addFilterToMain()` adds a filter to *everything*

All of these methods take a `FilterComponent` as their first argument.  The
first takes a Z index as its second argument, and a `SpriteLocation` as its
third argument, whereas the second takes a `SpriteLocation` as its second
argument.

There are 5 `SpriteLocations`:

- `SpriteLocation.WORLD` is for filters that go on the world
- `SpriteLocation.HUD` is for filters that go on the HUD
- `SpriteLocation.OVERLAY` is for filters that go on overlays (pop-up scenes,
  like win messages and pause scenes)
- `SpriteLocation.BACKGROUND` is for filters that go on a Parallax background
- `SpriteLocation.FOREGROUND` is for filters that go on a Parallax foreground

# Filters

Filters let you change the visual appearance of a game.  They can make a game
look exceptionally cool, but they need to be used with care, because they can
use up a lot of compute power, and slow down your game.

Pixi.js provides lots of filters, which JetLag lets you use.  You can attach
filters to overlays, the world, and the hud.  Within the world, you can attach
filters to a specific Z index, or to the whole world.

To get an idea about the filters that Pixi.js provides, please visit the
[Pixi.js filters demo](https://pixijs.io/filters/examples/).  As you play with
different filters, you'll also get a sense for what names Pixi.js uses for its
filters, so that you know what names to `import` into your code.  In addition,
the configuration options for each filter on that website correspond to the
configuration options that will be available to you in the code.

As you work through this chapter, you may want to jump between the sections.
For example, we make a bunch of filters in the second section, but we don't
attach any filters to the game until the fifth section!  It might help you
understand the concepts if you jump forward and back, so that you can test out
filters as you make them.

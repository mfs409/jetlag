## Complex Filters

In the Pixi.js filter demos, there are some very cool effects that come from
combining several filters all at once.  We can do this in a `FilterComponent`.
Here's an example:

```typescript
{{#include filters.ts:158:202}}
```

One thing you'll see here is that we have three filters, two of which need some
special configuration in the `constructor` for the `FilterComponent`.
`preRender` needs to update two of the filters so that they get the desired
animated effect.  Finally, `getFilters` returns an array with *all three*
filters in it.  This will ensure that they all get attached to the game.

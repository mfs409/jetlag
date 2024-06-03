## A Few Simple Filter Components

Let's go ahead and make a few `FilterComponents`.  We'll create a new file
called [`filters.ts`](./filters.ts), and export some filters from there.
Normally, you'd need ti `import` your filters, either from `pixi.js` or
`pixi-filters`, but in this code, I've made it so that they can be reached by
importing from `jetlag` directly.

Our first filter will be for blurring:

```typescript
{{#include filters.ts:3:16}}
```

We are making the component as a `class`, but it's not very complicated... it
has a Pixi.js `BlurFilter`, which it returns as a single-element array through
`getFilters()`.  `preRender` returns the `enabled` field, which is public, so
that your code can turn the filter on and off.

There are many cool filters in Pixi.js that we can create in the same way.
Here are a few more:

```typescript
{{#include filters.ts:18:78}}
```

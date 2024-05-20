## Setting Up The Session Storage

Next, let's set up our session storage.  This is just a tiny bit harder: the
first call to `builder()` would find that there is no `SStore` yet, but each
time after that, `builder()` would find that there already is an `SStore`.  So
then, we can't just "make" the `sstore`, we'll need to check if it exists,
first:

```typescript
{{#include game_01.ts:51:54}}
```

And just like with local storage, in any code *other than the builder*, we can
access the session storage like this:

```typescript
{{#include game_01.ts:54}}
```

## Setting Up The Session Storage

Next, let's set up our session storage.  This is just a tiny bit harder: the
first call to `builder()` would find that there is no `SStore` yet, but each
time after that, `builder()` would find that there already is an `SStore`.  So
then, we can't just "make" the `sstore`, we'll need to check if it exists,
first:

```typescript
    // Only set up session storage if we don't have one already
    if (!stage.storage.getSession("session_state"))
      stage.storage.setSession("session_state", new SStore());
    let sstore = stage.storage.getSession("session_state");
```

And just like with local storage, in any code *other than the builder*, we can
access the session storage like this:

```typescript
  let sstore = stage.storage.getSession("session_state");
```

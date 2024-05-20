## Greeting The Player

Our next bit of code will compare today's date with the date in `pstore`, to
decide if it needs to put a greeting on the screen.  We'll put the decision into
a variable called `new_day`:

```typescript
{{#include game_01.ts:66:74}}
```

While we were at it, we updated the `pstore` with today's date, and we added to
the number of times played.  Since we changed `pstore`, we had to call
`persist()`, of course.

The code above will interact with the code for initializing the `pstore` in a
way that might be surprising: when `first_time` is `true`, `last_day` and
`today` will be the same, so `new_day` will be `false`.  This is OK, because we
print a different message for `new_day` than for `first_time`.  Here's some code
that puts it all together by drawing an overlay on the screen with the
appropriate welcome message (if any).  Note that we could make use of `sstore`
if we also wanted a way to greet someone when they re-opened the page, but it
wasn't the first time today.

```typescript
{{#include game_01.ts:76:102}}
```

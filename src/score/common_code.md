## Common Code

In every one of our games for this chapter, we'll want to print some information
on the screen so that we can see the scores.  The easiest way to do this is to
create a helper function.  Note that this helper function is pretty big: it
prints more information than any one of the games in this chapter needs.  I put
the function in [score_helpers.ts](score_helpers.ts):

```typescript
{{#include score_helpers.ts:3:37}}
```

In the above code, you'll notice some lines that use the question mark in
unusual ways.  For example, there's a line that says:

```typescript
{{#include score_helpers.ts:34}}
```

The syntax `condition ? value1 : value2` is a special version of an `if`
statement.  You can interpret this as saying "if the condition is not "false",
use value1.  Otherwise use value2.  So, in the specific example,
`getLoseCountdownRemaining()` could return `undefined` (i.e., because there is
no lose countdown in the level).  In that case, value2 (`""`) will be displayed.
Otherwise, we'll get the value and turn it into a number with two decimal
places.

Part of why this gets confusing is that the code also uses the `?.` operator
(which is sometimes called the "optional chaining" or "Elvis" operator).  When
you see an expression like `stage.score.getWinCountdownRemaining()?.toFixed(2)`,
it essentially means "if `getWinCountdownRemaining()` does *not* return
undefined, then it is safe to call `toFixed(2)` on the thing that was returned.
This lets the function return `undefined` or a number, and when it's a number,
we make sure it has exactly two digits after the decimal point.

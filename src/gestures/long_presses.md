## Long Presses

Sometimes we want to work with long presses.  These aren't quite the same as
`pan`: they show up as a touch-down event and a touch-up event.  Typically, what
we'll want to do is have some function that runs on every clock tick (so 45
times per second).  When the button is pressed, it should set some variable
true, and when it is released, that variable should become false.  The function
that runs every clock tick should check that variable, and only run the button's
true action if the variable is true.

Here is the [code](game_08.ts) for the game we'll make, and here's what it looks
like when it runs:

<iframe src="./game_08.iframe.html"></iframe>

Knowing if a button is being pressed or not can be tricky.  Fortunately, we can
put this behavior in a helper function, and things will get easier.  Note that
this is some very tricky code.  Hopefully the comment will help you understand
why:

```typescript
{{#include game_08.ts:43:60}}
```

Next, let's put a border on the world, and draw a hero.  We'll use dampened
motion as a way to see that the toggle buttons really are working:

```typescript
{{#include game_08.ts:32:41}}
```

Now we can draw some buttons for moving the hero.  These are "toggle" buttons:
they run some code when they are pressed, and other code when they are released.

```typescript
{{#include game_08.ts:62:84}}
```

One thing you'll notice about these buttons is that unexpected things happen if
you slide your finger off of them.  Be sure to try to do things like that when
testing your code.  Maybe you'll decide you like the unexpected behavior.  Maybe
you'll come up with a beautiful solution, and you'll share it with me, so that I
can update JetLag!

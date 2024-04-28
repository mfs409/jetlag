## The Parts of the Default Game

Let's start by trying to understand the default game that comes with JetLag.
When you cloned the last tutorial and ran the game, you should have seen
something like this:

![Running for the first time](./first_run.png)

Our goal right now is to understand why.  There are two important files.  The
first is `src/game/game.html`.  It is the file that defines the structure of the
web page that you're seeing in your browser.  If you open it in VSCode, you
should see something like this:

```html
{{#include ../empty/game.html}}
```

```admonish Note
Most of this file is not going to change from one game to the next.  If you
don't understand all the details, it's OK.
```

The `head` section describes the general appearance of the web page.  It has
some `meta` tags that explain how mobile web browsers should scale the page so
it looks good on a small screen.  It has a `style` tag, which makes sure that
the page fills the screen.  Finally, it has a `title`, which is what appears as
your game name in the browser tab or browser title bar.  The first thing you
should do whenever you start making a new game is update the title.

The `body` only has two parts.  The first is a `div` tag, named `game-player`,
which is where the game is going to appear.  Right now, `game-player` may not
make sense.  When we get to the `game.ts` file, we'll see why it matters.  The
other thing is a `script` tag.  This tells the web browser that the code to run
will be called `game.js`.  You probably don't want to change anything in the
`body` section of this file.

Now let's move on to the second file.  It is called `src/game/game.ts`.  First
of all, notice that it is not `game.js`.  That's because it *only* has the code
that you write, not all of the JetLag stuff (and Pixi.js stuff, and Box2D
stuff).  When you type `npm start`, then `game.ts` gets combined with all those
other things to produce the `game.js` file that the web page expects.

There are four important parts of `game.ts`.  The first is a set of `import`
statements that appear at the top of the file.  These indicate which parts of
JetLag your game needs.  For now, you can just leave them as-is.  Later, you'll
learn how to get VSCode to automatically update the imports as you start using
new features of JetLag.  That part of the file should look like this:

```typescript
{{#include ./game_01.ts:1}}
```

The second part of the file is where we provide JetLag with some configuration
for our game. When you're just starting out, you only need three pieces of
configuration.  The first two work together to give JetLag an idea about the
dimensions of your game.

```typescript
{{#include ./game_01.ts:3:15}}
```

One important thing is that all of this code is defined as a `class` that
`implements` something called `GameConfig`.  All that really means is that I've
made sure that if you forget any of the required parts of the configuration, you
will get an error.  You can try it out.  Put `//` in front of one of the lines
(perhaps `hitboxes`) and watch what happens.  `Config` gets a red underline, and
if you hover your mouse over it, you'll see an error message.

![An error in our Config object](./vscode_error_config.png)

Most of the time, the only things you'll want to change in this part of the code
are the asset names (`musicNames`, `soundNames`, and `imageNames`).  When you
start using JetLag's storage features, you will also need to update the
`storageKey`, but we won't worry about that for now.  And when you're ready to
launch your game, you'll want to set `hitBoxes = false`, but we're not ready to
do that yet!

The third part of the file is where we put our actual game code.  In later
tutorials, we'll learn how to split this apart, since a game's code can get
quite long.  We'll look at this code in more detail in the next section of the
tutorial.  For now, what matters is that it is a "function".  A function is a
block of code that we can run any time we want.  It turns out that JetLag itself
will decide when to call this function.  The function takes an argument called
`level`, which lets it do different things depending on which level of the game
is being drawn.  Our function only draws one level, so we prefix `level` with an
`_`, to indicate that we aren't going to use it.

Remember that this function creates the *initial state* of the game.  It runs to
completion before you get to play the game, and anything that happens during
gameplay is because of decisions the physics simulator makes, or events that
occur.

```typescript
{{#include ./game_01.ts:17:63}}
```

The last part of the file is a call to `initializeAndLaunch`.  This is what
leads to your game actually running.  You'll notice that we have the name of the
`div` from the HTML file in here.  In essence, this says "find that div, make a
game according to the rules in `Config` and `builder`, and then put the game
into that div".

```typescript
{{#include ./game_01.ts:65:}}
```

One last note: you can change names like `Config` and `builder`, but when you
do, make sure you change them everywhere!

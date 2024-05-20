## Preliminary Setup

In each part of this chapter, we're going to build a mini game to explore some
feature of rigid bodies.  Most of the time, we're going to use tilt to control
actors, because it's easy.  We're also going to put a border around the window,
so things can't wander off the screen.

In the last chapter, that we made use of a helper function in our `game.ts`
file.  But we can do even better!  We can make a separate *file* for storing
helper functions.  This will let us re-use code even more easily.  In addition,
it's good to learn how to split your code into multiple files, because games can
get *very* big, and we don't want to have thousands of lines of code in one
file.

In VSCode, the panel on the left hand side lists folders and files.  You should
see that there is a file called `game.ts` in your `src/game` folder.  Now we're
going to add a new file, called `common.ts`.  You can do this by right-clicking
on the `src/game` folder and selecting "New File...".

The first thing we'll put into this file is the code for enabling tilt.  This is
almost the same as the code in the last chapter, except that it adds the word
`export` before `function`.  This lets other files `import` the `enableTilt`
function.

```typescript
{{#include common.ts:3:21}}
```

Hopefully that code looks pretty familiar.  Now let's make another useful
function.  This one will draw a box around the outside of the 16x9 world.

```typescript
{{#include common.ts:23:51}}
```

The only unusual thing about that function is that it returns the four walls
that make up the bounding box.  If you were to say `let walls = boundingBox()`,
then you could refer to the top wall as `walls.t`, for example.

While we're at it, let's give ourselves another function for making wide
bounding boxes:

```typescript
{{#include common.ts:53:76}}
```

[Here's the final code](common.ts).  Note that this file also includes a
function for drawing a mute button.  We'll discuss this code in the chapter
about sound effects.

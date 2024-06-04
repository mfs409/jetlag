## Using The Server

When you are testing on your machine, you can start the server by opening a
terminal and navigating to the `multiplayer-server` folder.  The first time you
try to run it, you'll need to type `npm install` first.  Then type `npm start`
to launch the server.

Since the server does not "validate" the log-in tokens it receives, you can get
a reasonable multiplayer game set-up by opening a few browser windows and having
each make up its own token to use.  However, it's going to take a lot of code to
get this working.  First, we're going to create two classes.  The first is for
holding the information that connects an actor to a user name.  Each time
someone joins a room, all members of that room will need to make one of these
for the new member:

```typescript
{{#include game.ts:15:29}}
```

Next, we'll make another class for representing the appearance of an actor. This
will have the `userId` of the client who made the actor (which must match the
`userId` in the `RemoteActor` class), along with the actor's position, rotation,
and the image it is using.

```typescript
{{#include game.ts:31:47}}
```

With those on hand, we can start thinking about how the client is going to
interact.  The key thing is that we have a special "network device" available as
`stage.network`, which we can use.  Since there are 16 different messages that
the server can send to the client, we'll need 16 different functions for
handling everything.  We can handle errors in a common way, because we don't
expect there to be errors:

```typescript
{{#include game.ts:107:117}}
```

Whew, that's half of the functions we need!

For the rest, we're going to need to keep track of some information that needs
to stick around for as long as the game is running.  Thinking back to the
"Storage" chapter, that's a good use case for "session" storage.  We'll want to
know our user Id and name, if we're connected, what room we're in, the other
actors, and our own actor:

```typescript
{{#include game.ts:99:105}}
```

Let's also make a function for drawing an actor on the screen.  We can use this
to make *our* actor, and other people's actors:

```typescript
{{#include game.ts:49:86}}
```

The main difference here is that other people's actors are just a ball that
moves around.  But *our* actor is different.  It uses `repeatEvents` to
broadcast its position 45 times per second.  This lets everyone else in the room
see where the actor is, and update their screens accordingly.

To see how it works, now let's look at the other network event handlers:

```typescript
{{#include game.ts:119:192}}
```

Most of these functions walk us through the authentication flow (for example, by
logging in, creating a room, etc).  But a few are very interesting.  For
example, when a `broadcast` message is received, this code turns it from JSON
into an object, pulls out a user Id, finds the corresponding actor in the
session storge, and updates that actor's position.  

Similarly, when a player joins a room, they get a message with all existing
players, and they can use it to know how many characters will be moving around
on screen.

## Wrapping Up

The full code for the game in this chapter can be found [here](game.ts).  You
will want to look through the code in the `multiplayer-server` folder at the
same time, because there are some close interconnections (especially regarding
what gets turned into JSON, and by whom).

In the code, you'll see that I haven't bothered to make a nice on-screen
keyboard.  Instead, I use `window.prompt` to get data, and `window.alert` to
report data.  This is not a good way to make a visually appealing game, but when
you're debugging, it can make it much easier to figure out what's going wrong.

Once you get the code up and running, you should be able to start the server,
then start three browsers.  When they are open, you can click a different menu
button in each browser.  That will let you create an actor and a room, then
create two more actors that need to be joined to a room.  Finally, by providing
the right addresses and room Id, you should get all three actors working at
once, and as you move an actor in one window, you should see it moving around on
in all three browser.

From there, it would be a good idea to learn about OAuth, so that users can
authenticate correctly.  With good authentication, it's possible to use the
JetLag multiplayer-server to support on-line games, or you might instead decide
to switch to FireBase.  If you switch to FireBase, you'll probably need to make
some edits to JetLag, but they won't be too daunting.  And once your gae is
truly multiplayer-capable, you'll be happy to know that you've created a feature
that will increase your audience and your game's ability to bring people together.
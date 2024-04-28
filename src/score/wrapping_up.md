# Wrapping Up

We've now explored all of the ways that JetLag helps you to manage winning and
losing the levels of a game.  One last thing to keep in mind is that these
mechanisms are all instantaneous and automatic: they all result in the level
*immediately* ending.  If you want a brief animation when the last hero is
defeated, or when some other event leads to the level ending, then you'll need
to work around this limitation.  One option is to use the screenshot feature of
overlays.  Another is to modify JetLag, so that winning and losing call
functions that you provide, instead of immediately ending.  There are other
ways, too... it all depends on what works best for the game you're making.


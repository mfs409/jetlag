## A Design That Uses All Three Kinds Of State

In this tutorial, we're going to build one example mini-game.  In the game, the
hero needs to dodge enemies and collect coins.  The hero can go to the
destination at any time, and when it does, all the coins it collects will get
added to the bank.  Every bundle of five coins will get turned into a ruby.
This creates some interesting storage requirements:

- During gameplay, we'll need to track how many coins have been collected.
  However, if the hero collides with an enemy, those coins will be dropped.
- Coins that don't turn into rubies *do not* get dropped, so they need to be
  tracked somewhere.
- All coins are dropped when the player quits the game
- The game will know if it's the first time it's ever been played, in which case
  it prints a special message.
- The game will also know if it's the first time it's been played *today*, in
  which case it prints a different message.

Here's the game:

<iframe src="./game_01.iframe.html"></iframe>

## What Gets Counted?

JetLag keeps track of many different statistics while your game is being played.
Here are the main things it tracks, along with the names of the functions for
reading them from your code:

- How many heroes have reached destinations?
  `stage.score.getDestinationArrivals()`
- How many enemies have been defeated? `stage.score.getEnemiesDefeated()`
- How many enemies have been created? `stage.score.getEnemiesCreated()`
- How many goodies (of each type) have been collected?
  `stage.score.getGoodieCount(i) // i in (0,1,2,3)`
- How any heroes have been defeated? `stage.score.getHeroesDefeated()`
- How many heroes have been created? `stage.score.getHeroesCreated()`
- How much time is left until the level ends in defeat?
  `stage.score.getLoseCountdownRemaining()`
- How much time is on the stopwatch? `stage.score.getStopwatch()`
- How much time is left until the level ends in victory?
  `stage.score.getWinCountdownRemaining()`

Some of these are, themselves, quite complex.  For example, there are several
ways to defeat an enemy:

- Hero collides with it, hero is invincible
- Hero collides with it, hero strength > enemy damage
- Projectile collides with it, decreases its damage
- Hero jumps on it, it's able to be defeated by jump
- Hero crawls into it, it's able to be defeated by crawl
- You call enemy.defeat() on the enemy, e.g., in an obstacle callback, gesture
  callback, or timer.

JetLag also has several different ways for an event to lead to a level being
won:

- Defeat a specific number of enemies
- Defeat all enemies
- Collect a certain amount of goodies (of each type)
- Have enough heroes reach destinations
- Survive for long enough
- You call score.winLevel()

Finally, there are a few events that lead to a level being lost:

- All heroes are defeated
- A specific, important hero is defeated
- Time runs out
- You call score.loseLevel()

In this tutorial and the next, we'll make several mini-games, and use them to
show each of these behaviors.

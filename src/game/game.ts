import { Actor, BoxBody, CircleBody, FilledBox, FilledCircle, FilledPolygon, GridSystem, Hero, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, PolygonBody, TextSprite, TimedEvent, initializeAndLaunch, stage } from "../jetlag";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
  // Use 16/9 for a game in landscape mode, and 9/16 for a game in portrait mode
  aspectRatio = { width: 16, height: 9 };
  // Make this `false` when you're done debugging your game and are ready to
  // share it with the world.
  hitBoxes = true;
}

/**
 * This function draws the first scene that shows when the game starts.  In this
 * code, it's an interactive world that cannot be won or lost.  After your game
 * starts becoming more polished, you will probably want to use several
 * functions like this one as a way to organize the parts of your game (levels,
 * chooser, welcome screen, store, etc).
 *
 * @param level Which level of the game should be displayed
 */
function builder(_level: number) {

  //Variables
  let energyValue = 100;
  let healthValue = 100;

  // Draw a grid on the screen, to help us think about the positions of actors.
  // Remember that when `hitBoxes` is true, clicking the screen will show
  // coordinates in the developer console.
  //GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 16, y: 9 });


  //Example text HUD screen at top left to show hunger and stuff
  //Energy
  new Actor({
    rigidBody: new CircleBody({ cx: 1.5, cy: 0.5, radius: .01 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 50, color: "#000000" },  () => "Energy: "+energyValue)
  });
  //Health
  new Actor({
    rigidBody: new CircleBody({ cx: 1.5, cy: 1.5, radius: .01 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 50, color: "#000000" },  () => "Health: "+healthValue)
  });




  // Make a "hero" who moves via keyboard control and appears as a circle
  let hero = new Actor({
    appearance: new FilledCircle({ radius: .5, fillColor: "#0008ff", lineWidth: .04, lineColor: "#00ff00" }),
    rigidBody: new CircleBody({ cx: 5, cy: 2, radius: .5 }),
    role: new Hero(),
    movement: new ManualMovement(),
  });
  
  // Make an obstacle that is a rectangle
  let box = new Actor({
    rigidBody: new BoxBody({ cx: 3, cy: 4, width: 1, height: 1 }),
    appearance: new FilledBox({ width: 1, height: 1, fillColor: "#ff0000", lineWidth: .04, lineColor: "#00ff00" }),
    role: new Obstacle({
      heroCollision: (_o: Actor, h: Actor) => {
        if(energyValue < 100)
        energyValue+=20
        if(energyValue>100){
          energyValue=100
        }
      }
    }),
    
  });

  //Timer
  stage.world.timer.addEvent(new TimedEvent(1, true, () => {
    if(energyValue>=5){
    energyValue-=5}

    if(energyValue==0){
      healthValue-=5
    }
  }));

  let box2 = new Actor({
    rigidBody: new BoxBody({ cx: 8, cy: 7, width: 1, height: 1 }),
    appearance: new FilledBox({ width: 1, height: 1, fillColor: "#ff0000", lineWidth: .04, lineColor: "#00ff00" }),
    role: new Obstacle({
      heroCollision: (_o: Actor, h: Actor) => {
        energyValue=0
      }
    }),
    
  });
  

  // Make hospital
  let hospital = new Actor({
    rigidBody: new BoxBody({ cx: 9, cy: 2, width: 1, height: 1 }),
    appearance: new FilledBox({ width: 1, height: 1, fillColor: " #0f810e ", lineWidth: .04, lineColor: "#00ff00" }),
    role: new Obstacle({
      heroCollision: (_o: Actor, h: Actor) => {
        healthValue+=5
        energyValue-=10
        if(healthValue>100){
          healthValue=100
        }
      }
    }),
    
  });

  // Pressing a key will change the hero's velocity
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyUpHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(0));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_UP, () => (hero.movement as ManualMovement).updateYVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_DOWN, () => (hero.movement as ManualMovement).updateYVelocity(5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_LEFT, () => (hero.movement as ManualMovement).updateXVelocity(-5));
  stage.keyboard.setKeyDownHandler(KeyCodes.KEY_RIGHT, () => (hero.movement as ManualMovement).updateXVelocity(5));
}

// call the function that starts running the game in the `game-player` div tag
// of `index.html`
initializeAndLaunch("game-player", new Config(), builder);

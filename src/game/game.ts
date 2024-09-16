import { Actor, ActorPoolSystem, BoxBody, CircleBody, FilledBox, FilledCircle, FilledPolygon, Goodie, GridSystem, Hero, ImageSprite, JetLagGameConfig, KeyCodes, ManualMovement, Obstacle, PolygonBody, Sensor, Sides, TextSprite, TimedEvent, initializeAndLaunch, stage } from "../jetlag";

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

  resources ={
    prefix: "assets/",
    imageNames: ["lehigh_logo.png"]
  };

  
}


class SomethingThatLasts {
   energyValue = 100;
   healthValue = 100;
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
function builder(level: number) {
  let sessionInfo = stage.storage.getSession("sessionInfo") as SomethingThatLasts;
  if (!sessionInfo) {
    stage.storage.setSession("sessionInfo", new SomethingThatLasts());
    sessionInfo = stage.storage.getSession("sessionInfo") as SomethingThatLasts;
  }
  //Toggle Grid System
  GridSystem.makeGrid(stage.world, { x: 0, y: 0 }, { x: 16, y: 9 });

  //Variables
  // Draw a grid on the screen, to help us think about the positions of actors.
  // Remember that when `hitBoxes` is true, clicking the screen will show
  // coordinates in the developer console.


  //Example text HUD screen at top left to show hunger and stuff
  //Energy
  new Actor({
    rigidBody: new CircleBody({ cx: 0, cy: 0, radius: .01 }),
    appearance: new TextSprite({ center: false, face: "Arial", size: 50, color: "#000000" },  () => "Energy: "+sessionInfo.energyValue)
  });
  //Health
  new Actor({
    rigidBody: new CircleBody({ cx: 0, cy: 1, radius: .01 }),
    appearance: new TextSprite({ center: false, face: "Arial", size: 50, color: "#000000" },  () => "Health: "+sessionInfo.healthValue)
  });



  //MAIN AREA SYSTEM
  if(level == 1){
  
  //Test Lehigh Logo
  new Actor({
    rigidBody: new CircleBody({ cx: 0, cy: 0, radius: .01 }),
    appearance: new ImageSprite({width: 1, height: 1, img: "lehigh_logo.png"})
  });

  //Portal to Rathbone
  new Actor({
    appearance: new FilledBox({width: 2, height: 2, fillColor: "#000000" }),
    rigidBody: new BoxBody({  cx: 1, cy: 8, width: 2, height: 2}),
    role: new Sensor({ heroCollision: () => stage.switchTo(builder, 2) })
  });

  //Rathbone Text
  new Actor({
    rigidBody: new CircleBody({ cx: 1, cy: 8, radius: .01 }),
    appearance: new TextSprite({ center: true, face: "Arial", size: 20, color: "#FFFFFF" }, "Rathbone")
  });
}



  // Make a "hero" who moves via keyboard control and appears as a circle
  let hero = new Actor({
    appearance: new FilledBox({width: 1, height: 1, fillColor: "#0008ff", lineWidth: .04, lineColor: "#00ff00" }),
    rigidBody: new BoxBody({ cx: 5, cy: 5, height: 1, width: 1}),
    role: new Hero(),
    movement: new ManualMovement(),
  });
  
  // Make an obstacle that is a rectangle


  //Timer
  stage.world.timer.addEvent(new TimedEvent(1, true, () => {
    if(sessionInfo.energyValue>=5){
      sessionInfo.energyValue-=5}

    if(sessionInfo.energyValue==0){
      sessionInfo.healthValue-=5
    }
  }));


 
  //RATHBONE LEVEL FOOD SYSTEM
  if(level == 2)
    {
  function createGoodie(){
    new Actor({
      appearance: new FilledCircle({ radius: 0.5, fillColor: "#FF0000" }),
      rigidBody: new CircleBody({ cx: Math.floor((Math.random() * 13)+3), cy: Math.floor((Math.random() * 9)+1), radius: 0.4 }),
      role: new Goodie({
        onCollect: () => {
          sessionInfo.energyValue += 10;
          if(sessionInfo.energyValue>100){
            sessionInfo.energyValue = 100;
          }
          createGoodie();
          return true;
        }
      })
    });}
    createGoodie();
    //PORTAL BACK TO MAIN AREA
    new Actor({
      appearance: new FilledBox({width: 2, height: 2, fillColor: "#000000" }),
      rigidBody: new BoxBody({ cx: 1, cy: 8, width: 2, height: 2}),
      role: new Sensor({ heroCollision: () => stage.switchTo(builder, 1) })
    });
    //PORTAL TEXT
    new Actor({
      rigidBody: new CircleBody({ cx: 1, cy: 8, radius: .01 }),
      appearance: new TextSprite({ center: true, face: "Arial", size: 20, color: "#FFFFFF" }, "Main Area")
    });
  }
  
  

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


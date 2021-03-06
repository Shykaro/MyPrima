namespace Script {
  import ƒ = FudgeCore;

  interface Config {
    [key: string]: number | string | Config;
  }

  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;

  window.addEventListener("load", init);

  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start); //HAD TO MAKE THIS UNKNOWN BECAUSE START IS NOW ASYNC

  export let viewport: ƒ.Viewport;
  let sounds: ƒ.ComponentAudio[]; //outdated? i need it for later
  let gameState: GameState;
  let config: Config;

  let water: ƒ.Node[];    //Blocks that cant be set foot on with normal units - Beinhaltet jeden Wasserblock in einem Array gespeichert
  export let paths: ƒ.Node[];    //Building/Land are, every unit can walk on these - beinhaltet jeden begehbaren block in einem Array gespeichert
  let cat: ƒ.Node;
  export let catPH: ƒ.Node;
  let catThrow: ƒ.Node;
  export let catThrowPH: ƒ.Node;
  let catWin: ƒ.Node;
  export let catWinPH: ƒ.Node;
  export let cityNode: City[] = [];   //City = new ƒ.Node("CityP2");
  export let cityNodeP2: CityP2[] = []; //City = new ƒ.Node("CityP2");

  export let leftRightCoordination = 0;
  export let throwBoolean: Boolean = false;
  export let wonBoolean: Boolean = false;

  export let mobsAnzPlayer1: number = 0; //Ist die länge von beiden Arrays des Spielers zusammen
  export let mobsAnzPlayer2: number = 0; //Ist die länge von beiden Arrays des Spielers zusammen

  let mobsAny: any[] = [];

  let mobsP2Any: any[] = [];

  let anzMine: number = 0;
  let anzMineP2: number = 0;



  // Balancing Field ############################################################################
  let costMob: number = 14;   //Kosten für eine normale Einheit, NEEDED TO ADJUST PRICES
  //let costMob2: number = 26;  //Kosten für eine stärkere Einheit

  let costMineBuild: number = 10; //Kosten um eine Mine in der Stadt zu bauen, welche extra Gold generiert
  let goldMineOutput: number = 5; //Zusätzlicher Gold output einer Mine pro Runde

  let goldGain: number = 10;          //Geld die jeder Spieler am Anfang seines Zuges bekommt ##Adjustable for balancing,  //Das stimmt NICHTMEHR-> beachte dass für den Start des Spiels jeder Spieler einmal den Goldgain erhält
  let gold: number = costMob + 0;     //StartGeld für Spieler 1 PLUS costMob weil die Unit am anfang verschenkt wird!!
  let goldP2: number = costMob + 0;   //StartGeld für Spieler 2

  export let healthUnitSmall: number = 10;
  export let healthUnitBig: number = 20;

  export let dmgUnitSmall: number = 5;
  export let dmgUnitBig: number = 10;

  let turnsNeededForCaptureP1: number = 5; //Turns needed to capture the enemy city with a troop ontop of it. -> currently the wincondition (WATCH OUT THAT ENEMY CANT PRODUCE UNITS WHILE A UNIT STANDS ON THIS FIELD)
  let turnsNeededForCaptureP2: number = 5; //Turns needed to capture the enemy city with a troop ontop of it. -> currently the wincondition (WATCH OUT THAT ENEMY CANT PRODUCE UNITS WHILE A UNIT STANDS ON THIS FIELD)

  let mobBuyLimit: number = 1;  //Adjust this number if players should be able to buy more than 1 unit per turn.
  //Balancing Field End ############################################################################

  let score: number = 0 - costMob; //Needs adjust for free first unit
  let scoreP2: number = 0 - costMob; //Needs adjust for free first unit

  let turnPhaseOne = "Bewege deine Einheiten, drücke Enter zum Bestätigen der Position.";
  let turnPhaseTwo = "Produziere Truppen oder rüste deine Stadt auf, drücke Enter zum fortfahren.";
  let turnPhaseWinP1 = "Spieler 1 hat gewonnen! Drücke Enter zum neustarten.";
  let turnPhaseWinP2 = "Spieler 2 hat gewonnen! Drücke Enter zum neustarten.";
  let turnPhaseEnd = "Das Spiel ist zu Ende, drücke Enter zum reloaden!";

  let zwischenSpeicherCoordinateLRC: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);    //LRC = LimitReachCheck, used in checking that unit can only work one field from origin.
  let zwischenSpeicherCoordinateLRCP2: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

  let possibleLimitReachedCheckX: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckY: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckXMinus: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckYMinus: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckStay: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

  let possibleLimitReachedCheckXP2: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckYP2: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckXMinusP2: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckYMinusP2: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let possibleLimitReachedCheckStayP2: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);


  export let currentplayer: number = 1; //distinguishes between player 1 and 2 and also who starts!! //1 and 2 are PC's, 3 are the Bots and 0 is Standby
  let currentPhase: number = 1; //Distinguishes between phase 1 (placing troops, which might as well be different phases all together) and phase 2 (choosing cities to produce troops)
  let i = 0;
  let roundsPlayed: number = 0; //if console logged shows round passed (keep in mind that it should be used -2 since the game starts in turn 3)
  let addMobLimitCounter: number = mobBuyLimit; //limits how many units per round can be bought for P1. -> adjust mobBuyLimit to change this
  let addMobLimitCounterP2: number = mobBuyLimit; //limits how many units per round can be bought for P2. -> adjust mobBuyLimit to change this
  export let currentUnitNumber: number = 0; //taken in account to cycle through the units to move them, used in Mob.move function
  export let currentUnitNumberP2: number = 0; //taken in account to cycle through the units to move them, used in Mob.move function
  export let iLimitSpaceToOne: number = 0; //does the same as iMove, just only for the Space Enter Mob/Unit switch.
  export let finishedMobPlacement: Boolean = false; //If false, says youre able to move the unit, true says its done.
  export let movingDirection: string = "y";

  export let movement: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0); //outdated? yes
  export let iMoveY: number = 0;            //Necessary global variables to limit user to one move per time. ALLE OBSOLET.
  export let iMoveYMinus: number = 0;       //outdated? yes
  export let iMoveX: number = 0;            //outdated? yes
  export let iMoveXMinus: number = 0;

  let hasFirstUnitBeenKilledP1: boolean = false;
  let hasFirstUnitBeenKilledP2: boolean = false;

  //------------ TO-DO'S -------------------------------------------------------------------
  // Bugfixing (Known: first unit of enemy gets beaten, UI doesnt refresh current units, man sollte keine 10te unit kaufen können) DONE, DONE, DONE
  // VUI anpassen DONE
  // Email schreiben DONE
  // Startup menü verändern -> controlls beinhalten DONE
  // 
  // ++ DONE adding all the requirements is more important
  // ++ DONE Eventsystem angucken, kp wie das funktioniert -> Das wird Jirka mögen
  // ++ DONE Physics zur Erlebnissteigerung einfügen
  // ++ DONE State machine
  // ++ DONE External Data via Highscore -> Punkte integrieren, oder züge bis zum win -> BRAUCHT WINCONDITION, EXTERNAL DATA AUF BALANCE SHEET ABÄNDERN -> did a balance json sheet which gets loaded.
  // ++ DONE Start implementing different rounds in a players turn -> unit moving -> unit producing -> playerswap
  // ++ DONE Add Gold mechanic -> expand with buying upgrades and getting gold from defeating units -> Defeating Units is Missing.
  // ++ DONE ARRAY KANN NUN MIT GESTORBENER EINHEIT AUF NULL GEHEN -> ausweichtregelung finden! bzw umgehen
  // ++ DONE ein fking UI <-- Important, less complexity, machen sobald ich kb auf programming aber Zeit habe.
  // ++ DONE Start on Unit to unit intercation ?? How do they interact, do they have HP or other Stats? -> Do another spawn RANDOM button for enemy units, let every unit move by one and automatically change side when everyone moved/interacted.
  // ++ DONE Unit should only be able to walk 1 field from starting position, maybe test with random spawnfields for Unit +1 button.
  // ++ DONE but maybe needs rework ++ Graphics, like terrain and Units
  // -- CANCELED Implement light to use as viewing distance, dont know how this works -> did spotlight instead
  // -- CANCELED work on Networking this gon be fun, should try this -> aint working
  // -- CANCELED at least for Abgabe canceled, will das immernoch danach machen: "Random Map generator -> yea fuck that"
  //------------ TO-DO'S End ---------------------------------------------------------------

  //------------ Notizen ------------------------------------------------------------------- FOR FUTURE
  // BUGFIX: wenn erste einheit des Arrays getötet wird rutscht es nicht nach wenn der andere Spieler dran ist.
  // Do random maps as external data save and load. -> needs random maps and that takes too much time, maybe at the end
  // Definitly should do an VUI update Function instead mentioning everything every time...
  //
  // Ui Zeigt leben der Einheiten wenn diese nicht onehit sterben sollten.
  // Physik einbauen indem man kästchen rumschiebt -> geht nicht wegen tp-ing, eher konfetti oder so einbauen am beginn oder ende der runde
  // SPÄTERES BUG PROBLEM: Unit spawnen während gegnerische einheit auf dem Cityfield steht. -> Unitinteraction nur möglich wenn einheit gemoved wird!!
  //------------ Notizen End ---------------------------------------------------------------


  function init(_event: Event): void {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event: Event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
      startInteractiveViewport();
    });
    // @ts-ignore
    dialog.showModal();
  }

  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", ƒ.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = ƒ.Project.resources["Graph|2022-03-17T14:08:08.737Z|08207"] as ƒ.Graph;
    ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert(
        "Nothing to render. Create a graph with at least a mesh, material and probably some light"
      );
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒ.Debug.log("Viewport:", viewport);

    await loadSprites();

    viewport.draw();
    canvas.dispatchEvent(
      new CustomEvent("interactiveViewportStarted", {
        bubbles: true,
        detail: viewport,
      })
    );
  }

  async function loadJSON() { //Load balance json external data
    let costOfMobs: Response = await fetch("./Assets/balancesheet.json");
    Balance.costOfMobs = (await costOfMobs.json()).costOfMobs;
  }

  async function start(_event: CustomEvent) { //Was beim Start initialisiert werden soll
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(5, 2.5, 15));
    viewport.camera.mtxPivot.rotateY(180)

    gameState = new GameState();
    let response: Response = await fetch("config.json");
    config = await response.json();
    console.log(config);
    //FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    const graph: ƒ.Node = viewport.getBranch();
    await loadJSON(); //gets balance adjustements.

    document.getElementById("--plusmob").innerHTML = "Cost: " + Balance.costOfMobs[0].cost;
    document.getElementById("--plusmob2").innerHTML = "Cost: " + Balance.costOfMobs[1].cost;
    document.getElementById("--plusmobP2").innerHTML = "Cost: " + Balance.costOfMobs[0].cost;
    document.getElementById("--plusmob2P2").innerHTML = "Cost: " + Balance.costOfMobs[1].cost;
    document.getElementById("--plusMine").innerHTML = "Cost: " + costMineBuild;
    document.getElementById("--plusMineP2").innerHTML = "Cost: " + costMineBuild;

    document.getElementById("--highscore").setAttribute('value', localStorage.getItem('highscore'));
    if (localStorage.getItem('highscore') === null) {
      let x: number = 0;
      document.getElementById("--highscore").setAttribute('value', x.toString());
    };

    document.getElementById("--score_player_one").setAttribute('value', score.toString());
    document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());

    ƒ.AudioManager.default.listenTo(graph);

    sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
    sounds[0].play(true);
    //sounds[3].play(true); //MUSIC CRAZY
    sounds[4].play(true); //MUSIC Funky

    water = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
    paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();
    cat = graph.getChildrenByName("StateMachine")[0];
    setSpriteCat(cat); //NEEDS TO HAPPEN BEFORE CATTHROW ASKS FOR THE CHILDREN BECAUSE OTHERWISE IT DOESNT EXIST YET
    catThrow = graph.getChildrenByName("StateMachine")[0]; //("cat")[0];
    setSpriteCatThrow(catThrow);
    catWin = graph.getChildrenByName("StateMachine")[0]; //("cat")[0];
    setSpriteCatWin(catWin);

    //Needed to directly swap between sprites
    catPH = cat.getChildrenByName("SpriteCat")[0];
    catThrowPH = catThrow.getChildrenByName("SpriteCatThrow")[0];
    catThrowPH.activate(false);
    catWinPH = catWin.getChildrenByName("SpriteCatWin")[0];
    catWinPH.activate(false); //Hides the other sprites on the same Branch

    document.getElementById("vui").style.visibility = 'visible';  //Vui einschalten
    document.getElementById("--addMob").style.display = 'none';   //Mob menü ausschalten
    document.getElementById("--addMobP2").style.display = 'none'; //Mob menü ausschalten
    document.getElementById("--addBuildings").style.display = 'none';   //Mob menü ausschalten
    document.getElementById("--addBuildingsP2").style.display = 'none'; //Mob menü ausschalten

    const city = new City("City");
    const cityP2 = new CityP2("CityP2");

    //const city2 = new City("City");
    //const city2P2 = new CityP2("CityP2");

    cityNode.push(city); //if multiple cities p1
    cityNodeP2.push(cityP2); //if multiple cities p2

    //cityNode.push(city2);
    //cityNodeP2.push(city2P2);


    //Positions of starting Cities
    paths[15].addChild(city);
    paths[34].addChild(cityP2); //16

    //console.log(graph.getChildrenByName("Grid")[0].getChildrenByName("Path")[0].getChild(15).getChildrenByName("City")[0]); //adjust x from getChild(x) to paths[x].addChild(city) and CityP2!! 

    //paths[1].addChild(city2);
    //paths[2].addChild(city2P2);

    //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
    for (let i = 1; i < 10; i++) { //goes through all 9 possible Units
      for (let ii = 1; ii < 5; ii++) { //goes through all 4 possible unit variations
        //console.log("--" + i + "img" + ii)
        document.getElementById("--" + i + "img" + ii).style.display = 'none';
      }
    };

    //Admin  Menu -------------------------------------------------------------------- ->>>>> Repurposed with -- to normal city troop adding!!
    document.getElementById("--plusmob").addEventListener("click", () => {
      creatingMob(1, graph, city, cityP2);
    })
    document.getElementById("--plusmob2").addEventListener("click", () => {
      creatingMob(2, graph, city, cityP2);
    })
    document.getElementById("--plusmobP2").addEventListener("click", () => {
      creatingMob(3, graph, city, cityP2);
    })
    document.getElementById("--plusmob2P2").addEventListener("click", () => {
      creatingMob(4, graph, city, cityP2);
    })
    document.getElementById("--plusMine").addEventListener("click", () => {
      creatingBuildings();
    })
    document.getElementById("--plusMineP2").addEventListener("click", () => {
      creatingBuildings();
    })

    document.getElementById("changePlayer").addEventListener("click", () => {
      if (currentplayer === 1) {
        currentplayer = 2;
      }
      else {
        currentplayer = 1;
      }
      console.log("Current turn player is now: " + currentplayer) //CHANGE THIS GLEICH SOFORT});
      document.getElementById("currentPlayer").setAttribute('value', currentplayer.toString())
    })
    //Admin Menu End ------------------------------------------------------------------

    graph.addEventListener("playSpawnSound", hndPlaySpawnSound);

    changeUnit(graph); //Funktion zum bewegen einer Unit in Main.ts

    water.forEach(function (item, index) { //Loop for all water tiles
      setSprite(water[index]);
    });

    paths.forEach(function (item, index) { //Loop for all paths tiles
      setSpritePaths(paths[index]);
    });

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a

    initAnim(graph);

    //gebe den Spielern ihre Start-sachen --------------------------------------------------------------------
    creatingMob(1, graph, city, cityP2); //Gibt eine mob - unit zu Stadt von Spieler1
    creatingMob(3, graph, city, cityP2); //Gibt eine mobP2 - unit zu Stadt von Spieler2
    //skips 2 turns, so players have start gold and some Bugs are shoved away lol 
    unitInteraction(graph);
    logInUnit();
    handleEndOfCityProcedure(currentUnitNumber, 2);
    unitInteraction(graph);
    logInUnitP2();
    handleEndOfCityProcedure(currentUnitNumber, 1);
    console.log("Health of p1 unit: " + mobsAny[0].health);
    //Ende start items ---------------------------------------------------------------------------------------

  } //ENDKLAMMER FÜR START FUNKTION -------------------------------------------------------------------------------------


  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used

    //document.getElementById("--goldInput").setAttribute('value', gold.toString());
    //document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());

    //mobsAny.map((g) => g.move()); //g.move(paths));
    //mobsAny.map((g) => g.move()); //g.move(paths));
    //mobsP2Any.map((g) => g.move()); //g.move(paths));
    //mobsP2Any.map((g) => g.move()); //g.move(paths));
    gameState.roundTimer -= <number>config["drain"];

    viewport.draw();

    if (addMobLimitCounter == 0) {
      document.getElementById("--plusmob").setAttribute('disabled', "");
      document.getElementById("--plusmob2").setAttribute('disabled', "");
    }
    if (addMobLimitCounterP2 == 0) {
      document.getElementById("--plusmobP2").setAttribute('disabled', "");
      document.getElementById("--plusmob2P2").setAttribute('disabled', "");

    }
    if (addMobLimitCounter > 0) {
      document.getElementById("--plusmob").removeAttribute('disabled');
      document.getElementById("--plusmob2").removeAttribute('disabled');
    }
    if (addMobLimitCounterP2 > 0) {
      document.getElementById("--plusmobP2").removeAttribute('disabled');
      document.getElementById("--plusmob2P2").removeAttribute('disabled');
    }
    if (currentplayer === 0) {
      document.getElementById("--headingInfo").setAttribute('value', turnPhaseEnd);
    }
  }

  /*if(currentplayer === 1){
    document.getElementById("--infoBuiltMines").setAttribute('value', anzMine.toString());
  }
  if(currentplayer === 2){
    document.getElementById("--infoBuiltMines").setAttribute('value', anzMineP2.toString());
  }*/


  // ------------- Moving Mob abteil für beide Spieler ---------------------------------------------------
  function changeUnit(graph: ƒ.Node): void { //Is used to track current unit and change values accordingly -> NOT ANYMORE
    document.addEventListener('keydown', (event) => {
      //console.log(graph.getChildrenByName);
      var name = event.key;

      console.log("Current phase: " + currentPhase);

      if (currentplayer === 0) { //STANDBY END OF GAME PROCEDURE
        if (name === 'Space' || name === 'Enter') {
          const balls: ƒ.Node = graph.getChildrenByName("Physics")[0].getChildrenByName("Balls")[0];
          balls.activate(true);
          sounds[5].play(true);
          if (score >= scoreP2) { }
          window.localStorage.setItem("highscore", score.toString());
        }
        else {
          window.localStorage.setItem("highscore", scoreP2.toString());
        }
        setTimeout(() => {
          location.reload();
        }, 5000);
      }


      if (currentplayer === 1) {
        //if (mobsAny.length > 0)
        if (currentPhase === 1) { //&& mobsAny.length > 0) {
          if (mobsAny.length > 0) {
            if(hasFirstUnitBeenKilledP2){ //Fixes first unit kill bug
              getPossibleLimitReachedCheck();
              hasFirstUnitBeenKilledP2 = false;
            }
            //console.log(mobs[currentUnitNumber].mtxLocal + " and " + currentUnitNumber);


            if (name === 'd' || name === 'ArrowRight') {
              //currentMobPosition = new ƒ.Vector3(mobs[currentUnitNumber].mtxLocal.translation.x, mobs[currentUnitNumber].mtxLocal.translation.y, 0);

              if (checkIfMoveMob("x")) {


                mobsAny[currentUnitNumber].mtxLocal.translateX(1);
                //console.log("trying to move right");

              }
            }
            if (name === 'a' || name === 'ArrowLeft') {

              if (checkIfMoveMob("-x")) {
                mobsAny[currentUnitNumber].mtxLocal.translateX(-1);
                //console.log("trying to move Left");

              }
            }
            if (name === 'w' || name === 'ArrowUp') {

              if (checkIfMoveMob("y")) {
                mobsAny[currentUnitNumber].mtxLocal.translateY(1);
                //console.log("trying to move up");

              }
            }
            if (name === 's' || name === 'ArrowDown') {

              if (checkIfMoveMob("-y")) {
                mobsAny[currentUnitNumber].mtxLocal.translateY(-1);
                //console.log("trying to move down");

              }
            }
            if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
              if (currentplayer === 1) {
                //if(mobsAny.length === 0){
                  //zwischenSpeicherCoordinateLRCP2.set(((mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x)), mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y, 0);
                //  checkIfMoveMob("y");
                //}
                console.log("Length??: " + mobsAny.length);
                if(mobsAny.length > 0){
                sounds[2].play(true);
                unitInteraction(graph); //UNIT INTERACTION HERE
                //currentPhase = 2;
                logInUnit(); //also end of turn 1 procedure if its not the last unit.
                //logInUnitP2();
                }
              }
              return;
            }
          }
          else {
            handleCityTurnPart(); //WEIRD INTERACTION
            currentPhase = 2;
            return;
          }
        }
        if (currentPhase === 2) { //Shuts down the other key down events, initiates or gives time for phase 2
          if (name === 'Space' || name === 'Enter') {


            handleEndOfCityProcedure(currentUnitNumber, 2); //Wechselt zu zweitem angegebenen Parameter, aka current player wechselt nun zu 2
            gameState.roundTimer = 1;
            //ENDING OF PLAYER 1 PHASE 2
            return;
          }
        }
      }

      if (currentplayer === 2) {
        if (currentPhase === 1) { //&& mobsP2Any.length > 0) {
          
          if (mobsP2Any.length > 0) {
            if(hasFirstUnitBeenKilledP1){ //Fixes first unit kill bug
              getPossibleLimitReachedCheckP2();
              hasFirstUnitBeenKilledP1 = false;
            }
            if (name === 'd' || name === 'ArrowRight') {
              if (checkIfMoveMobP2("x")) {
                mobsP2Any[currentUnitNumberP2].mtxLocal.translateX(1);
                //console.log("trying to move right");
              }
            }
            if (name === 'a' || name === 'ArrowLeft') {
              if (checkIfMoveMobP2("-x")) {
                mobsP2Any[currentUnitNumberP2].mtxLocal.translateX(-1);
                //console.log("trying to move Left");
              }
            }
            if (name === 'w' || name === 'ArrowUp') {
              if (checkIfMoveMobP2("y")) {
                mobsP2Any[currentUnitNumberP2].mtxLocal.translateY(1);
                //console.log("trying to move up");
              }
            }
            if (name === 's' || name === 'ArrowDown') {
              if (checkIfMoveMobP2("-y")) {
                mobsP2Any[currentUnitNumberP2].mtxLocal.translateY(-1);
                //console.log("trying to move down");
              }
            }
            if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
              if (currentplayer === 2) {
                //if(mobsP2Any.length === 0){
                //  zwischenSpeicherCoordinateLRC.set(((mobsAny[currentUnitNumber].mtxLocal.translation.x)), mobsAny[currentUnitNumber].mtxLocal.translation.y, 0);
                //checkIfMoveMobP2("y");
                //}
                console.log("Length??: " + mobsP2Any.length);

                if(mobsP2Any.length > 0){
                sounds[2].play(true);
                //currentPhase = 2;
                unitInteraction(graph); //UNIT INTERACTION HERE
                logInUnitP2() //also end of turn procedure if its not the last unit.
                //logInUnit();
              }
              }

              return;
            }
          }
          else {
            //unitInteraction(graph); //UNIT INTERACTION HERE
            //logInUnitP2();
            //
            handleCityTurnPartP2()
            currentPhase = 2;
            return;
          }
        }
        if (currentPhase === 2) {
          if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
            handleEndOfCityProcedure(currentUnitNumberP2, 1); //Wechselt zu zweitem angegebenen Parameter, aka current player wechselt nun zu 1
            gameState.roundTimer = 1;
            //handleNPCAction();
            //ENDING OF PLAYER 2 PHASE 2
            return;
          }
        }
      }
    })
  }

  // ------------- Check Moving Mob abteil Anfang für Spieler 1 ---------------------------------------------------
  export function checkIfMoveMob(_direction?: string): boolean { //checks which directions the CURRENTUNITNUMBER can go, called in changeUnit()


    const y: number = mobsAny[currentUnitNumber].mtxLocal.translation.y;
    const x: number = mobsAny[currentUnitNumber].mtxLocal.translation.x;
    let newPosition: ƒ.Vector3;

    switch (_direction ?? movingDirection) {
      case "x":
        newPosition = new ƒ.Vector3(x + 1, y, 0);
        zwischenSpeicherCoordinateLRC.set(((mobsAny[currentUnitNumber].mtxLocal.translation.x) + 1), mobsAny[currentUnitNumber].mtxLocal.translation.y, 0);
        break;
      case "-x":
        newPosition = new ƒ.Vector3(x - 1, y, 0);
        zwischenSpeicherCoordinateLRC.set(((mobsAny[currentUnitNumber].mtxLocal.translation.x) - 1), mobsAny[currentUnitNumber].mtxLocal.translation.y, 0);
        break;
      case "y":
        newPosition = new ƒ.Vector3(x, y + 1, 0);
        zwischenSpeicherCoordinateLRC.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, ((mobsAny[currentUnitNumber].mtxLocal.translation.y) + 1), 0);
        break;
      case "-y":
        newPosition = new ƒ.Vector3(x, y - 1, 0);
        zwischenSpeicherCoordinateLRC.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, ((mobsAny[currentUnitNumber].mtxLocal.translation.y) - 1), 0);
        break;

      default:
        break;
    }

    const wall: ƒ.Node = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0));

    if (wall) {
      //sounds[1].play(false);
      return false;
    }

    const path: ƒ.Node = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 0));

    if (!path) {
      //sounds[1].play(false);
      return false;
    }

    //console.log("x: " + x + " y: " + y);

    if (zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckStay) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckX)
      || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckY) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckXMinus) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckYMinus)) {
      //unitPositionPlaceholder.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0); //USED FOR UNIT INTERACTION to get position before it is moved
      return true;
    }
    else {
      return false; //Changed this to false since only if mob still in allowed grid it is allowed to move -> allowed to return true
    }
  }
  // ------------- Check Moving Mob abteil END für Spieler 1 ---------------------------------------------------


  // ------------- Check Moving Mob abteil Anfang für Spieler 2 ---------------------------------------------------
  export function checkIfMoveMobP2(_direction?: string): boolean { //checks which directions the CURRENTUNITNUMBER can go, called in changeUnit()
    const y: number = mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y;
    const x: number = mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x;
    let newPosition: ƒ.Vector3;

    switch (_direction ?? movingDirection) {
      case "x":
        newPosition = new ƒ.Vector3(x + 1, y, 0);
        zwischenSpeicherCoordinateLRCP2.set(((mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x) + 1), mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y, 0);
        break;
      case "-x":
        newPosition = new ƒ.Vector3(x - 1, y, 0);
        zwischenSpeicherCoordinateLRCP2.set(((mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x) - 1), mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y, 0);
        break;
      case "y":
        newPosition = new ƒ.Vector3(x, y + 1, 0);
        zwischenSpeicherCoordinateLRCP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x, ((mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y) + 1), 0);
        break;
      case "-y":
        newPosition = new ƒ.Vector3(x, y - 1, 0);
        zwischenSpeicherCoordinateLRCP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x, ((mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y) - 1), 0);
        break;

      default:
        break;
    }

    const wall: ƒ.Node = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0));

    if (wall) {
      //sounds[1].play(false);
      return false;
    }

    const path: ƒ.Node = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 0));

    if (!path) {
      //sounds[1].play(false);
      return false;
    }

    if (zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckStayP2) || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckXP2)
      || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckYP2) || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckXMinusP2) || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckYMinusP2)) {
      //unitPositionPlaceholder.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0); //USED FOR UNIT INTERACTION to get position before it is moved
      return true; //WENN zwischenSpeicher sagt er läuft auf ein feld zu dass aus den possibleLimitReachedCheck feldERN drüber hinausgeht, wirft es return false anstatt true.
    }
    else {
      return false; //Changed this to false since only if mob still in allowed grid it is allowed to move -> allowed to return true
    }
  }
  // ------------- Moving Mob abteil END PLAYER 2 ---------------------------------------------------

  // ------------- Handle END TURN abteil Anfang für Spieler 1 ---------------------------------------------------
  function logInUnit(): void {
    if ((currentUnitNumber + 1) === mobsAny.length) {
      document.getElementById("--headingInfo").setAttribute('value', turnPhaseTwo);
      roundsPlayed++

      if (roundsPlayed > 2) {
        currentPhase = 2;
      }


      handleCityTurnPart();
      //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 1 -> moved all pieces ####################################################################
      //currentplayer = 2;
      //document.getElementById("--unitdiv1P2").style.borderColor = "red";
      document.getElementById("--unitdiv" + (currentUnitNumber + 1)).style.borderColor = "#048836";
      currentUnitNumber = 0;
      getPossibleLimitReachedCheck();
      //handleUiPlayerswap();

      console.log("turnplayer is now: " + currentplayer);
      //console.log("turnphase is now: " + currentPhase);

      return;
    }
    else {
      currentUnitNumber++;
      getPossibleLimitReachedCheck();
      
      document.getElementById("--unitdiv" + (currentUnitNumber + 1)).style.borderColor = "red"; //--unitdiv1P2 für spieler 2
      document.getElementById("--unitdiv" + currentUnitNumber).style.borderColor = "#048836";
      //console.log(currentUnitNumber + " setze diese zahl auf grün");
      return;
    }
  }
  // ------------- Handle END TURN abteil END für Spieler 1 ---------------------------------------------------

  // ------------- Handle END TURN abteil Anfang für Spieler 2 ---------------------------------------------------
  function logInUnitP2(): void {
    document.getElementById("--headingInfo").setAttribute('value', turnPhaseTwo);
    if ((currentUnitNumberP2 + 1) === mobsP2Any.length) { //############### mögliche Bugstelle, ij
      roundsPlayed++
      if (roundsPlayed > 2) {
        currentPhase = 2;
      }

      handleCityTurnPartP2();

      //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 2 -> moved all pieces #################################################################################
      //currentplayer = 1;
      //document.getElementById("--unitdiv1").style.borderColor = "red";
      document.getElementById("--unitdiv" + (currentUnitNumberP2 + 1) + "P2").style.borderColor = "#048836";
      //console.log("LRCStay before Unit count: " + possibleLimitReachedCheckStayP2);
      currentUnitNumberP2 = 0;
      getPossibleLimitReachedCheckP2();
      //console.log("LRCStay after Unit count: " + possibleLimitReachedCheckStayP2);

      //handleUiPlayerswap();

      console.log("turnplayer is now: " + currentplayer);
      //console.log("turnphase is now: " + currentPhase);
      return;
    }
    else {
      //console.log("LRCStay before Unit count: " + possibleLimitReachedCheckStayP2);
      currentUnitNumberP2++;
      getPossibleLimitReachedCheckP2();
      
      //console.log("LRCStay after Unit count: " + possibleLimitReachedCheckStayP2);
      document.getElementById("--unitdiv" + (currentUnitNumberP2 + 1) + "P2").style.borderColor = "red"; //--unitdiv1P2 für spieler 2
      document.getElementById("--unitdiv" + currentUnitNumberP2 + "P2").style.borderColor = "#048836";
      return;
    }
  }
  // ------------- Handle END TURN abteil END für Spieler 2 ---------------------------------------------------

  function getPossibleLimitReachedCheck(){
    possibleLimitReachedCheckX.set(mobsAny[currentUnitNumber].mtxLocal.translation.x + 1, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0);
    possibleLimitReachedCheckY.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y + 1, 0);
    possibleLimitReachedCheckXMinus.set(mobsAny[currentUnitNumber].mtxLocal.translation.x - 1, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0);
    possibleLimitReachedCheckYMinus.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y - 1, 0);
    possibleLimitReachedCheckStay.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0);
    return;
  }


  function getPossibleLimitReachedCheckP2() {
    possibleLimitReachedCheckXP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x + 1, mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y, 0);
    possibleLimitReachedCheckYP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y + 1, 0);
    possibleLimitReachedCheckXMinusP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x - 1, mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y, 0);
    possibleLimitReachedCheckYMinusP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y - 1, 0);
    possibleLimitReachedCheckStayP2.set(mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y, 0);
    return;
  }

  function handleUiPlayerswap(): void { //Handles player 1 and 2 UI changes when swapping.
    //console.log(currentplayer + "<- current player -> should be 1 and also gold for p1: " + gold + " p2 gold: " + goldP2);

    if (currentplayer === 1) {
      //console.log(currentplayer + "<- current player and also gold for p1: " + gold);

      //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
      for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops invisible
        document.getElementById("--unitdiv" + i + "P2").style.display = 'none';
      }
      for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops visible
        document.getElementById("--unitdiv" + i).style.display = null;
      }
    }
    else {

      //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
      for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops invisible
        document.getElementById("--unitdiv" + i).style.display = 'none';
      }
      for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops visible
        document.getElementById("--unitdiv" + i + "P2").style.display = null;
      }
    };
  }

  // ------------- Creating Mobs, both player ---------------------------------------------------
  function creatingMob(whichUnit: number, graph: ƒ.Node, city: City, cityP2: City): void {  //1=mobs, 2=mobs2, 3=mobsP2, 4=mobs2P2 für "whichUnit" ---- Benötigt graph, city und cityP2 da diese nicht Global sein können.
    if (whichUnit === 1) {
      if ((mobsAny.length) < 9) {
        if (addMobLimitCounter > 0) {
          if (gold >= Balance.costOfMobs[0].cost) {
            gold -= Balance.costOfMobs[0].cost;
            score += Balance.costOfMobs[0].cost;
            document.getElementById("--score_player_one").setAttribute('value', score.toString());
            document.getElementById("--goldInput").setAttribute('value', gold.toString());
            addMobLimitCounter--
            i++
            console.log("Gesamte anzahl an Units: Mob" + i)
            const mob = new Mob("Mob" + i);
            let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
            //console.log(cityPosition)
            //mob.mtxLocal.translate(new ƒ.Vector3(4, 3, 0));
            mob.mtxLocal.translate(cityPosition);
            graph.addChild(mob);
            mobsAny.push(mob);
            mob.spawn();
            for (let iCounter = 0; iCounter < mobsAny.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
              if (iCounter === mobsAny.length) {
                document.getElementById("--" + mobsAny.length + "img1").style.display = null;
                document.getElementById("--" + mobsAny.length + "Filler").style.display = 'none';
              };
            };
          };
        };
      }
    }
    if (whichUnit === 2) {
      if ((mobsAny.length) < 9) {
        if (addMobLimitCounter > 0) {
          if (gold >= Balance.costOfMobs[1].cost) {
            gold -= Balance.costOfMobs[1].cost;
            score += Balance.costOfMobs[1].cost;
            document.getElementById("--score_player_one").setAttribute('value', score.toString());
            document.getElementById("--goldInput").setAttribute('value', gold.toString());
            addMobLimitCounter--
            i++
            console.log("Gesamte anzahl an Units: Mob" + i)
            const mob2 = new Mob2("Mob2" + i);
            let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
            mob2.mtxLocal.translate(cityPosition);
            graph.addChild(mob2);
            mobsAny.push(mob2);
            mob2.spawn();
            for (let iCounter = 0; iCounter < mobsAny.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
              if (iCounter === mobsAny.length) {
                document.getElementById("--" + mobsAny.length + "img3").style.display = null;
                document.getElementById("--" + mobsAny.length + "Filler").style.display = 'none';
                //console.log("--" + i + "img3")
              };
            };
          };
        };
      }
    }
    if (whichUnit === 3) {
      if (mobsP2Any.length < 9) {
        if (addMobLimitCounterP2 > 0) {
          if (goldP2 >= Balance.costOfMobs[0].cost) {
            goldP2 -= Balance.costOfMobs[0].cost;
            scoreP2 += Balance.costOfMobs[0].cost;
            document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
            document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
            addMobLimitCounterP2--
            i++
            console.log("Gesamte anzahl an Units: Mob" + i)
            const mobP2 = new MobP2("MobP2" + i);
            mobP2.spawn();
            let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
            mobP2.mtxLocal.translate(cityPosition);
            graph.addChild(mobP2);
            mobsP2Any.push(mobP2);
            mobP2.spawn();
            for (let iCounter = 0; iCounter < mobsP2Any.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
              if (iCounter === mobsP2Any.length) {
                document.getElementById("--" + mobsP2Any.length + "img2").style.display = null;
                document.getElementById("--" + mobsP2Any.length + "FillerP2").style.display = 'none';
                //console.log("--" + i + "img1")
              };
            };
          };
        };
      }
    }
    if (whichUnit === 4) {
      if (mobsP2Any.length < 9) {
        if (addMobLimitCounterP2 > 0) {
          if (goldP2 >= Balance.costOfMobs[1].cost) {
            goldP2 -= Balance.costOfMobs[1].cost;
            scoreP2 += Balance.costOfMobs[1].cost;
            document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
            document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
            addMobLimitCounterP2--
            i++
            console.log("Gesamte anzahl an Units: Mob" + i)
            const mob2P2 = new Mob2P2("Mob2P2" + i);
            let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
            mob2P2.mtxLocal.translate(cityPosition);
            graph.addChild(mob2P2);
            mobsP2Any.push(mob2P2);
            mob2P2.spawn();
            console.log(mobsP2Any + " :mobsP2 vs mob2P2: " + mob2P2)
            for (let iCounter = 0; iCounter < mobsP2Any.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
              if (iCounter === mobsP2Any.length) {
                document.getElementById("--" + mobsP2Any.length + "img4").style.display = null;
                document.getElementById("--" + mobsP2Any.length + "FillerP2").style.display = 'none';
                //console.log("--" + i + "img1")
              };
            };
          };
        };
      }
    }
  }
  // ------------- Creating Mobs, both player END ---------------------------------------------------


  // ------------- Handles the city part of the turn, after all troops have been moved. ---------------------------------------------------
  function handleCityTurnPart() {
    document.getElementById("--addMob").style.display = null;
    document.getElementById("--addBuildings").style.display = null;
    document.getElementById("--addBuildingsP2").style.display = 'none';
    document.getElementById("--infoBuildings").style.display = null;
    document.getElementById("--infoBuildingsP2").style.display = 'none';
    if (roundsPlayed > 2) {
      document.getElementById("--addMobP2").style.display = 'none';
      //console.log("Setze BuildingP2 und MobP2 zu none");
    };
    addMobLimitCounter = mobBuyLimit;
    
  }


  function handleCityTurnPartP2() {
    document.getElementById("--addBuildingsP2").style.display = null;
    document.getElementById("--infoBuildingsP2").style.display = null;
    document.getElementById("--addMobP2").style.display = null;
    document.getElementById("--addBuildings").style.display = 'none';
    document.getElementById("--infoBuildings").style.display = 'none';
    if (roundsPlayed > 2) {
      document.getElementById("--addMob").style.display = 'none';

      //console.log("Setze BuildingP1 und MobP1 zu none");
    };
    addMobLimitCounterP2 = mobBuyLimit;
    
  }
  // ------------- Handles the city part of the turn, after all troops have been moved. END ---------------------------------------------------


  function handleEndOfCityProcedure(currentUnitNumb: number, setPlayer: number) {
    let playerPlaceHolder: string = "";
    let playerPlaceHolder2: string = "P2";
    if (setPlayer === 1) { //wenn spieler zu 1 wechseln soll nimm diese modifikatoren
      playerPlaceHolder = "P2";
      playerPlaceHolder2 = "";
      gold += (goldGain + (anzMine * goldMineOutput));
      score += (goldGain + (anzMine * goldMineOutput));
      document.getElementById("--score_player_one").setAttribute('value', score.toString());
      document.getElementById("--goldInput").setAttribute('value', gold.toString());
      document.getElementById("--gold").style.display = null;
      document.getElementById("--goldP2").style.display = 'none';
      document.getElementById("anz_mine").style.display = null;
      document.getElementById("anz_minep2").style.display = 'none';
    }
    else {
      if (roundsPlayed > 1) { //Fixes a bug, i dont know why p2 gets one tick more than P1 so iam reducing one turn for P2
        goldP2 += (goldGain + (anzMineP2 * goldMineOutput));
        scoreP2 += (goldGain + (anzMineP2 * goldMineOutput));
        document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
      };
      //console.log("P2 gets money. ")
      document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
      document.getElementById("--goldP2").style.display = null;
      document.getElementById("--gold").style.display = 'none';
      document.getElementById("anz_minep2").style.display = null;
      document.getElementById("anz_mine").style.display = 'none';
    }
    document.getElementById("--unitdiv1" + playerPlaceHolder2).style.borderColor = "red";
    document.getElementById("--unitdiv" + (currentUnitNumb + 1) + "" + playerPlaceHolder).style.borderColor = "#048836";
    //console.log("ENDING P" + currentplayer);
    currentPhase = 1;
    currentplayer = setPlayer;
    //console.log(setPlayer);
    document.getElementById("--addMob" + playerPlaceHolder).style.display = 'none';
    document.getElementById("--addBuildings" + playerPlaceHolder).style.display = 'none';
    document.getElementById("--infoBuildings" + playerPlaceHolder).style.display = 'none';

    //document.querySelector("#anz_mine")
    handleUiPlayerswap();
    document.getElementById("--headingInfo").setAttribute('value', turnPhaseOne);

    return;
  }

  function creatingBuildings() { //Handles all Buildings, needs additional parameter if multiple Buildings should be available
    if (currentplayer === 1) {
      if (gold >= costMineBuild) {
        gold -= costMineBuild;
        document.getElementById("--goldInput").setAttribute('value', gold.toString());
        anzMine++;
        throwBoolean = true;
        document.getElementById("anz_mine").setAttribute('value', anzMine.toString());
      }
    }
    if (currentplayer === 2) {
      if (goldP2 >= costMineBuild) {
        goldP2 -= costMineBuild;
        document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
        anzMineP2++;
        throwBoolean = true;
        document.getElementById("anz_minep2").setAttribute('value', anzMineP2.toString());
      }
    }
  }

  function unitInteraction(graph: ƒ.Node) {
    //auf Placeholder zugreifen zum Vergleich mit ursprünglicher position
    //unitPositionPlaceholder NOT THIS ONE
    //possibleLimitReachedCheckStay IS ACTUALLY THE CORE POSITION FOR THE UNIT.
    if (currentplayer === 1) {
      //In schleife unitPositionPlaceholder mit allen Figuren von Spieler 2 abfragen
      for (let iCounter2 = 0; iCounter2 < mobsP2Any.length; iCounter2++) {
        if (mobsAny[currentUnitNumber].mtxLocal.translation.equals(mobsP2Any[iCounter2].mtxLocal.translation)) { // UNIT TO UNIT INTERACTION P1
          mobsAny[currentUnitNumber].mtxLocal.translation = (possibleLimitReachedCheckStay);
          mobsP2Any[iCounter2].health -= mobsAny[currentUnitNumber].dmg;
          console.log("Health of p2 unit: " + mobsP2Any[iCounter2].health);
          gold += goldGain / 2;
          score += goldGain / 2;
          document.getElementById("--score_player_one").setAttribute('value', score.toString());
          document.getElementById("--goldInput").setAttribute('value', gold.toString());
          sounds[1].play(true);
          if (mobsP2Any[iCounter2].health < 1) {
            let spliceRemoved: any[] = [];
            //removeChild(mobsAny[iCounter3]);
            graph.removeChild(mobsP2Any[iCounter2]);
            spliceRemoved = mobsP2Any.splice(iCounter2, 1);
            if(iCounter2 === 0){
              hasFirstUnitBeenKilledP1 = true;
            };
            console.log(spliceRemoved);
            console.log(mobsP2Any);
            delete spliceRemoved[0];
            document.getElementById("--" + (iCounter2 + 1) + "img2").style.display = 'none';
            document.getElementById("--" + (iCounter2 + 1) + "img4").style.display = 'none';
            document.getElementById("--" + (iCounter2 + 1) + "FillerP2").style.display = null;
            for (let iLength = 2; iLength < 9; iLength++) {
              if (document.getElementById("--" + (iCounter2 + iLength) + "Filler").style.display === 'none') {
                if (!(document.getElementById("--" + (iCounter2 + iLength) + "img2").style.display)) {
                  document.getElementById("--" + (iCounter2 + iLength) + "img2").style.display = 'none';
                  document.getElementById("--" + (iCounter2 + iLength) + "Filler").style.display = null;
                  document.getElementById("--" + (iCounter2 + (iLength - 1)) + "img2").style.display = null;
                  document.getElementById("--" + (iCounter2 + (iLength - 1)) + "Filler").style.display = 'none';
                };
                if (!(document.getElementById("--" + (iCounter2 + iLength) + "img4").style.display)) {
                  document.getElementById("--" + (iCounter2 + iLength) + "img4").style.display = 'none';
                  document.getElementById("--" + (iCounter2 + iLength) + "Filler").style.display = null;
                  document.getElementById("--" + (iCounter2 + (iLength - 1)) + "img4").style.display = null;
                  document.getElementById("--" + (iCounter2 + (iLength - 1)) + "Filler").style.display = 'none';
                }
              }
            }
          }
        }
      }
      if (mobsAny[currentUnitNumber].mtxLocal.translation.x === cityNodeP2[0].mtxWorld.translation.x && mobsAny[currentUnitNumber].mtxLocal.translation.y === cityNodeP2[0].mtxWorld.translation.y) { // CITY INTERACTION P1
        turnsNeededForCaptureP1--;
        if (turnsNeededForCaptureP1 < 1) {
          //alert("City of P2 has been captured!");
          let spliceRemoved: any[] = [];
          graph.removeChild(cityNodeP2[cityNodeP2.length - 1]);
          spliceRemoved = cityNodeP2.splice(cityNodeP2.length - 1, 1);
          console.log(spliceRemoved);
          console.log(cityNodeP2);
          delete spliceRemoved[0];
          if (cityNodeP2.length === 0) {
            currentPhase = 10;
            currentplayer = 0;
            document.getElementById("--headingInfo").setAttribute('value', turnPhaseWinP1);
            wonBoolean = true;
          }
        }
      }
    }

    if (currentplayer === 2) {
      //In schleife unitPositionPlaceholder mit allen Figuren von Spieler 1 abfragen
      for (let iCounter3 = 0; iCounter3 < mobsAny.length; iCounter3++) {
        if (mobsP2Any[currentUnitNumberP2].mtxLocal.translation.equals(mobsAny[iCounter3].mtxLocal.translation)) { // UNIT TO UNIT INTERACTION P2
          mobsP2Any[currentUnitNumberP2].mtxLocal.translation = (possibleLimitReachedCheckStayP2);
          mobsAny[iCounter3].health -= mobsP2Any[currentUnitNumberP2].dmg;
          console.log("Health of p1 unit: " + mobsAny[iCounter3].health);
          goldP2 += goldGain / 2;
          scoreP2 += goldGain / 2;
          document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
          document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
          sounds[1].play(true);
          if (mobsAny[iCounter3].health < 1) {
            let spliceRemoved: any[] = [];
            //removeChild(mobsAny[iCounter3]);
            graph.removeChild(mobsAny[iCounter3]);
            spliceRemoved = mobsAny.splice(iCounter3, 1);
            if(iCounter3 === 0){
              hasFirstUnitBeenKilledP2 = true;
            };
            console.log(spliceRemoved);
            console.log(mobsAny);
            delete spliceRemoved[0];
            document.getElementById("--" + (iCounter3 + 1) + "img3").style.display = 'none'; //Muss nach oben aufrücken...
            document.getElementById("--" + (iCounter3 + 1) + "img1").style.display = 'none';
            document.getElementById("--" + (iCounter3 + 1) + "Filler").style.display = null;
            for (let iLength = 2; iLength < 9; iLength++) {
              if (document.getElementById("--" + (iCounter3 + iLength) + "Filler").style.display === 'none') {
                if (!(document.getElementById("--" + (iCounter3 + iLength) + "img1").style.display)) {
                  document.getElementById("--" + (iCounter3 + iLength) + "img1").style.display = 'none';
                  document.getElementById("--" + (iCounter3 + iLength) + "Filler").style.display = null;
                  document.getElementById("--" + (iCounter3 + (iLength - 1)) + "img1").style.display = null;
                  document.getElementById("--" + (iCounter3 + (iLength - 1)) + "Filler").style.display = 'none';
                };
                if (!(document.getElementById("--" + (iCounter3 + iLength) + "img3").style.display)) {
                  document.getElementById("--" + (iCounter3 + iLength) + "img3").style.display = 'none';
                  document.getElementById("--" + (iCounter3 + iLength) + "Filler").style.display = null;
                  document.getElementById("--" + (iCounter3 + (iLength - 1)) + "img3").style.display = null;
                  document.getElementById("--" + (iCounter3 + (iLength - 1)) + "Filler").style.display = 'none';
                }
              }
            }
          }
        }
      }

      if (mobsP2Any[currentUnitNumberP2].mtxLocal.translation.y === cityNode[0].mtxWorld.translation.y && mobsP2Any[currentUnitNumberP2].mtxLocal.translation.x === cityNode[0].mtxWorld.translation.x) { // CITY INTERACTION P2
        turnsNeededForCaptureP2--;
        if (turnsNeededForCaptureP2 < 1) { //THIS DOESNT WORK IF THE CAPTURED CITIES ARE RANDOM!!
          //alert("City of P1 has been captured!");
          let spliceRemoved: any[] = [];
          graph.removeChild(cityNode[cityNode.length - 1]);
          spliceRemoved = cityNode.splice(cityNode.length - 1, 1);
          console.log(spliceRemoved);
          console.log(cityNode);
          delete spliceRemoved[0];
          if (cityNode.length === 0) {
            currentPhase = 10;
            currentplayer = 0;
            document.getElementById("--headingInfo").setAttribute('value', turnPhaseWinP2);
            wonBoolean = true;
          }
        }
      }
    }

  }

  function hndPlaySpawnSound() { //Yes iam kind of an useless event, but an event nonetheless. -> Jirka's criteria list made me do this
    sounds[2].play(true);
  }

  function initAnim(_graph: ƒ.Node): void {
    //let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence(); //Up and down movement
    //animseq.addKey(new ƒ.AnimationKey(0, 0));
    //animseq.addKey(new ƒ.AnimationKey(2000, 1));
    //animseq.addKey(new ƒ.AnimationKey(4000, 0));

    let animseq2: ƒ.AnimationSequence = new ƒ.AnimationSequence();  //Rotation
    animseq2.addKey(new ƒ.AnimationKey(0, 0));
    animseq2.addKey(new ƒ.AnimationKey(2000, 90));
    animseq2.addKey(new ƒ.AnimationKey(4000, 180));
    animseq2.addKey(new ƒ.AnimationKey(6000, 270));
    animseq2.addKey(new ƒ.AnimationKey(8000, 360));

    let animStructure: ƒ.AnimationStructure = {
      components: {
        ComponentTransform: [
          {
            "ƒ.ComponentTransform": {
              mtxLocal: {
                //translation: {
                //z: animseq,
                //},
                rotation: {
                  z: animseq2,
                },
              },
            },
          },
        ],
      },
    };
    let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, 30);

    let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(
      animation,
      ƒ.ANIMATION_PLAYMODE.LOOP,
      ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS
    );

    let cmpAnimator2: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(
      animation,
      ƒ.ANIMATION_PLAYMODE.LOOP,
      ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS
    );


    _graph.getChildrenByName("Grid")[0].getChildrenByName("Path")[0].getChild(15).getChildrenByName("City")[0].addComponent(cmpAnimator); //adjust x from getChild(x) to paths[x].addChild(city) and CityP2!! 
    _graph.getChildrenByName("Grid")[0].getChildrenByName("Path")[0].getChild(34).getChildrenByName("CityP2")[0].addComponent(cmpAnimator2);

    cmpAnimator.activate(true);
  }
}

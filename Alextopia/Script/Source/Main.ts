namespace Script {
  import ƒ = FudgeCore;

  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;

  window.addEventListener("load", init);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  export let viewport: ƒ.Viewport;
  let sounds: ƒ.ComponentAudio[]; //outdated? i need it for later
  let pacman: ƒ.Node;             //outdated? yes
  let water: ƒ.Node[];    //Blocks that cant be set foot on with normal units - Beinhaltet jeden Wasserblock in einem Array gespeichert
  export let paths: ƒ.Node[];    //Building/Land are, every unit can walk on these - beinhaltet jeden begehbaren block in einem Array gespeichert
  export let cityNode: City[] = [];   //City = new ƒ.Node("CityP2");
  export let cityNodeP2: CityP2[] = []; //City = new ƒ.Node("CityP2");

  export let mobs: Mob[] = [];   //Array for all created mobs/units
  export let mobs2: Mob2[] = [];   //Array for all created mobs/units

  export let mobsP2: MobP2[] = [];   //Array for all created mobs/units
  export let mobs2P2: Mob2P2[] = [];   //Array for all created mobs/units



  let currentplayer: number = 1; //distinguishes between player 1 and 2
  let currentPhase: number = 1; //Distinguishes between phase 1 (placing troops, which might as well be different phases all together) and phase 2 (choosing cities to produce troops)
  let i = 0;
  export let currentUnitNumber: number = 0; //taken in account to cycle through the units to move them, used in Mob.move function
  export let currentUnitNumberP2: number = 0; //taken in account to cycle through the units to move them, used in Mob.move function
  export let iMoveY: number = 0;            //Necessary global variables to limit user to one move per time. ALLE OBSOLET.
  export let iMoveYMinus: number = 0;       //outdated? yes
  export let iMoveX: number = 0;            //outdated? yes
  export let iMoveXMinus: number = 0;       //outdated? yes
  export let iLimitSpaceToOne: number = 0; //does the same as iMove, just only for the Space Enter Mob/Unit switch.
  export let finishedMobPlacement: Boolean = false; //If false, says youre able to move the unit, true says its done.

  export let movingDirection: string = "y";

  export let movement: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0); //outdated? yes



  //------------ TO-DO'S -------------------------------------------------------------------
  // Start on Unit to unit intercation ?? How do they interact, do they have HP or other Stats? -> Do another spawn RANDOM button for enemy units, let every unit move by one and automatically change side when everyone moved/interacted.
  // ein fking UI <-- Important, less complexity, machen sobald ich kb auf programming aber Zeit habe.
  // Handle Player swap -> currentPlayerSwapHandle()
  // Unit should only be able to walk 1 field from starting position, maybe test with random spawnfields for Unit +1 button.
  // Start implementing different rounds in a players turn -> unit moving -> unit producing -> playerswap
  // Add Gold mechanic
  // Random Map generator
  //
  // ++ DONE but maybe needs rework ++ Graphics, like terrain and Units
  //------------ TO-DO'S End ---------------------------------------------------------------

  //------------ Notizen -------------------------------------------------------------------
  // Do random maps as external data save and load.
  // Money Balancing überlegen -> stadt upgradable?
  // Ui Zeigt leben der Einheiten wenn diese nicht onehit sterben sollten.
  //
  //
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

  function start(_event: CustomEvent): void { //Was beim Start initialisiert werden soll
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(3, 2, 15));
    viewport.camera.mtxPivot.rotateY(180);

    const graph: ƒ.Node = viewport.getBranch();

    ƒ.AudioManager.default.listenTo(graph);

    sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
    //pacman = graph.getChildrenByName("Pacman")[0];
    water = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
    paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();

    for (const path of paths) { //Herausfinden was das is
      //addInteractable(path);
    }

    const city = new City("City");
    const cityP2 = new CityP2("CityP2");

    cityNode.push(city);
    cityNodeP2.push(cityP2);

    //Positions of starting Cities
    paths[44].addChild(city);
    paths[34].addChild(cityP2);
    

    //Test console Logs
    console.log(paths);
    console.log(water);
    console.log(cityNode);
    console.log(cityNodeP2);

    //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
    for (let i = 1; i < 10; i++) { //goes through all 9 possible Units
      for (let ii = 1; ii < 5; ii++) { //goes through all 4 possible unit variations
        //console.log("--" + i + "img" + ii)
        document.getElementById("--" + i + "img" + ii).style.display = 'none';
      }
    };


    //Admin  Menu --------------------------------------------------------------------
    document.getElementById("plusmob").addEventListener("click", (event) => {
      //function addMob() {
      if ((mobs.length + mobs2.length) != 9) {
        i++
        console.log("Mob" + i)

        const mob = new Mob("Mob" + i);
        let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
        //console.log(cityPosition)
        //mob.mtxLocal.translate(new ƒ.Vector3(4, 3, 0));
        mob.mtxLocal.translate(cityPosition);
        graph.addChild(mob);

        mobs.push(mob);
        //Spielerfigur == position von interactable, soll dann hochzählen
        //const path = paths.find((p) => p.mtxLocal.translation.equals(mobs[0].mtxLocal.translation, 0.5)); //sucht interactables auf der selben stelle von Mobs

        //if (path) {
          //const city: ƒ.Node = path.getChild(0);

          //if (city) {
            //console.log(city);
          //}
        //}
        //const city = path.getChild(0);


        /*for(let iCounter = 0; iCounter < i+1; iCounter++){ //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
          if(iCounter === i){
            document.getElementById("--" + i + "img1").style.display = null;
            //console.log("--" + i + "img1")
          };
        };*/

        for (let iCounter = 0; iCounter < mobs.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
          if (iCounter === mobs.length) {
            document.getElementById("--" + mobs.length + "img1").style.display = null;
          };
        };
      }

      //Anzahl der Mobs generated im Array
      //console.log(mobs) //CHANGE THIS GLEICH SOFORT});


    })

    document.getElementById("plusmob2").addEventListener("click", (event) => {
      //function addMob() {

      if ((mobs.length + mobs2.length) != 9) {
        i++
        console.log("Mob2" + i)


        const mob2 = new Mob2("Mob2" + i);
        let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
        mob2.mtxLocal.translate(cityPosition);
        graph.addChild(mob2);

        mobs.push(mob2);


        for (let iCounter = 0; iCounter < mobs.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
          if (iCounter === mobs.length) {
            document.getElementById("--" + mobs.length + "img3").style.display = null;
            //console.log("--" + i + "img3")
          };
        };
      }

      //Anzahl der Mobs generated im Array
      //console.log(mobs2)


    })
    document.getElementById("plusmobP2").addEventListener("click", (event) => {
      //function addMob() {
      if ((mobsP2.length + mobs2P2.length) != 9) {
        i++
        console.log("MobP2" + i)

        const mobP2 = new MobP2("MobP2" + i);
        let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
        mobP2.mtxLocal.translate(cityPosition);
        graph.addChild(mobP2);

        mobsP2.push(mobP2);


        for (let iCounter = 0; iCounter < mobsP2.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
          if (iCounter === mobsP2.length) {
            document.getElementById("--" + mobsP2.length + "img2").style.display = null;
            //console.log("--" + i + "img1")
          };
        };
      }
      //Anzahl der Mobs generated im Array
      //console.log(mobsP2) //CHANGE THIS GLEICH SOFORT});


    })

    document.getElementById("plusmob2P2").addEventListener("click", (event) => {
      //function addMob() {
      if ((mobsP2.length + mobs2P2.length) != 9) {
        i++
        console.log("Mob2P2" + i)

        const mob2P2 = new Mob2P2("Mob2P2" + i);
        let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
        mob2P2.mtxLocal.translate(cityPosition);
        graph.addChild(mob2P2);

        mobsP2.push(mob2P2);


        for (let iCounter = 0; iCounter < mobsP2.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
          if (iCounter === mobsP2.length) {
            document.getElementById("--" + mobsP2.length + "img4").style.display = null;
            //console.log("--" + i + "img1")
          };
        };
      }

      //Anzahl der Mobs generated im Array
      //console.log(mobs2P2) //CHANGE THIS GLEICH SOFORT});


    })
    document.getElementById("changePlayer").addEventListener("click", (event) => {
      //function addMob() {
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


    //If ( spieler 1 dont do changeunitP2)
    changeUnit(); //Funktion zum bewegen einer Unit in Main.ts

    //changeUnitP2(); //Funktion zum bewegen einer Unit in Main.ts für PLAYER 2

    water.forEach(function (item, index) { //Loop for all water tiles
      setSprite(water[index]);
    });

    paths.forEach(function (item, index) { //Loop for all paths tiles
      setSpritePaths(paths[index]);
    });


    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    mobs.map((g) => g.move()); //g.move(paths));
    mobs2.map((g) => g.move()); //g.move(paths));
    mobsP2.map((g) => g.move()); //g.move(paths));
    mobs2P2.map((g) => g.move()); //g.move(paths));


    /*if (checkIfMove()) {
      if (!sounds[1].isPlaying && !movement.equals(new ƒ.Vector3(0, 0, 0))) {
        sounds[1].play(true);
      }
      useInteractable(); 
      pacman.mtxLocal.translate(movement);
    }*/

    //checkIfGameOver();

    viewport.draw();
  }


  // ------------- Moving Mob abteil PLAYER 1 ---------------------------------------------------
  function changeUnit(): void { //Is used to track current unit and change values accordingly -> NOT ANYMORE
    //let localVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
    //let localVector: ƒ.Matrix4x4 = mobs[currentUnitNumber].mtxLocal;

    //console.log("Ist das die Länge vom Array?: " + mobs.length)


    document.addEventListener('keydown', (event) => {
      if (currentplayer === 1) {
        var name = event.key;

        if (name === 'd' || name === 'ArrowRight') {
          if (checkIfMoveMob("x")) {
            mobs[currentUnitNumber].mtxLocal.translateX(1);
            console.log("trying to move right");
          }
        }
        if (name === 'a' || name === 'ArrowLeft') {
          if (checkIfMoveMob("-x")) {
            mobs[currentUnitNumber].mtxLocal.translateX(-1);
            console.log("trying to move Left");
          }
        }
        if (name === 'w' || name === 'ArrowUp') {
          if (checkIfMoveMob("y")) {
            mobs[currentUnitNumber].mtxLocal.translateY(1);
            console.log("trying to move up");
          }
        }
        if (name === 's' || name === 'ArrowDown') {
          if (checkIfMoveMob("-y")) {
            mobs[currentUnitNumber].mtxLocal.translateY(-1);
            console.log("trying to move down");
          }
        }
        if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
          if ((currentUnitNumber + 1) === mobs.length) {
            console.log("RETURNINGP1");
            currentplayer = 2;
            document.getElementById("--unitdiv1P2").style.borderColor = "red";
            document.getElementById("--unitdiv" + (currentUnitNumber + 1)).style.borderColor = "#048836";
            currentUnitNumber = 0;


            handleUiPlayerswap();
            console.log(currentplayer);
            //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 1 -> moved all pieces ####################################################################
            return;
          }
          else {
            currentUnitNumber++;
            document.getElementById("--unitdiv" + (currentUnitNumber + 1)).style.borderColor = "red"; //--unitdiv1P2 für spieler 2
            document.getElementById("--unitdiv" + currentUnitNumber).style.borderColor = "#048836";
          }

          console.log("Logged position, going to next unit");
        }

      }

      if (currentplayer === 2) {
        var name = event.key;

        if (name === 'd' || name === 'ArrowRight') {
          if (checkIfMoveMobP2("x")) {
            mobsP2[currentUnitNumberP2].mtxLocal.translateX(1);
            console.log("trying to move right");
          }
        }
        if (name === 'a' || name === 'ArrowLeft') {
          if (checkIfMoveMobP2("-x")) {
            mobsP2[currentUnitNumberP2].mtxLocal.translateX(-1);
            console.log("trying to move Left");
          }
        }
        if (name === 'w' || name === 'ArrowUp') {
          if (checkIfMoveMobP2("y")) {
            mobsP2[currentUnitNumberP2].mtxLocal.translateY(1);
            console.log("trying to move up");
          }
        }
        if (name === 's' || name === 'ArrowDown') {
          if (checkIfMoveMobP2("-y")) {
            mobsP2[currentUnitNumberP2].mtxLocal.translateY(-1);
            console.log("trying to move down");
          }
        }
        if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
          if ((currentUnitNumberP2 + 1) === mobsP2.length) {
            console.log("RETURNINGP2");
            currentplayer = 1;
            document.getElementById("--unitdiv1").style.borderColor = "red";
            document.getElementById("--unitdiv" + (currentUnitNumberP2 + 1) + "P2").style.borderColor = "#048836";
            currentUnitNumberP2 = 0;
            handleUiPlayerswap();
            console.log(currentplayer);

            //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 2 -> moved all pieces #################################################################################
            return;
          }
          else {
            currentUnitNumberP2++;
            document.getElementById("--unitdiv" + (currentUnitNumberP2 + 1) + "P2").style.borderColor = "red"; //--unitdiv1P2 für spieler 2
            document.getElementById("--unitdiv" + currentUnitNumberP2 + "P2").style.borderColor = "#048836";
          }

          console.log("Logged position, going to next unit");
        }

      }


    })
  }

  export function checkIfMoveMob(_direction?: string): boolean { //checks which directions the CURRENTUNITNUMBER can go, called in changeUnit()
    const y: number = mobs[currentUnitNumber].mtxLocal.translation.y;
    const x: number = mobs[currentUnitNumber].mtxLocal.translation.x;
    let newPosition: ƒ.Vector3;

    switch (_direction ?? movingDirection) {
      case "x":
        newPosition = new ƒ.Vector3(x + 1, y, 0);
        break;
      case "-x":
        newPosition = new ƒ.Vector3(x - 1, y, 0);
        break;
      case "y":
        newPosition = new ƒ.Vector3(x, y + 1, 0);
        break;
      case "-y":
        newPosition = new ƒ.Vector3(x, y - 1, 0);
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

    return true;
  }


  function handleUiPlayerswap(): void { //Handles player 1 and 2 UI changes when swapping.

    if (currentplayer === 1) {
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



  // ------------- Moving Mob abteil END PLAYER 1 ---------------------------------------------------

  // ------------- Moving Mob abteil PLAYER 2 --------------------------------------------------- IS INTEGRATED IN changeUnit von P1 !!!!!!!!!!!!!!!!!!! #######################################
  /*function changeUnitP2(): void { //Is used to track current unit and change values accordingly -> NOT ANYMORE
    //let localVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
    //let localVector: ƒ.Matrix4x4 = mobs[currentUnitNumber].mtxLocal;
 
    
    
    document.addEventListener('keydown', (event) => {

      if(currentplayer === 2){
      var name = event.key;
 
      if (name === 'd' || name === 'ArrowRight') {
        if (checkIfMoveMobP2("x")) {
        mobsP2[currentUnitNumberP2].mtxLocal.translateX(1);
        console.log("trying to move right");
        }
      }
      if (name === 'a' || name === 'ArrowLeft') {
        if (checkIfMoveMobP2("-x")) {
        mobsP2[currentUnitNumberP2].mtxLocal.translateX(-1);
        console.log("trying to move Left");
        }
      }
      if (name === 'w' || name === 'ArrowUp') {
        if (checkIfMoveMobP2("y")) {
        mobsP2[currentUnitNumberP2].mtxLocal.translateY(1);
        console.log("trying to move up");
        }
      }
      if (name === 's' || name === 'ArrowDown') {
        if (checkIfMoveMobP2("-y")) {
        mobsP2[currentUnitNumberP2].mtxLocal.translateY(-1);
        console.log("trying to move down");
        }
      }
      if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
        if((currentUnitNumberP2 + 1) === mobsP2.length){
          console.log("RETURNINGP2");
          currentplayer = 1;
          return;
        }
        else{
          currentUnitNumberP2++;
        }
      
          console.log("Logged position, going to next unit");
        }
      
      }
      })
    } */

  export function checkIfMoveMobP2(_direction?: string): boolean { //checks which directions the CURRENTUNITNUMBER can go, called in changeUnit()
    const y: number = mobsP2[currentUnitNumberP2].mtxLocal.translation.y;
    const x: number = mobsP2[currentUnitNumberP2].mtxLocal.translation.x;
    let newPosition: ƒ.Vector3;

    switch (_direction ?? movingDirection) {
      case "x":
        newPosition = new ƒ.Vector3(x + 1, y, 0);
        break;
      case "-x":
        newPosition = new ƒ.Vector3(x - 1, y, 0);
        break;
      case "y":
        newPosition = new ƒ.Vector3(x, y + 1, 0);
        break;
      case "-y":
        newPosition = new ƒ.Vector3(x, y - 1, 0);
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

    return true;
  }
  // ------------- Moving Mob abteil END PLAYER 2 ---------------------------------------------------


  //Momentan noch uninteressant aber wichtig für interactable city later.
  /*function addInteractable(_path: ƒ.Node): void {
    //random interactable auf der Map platzieren
    const mtrCity: ƒ.Material = new ƒ.Material(
      "City",
      ƒ.ShaderLit,
      new ƒ.CoatColored(ƒ.Color.CSS("#f5ce42"))
    );

    const mtrCityP2: ƒ.Material = new ƒ.Material(
      "CityP2",
      ƒ.ShaderLit,
      new ƒ.CoatColored(ƒ.Color.CSS("#426cf5"))
    );

    //const cityNode = new ƒ.Node("City");
    cityNode.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
    cityNode.addComponent(new ƒ.ComponentMaterial(mtrCity));
    cityNode.addComponent(new ƒ.ComponentTransform());
    cityNode.mtxLocal.scale(new ƒ.Vector3(0.3, 0.3, 0.3));

    //const cityNodeP2 = new ƒ.Node("City");
    cityNodeP2.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
    cityNodeP2.addComponent(new ƒ.ComponentMaterial(mtrCityP2));
    cityNodeP2.addComponent(new ƒ.ComponentTransform());
    cityNodeP2.mtxLocal.scale(new ƒ.Vector3(0.3, 0.3, 0.3));

    //paths[34].addChild(cityNode); //Why doesnt this work? -> create new city node !!
    paths[44].addChild(cityNode); // an Path 44 ist nun ein Interactable City gepflanzt, no clue was ich damit anfange. -> Feindliche city einnehmbar indem Truppe draufgesetzt wird.
    paths[34].addChild(cityNodeP2); //cityNodeP2 ist p2 spieler stadt.
  }*/

  function useInteractable() { //Search function and how its used before.
    //Spielerfigur == position von interactable, soll dann hochzählen
    const path = paths.find((p) => p.mtxLocal.translation.equals(pacman.mtxLocal.translation, 0.2)); //Pacman ersetzen. sucht interactables auf der selben stelle von pacman

    if (path) {
      const city: ƒ.Node = path.getChild(0);

      if (city) {
        path.removeChild(city); //removes paths[x].addChild(cityNode)
      }
    }
  }




  // Not needed atm, is just for collection

  /*function movePacman(): void {
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) &&
        (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
      ) {
        if (checkIfMove("x")) {
          movement.set(1 / 60, 0, 0);
          //rotateSprite("x");
          movingDirection = "x";
        }
      }
  
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) &&
        (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
      ) {
        if (checkIfMove("-y")) {
          movement.set(0, -1 / 60, 0);
          //rotateSprite("-y");
          movingDirection = "-y";
        }
      }
  
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) &&
        (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
      ) {
        if (checkIfMove("-x")) {
          movement.set(-1 / 60, 0, 0);
          //rotateSprite("-x");
          movingDirection = "-x";
        }
      }
  
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
        (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
      ) {
        if (checkIfMove("y")) {
          movement.set(0, 1 / 60, 0);
          //rotateSprite("y");
          movingDirection = "y";
        }
      }
    }*/

  /*
    export function checkIfMove(_direction?: string): boolean {
      const y: number = pacman.mtxLocal.translation.y;
      const x: number = pacman.mtxLocal.translation.x;
      let newPosition: ƒ.Vector3;
  
      switch (_direction ?? movingDirection) {
        case "x":
          newPosition = new ƒ.Vector3(x + 1, y, 0);
          break;
        case "-x":
          newPosition = new ƒ.Vector3(x - 1, y, 0);
          break;
        case "y":
          newPosition = new ƒ.Vector3(x, y + 1, 0);
          break;
        case "-y":
          newPosition = new ƒ.Vector3(x, y - 1, 0);
          break;
  
        default:
          break;
      }
  
      const wall: ƒ.Node = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0.022));
  
      if (wall) {
        sounds[1].play(false);
        return false;
      }
  
      const path: ƒ.Node = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 1));
  
      if (!path) {
        sounds[1].play(false);
        return false;
      }
  
      return true;
    }*/

  /*
  function checkIfGameOver(): void {
    for (const mob of mobs) {
      const isEvenPacman =
        (Math.round(pacman.mtxLocal.translation.y) + Math.round(pacman.mtxLocal.translation.x)) %
          2 ===
        0;

      const isEvenMob =
        (Math.round(mob.mtxLocal.translation.y) + Math.round(mob.mtxLocal.translation.x)) %
          2 ===
        0;

      if (
        isEvenPacman !== isEvenMob &&
        pacman.mtxLocal.translation.equals(Mob.mtxLocal.translation, 0.8)
      ) {
        document.getElementById("game-over").style.width = "100vw";
        ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, update);

        sounds[1].play(false);
        sounds[2].play(true);

        document.getElementById("restart").addEventListener("click", function (_event: Event) {
          window.location.reload();
        });
      }
    }
  }*/

}

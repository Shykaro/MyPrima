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
  let paths: ƒ.Node[];    //Building/Land are, every unit can walk on these - beinhaltet jeden begehbaren block in einem Array gespeichert

  export let mobs: Mob[] = [];   //Array for all created mobs/units
  let currentplayer: number = 1; //distinguishes between player 1 and 2
  let i = 0;
  export let currentUnitNumber: number = 0; //taken in account to cycle through the units to move them, used in Mob.move function
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
  // 
  //
  //
  // ++ DONE but maybe needs rework ++ Graphics, like terrain and Units
  //------------ TO-DO'S End ---------------------------------------------------------------

  //------------ Notizen -------------------------------------------------------------------
  // Do random maps as external data save and load.
  //
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
      addInteractable(path);
    }

    console.log(paths);
    console.log(water);


    //Admin  Menu --------------------------------------------------------------------
    document.getElementById("plusmob").addEventListener("click", (event) => {
      //function addMob() {
      i++
      console.log("Mob" + i)

      const mob = new Mob("Mob" + i);
      mob.mtxLocal.translate(new ƒ.Vector3(4, 3, 0));
      graph.addChild(mob);

      mobs.push(mob);

      //Anzahl der Mobs generated im Array
      console.log(mobs) //CHANGE THIS GLEICH SOFORT});


    })
    //Admin Menu End ------------------------------------------------------------------


    changeUnit(); //Funktion zum bewegen einer Unit in Main.ts


    //setSprite(pacman);

    water.forEach(function (item, index) { //Loop for all water tiles
      setSprite(water[index]);
    });

    paths.forEach(function (item, index) { //Loop for all water tiles
      setSpritePaths(paths[index]);
    });
    

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    //movePacman();
    mobs.map((g) => g.move()); //g.move(paths));

    //mobs.move(paths);
    //mobs[2].move(paths);



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


  function currentPlayerSwapHandle(): void { //Handles player 1 and 2.

  }

  

  // ------------- Moving Mob abteil ---------------------------------------------------
  function changeUnit(): void { //Is used to track current unit and change values accordingly -> NOT ANYMORE
    //let localVector: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
    //let localVector: ƒ.Matrix4x4 = mobs[currentUnitNumber].mtxLocal;

    document.addEventListener('keydown', (event) => {
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
        currentUnitNumber++;
        console.log("Logged position, going to next unit");
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
  // ------------- Moving Mob abteil END ---------------------------------------------------


    //Momentan noch uninteressant aber wichtig für interactable city later.
    function addInteractable(_path: ƒ.Node): void {
      //random interactable auf der Map platzieren
      const mtrCity: ƒ.Material = new ƒ.Material(
        "City",
        ƒ.ShaderLit,
        new ƒ.CoatColored(ƒ.Color.CSS("#f5ce42"))
      );
  
      const cityNode = new ƒ.Node("City");
      cityNode.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
      cityNode.addComponent(new ƒ.ComponentMaterial(mtrCity));
      cityNode.addComponent(new ƒ.ComponentTransform());
      cityNode.mtxLocal.scale(new ƒ.Vector3(0.3, 0.3, 0.3));
  
      //paths[34].addChild(cityNode); //Why doesnt this work?
      paths[42].addChild(cityNode); // an Path 43 ist nun ein Interactable City gepflanz, no clue was ich damit anfange. -> Feindliche city einnehmbar indem Truppe draufgesetzt wird.
    }
  
    function useInteractable() { //Search function and how its used before.
      //Spielerfigur == position von interactable, soll dann hochzählen
      const path = paths.find((p) => p.mtxLocal.translation.equals(pacman.mtxLocal.translation, 0.2)); //Pacman ersetzen.
  
      if (path) {
        const city: ƒ.Node = path.getChild(0);
  
        if (city) {
          path.removeChild(city);
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

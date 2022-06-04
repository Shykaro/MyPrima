namespace Script {
  import ƒ = FudgeCore;

  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;

  window.addEventListener("load", init);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  export let viewport: ƒ.Viewport;
  let sounds: ƒ.ComponentAudio[];
  let pacman: ƒ.Node;
  let water: ƒ.Node[];    //Blocks that cant be set foot on with normal units
  let paths: ƒ.Node[];    //Building/Land are, every unit can walk on these

  export let mobs: Mob[] = [];   //Array for all created mobs/units
  let currentplayer: number = 1; //distinguishes between player 1 and 2
  let i = 0;
  export let currentUnitNumber: number = 0; //taken in account to cycle through the units to move them, used in Mob.move function
  export let iMoveY: number = 0;             //Necessary global variables to limit user to one move per time.
  export let iMoveYMinus: number = 0;
  export let iMoveX: number = 0;
  export let iMoveXMinus: number = 0;
  export let iLimitSpaceToOne: number = 0; //does the same as iMove, just only for the Space Enter Mob/Unit switch.
  export let finishedMobPlacement: Boolean = false; //If false, says youre able to move the unit, true says its done.

  export let movingDirection: string = "y";   //outdated?
  export let movement: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0); //outdated?

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
    pacman = graph.getChildrenByName("Pacman")[0];
    water = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
    paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();

    for (const path of paths) { //Herausfinden was das is
      addInteractable(path);
    }


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

    
    setSprite(pacman);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    movePacman();
    mobs.map((g) => g.move()); //g.move(paths));

    //mobs.move(paths);
    //mobs[2].move(paths);



    if (checkIfMove()) {
      if (!sounds[1].isPlaying && !movement.equals(new ƒ.Vector3(0, 0, 0))) {
        sounds[1].play(true);
      }
      useInteractable();
      pacman.mtxLocal.translate(movement);
    }

    //checkIfGameOver();

    viewport.draw();
  }

  function movePacman(): void {
    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("x")) {
        movement.set(1 / 60, 0, 0);
        rotateSprite("x");
        movingDirection = "x";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("-y")) {
        movement.set(0, -1 / 60, 0);
        rotateSprite("-y");
        movingDirection = "-y";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) &&
      (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("-x")) {
        movement.set(-1 / 60, 0, 0);
        rotateSprite("-x");
        movingDirection = "-x";
      }
    }

    if (
      ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
      (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
    ) {
      if (checkIfMove("y")) {
        movement.set(0, 1 / 60, 0);
        rotateSprite("y");
        movingDirection = "y";
      }
    }
  }

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
  }

  /* Not needed atm, is jsut for collision
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

  function addInteractable(_path: ƒ.Node): void {
    //random interactable auf der Map platzieren
    const mtrPill: ƒ.Material = new ƒ.Material(
      "Pill",
      ƒ.ShaderLit,
      new ƒ.CoatColored(ƒ.Color.CSS("#f5ce42"))
    );

    const pillNode = new ƒ.Node("Pill");
    pillNode.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
    pillNode.addComponent(new ƒ.ComponentMaterial(mtrPill));
    pillNode.addComponent(new ƒ.ComponentTransform());
    pillNode.mtxLocal.scale(new ƒ.Vector3(0.3, 0.3, 0.3));

    _path.addChild(pillNode);
  }

  function useInteractable() {
    //Spielerfigur == position von interactablle, soll dann hochzählen
    const path = paths.find((p) => p.mtxLocal.translation.equals(pacman.mtxLocal.translation, 0.2));

    if (path) {
      const pill: ƒ.Node = path.getChild(0);

      if (pill) {
        path.removeChild(pill);
      }
    }
  }

  function changeUnit(): void { //Is used to track current unit and change values accordingly -> NOT ANYMORE


    document.addEventListener('keydown', (event) => {
      var name = event.key;

      if (name === 'd' || name === 'ArrowRight') {
        mobs[currentUnitNumber].mtxLocal.translateX(1);
        console.log("trying to move right");
      }
      if (name === 'a' || name === 'ArrowLeft') {
        mobs[currentUnitNumber].mtxLocal.translateX(-1);
        console.log("trying to move Left");
      }
      if (name === 'w' || name === 'ArrowUp') {
        mobs[currentUnitNumber].mtxLocal.translateY(1);
        console.log("trying to move up");
      }
      if (name === 's' || name === 'ArrowDown') {
        mobs[currentUnitNumber].mtxLocal.translateY(-1);
        console.log("trying to move down");
      }

    })
  }




}

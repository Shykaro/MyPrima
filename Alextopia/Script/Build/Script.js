"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let dialog;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let sounds;
    let pacman;
    let water; //Blocks that cant be set foot on with normal units
    let paths; //Building/Land are, every unit can walk on these
    Script.mobs = []; //Array for all created mobs/units
    let currentplayer = 1; //distinguishes between player 1 and 2
    let i = 0;
    Script.currentUnitNumber = 0; //taken in account to cycle through the units to move them, used in Mob.move function
    Script.iMoveY = 0; //Necessary global variables to limit user to one move per time.
    Script.iMoveYMinus = 0;
    Script.iMoveX = 0;
    Script.iMoveXMinus = 0;
    Script.iLimitSpaceToOne = 0; //does the same as iMove, just only for the Space Enter Mob/Unit switch.
    Script.finishedMobPlacement = false; //If false, says youre able to move the unit, true says its done.
    Script.movingDirection = "y"; //outdated?
    Script.movement = new ƒ.Vector3(0, 0, 0); //outdated?
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        // @ts-ignore
        dialog.showModal();
    }
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources["Graph|2022-03-17T14:08:08.737Z|08207"];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", viewport);
        await Script.loadSprites();
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {
            bubbles: true,
            detail: viewport,
        }));
    }
    function start(_event) {
        Script.viewport = _event.detail;
        Script.viewport.camera.mtxPivot.translate(new ƒ.Vector3(3, 2, 15));
        Script.viewport.camera.mtxPivot.rotateY(180);
        const graph = Script.viewport.getBranch();
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
            i++;
            console.log("Mob" + i);
            const mob = new Script.Mob("Mob" + i);
            mob.mtxLocal.translate(new ƒ.Vector3(4, 3, 0));
            graph.addChild(mob);
            Script.mobs.push(mob);
            //Anzahl der Mobs generated im Array
            console.log(Script.mobs); //CHANGE THIS GLEICH SOFORT});
        });
        //Admin Menu End ------------------------------------------------------------------
        changeUnit(); //Funktion zum bewegen einer Unit in Main.ts
        Script.setSprite(pacman);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        movePacman();
        Script.mobs.map((g) => g.move()); //g.move(paths));
        //mobs.move(paths);
        //mobs[2].move(paths);
        if (checkIfMove()) {
            if (!sounds[1].isPlaying && !Script.movement.equals(new ƒ.Vector3(0, 0, 0))) {
                sounds[1].play(true);
            }
            useInteractable();
            pacman.mtxLocal.translate(Script.movement);
        }
        //checkIfGameOver();
        Script.viewport.draw();
    }
    function movePacman() {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkIfMove("x")) {
                Script.movement.set(1 / 60, 0, 0);
                Script.rotateSprite("x");
                Script.movingDirection = "x";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkIfMove("-y")) {
                Script.movement.set(0, -1 / 60, 0);
                Script.rotateSprite("-y");
                Script.movingDirection = "-y";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) &&
            (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05) {
            if (checkIfMove("-x")) {
                Script.movement.set(-1 / 60, 0, 0);
                Script.rotateSprite("-x");
                Script.movingDirection = "-x";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
            (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05) {
            if (checkIfMove("y")) {
                Script.movement.set(0, 1 / 60, 0);
                Script.rotateSprite("y");
                Script.movingDirection = "y";
            }
        }
    }
    function checkIfMove(_direction) {
        const y = pacman.mtxLocal.translation.y;
        const x = pacman.mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? Script.movingDirection) {
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
        const wall = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0.022));
        if (wall) {
            sounds[1].play(false);
            return false;
        }
        const path = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 1));
        if (!path) {
            sounds[1].play(false);
            return false;
        }
        return true;
    }
    Script.checkIfMove = checkIfMove;
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
    function addInteractable(_path) {
        //random interactable auf der Map platzieren
        const mtrPill = new ƒ.Material("Pill", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("#f5ce42")));
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
            const pill = path.getChild(0);
            if (pill) {
                path.removeChild(pill);
            }
        }
    }
    function changeUnit() {
        document.addEventListener('keydown', (event) => {
            var name = event.key;
            if (name === 'd' || name === 'ArrowRight') {
                Script.mobs[Script.currentUnitNumber].mtxLocal.translateX(1);
                console.log("trying to move right");
            }
            if (name === 'a' || name === 'ArrowLeft') {
                Script.mobs[Script.currentUnitNumber].mtxLocal.translateX(-1);
                console.log("trying to move Left");
            }
            if (name === 'w' || name === 'ArrowUp') {
                Script.mobs[Script.currentUnitNumber].mtxLocal.translateY(1);
                console.log("trying to move up");
            }
            if (name === 's' || name === 'ArrowDown') {
                Script.mobs[Script.currentUnitNumber].mtxLocal.translateY(-1);
                console.log("trying to move down");
            }
        });
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class Mob extends ƒ.Node {
        movement = new ƒ.Vector3(0, -1 / 600, 0);
        lastPath = new ƒ.Vector3(0, 0, 0);
        constructor(_name) {
            super(_name);
            const mesh = new ƒ.MeshSphere();
            const material = new ƒ.Material("MaterialGhost", ƒ.ShaderLit, new ƒ.CoatColored());
            const cmpTransform = new ƒ.ComponentTransform();
            const cmpMesh = new ƒ.ComponentMesh(mesh);
            const cmpMaterial = new ƒ.ComponentMaterial(material);
            cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
            this.addComponent(cmpTransform);
            this.addComponent(cmpMesh);
            this.addComponent(cmpMaterial);
            // sprites
            const sprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(Script.animations["mob"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.5);
            sprite.framerate = 10;
            this.addChild(sprite);
            this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
        changeUnit() {
            document.addEventListener('keydown', (event) => {
                var name = event.key;
                if (name === 'd' || name === 'ArrowRight') {
                    Script.mobs[Script.currentUnitNumber].mtxLocal.translateX(1);
                    console.log("trying to move right");
                }
                if (name === 'a' || name === 'ArrowLeft') {
                    Script.mobs[Script.currentUnitNumber].mtxLocal.translateX(-1);
                    console.log("trying to move Left");
                }
                if (name === 'w' || name === 'ArrowUp') {
                    Script.mobs[Script.currentUnitNumber].mtxLocal.translateY(1);
                    console.log("trying to move up");
                }
                if (name === 's' || name === 'ArrowDown') {
                    Script.mobs[Script.currentUnitNumber].mtxLocal.translateY(-1);
                    console.log("trying to move down");
                }
            });
        }
        //Bevor das hier aufgerufen wird MUSS der Lokale vektor gespeichert werden, da man von diesem aus die Position wechselt.
        move() {
            //Press Key for move into direction once
            /*if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D,])
            ) {
               //Adjust this to max out for one field
              //if (iMoveX == 0 && !finishedMobPlacement){
                //iMoveX = 1;
              //mobs[currentUnitNumber].mtxLocal.translateX(1);
              //console.log("trying to move right");
      
            //}
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
            ) {
              if (iMoveYMinus == 0 && !finishedMobPlacement){
                iMoveYMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(-1);
              }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
            )  {
              if (iMoveXMinus == 0 && !finishedMobPlacement){
                iMoveXMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateX(-1);
            }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
            ) {
              if (iMoveY == 0 && !finishedMobPlacement){
                iMoveY = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(1); //do mobs[x] for the according unit in the rooster. mobs[2].mtxLocal... for 3rd created unit
            }
          }
      
            if ( //After pressing space or enter the unit is placed and cant be moved anymore -> jump to next mob
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ENTER, ƒ.KEYBOARD_CODE.SPACE])
            ) {
                //finishedMobPlacement = true;
                if (iLimitSpaceToOne == 0){
                  iLimitSpaceToOne = 1;
                  currentUnitNumber++;
                  iMoveX = 0;           //Setze imoves zurück damit neue unit wieder verschoben werden kann
                  iMoveXMinus = 0;
                  iMoveY = 0;
                  iMoveYMinus = 0;
                  if(currentUnitNumber){ //useless, yet.
      
                  }
              }
            }
      */
            /*
                  if (
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
                  ) {
                    const possiblePaths: ƒ.Node[] = [];
            
                    // get possible paths
                    for (const path of _paths) {
                      if (
                        path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                        !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                      ) {
                        const isEvenPath =
                          (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
            
                        const isEvenLocal =
                          (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                            2 ===
                          0;
            
                        if (isEvenPath !== isEvenLocal) {
                          possiblePaths.push(path);
                        }
                      }
                    }
            
                    // lower probability for going back to same path
                    const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
            
                    if (possiblePaths.length !== 1 && index !== -1) {
                      const pathsCopy = possiblePaths.slice();
                      pathsCopy.splice(index, 1);
            
                    }
            
                    const path = possiblePaths[Math.floor(0.2 * possiblePaths.length)];
            
                    this.lastPath.set(
                      Math.round(this.mtxLocal.translation.x),
                      Math.round(this.mtxLocal.translation.y),
                      0
                    );
            
                    // set moving direction
                    if (path) {
                      if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, 1 / 600, 0);
                      } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                        this.movement.set(1 / 600, 0, 0);
                      } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, -1 / 600, 0);
                      } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                        //this.movement.set(-1 / 600, 0, 0);
                        this.mtxLocal.translation.x -= 1;
                      }
                    }
                  }
                  this.mtxLocal.translate(this.movement);
                
            */
            /*if (
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
            ) {
              const possiblePaths: ƒ.Node[] = [];
      
              // get possible paths
              for (const path of _paths) {
                if (
                  path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                  !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                ) {
                  const isEvenPath =
                    (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
      
                  const isEvenLocal =
                    (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                      2 ===
                    0;
      
                  if (isEvenPath !== isEvenLocal) {
                    possiblePaths.push(path);
                  }
                }
              }
      
              // lower probability for going back to same path
              const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
      
              if (possiblePaths.length !== 1 && index !== -1) {
                const pathsCopy = possiblePaths.slice();
                pathsCopy.splice(index, 1);
      
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy);
              }
      
              const path = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];
      
              this.lastPath.set(
                Math.round(this.mtxLocal.translation.x),
                Math.round(this.mtxLocal.translation.y),
                0
              );
      
              // set moving direction
              if (path) {
                if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, 1 / 60, 0);
                } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(1 / 60, 0, 0);
                } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, -1 / 60, 0);
                } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(-1 / 60, 0, 0);
                }
              }
            }
            this.mtxLocal.translate(this.movement);*/
        }
    }
    Script.Mob = Mob;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒAid = FudgeAid;
    Script.animations = {};
    let spritePacman;
    async function loadSprites() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("Assets/pacman-sprites.png");
        let spriteSheet = new ƒ.CoatTextured(undefined, imgSpriteSheet);
        generateSprites(spriteSheet);
    }
    Script.loadSprites = loadSprites;
    function generateSprites(_spritesheet) {
        const pacman = new ƒAid.SpriteSheetAnimation("pacman", _spritesheet);
        pacman.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 8, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
        const mob = new ƒAid.SpriteSheetAnimation("mob", _spritesheet);
        mob.generateByGrid(ƒ.Rectangle.GET(512, 0, 60, 64), 4, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
        Script.animations["pacman"] = pacman;
        Script.animations["mob"] = mob;
    }
    function setSprite(_node) {
        spritePacman = new ƒAid.NodeSprite("Sprite");
        spritePacman.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spritePacman.setAnimation(Script.animations["pacman"]);
        spritePacman.setFrameDirection(1);
        spritePacman.mtxLocal.translateZ(0.5);
        spritePacman.framerate = 15;
        _node.addChild(spritePacman);
        _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        spritePacman.mtxLocal.rotateZ(90);
    }
    Script.setSprite = setSprite;
    function rotateSprite(_direction) {
        if (_direction !== Script.movingDirection) {
            if ((_direction === "x" && Script.movingDirection === "y") ||
                (_direction === "-y" && Script.movingDirection === "x") ||
                (_direction === "-x" && Script.movingDirection === "-y") ||
                (_direction === "y" && Script.movingDirection === "-x")) {
                spritePacman.mtxLocal.rotateZ(-90);
            }
            else if ((_direction === "-x" && Script.movingDirection === "y") ||
                (_direction === "x" && Script.movingDirection === "-y") ||
                (_direction === "y" && Script.movingDirection === "x") ||
                (_direction === "-y" && Script.movingDirection === "-x")) {
                spritePacman.mtxLocal.rotateZ(90);
            }
            else if ((_direction === "-x" && Script.movingDirection === "x") ||
                (_direction === "x" && Script.movingDirection === "-x") ||
                (_direction === "y" && Script.movingDirection === "-y") ||
                (_direction === "-y" && Script.movingDirection === "y")) {
                spritePacman.mtxLocal.rotateZ(180);
            }
        }
    }
    Script.rotateSprite = rotateSprite;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map
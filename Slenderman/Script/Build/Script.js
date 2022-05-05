"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class DropToGroundInitial extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(DropToGroundInitial);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    document.addEventListener("interactiveViewportStarted", this.setPosition);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
        setPosition = () => {
            const graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"];
            const ground = graph
                .getChildrenByName("Environment")[0]
                .getChildrenByName("Ground")[0];
            const cmpMeshTerrain = ground.getComponent(ƒ.ComponentMesh);
            const meshTerrain = cmpMeshTerrain.mesh;
            const distance = meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, cmpMeshTerrain.mtxWorld).distance;
            this.node.mtxLocal.translateY(-distance);
        };
    }
    Script.DropToGroundInitial = DropToGroundInitial;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class DropToGroundMove extends ƒ.ComponentScript {
        static graph;
        static ground;
        static cmpMeshTerrain;
        static meshTerrain;
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(DropToGroundMove);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.setPosition);
        }
        setPosition = (_event) => {
            if (!DropToGroundMove.graph) {
                DropToGroundMove.graph = ƒ.Project.resources["Graph|2022-04-14T12:59:19.588Z|86127"];
                DropToGroundMove.ground = DropToGroundMove.graph
                    .getChildrenByName("Environment")[0]
                    .getChildrenByName("Ground")[0];
                DropToGroundMove.cmpMeshTerrain = DropToGroundMove.ground.getComponent(ƒ.ComponentMesh);
                DropToGroundMove.meshTerrain = DropToGroundMove.cmpMeshTerrain.mesh;
            }
            const distance = DropToGroundMove.meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, DropToGroundMove.cmpMeshTerrain.mtxWorld).distance;
            this.node.mtxLocal.translateY(-distance);
        };
    }
    Script.DropToGroundMove = DropToGroundMove;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let avatar;
    let camera;
    let graph;
    const speedRotY = -0.1;
    const speedRotX = 0.2;
    let rotationX = 0;
    let cntrWalk = new ƒ.Control("cntrWalk", 2, 0 /* PROPORTIONAL */, 300);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        graph = viewport.getBranch();
        avatar = graph.getChildrenByName("Avatar")[0];
        camera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
        viewport.camera = camera;
        viewport.getCanvas().addEventListener("pointermove", hndPointerMove);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        addTrees();
    }
    function update(_event) {
        //ƒ.Physics.simulate();  // if physics is included and used
        controlWalk();
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function hndPointerMove(_event) {
        //avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY))
        avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
        rotationX += _event.movementY * speedRotX;
        rotationX = Math.min(60, Math.max(-60, rotationX));
        camera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    }
    function controlWalk() {
        /*let input: number = ƒ.Keyboard.mapToTrit(
         [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP],
         [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]
       );
   
       cntrWalk.setInput(input);
       cntrWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 5 : 2);
   
       let input2: number = ƒ.Keyboard.mapToTrit(
         [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT],
         [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]
       );
       
       /*avatar
       .getComponent(ƒ.ComponentRigidbody)
       .setVelocity(ƒ.Vector3.SCALE(avatar.mtxLocal.getZ(), (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20));
   
       let vector = new ƒ.Vector3(
         (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20, 0, (cntrWalk.getOutput()*ƒ.Loop.timeFrameGame) / 20);
   
       vector.transform(avatar.mtxLocal, false);
   
       avatar.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);*/
        let input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
        cntrWalk.setInput(input);
        cntrWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 6 : 2);
        let input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
        avatar.mtxLocal.translateZ((cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 1000);
        avatar.mtxLocal.translateX((1.5 * input2 * ƒ.Loop.timeFrameGame) / 1000);
    }
    function addTrees() {
        const trees = graph.getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];
        for (let index = 0; index < 100; index++) {
            const position = ƒ.Random.default.getVector3(new ƒ.Vector3(29, 0, 29), new ƒ.Vector3(-29, 0, -29));
            const roundedPosition = new ƒ.Vector3(Math.round(position.x), Math.round(position.y), Math.round(position.z));
            if (!Script.Tree.takenPositions.find((p) => p.equals(roundedPosition))) {
                trees.addChild(new Script.Tree("Tree", roundedPosition));
            }
        }
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class SlendermanMoveSet extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(SlendermanMoveSet);
        // Properties may be mutated by users in the editor via the automatically created user interface
        timeToChange = 0;
        direction;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
        }
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    document.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.move);
                    break;
            }
        };
        move = (_event) => {
            console.log("Slenderman moves", this);
            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.direction, ƒ.Loop.timeFrameGame / 1000));
            if (this.timeToChange > ƒ.Time.game.get()) {
                return;
            }
            this.timeToChange = ƒ.Time.game.get() + 1000;
            this.direction = ƒ.Random.default.getVector3(new ƒ.Vector3(-1, 0, -1), new ƒ.Vector3(1, 0, 1));
        };
    }
    Script.SlendermanMoveSet = SlendermanMoveSet;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Tree extends ƒ.Node {
        static takenPositions = [];
        constructor(_name, _position) {
            super(_name);
            const cmpTransform = new ƒ.ComponentTransform();
            Tree.takenPositions.push(_position);
            Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z + 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z - 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z + 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z - 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x, _position.y, _position.z - 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x, _position.y, _position.z + 1));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z));
            Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z));
            this.addComponent(cmpTransform);
            this.mtxLocal.translation = _position;
            this.addComponent(new Script.DropToGroundInitial());
            this.addGraph();
        }
        async addGraph() {
            const treeGraph = await ƒ.Project.createGraphInstance(ƒ.Project.resources["Graph|2022-04-26T14:53:15.560Z|71402"]);
            this.addChild(treeGraph);
        }
    }
    Script.Tree = Tree;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map
namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

    enum JOB {
        SPAWN, IDLE, THROW, WIN
    }



    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(StateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = StateMachine.get();
        //public forceEscape: number = 25;
        //public torqueIdle: number = 5;
        private deltaTime: number = 0;
        private timeStamp: number = 1;
        private cmpBody: ƒ.ComponentRigidbody;
        private cmpMaterial: ƒ.ComponentMaterial;
        private cmpTransform: ƒ.ComponentTransform;

        public leftRightCoordination: number = 0;


        constructor() {
            super();
            this.instructions = StateMachine.instructions; // setup instructions with the static set

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            //const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
            //const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);

            /*const sprite: ƒAid.NodeSprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations["mob"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.1);
            sprite.mtxLocal.translateY(0.1);
            sprite.framerate = 8;
            sprite.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 1));*/


            //this.addChild(sprite);
            //this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }

        public static get(): ƒAid.StateMachineInstructions<JOB> {
            let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
            setup.transitDefault = StateMachine.transitDefault;
            setup.actDefault = StateMachine.actDefault;
            setup.setAction(JOB.SPAWN, <ƒ.General>this.actSpawn);
            setup.setAction(JOB.IDLE, <ƒ.General>this.actIdle);
            setup.setAction(JOB.THROW, <ƒ.General>this.actThrow);
            setup.setAction(JOB.WIN, <ƒ.General>this.actWin);
            setup.setTransition(JOB.THROW, JOB.WIN, <ƒ.General>this.transitWin);
            return setup;
        }

        private static transitDefault(_machine: StateMachine): void {
            //console.log("Transit to", _machine.stateNext);
        }

        private static async actSpawn(_machine: StateMachine): Promise<void> {
            _machine.transit(JOB.IDLE);
        }

        private static async actDefault(_machine: StateMachine): Promise<void> {
            //console.log(JOB[_machine.stateCurrent]);
            _machine.transit(JOB.IDLE);
        }

        private static async actIdle(_machine: StateMachine): Promise<void> { //THIS SOMEWHAT WORKS NOW, GOODLUCKT TOMORROW
            let currPos: ƒ.Vector3 = _machine.node.mtxLocal.translation;
            _machine.timeStamp += 1 * _machine.deltaTime / 2;
            if (catPH.activate) {
                catPH.activate(true);
                catThrowPH.activate(false);
            }
            if ((StateMachine.sinHorizontal(_machine.timeStamp)) > 1.99 && leftRightCoordination === 0) {
                leftRightCoordination = 1;
                const graph: ƒ.Node = viewport.getBranch();
                const catSprite: ƒ.Node = graph.getChildrenByName("StateMachine")[0].getChildrenByName("SpriteCat")[0];
                catSprite.mtxLocal.scaleX(-1);
            };
            if ((StateMachine.sinHorizontal(_machine.timeStamp)) < -1.99 && leftRightCoordination === 1) {
                leftRightCoordination = 0;
                const graph: ƒ.Node = viewport.getBranch();
                const catSprite: ƒ.Node = graph.getChildrenByName("StateMachine")[0].getChildrenByName("SpriteCat")[0];
                catSprite.mtxLocal.scaleX(-1);
            };
            _machine.cmpTransform.mtxLocal.translation = new ƒ.Vector3(StateMachine.sinHorizontal(_machine.timeStamp) * 2.5 + 5, 6, currPos.z); //( --- , StateMachine.sin(_machine.timeStamp + ???, currPos.z + 0.01)
            StateMachine.actDefault(_machine);

            if (throwBoolean) {
                _machine.transit(JOB.THROW);
            }
            if (wonBoolean) {
                _machine.transit(JOB.WIN);
            }
        }
        private static async actThrow(_machine: StateMachine): Promise<void> {
            if (throwBoolean) {
                catPH.activate(false);
                catThrowPH.activate(true);
            }
            throwBoolean = false;

            setTimeout(() => {
                StateMachine.actDefault(_machine);
                _machine.transit(JOB.IDLE);
            }, 1000);

        }
        private static async actWin(_machine: StateMachine): Promise<void> {
            catPH.activate(false);
            catWinPH.activate(true);
            wonBoolean = false;
            StateMachine.actDefault(_machine);
        }

        private static transitWin(_machine: StateMachine): void {
        }

        // Activate the functions of this component as response to events
        private hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case ƒ.EVENT.COMPONENT_ADD:
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case ƒ.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    break;
                case ƒ.EVENT.NODE_DESERIALIZED:
                    this.cmpBody = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.cmpMaterial = this.node.getComponent(ƒ.ComponentMaterial); //cmpMaterial is used here, why does it say its not used?!
                    this.cmpTransform = this.node.getComponent(ƒ.ComponentTransform);
                    this.cmpBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
                        if (_event.cmpRigidbody.node.name == "runner")
                            this.transit(JOB.WIN);
                    });
                    let trigger: ƒ.ComponentRigidbody = this.node.getChildren()[0].getComponent(ƒ.ComponentRigidbody);
                    trigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
                        //console.log("TriggerEnter", _event.cmpRigidbody.node.name);
                        if (_event.cmpRigidbody.node.name == "runner" && this.stateCurrent != JOB.WIN)
                            this.transit(JOB.THROW);
                    });
                    trigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_EXIT, (_event: ƒ.EventPhysics) => {
                        if (this.stateCurrent == JOB.THROW)
                            this.transit(JOB.IDLE);
                    });
                    break;
            }
        }

        private update = (_event: Event): void => {
            this.act();
            this.deltaTime = this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
        }

        //private static sin = (x: number): number => {
        //    return Math.sin(Math.PI * x) * 0.3;
        //}

        private static sinHorizontal = (x: number): number => {
            return Math.sin(1 * x) * 2;
        }






        // protected reduceMutator(_mutator: ƒ.Mutator): void {
        //   // delete properties that should not be mutated
        //   // undefined properties and private fields (#) will not be included by default
        // }
    }
}
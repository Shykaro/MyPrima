namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

    enum JOB {
        SPAWN, IDLE, ESCAPE, STAY
    }



    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(StateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = StateMachine.get();
        //public forceEscape: number = 25;
        //public torqueIdle: number = 5;
        private deltaTime: number = 0;
        private timeStamp: number = 0;
        private cmpBody: ƒ.ComponentRigidbody;
        private cmpMaterial: ƒ.ComponentMaterial;
        private cmpTransform: ƒ.ComponentTransform;



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
            setup.setAction(JOB.ESCAPE, <ƒ.General>this.actEscape);
            setup.setAction(JOB.STAY, <ƒ.General>this.actDie);
            setup.setTransition(JOB.ESCAPE, JOB.STAY, <ƒ.General>this.transitStay);
            return setup;
        }

        private static transitDefault(_machine: StateMachine): void {
            console.log("Transit to", _machine.stateNext);
        }

        private static async actSpawn(_machine: StateMachine): Promise<void> {
            //console.log(JOB[_machine.stateCurrent]);
            //let terrainInfo: ƒ.TerrainInfo = meshTerrain.getTerrainInfo(_machine.node.mtxWorld.translation, mtxTerrain);
            //if (terrainInfo.distance < 0.5)
            //  _machine.cmpBody.applyForce(ƒ.Vector3.Y(20));

            //const enemy = ƒ.Random.default.getElement(ObserverMob.observer);
            //observer.addChild(new Enemy("Enemy", enemy));

        }

        private static async actDefault(_machine: StateMachine): Promise<void> {
            //console.log(JOB[_machine.stateCurrent]);
            //let terrainInfo: ƒ.TerrainInfo = meshTerrain.getTerrainInfo(_machine.node.mtxWorld.translation, mtxTerrain);
            //if (terrainInfo.distance < 0.5)
            //  _machine.cmpBody.applyForce(ƒ.Vector3.Y(20));
            console.log(JOB[_machine.stateCurrent]);
            
        }

        private static async actIdle(_machine: StateMachine): Promise<void> { //THIS SOMEWHAT WORKS NOW, GOODLUCKT TOMORROW
            _machine.cmpMaterial.clrPrimary = ƒ.Color.CSS("magenta");
            let currPos: ƒ.Vector3 = _machine.node.mtxLocal.translation;
            _machine.timeStamp += 1 * _machine.deltaTime;
            _machine.cmpTransform.mtxLocal.translation = new ƒ.Vector3(StateMachine.sinHorizontal(_machine.timeStamp), StateMachine.sin(_machine.timeStamp) + 0.5, currPos.z);
            StateMachine.actDefault(_machine);
        }
        private static async actEscape(_machine: StateMachine): Promise<void> {
            _machine.cmpMaterial.clrPrimary = ƒ.Color.CSS("white");
            //let difference: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(_machine.node.mtxWorld.translation, cart.mtxWorld.translation);
            //difference.normalize(_machine.forceEscape);
            //_machine.cmpBody.applyForce(difference);
            StateMachine.actDefault(_machine);
        }
        private static async actDie(_machine: StateMachine): Promise<void> {
            //
        }

        private static transitStay(_machine: StateMachine): void {
            //_machine.cmpBody.applyLinearImpulse(ƒ.Vector3.Y(5));
            //let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 100, 20, (_event: ƒ.EventTimer) => {
            //  _machine.cmpMaterial.clrPrimary = ƒ.Color.CSS("black", 1 - _event.count / 20);
            //  if (_event.lastCall)
            //    _machine.transit(JOB.STAY);
            //});
            //console.log(timer);
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
                this.cmpMaterial = this.node.getComponent(ƒ.ComponentMaterial);
                this.cmpTransform = this.node.getComponent(ƒ.ComponentTransform);
                this.cmpBody.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
                  if (_event.cmpRigidbody.node.name == "runner")
                    this.transit(JOB.STAY);
                });
                let trigger: ƒ.ComponentRigidbody = this.node.getChildren()[0].getComponent(ƒ.ComponentRigidbody);
                trigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, (_event: ƒ.EventPhysics) => {
                  //console.log("TriggerEnter", _event.cmpRigidbody.node.name);
                  if (_event.cmpRigidbody.node.name == "runner" && this.stateCurrent != JOB.STAY)
                    this.transit(JOB.ESCAPE);
                });
                trigger.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_EXIT, (_event: ƒ.EventPhysics) => {
                  if (this.stateCurrent == JOB.ESCAPE)
                    this.transit(JOB.IDLE);
                });
                break;
            }
          }

        private update = (_event: Event): void => {
            this.act();
            this.deltaTime = this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
        }

        private static sin = (x: number): number => {
            return Math.sin(Math.PI * x) * 0.3;
        }

        private static sinHorizontal = (x: number): number => {
            return Math.sin(1 * x) * 2;
        }




        // protected reduceMutator(_mutator: ƒ.Mutator): void {
        //   // delete properties that should not be mutated
        //   // undefined properties and private fields (#) will not be included by default
        // }
    }
}
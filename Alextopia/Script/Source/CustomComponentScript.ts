namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class BackgroundCoinScript extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(BackgroundCoinScript);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "BackgroundCoinScript added to ";

    public pointInTime: number = 0;

    // WELCOME TO THE CRITERIA COIN. HONESTLY JIRKA, IAM SORRY. BUT ALSO, I CAN'T REALLY INCLUDE ALL CRITERIAS IN MY GAME, SO HERE'S THE SOLUTION. 
    // THE GAME HAS NOW ITS OWN MASCOT. WHICH IS AN INDEFINITLY IMPORTANT PART OF THE CORE GAMEPLAY MECHANIC SINCE IT JUDGES THE PLAYER.

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Debug.log(this.message, this.node);
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    public update = (_event: Event) => {
      let deltaTime: number = ƒ.Loop.timeFrameReal / 1000;
      this.node.mtxLocal.rotateY(180 * deltaTime);
      this.pointInTime += 1 * deltaTime;
      let currPos: ƒ.Vector3 = this.node.mtxLocal.translation;
      this.node.mtxLocal.translation = new ƒ.Vector3(currPos.x,(this.sin(this.pointInTime)-1.5),currPos.z);
      //console.log("sin", this.sin(this.timeStamp));
    }

    public sin(x: number): number {
      return Math.sin(Math.PI*x)*0.3;
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}
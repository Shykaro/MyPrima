namespace Script {
    import ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

    export class SlendermanMoveSet extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(SlendermanMoveSet);
    // Properties may be mutated by users in the editor via the automatically created user interface
    private timeToChange: number = 0;
    private direction: ƒ.Vector3;

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
    }


    public hndEvent = (_event: Event): void => {
        switch (_event.type) {
          case ƒ.EVENT.COMPONENT_ADD:
            document.addEventListener(ƒ.EVENT.RENDER_PREPARE, this.move);
            break;
        }
      };

    private move = (_event: Event) : void => {
          console.log("Slenderman moves", this);
          this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.direction, ƒ.Loop.timeFrameGame/1000));

          if(this.timeToChange > ƒ.Time.game.get()){
              return
          }
          this.timeToChange = ƒ.Time.game.get() + 1000;

          this.direction = ƒ.Random.default.getVector3(new ƒ.Vector3(-1, 0, -1), new ƒ.Vector3(1, 0, 1))


    }
}
}
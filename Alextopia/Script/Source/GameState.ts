namespace Script { //Accidently did a classic VUI, so this Gamestate mutable is useable but not really integrated. Whoops.
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;
  
    export class GameState extends ƒ.Mutable {
      public battery: number = 1;
  
      public constructor() {
        super();
        const domVui: HTMLDivElement = document.querySelector("div#vui");
        console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
      }
  
      protected reduceMutator(_mutator: ƒ.Mutator): void {}
    }
  }
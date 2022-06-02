declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    let mobs: Mob[];
    let movingDirection: string;
    let movement: ƒ.Vector3;
    function checkIfMove(_direction?: string): boolean;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob extends ƒ.Node {
        private movement;
        private lastPath;
        constructor(_name: string);
        move(_paths: ƒ.Node[]): void;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    let animations: ƒAid.SpriteSheetAnimations;
    function loadSprites(): Promise<void>;
    function setSprite(_node: ƒ.Node): void;
    function rotateSprite(_direction: string): void;
}

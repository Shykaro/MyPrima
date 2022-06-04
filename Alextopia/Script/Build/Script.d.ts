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
    let currentUnitNumber: number;
    let iMoveY: number;
    let iMoveYMinus: number;
    let iMoveX: number;
    let iMoveXMinus: number;
    let iLimitSpaceToOne: number;
    let finishedMobPlacement: Boolean;
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
        changeUnit(): void;
        move(): void;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    let animations: ƒAid.SpriteSheetAnimations;
    function loadSprites(): Promise<void>;
    function setSprite(_node: ƒ.Node): void;
    function rotateSprite(_direction: string): void;
}

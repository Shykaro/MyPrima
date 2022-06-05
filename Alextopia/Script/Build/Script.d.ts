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
    let mobs2: Mob2[];
    let mobsP2: MobP2[];
    let mobs2P2: Mob2P2[];
    let currentUnitNumber: number;
    let currentUnitNumberP2: number;
    let iMoveY: number;
    let iMoveYMinus: number;
    let iMoveX: number;
    let iMoveXMinus: number;
    let iLimitSpaceToOne: number;
    let finishedMobPlacement: Boolean;
    let movingDirection: string;
    let movement: ƒ.Vector3;
    function checkIfMoveMob(_direction?: string): boolean;
    function checkIfMoveMobP2(_direction?: string): boolean;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob extends ƒ.Node {
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob2 extends ƒ.Node {
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob2P2 extends ƒ.Node {
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class MobP2 extends ƒ.Node {
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    let animations: ƒAid.SpriteSheetAnimations;
    function loadSprites(): Promise<void>;
    function setSprite(_node: ƒ.Node): void;
    function setSpritePaths(_node: ƒ.Node): void;
}

declare namespace Script {
    import ƒ = FudgeCore;
    class BackgroundCoinScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        pointInTime: number;
        constructor();
        hndEvent: (_event: Event) => void;
        update: (_event: Event) => void;
        sin(x: number): number;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let viewport: ƒ.Viewport;
    let paths: ƒ.Node[];
    let cityNode: City[];
    let cityNodeP2: CityP2[];
    let mobsAnzPlayer1: number;
    let mobsAnzPlayer2: number;
    let healthUnitSmall: number;
    let healthUnitBig: number;
    let dmgUnitSmall: number;
    let dmgUnitBig: number;
    let currentplayer: number;
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
    import ƒAid = FudgeAid;
    let animations: ƒAid.SpriteSheetAnimations;
    function loadSprites(): Promise<void>;
    function setSprite(_node: ƒ.Node): void;
    function setSpritePaths(_node: ƒ.Node): void;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class City extends ƒ.Node {
        constructor(_name: string);
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CityP2 extends ƒ.Node {
        constructor(_name: string);
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Light extends ƒ.Node {
        constructor(_name: string);
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob2 extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob2P2 extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class MobP2 extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        move(): void;
    }
}

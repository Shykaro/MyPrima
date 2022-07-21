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
    let leftRightCoordination: number;
    let throwBoolean: Boolean;
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
    function setSpriteCat(_node: ƒ.Node): void;
    function setSpriteCatThrow(_node: ƒ.Node): void;
}
declare namespace Script {
    import ƒAid = FudgeAid;
    enum JOB {
        SPAWN = 0,
        IDLE = 1,
        THROW = 2,
        STAY = 3
    }
    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        private deltaTime;
        private timeStamp;
        private cmpBody;
        private cmpMaterial;
        private cmpTransform;
        leftRightCoordination: number;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actSpawn;
        private static actDefault;
        private static actIdle;
        private static actThrow;
        private static actDie;
        private static transitStay;
        private hndEvent;
        private update;
        private static sin;
        private static sinHorizontal;
    }
    export {};
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Balance extends ƒ.Node {
        static costOfMobs: any;
    }
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
        health: number;
        dmg: number;
        constructor(_name: string);
        spawn(): void;
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob2 extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        spawn(): void;
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Mob2P2 extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        spawn(): void;
        move(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class MobP2 extends ƒ.Node {
        private health;
        private dmg;
        constructor(_name: string);
        spawn(): void;
        move(): void;
    }
}

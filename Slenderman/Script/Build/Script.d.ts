declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundInitial extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        private setPosition;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundMove extends ƒ.ComponentScript {
        private static graph;
        private static ground;
        private static cmpMeshTerrain;
        private static meshTerrain;
        static readonly iSubclass: number;
        constructor();
        setPosition: (_event: Event) => void;
    }
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class SlendermanMoveSet extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private timeToChange;
        private direction;
        constructor();
        hndEvent: (_event: Event) => void;
        private move;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Tree extends ƒ.Node {
        static takenPositions: ƒ.Vector3[];
        constructor(_name: string, _position: ƒ.Vector3);
        private addGraph;
    }
}

"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let dialog;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start);
    let sounds; //outdated? i need it for later
    let water; //Blocks that cant be set foot on with normal units - Beinhaltet jeden Wasserblock in einem Array gespeichert
    Script.cityNode = []; //City = new ƒ.Node("CityP2");
    Script.cityNodeP2 = []; //City = new ƒ.Node("CityP2");
    Script.mobs = []; //Array for all created mobs/units
    Script.mobs2 = []; //Array for all created mobs/units
    Script.mobsP2 = []; //Array for all created mobs/units
    Script.mobs2P2 = []; //Array for all created mobs/units
    let costMob = 14; //Kosten für eine normale Einheit
    let costMob2 = 26; //Kosten für eine stärkere Einheit
    let goldGain = 10; //Geld die jeder Spieler am Anfang seines Zuges bekommt ##Adjustable for balancing,  //Das stimmt NICHTMEHR-> beachte dass für den Start des Spiels jeder Spieler einmal den Goldgain erhält
    let gold = costMob + 0; //StartGeld für Spieler 1 PLUS costMob weil die Unit am anfang verschenkt wird!!
    let goldP2 = costMob + 0; //StartGeld für Spieler 2
    let mobBuyLimit = 1; //Adjust this number if players should be able to buy more than 1 unit per turn.
    let turnPhaseOne = "Bewege deine Einheiten, drücke Enter zum Bestätigen der Position.";
    let turnPhaseTwo = "Produziere Truppen oder rüste deine Stadt auf, drücke Enter zum fortfahren.";
    //document.getElementById("--headingInfo").setAttribute('value', turnPhaseOne/Two);
    let zwischenSpeicherCoordinateLRC = new ƒ.Vector3(0, 0, 0); //LRC = LimitReachCheck, used in checking that unit can only work one field from origin.
    let zwischenSpeicherCoordinateLRCP2 = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckX = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckY = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckXMinus = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckYMinus = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckStay = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckXP2 = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckYP2 = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckXMinusP2 = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckYMinusP2 = new ƒ.Vector3(0, 0, 0);
    let possibleLimitReachedCheckStayP2 = new ƒ.Vector3(0, 0, 0);
    Script.currentplayer = 1; //distinguishes between player 1 and 2 and also who starts!!
    let currentPhase = 1; //Distinguishes between phase 1 (placing troops, which might as well be different phases all together) and phase 2 (choosing cities to produce troops)
    let i = 0;
    let roundsPlayed = 0; //if console logged shows round passed (keep in mind that it should be used -2 since the game starts in turn 3)
    let addMobLimitCounter = mobBuyLimit; //limits how many units per round can be bought for P1. -> adjust mobBuyLimit to change this
    let addMobLimitCounterP2 = mobBuyLimit; //limits how many units per round can be bought for P2. -> adjust mobBuyLimit to change this
    Script.currentUnitNumber = 0; //taken in account to cycle through the units to move them, used in Mob.move function
    Script.currentUnitNumberP2 = 0; //taken in account to cycle through the units to move them, used in Mob.move function
    Script.iMoveY = 0; //Necessary global variables to limit user to one move per time. ALLE OBSOLET.
    Script.iMoveYMinus = 0; //outdated? yes
    Script.iMoveX = 0; //outdated? yes
    Script.iMoveXMinus = 0; //outdated? yes
    Script.iLimitSpaceToOne = 0; //does the same as iMove, just only for the Space Enter Mob/Unit switch.
    Script.finishedMobPlacement = false; //If false, says youre able to move the unit, true says its done.
    Script.movingDirection = "y";
    Script.movement = new ƒ.Vector3(0, 0, 0); //outdated? yes
    //------------ TO-DO'S -------------------------------------------------------------------
    // Start on Unit to unit intercation ?? How do they interact, do they have HP or other Stats? -> Do another spawn RANDOM button for enemy units, let every unit move by one and automatically change side when everyone moved/interacted.
    // ein fking UI <-- Important, less complexity, machen sobald ich kb auf programming aber Zeit habe.
    // Handle Player swap -> currentPlayerSwapHandle()
    // Start implementing different rounds in a players turn -> unit moving -> unit producing -> playerswap
    // Add Gold mechanic
    // Random Map generator
    // 
    // 
    //
    // ++ DONE Unit should only be able to walk 1 field from starting position, maybe test with random spawnfields for Unit +1 button.
    // ++ DONE but maybe needs rework ++ Graphics, like terrain and Units
    //------------ TO-DO'S End ---------------------------------------------------------------
    //------------ Notizen -------------------------------------------------------------------
    // Do random maps as external data save and load.
    // Money Balancing überlegen -> stadt upgradable?
    // Ui Zeigt leben der Einheiten wenn diese nicht onehit sterben sollten.
    //
    //
    //------------ Notizen End ---------------------------------------------------------------
    function init(_event) {
        dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
            dialog.close();
            startInteractiveViewport();
        });
        // @ts-ignore
        dialog.showModal();
    }
    async function startInteractiveViewport() {
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources["Graph|2022-03-17T14:08:08.737Z|08207"];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", viewport);
        await Script.loadSprites();
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {
            bubbles: true,
            detail: viewport,
        }));
    }
    function start(_event) {
        Script.viewport = _event.detail;
        Script.viewport.camera.mtxPivot.translate(new ƒ.Vector3(5, 2.5, 15));
        Script.viewport.camera.mtxPivot.rotateY(180);
        const graph = Script.viewport.getBranch();
        document.getElementById("--plusmob").innerHTML = "Cost: " + costMob;
        document.getElementById("--plusmob2").innerHTML = "Cost: " + costMob2;
        document.getElementById("--plusmobP2").innerHTML = "Cost: " + costMob;
        document.getElementById("--plusmob2P2").innerHTML = "Cost: " + costMob2;
        ƒ.AudioManager.default.listenTo(graph);
        sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
        //pacman = graph.getChildrenByName("Pacman")[0];
        water = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
        Script.paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();
        for (const path of Script.paths) { //Herausfinden was das is
            //addInteractable(path);
        }
        document.getElementById("vui").style.visibility = 'visible'; //Vui einschalten
        document.getElementById("--addMob").style.display = 'none'; //Mob menü ausschalten
        document.getElementById("--addMobP2").style.display = 'none'; //Mob menü ausschalten
        const city = new Script.City("City");
        const cityP2 = new Script.CityP2("CityP2");
        Script.cityNode.push(city);
        Script.cityNodeP2.push(cityP2);
        //Positions of starting Cities
        Script.paths[44].addChild(city);
        Script.paths[34].addChild(cityP2);
        //Test console Logs
        console.log(Script.paths);
        console.log(water);
        console.log(Script.cityNode);
        console.log(Script.cityNodeP2);
        //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
        for (let i = 1; i < 10; i++) { //goes through all 9 possible Units
            for (let ii = 1; ii < 5; ii++) { //goes through all 4 possible unit variations
                //console.log("--" + i + "img" + ii)
                document.getElementById("--" + i + "img" + ii).style.display = 'none';
            }
        }
        ;
        //Admin  Menu -------------------------------------------------------------------- ->>>>> Repurposed with -- to normal city troop adding!!
        document.getElementById("--plusmob").addEventListener("click", (event) => {
            creatingMob(1, graph, city, cityP2);
        });
        document.getElementById("--plusmob2").addEventListener("click", (event) => {
            creatingMob(2, graph, city, cityP2);
        });
        document.getElementById("--plusmobP2").addEventListener("click", (event) => {
            creatingMob(3, graph, city, cityP2);
        });
        document.getElementById("--plusmob2P2").addEventListener("click", (event) => {
            creatingMob(4, graph, city, cityP2);
        });
        document.getElementById("changePlayer").addEventListener("click", (event) => {
            if (Script.currentplayer === 1) {
                Script.currentplayer = 2;
            }
            else {
                Script.currentplayer = 1;
            }
            console.log("Current turn player is now: " + Script.currentplayer); //CHANGE THIS GLEICH SOFORT});
            document.getElementById("currentPlayer").setAttribute('value', Script.currentplayer.toString());
        });
        //Admin Menu End ------------------------------------------------------------------
        changeUnit(); //Funktion zum bewegen einer Unit in Main.ts
        water.forEach(function (item, index) {
            Script.setSprite(water[index]);
        });
        Script.paths.forEach(function (item, index) {
            Script.setSpritePaths(Script.paths[index]);
        });
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continuously draw the viewport, update the audiosystem and drive the physics i/a
        //gebe den Spielern ihre Start-sachen --------------------------------------------------------------------
        creatingMob(1, graph, city, cityP2); //Gibt eine mob - unit zu Stadt von Spieler1
        creatingMob(3, graph, city, cityP2); //Gibt eine mobP2 - unit zu Stadt von Spieler2
        //skips 2 turns, so players have start gold and some Bugs are shoved away lol 
        logInUnit();
        handleEndOfCityProcedure(Script.currentUnitNumber, 2);
        logInUnitP2();
        handleEndOfCityProcedure(Script.currentUnitNumber, 1);
        //Ende start items ---------------------------------------------------------------------------------------
    } //ENDKLAMMER FÜR START FUNKTION -------------------------------------------------------------------------------------
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        //document.getElementById("--goldInput").setAttribute('value', gold.toString());
        //document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
        Script.mobs.map((g) => g.move()); //g.move(paths));
        Script.mobs2.map((g) => g.move()); //g.move(paths));
        Script.mobsP2.map((g) => g.move()); //g.move(paths));
        Script.mobs2P2.map((g) => g.move()); //g.move(paths));
        Script.viewport.draw();
        if (addMobLimitCounter == 0) {
            document.getElementById("--plusmob").setAttribute('disabled', "");
            document.getElementById("--plusmob2").setAttribute('disabled', "");
        }
        if (addMobLimitCounterP2 == 0) {
            document.getElementById("--plusmobP2").setAttribute('disabled', "");
            document.getElementById("--plusmob2P2").setAttribute('disabled', "");
        }
        if (addMobLimitCounter > 0) {
            document.getElementById("--plusmob").removeAttribute('disabled');
            document.getElementById("--plusmob2").removeAttribute('disabled');
        }
        if (addMobLimitCounterP2 > 0) {
            document.getElementById("--plusmobP2").removeAttribute('disabled');
            document.getElementById("--plusmob2P2").removeAttribute('disabled');
        }
    }
    // ------------- Moving Mob abteil für beide Spieler ---------------------------------------------------
    function changeUnit() {
        document.addEventListener('keydown', (event) => {
            var name = event.key;
            if (Script.currentplayer === 1) {
                if (currentPhase === 1) {
                    //console.log(mobs[currentUnitNumber].mtxLocal + " and " + currentUnitNumber);
                    if (name === 'd' || name === 'ArrowRight') {
                        //currentMobPosition = new ƒ.Vector3(mobs[currentUnitNumber].mtxLocal.translation.x, mobs[currentUnitNumber].mtxLocal.translation.y, 0);
                        if (checkIfMoveMob("x")) {
                            Script.mobs[Script.currentUnitNumber].mtxLocal.translateX(1);
                            //console.log("trying to move right");
                        }
                    }
                    if (name === 'a' || name === 'ArrowLeft') {
                        if (checkIfMoveMob("-x")) {
                            Script.mobs[Script.currentUnitNumber].mtxLocal.translateX(-1);
                            //console.log("trying to move Left");
                        }
                    }
                    if (name === 'w' || name === 'ArrowUp') {
                        if (checkIfMoveMob("y")) {
                            Script.mobs[Script.currentUnitNumber].mtxLocal.translateY(1);
                            //console.log("trying to move up");
                        }
                    }
                    if (name === 's' || name === 'ArrowDown') {
                        if (checkIfMoveMob("-y")) {
                            Script.mobs[Script.currentUnitNumber].mtxLocal.translateY(-1);
                            //console.log("trying to move down");
                        }
                    }
                    if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
                        if (Script.currentplayer === 1) {
                            //currentPhase = 2;
                            logInUnit(); //also end of turn procedure if its not the last unit.
                        }
                        return;
                    }
                }
                if (currentPhase === 2) { //Shuts down the other key down events, initiates or gives time for phase 2
                    if (name === 'Space' || name === 'Enter') {
                        handleEndOfCityProcedure(Script.currentUnitNumber, 2);
                        //console.log("Please work");
                        //document.getElementById("--unitdiv1P2").style.borderColor = "red";
                        //document.getElementById("--unitdiv" + (currentUnitNumber + 1)).style.borderColor = "#048836";
                        //currentPhase = 1;
                        //currentplayer = 2;
                        //document.getElementById("--addMob").style.display = 'none';
                        //console.log("ENDING P1");
                        //handleUiPlayerswap();
                        //goldP2 += goldGain;
                        //document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                        //document.getElementById("--goldP2").style.display = null;
                        //document.getElementById("--gold").style.display = 'none';
                        return;
                    }
                }
            }
            if (Script.currentplayer === 2) {
                if (currentPhase === 1) {
                    if (name === 'd' || name === 'ArrowRight') {
                        if (checkIfMoveMobP2("x")) {
                            Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translateX(1);
                            //console.log("trying to move right");
                        }
                    }
                    if (name === 'a' || name === 'ArrowLeft') {
                        if (checkIfMoveMobP2("-x")) {
                            Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translateX(-1);
                            //console.log("trying to move Left");
                        }
                    }
                    if (name === 'w' || name === 'ArrowUp') {
                        if (checkIfMoveMobP2("y")) {
                            Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translateY(1);
                            //console.log("trying to move up");
                        }
                    }
                    if (name === 's' || name === 'ArrowDown') {
                        if (checkIfMoveMobP2("-y")) {
                            Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translateY(-1);
                            //console.log("trying to move down");
                        }
                    }
                    if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
                        if (Script.currentplayer === 2) {
                            //currentPhase = 2;
                            logInUnitP2(); //also end of turn procedure if its not the last unit.
                        }
                        return;
                    }
                }
                if (currentPhase === 2) {
                    if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
                        handleEndOfCityProcedure(Script.currentUnitNumberP2, 1);
                        ///document.getElementById("--unitdiv1").style.borderColor = "red";
                        //document.getElementById("--unitdiv" + (currentUnitNumberP2 + 1) + "P2").style.borderColor = "#048836";
                        //currentPhase = 1;
                        //currentplayer = 1;
                        //document.getElementById("--addMobP2").style.display = 'none';
                        //console.log("ENDING P2");
                        //handleUiPlayerswap();
                        //gold += goldGain;
                        //document.getElementById("--goldInput").setAttribute('value', gold.toString());
                        //document.getElementById("--gold").style.display = null;
                        //document.getElementById("--goldP2").style.display = 'none';
                        return;
                    }
                }
            }
        });
    }
    // ------------- Check Moving Mob abteil Anfang für Spieler 1 ---------------------------------------------------
    function checkIfMoveMob(_direction) {
        const y = Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y;
        const x = Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? Script.movingDirection) {
            case "x":
                newPosition = new ƒ.Vector3(x + 1, y, 0);
                zwischenSpeicherCoordinateLRC.set(((Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x) + 1), Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
                break;
            case "-x":
                newPosition = new ƒ.Vector3(x - 1, y, 0);
                zwischenSpeicherCoordinateLRC.set(((Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x) - 1), Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
                break;
            case "y":
                newPosition = new ƒ.Vector3(x, y + 1, 0);
                zwischenSpeicherCoordinateLRC.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, ((Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y) + 1), 0);
                break;
            case "-y":
                newPosition = new ƒ.Vector3(x, y - 1, 0);
                zwischenSpeicherCoordinateLRC.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, ((Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y) - 1), 0);
                break;
            default:
                break;
        }
        const wall = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0));
        if (wall) {
            //sounds[1].play(false);
            return false;
        }
        const path = Script.paths.find((p) => p.mtxLocal.translation.equals(newPosition, 0));
        if (!path) {
            //sounds[1].play(false);
            return false;
        }
        if (zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckStay) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckX)
            || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckY) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckXMinus) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckYMinus)) {
            return true;
        }
        else {
            return false; //Changed this to false since only if mob still in allowed grid it is allowed to move -> allowed to return true
        }
    }
    Script.checkIfMoveMob = checkIfMoveMob;
    // ------------- Check Moving Mob abteil END für Spieler 1 ---------------------------------------------------
    // ------------- Check Moving Mob abteil Anfang für Spieler 2 ---------------------------------------------------
    function checkIfMoveMobP2(_direction) {
        const y = Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y;
        const x = Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? Script.movingDirection) {
            case "x":
                newPosition = new ƒ.Vector3(x + 1, y, 0);
                zwischenSpeicherCoordinateLRCP2.set(((Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x) + 1), Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
                break;
            case "-x":
                newPosition = new ƒ.Vector3(x - 1, y, 0);
                zwischenSpeicherCoordinateLRCP2.set(((Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x) - 1), Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
                break;
            case "y":
                newPosition = new ƒ.Vector3(x, y + 1, 0);
                zwischenSpeicherCoordinateLRCP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, ((Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y) + 1), 0);
                break;
            case "-y":
                newPosition = new ƒ.Vector3(x, y - 1, 0);
                zwischenSpeicherCoordinateLRCP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, ((Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y) - 1), 0);
                break;
            default:
                break;
        }
        const wall = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0));
        if (wall) {
            //sounds[1].play(false);
            return false;
        }
        const path = Script.paths.find((p) => p.mtxLocal.translation.equals(newPosition, 0));
        if (!path) {
            //sounds[1].play(false);
            return false;
        }
        if (zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckStayP2) || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckXP2)
            || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckYP2) || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckXMinusP2) || zwischenSpeicherCoordinateLRCP2.equals(possibleLimitReachedCheckYMinusP2)) {
            return true; //WENN zwischenSpeicher sagt er läuft auf ein feld zu dass aus den possibleLimitReachedCheck feldERN drüber hinausgeht, wirft es return false anstatt true.
        }
        else {
            return false; //Changed this to false since only if mob still in allowed grid it is allowed to move -> allowed to return true
        }
    }
    Script.checkIfMoveMobP2 = checkIfMoveMobP2;
    // ------------- Moving Mob abteil END PLAYER 2 ---------------------------------------------------
    // ------------- Handle END TURN abteil Anfang für Spieler 1 ---------------------------------------------------
    function logInUnit() {
        if ((Script.currentUnitNumber + 1) === Script.mobs.length) {
            document.getElementById("--headingInfo").setAttribute('value', turnPhaseTwo);
            roundsPlayed++;
            if (roundsPlayed > 2) {
                currentPhase = 2;
            }
            handleCityTurnPart();
            //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 1 -> moved all pieces ####################################################################
            //currentplayer = 2;
            //document.getElementById("--unitdiv1P2").style.borderColor = "red";
            document.getElementById("--unitdiv" + (Script.currentUnitNumber + 1)).style.borderColor = "#048836";
            Script.currentUnitNumber = 0;
            possibleLimitReachedCheckX.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x + 1, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckY.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinus.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x - 1, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinus.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStay.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            //handleUiPlayerswap();
            console.log("turnplayer is now: " + Script.currentplayer);
            console.log("turnphase is now: " + currentPhase);
            return;
        }
        else {
            Script.currentUnitNumber++;
            possibleLimitReachedCheckX.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x + 1, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckY.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinus.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x - 1, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinus.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStay.set(Script.mobs[Script.currentUnitNumber].mtxLocal.translation.x, Script.mobs[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            document.getElementById("--unitdiv" + (Script.currentUnitNumber + 1)).style.borderColor = "red"; //--unitdiv1P2 für spieler 2
            document.getElementById("--unitdiv" + Script.currentUnitNumber).style.borderColor = "#048836";
            console.log(Script.currentUnitNumber + " setze diese zahl auf grün");
            return;
        }
    }
    // ------------- Handle END TURN abteil END für Spieler 1 ---------------------------------------------------
    // ------------- Handle END TURN abteil Anfang für Spieler 2 ---------------------------------------------------
    function logInUnitP2() {
        document.getElementById("--headingInfo").setAttribute('value', turnPhaseTwo);
        if ((Script.currentUnitNumberP2 + 1) === Script.mobsP2.length) {
            roundsPlayed++;
            if (roundsPlayed > 2) {
                currentPhase = 2;
            }
            handleCityTurnPartP2();
            //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 2 -> moved all pieces #################################################################################
            //currentplayer = 1;
            //document.getElementById("--unitdiv1").style.borderColor = "red";
            document.getElementById("--unitdiv" + (Script.currentUnitNumberP2 + 1) + "P2").style.borderColor = "#048836";
            Script.currentUnitNumberP2 = 0;
            possibleLimitReachedCheckXP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x + 1, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinusP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x - 1, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinusP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStayP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            //handleUiPlayerswap();
            console.log("turnplayer is now: " + Script.currentplayer);
            console.log("turnphase is now: " + currentPhase);
            return;
        }
        else {
            Script.currentUnitNumberP2++;
            possibleLimitReachedCheckXP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x + 1, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinusP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x - 1, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinusP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStayP2.set(Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.x, Script.mobsP2[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            document.getElementById("--unitdiv" + (Script.currentUnitNumberP2 + 1) + "P2").style.borderColor = "red"; //--unitdiv1P2 für spieler 2
            document.getElementById("--unitdiv" + Script.currentUnitNumberP2 + "P2").style.borderColor = "#048836";
            return;
        }
    }
    // ------------- Handle END TURN abteil END für Spieler 2 ---------------------------------------------------
    function handleUiPlayerswap() {
        //console.log(currentplayer + "<- current player -> should be 1 and also gold for p1: " + gold + " p2 gold: " + goldP2);
        if (Script.currentplayer === 1) {
            console.log(Script.currentplayer + "<- current player and also gold for p1: " + gold);
            //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
            for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops invisible
                document.getElementById("--unitdiv" + i + "P2").style.display = 'none';
            }
            for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops visible
                document.getElementById("--unitdiv" + i).style.display = null;
            }
        }
        else {
            //alle Ui units auf display none machen, damit ich sie nicht einzeln aufzählen muss.
            for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops invisible
                document.getElementById("--unitdiv" + i).style.display = 'none';
            }
            for (let i = 1; i < 10; i++) { //goes through all 9 possible Units and makes turnplayer troops visible
                document.getElementById("--unitdiv" + i + "P2").style.display = null;
            }
        }
        ;
    }
    // ------------- Creating Mobs, both player ---------------------------------------------------
    function creatingMob(whichUnit, graph, city, cityP2) {
        if (whichUnit === 1) {
            if ((Script.mobs.length + Script.mobs2.length) != 9) {
                if (addMobLimitCounter > 0) {
                    if (gold >= costMob) {
                        gold -= costMob;
                        document.getElementById("--goldInput").setAttribute('value', gold.toString());
                        addMobLimitCounter--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mob = new Script.Mob("Mob" + i);
                        let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
                        //console.log(cityPosition)
                        //mob.mtxLocal.translate(new ƒ.Vector3(4, 3, 0));
                        mob.mtxLocal.translate(cityPosition);
                        graph.addChild(mob);
                        Script.mobs.push(mob);
                        for (let iCounter = 0; iCounter < Script.mobs.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === Script.mobs.length) {
                                document.getElementById("--" + Script.mobs.length + "img1").style.display = null;
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
        }
        if (whichUnit === 2) {
            if ((Script.mobs.length + Script.mobs2.length) != 9) {
                if (addMobLimitCounter > 0) {
                    if (gold >= costMob2) {
                        gold -= costMob2;
                        document.getElementById("--goldInput").setAttribute('value', gold.toString());
                        addMobLimitCounter--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mob2 = new Script.Mob2("Mob2" + i);
                        let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
                        mob2.mtxLocal.translate(cityPosition);
                        graph.addChild(mob2);
                        Script.mobs.push(mob2);
                        for (let iCounter = 0; iCounter < Script.mobs.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === Script.mobs.length) {
                                document.getElementById("--" + Script.mobs.length + "img3").style.display = null;
                                //console.log("--" + i + "img3")
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
        }
        if (whichUnit === 3) {
            if ((Script.mobsP2.length + Script.mobs2P2.length) != 9) {
                if (addMobLimitCounterP2 > 0) {
                    if (goldP2 >= costMob) {
                        goldP2 -= costMob;
                        document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                        addMobLimitCounterP2--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mobP2 = new Script.MobP2("MobP2" + i);
                        let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
                        mobP2.mtxLocal.translate(cityPosition);
                        graph.addChild(mobP2);
                        Script.mobsP2.push(mobP2);
                        for (let iCounter = 0; iCounter < Script.mobsP2.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === Script.mobsP2.length) {
                                document.getElementById("--" + Script.mobsP2.length + "img2").style.display = null;
                                //console.log("--" + i + "img1")
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
        }
        if (whichUnit === 4) {
            if ((Script.mobsP2.length + Script.mobs2P2.length) != 9) {
                if (addMobLimitCounterP2 > 0) {
                    if (goldP2 >= costMob2) {
                        goldP2 -= costMob2;
                        document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                        addMobLimitCounterP2--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mob2P2 = new Script.Mob2P2("Mob2P2" + i);
                        let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
                        mob2P2.mtxLocal.translate(cityPosition);
                        graph.addChild(mob2P2);
                        Script.mobsP2.push(mob2P2);
                        for (let iCounter = 0; iCounter < Script.mobsP2.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === Script.mobsP2.length) {
                                document.getElementById("--" + Script.mobsP2.length + "img4").style.display = null;
                                //console.log("--" + i + "img1")
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
        }
    }
    // ------------- Creating Mobs, both player END ---------------------------------------------------
    // ------------- Handles the city part of the turn, after all troops have been moved. ---------------------------------------------------
    function handleCityTurnPart() {
        document.getElementById("--addMob").style.display = null;
        if (roundsPlayed > 2) {
            document.getElementById("--addMobP2").style.display = 'none';
        }
        ;
        addMobLimitCounter = mobBuyLimit;
    }
    function handleCityTurnPartP2() {
        document.getElementById("--addMobP2").style.display = null;
        if (roundsPlayed > 2) {
            document.getElementById("--addMob").style.display = 'none';
        }
        ;
        addMobLimitCounterP2 = mobBuyLimit;
    }
    // ------------- Handles the city part of the turn, after all troops have been moved. END ---------------------------------------------------
    function handleEndOfCityProcedure(currentUnitNumb, setPlayer) {
        let playerPlaceHolder = "";
        let playerPlaceHolder2 = "P2";
        if (setPlayer === 1) { //wenn spieler zu 1 wechseln soll nimm diese modifikatoren
            playerPlaceHolder = "P2";
            playerPlaceHolder2 = "";
            gold += goldGain;
            document.getElementById("--goldInput").setAttribute('value', gold.toString());
            document.getElementById("--gold").style.display = null;
            document.getElementById("--goldP2").style.display = 'none';
        }
        else {
            if (roundsPlayed > 1) { //Fixes a bug, i dont know why p2 gets one tick more than P1 so iam reducing one turn for P2
                goldP2 += goldGain;
            }
            ;
            console.log("P2 gets money. ");
            document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
            document.getElementById("--goldP2").style.display = null;
            document.getElementById("--gold").style.display = 'none';
        }
        document.getElementById("--unitdiv1" + playerPlaceHolder2).style.borderColor = "red";
        document.getElementById("--unitdiv" + (currentUnitNumb + 1) + "" + playerPlaceHolder).style.borderColor = "#048836";
        console.log("ENDING P" + Script.currentplayer);
        currentPhase = 1;
        Script.currentplayer = setPlayer;
        document.getElementById("--addMob" + playerPlaceHolder).style.display = 'none';
        handleUiPlayerswap();
        document.getElementById("--headingInfo").setAttribute('value', turnPhaseOne);
        return;
        document.getElementById("--unitdiv1").style.borderColor = "red";
        document.getElementById("--unitdiv" + (Script.currentUnitNumberP2 + 1) + "P2").style.borderColor = "#048836";
        currentPhase = 1;
        Script.currentplayer = 1;
        document.getElementById("--addMobP2").style.display = 'none';
        console.log("ENDING P2");
        handleUiPlayerswap();
        return;
    }
    /*function useInteractable() { //Search function and how its used before.
      //Spielerfigur == position von interactable, soll dann hochzählen
      const path = paths.find((p) => p.mtxLocal.translation.equals(pacman.mtxLocal.translation, 0.2)); //Pacman ersetzen. sucht interactables auf der selben stelle von pacman
  
      if (path) {
        const city: ƒ.Node = path.getChild(0);
  
        if (city) {
          path.removeChild(city); //removes paths[x].addChild(cityNode)
        }
      }
    }*/
    // Not needed atm, is just for collection
    /*function movePacman(): void {
        if (
          ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) &&
          (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
        ) {
          if (checkIfMove("x")) {
            movement.set(1 / 60, 0, 0);
            //rotateSprite("x");
            movingDirection = "x";
          }
        }
    
        if (
          ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) &&
          (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
        ) {
          if (checkIfMove("-y")) {
            movement.set(0, -1 / 60, 0);
            //rotateSprite("-y");
            movingDirection = "-y";
          }
        }
    
        if (
          ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) &&
          (pacman.mtxLocal.translation.y + 0.025) % 1 < 0.05
        ) {
          if (checkIfMove("-x")) {
            movement.set(-1 / 60, 0, 0);
            //rotateSprite("-x");
            movingDirection = "-x";
          }
        }
    
        if (
          ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) &&
          (pacman.mtxLocal.translation.x + 0.025) % 1 < 0.05
        ) {
          if (checkIfMove("y")) {
            movement.set(0, 1 / 60, 0);
            //rotateSprite("y");
            movingDirection = "y";
          }
        }
      }*/
    /*
      export function checkIfMove(_direction?: string): boolean {
        const y: number = pacman.mtxLocal.translation.y;
        const x: number = pacman.mtxLocal.translation.x;
        let newPosition: ƒ.Vector3;
    
        switch (_direction ?? movingDirection) {
          case "x":
            newPosition = new ƒ.Vector3(x + 1, y, 0);
            break;
          case "-x":
            newPosition = new ƒ.Vector3(x - 1, y, 0);
            break;
          case "y":
            newPosition = new ƒ.Vector3(x, y + 1, 0);
            break;
          case "-y":
            newPosition = new ƒ.Vector3(x, y - 1, 0);
            break;
    
          default:
            break;
        }
    
        const wall: ƒ.Node = water.find((w) => w.mtxLocal.translation.equals(newPosition, 0.022));
    
        if (wall) {
          sounds[1].play(false);
          return false;
        }
    
        const path: ƒ.Node = paths.find((p) => p.mtxLocal.translation.equals(newPosition, 1));
    
        if (!path) {
          sounds[1].play(false);
          return false;
        }
    
        return true;
      }*/
    /*
    function checkIfGameOver(): void {
      for (const mob of mobs) {
        const isEvenPacman =
          (Math.round(pacman.mtxLocal.translation.y) + Math.round(pacman.mtxLocal.translation.x)) %
            2 ===
          0;
  
        const isEvenMob =
          (Math.round(mob.mtxLocal.translation.y) + Math.round(mob.mtxLocal.translation.x)) %
            2 ===
          0;
  
        if (
          isEvenPacman !== isEvenMob &&
          pacman.mtxLocal.translation.equals(Mob.mtxLocal.translation, 0.8)
        ) {
          document.getElementById("game-over").style.width = "100vw";
          ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, update);
  
          sounds[1].play(false);
          sounds[2].play(true);
  
          document.getElementById("restart").addEventListener("click", function (_event: Event) {
            window.location.reload();
          });
        }
      }
    }*/
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒAid = FudgeAid;
    Script.animations = {};
    let spriteWater;
    let spritePaths;
    async function loadSprites() {
        let imgSpriteSheet = new ƒ.TextureImage();
        await imgSpriteSheet.load("Assets/3232SpriteTP.png");
        let spriteSheet = new ƒ.CoatTextured(undefined, imgSpriteSheet);
        generateSprites(spriteSheet);
    }
    Script.loadSprites = loadSprites;
    function generateSprites(_spritesheet) {
        //const pacman: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("pacman", _spritesheet);
        //pacman.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 3, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        const water = new ƒAid.SpriteSheetAnimation("water", _spritesheet);
        water.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 3, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        // ------------------------ Mobs p1 --------------------------------
        const mob = new ƒAid.SpriteSheetAnimation("mob", _spritesheet);
        //mob.generateByGrid(
        mob.generateByGrid(ƒ.Rectangle.GET(160, 0, 32, 32), 4, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        const mob2 = new ƒAid.SpriteSheetAnimation("mob2", _spritesheet);
        //mob2.generateByGrid(
        mob2.generateByGrid(ƒ.Rectangle.GET(288, 0, 32, 32), 4, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        // ------------------------ Mobs p2 --------------------------------
        const mobP2 = new ƒAid.SpriteSheetAnimation("mobP2", _spritesheet);
        //mob.generateByGrid(
        mobP2.generateByGrid(ƒ.Rectangle.GET(416, 0, 32, 32), 4, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        const mob2P2 = new ƒAid.SpriteSheetAnimation("mob2P2", _spritesheet);
        //mob2.generateByGrid(
        mob2P2.generateByGrid(ƒ.Rectangle.GET(544, 0, 32, 32), 4, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        const paths = new ƒAid.SpriteSheetAnimation("paths", _spritesheet);
        //mob.generateByGrid(
        paths.generateByGrid(ƒ.Rectangle.GET(96, 0, 32, 32), 1, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));
        //animations["pacman"] = pacman;
        Script.animations["mob"] = mob;
        Script.animations["mob2"] = mob2;
        Script.animations["mobP2"] = mobP2;
        Script.animations["mob2P2"] = mob2P2;
        Script.animations["paths"] = paths;
        Script.animations["water"] = water;
    }
    function setSprite(_node) {
        spriteWater = new ƒAid.NodeSprite("Sprite");
        spriteWater.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spriteWater.setAnimation(Script.animations["water"]);
        spriteWater.setFrameDirection(1);
        spriteWater.mtxLocal.translateZ(0.0001);
        spriteWater.framerate = 2;
        _node.addChild(spriteWater);
        _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        //spritePacman.mtxLocal.rotateZ(90);
    }
    Script.setSprite = setSprite;
    function setSpritePaths(_node) {
        spritePaths = new ƒAid.NodeSprite("Sprite");
        spritePaths.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spritePaths.setAnimation(Script.animations["paths"]);
        spritePaths.setFrameDirection(1);
        spritePaths.mtxLocal.translateZ(0.0001);
        spritePaths.framerate = 1;
        _node.addChild(spritePaths);
        _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        //spritePacman.mtxLocal.rotateZ(90);
    }
    Script.setSpritePaths = setSpritePaths;
    /*export function setSprite(_node: ƒ.Node): void {
      spritePacman = new ƒAid.NodeSprite("Sprite");
      spritePacman.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
      spritePacman.setAnimation(<ƒAid.SpriteSheetAnimation>animations["water"]);
      spritePacman.setFrameDirection(1);
      spritePacman.mtxLocal.translateZ(0.0001);
      spritePacman.framerate = 1;
  
      _node.addChild(spritePacman);
      _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
      //spritePacman.mtxLocal.rotateZ(90);
    }*/
    /*export function rotateSprite(_direction: string): void {
      if (_direction !== movingDirection) {
        if (
          (_direction === "x" && movingDirection === "y") ||
          (_direction === "-y" && movingDirection === "x") ||
          (_direction === "-x" && movingDirection === "-y") ||
          (_direction === "y" && movingDirection === "-x")
        ) {
          spritePacman.mtxLocal.rotateZ(-90);
        } else if (
          (_direction === "-x" && movingDirection === "y") ||
          (_direction === "x" && movingDirection === "-y") ||
          (_direction === "y" && movingDirection === "x") ||
          (_direction === "-y" && movingDirection === "-x")
        ) {
          spritePacman.mtxLocal.rotateZ(90);
        } else if (
          (_direction === "-x" && movingDirection === "x") ||
          (_direction === "x" && movingDirection === "-x") ||
          (_direction === "y" && movingDirection === "-y") ||
          (_direction === "-y" && movingDirection === "y")
        ) {
          spritePacman.mtxLocal.rotateZ(180);
        }
      }
    }*/
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class City extends ƒ.Node {
        constructor(_name) {
            super(_name);
            const mtrCity = new ƒ.Material("City", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("#90d4ed")));
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(mtrCity));
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 0.01));
        }
    }
    Script.City = City;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class CityP2 extends ƒ.Node {
        constructor(_name) {
            super(_name);
            const mtrCityP2 = new ƒ.Material("CityP2", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("#ff6961")));
            //const cityNodeP2 = new ƒ.Node("City");
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(mtrCityP2));
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 0.01));
        }
    }
    Script.CityP2 = CityP2;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class Mob extends ƒ.Node {
        //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
        //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        constructor(_name) {
            super(_name);
            const mesh = new ƒ.MeshSphere();
            const material = new ƒ.Material("MaterialMob", ƒ.ShaderLit, new ƒ.CoatColored());
            const cmpTransform = new ƒ.ComponentTransform();
            const cmpMesh = new ƒ.ComponentMesh(mesh);
            const cmpMaterial = new ƒ.ComponentMaterial(material);
            cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
            this.addComponent(cmpTransform);
            this.addComponent(cmpMesh);
            this.addComponent(cmpMaterial);
            // sprites
            const sprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(Script.animations["mob"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.1);
            sprite.mtxLocal.translateY(0.1);
            sprite.framerate = 8;
            sprite.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 1));
            this.addChild(sprite);
            this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
            //sprite.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 1));
        }
        //Bevor das hier aufgerufen wird MUSS der Lokale vektor gespeichert werden, da man von diesem aus die Position wechselt.
        move() {
            //Press Key for move into direction once
            /*if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D,])
            ) {
               //Adjust this to max out for one field
              //if (iMoveX == 0 && !finishedMobPlacement){
                //iMoveX = 1;
              //mobs[currentUnitNumber].mtxLocal.translateX(1);
              //console.log("trying to move right");
      
            //}
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
            ) {
              if (iMoveYMinus == 0 && !finishedMobPlacement){
                iMoveYMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(-1);
              }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
            )  {
              if (iMoveXMinus == 0 && !finishedMobPlacement){
                iMoveXMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateX(-1);
            }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
            ) {
              if (iMoveY == 0 && !finishedMobPlacement){
                iMoveY = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(1); //do mobs[x] for the according unit in the rooster. mobs[2].mtxLocal... for 3rd created unit
            }
          }
      
            if ( //After pressing space or enter the unit is placed and cant be moved anymore -> jump to next mob
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ENTER, ƒ.KEYBOARD_CODE.SPACE])
            ) {
                //finishedMobPlacement = true;
                if (iLimitSpaceToOne == 0){
                  iLimitSpaceToOne = 1;
                  currentUnitNumber++;
                  iMoveX = 0;           //Setze imoves zurück damit neue unit wieder verschoben werden kann
                  iMoveXMinus = 0;
                  iMoveY = 0;
                  iMoveYMinus = 0;
                  if(currentUnitNumber){ //useless, yet.
      
                  }
              }
            }
      */
            /*
                  if (
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
                  ) {
                    const possiblePaths: ƒ.Node[] = [];
            
                    // get possible paths
                    for (const path of _paths) {
                      if (
                        path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                        !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                      ) {
                        const isEvenPath =
                          (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
            
                        const isEvenLocal =
                          (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                            2 ===
                          0;
            
                        if (isEvenPath !== isEvenLocal) {
                          possiblePaths.push(path);
                        }
                      }
                    }
            
                    // lower probability for going back to same path
                    const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
            
                    if (possiblePaths.length !== 1 && index !== -1) {
                      const pathsCopy = possiblePaths.slice();
                      pathsCopy.splice(index, 1);
            
                    }
            
                    const path = possiblePaths[Math.floor(0.2 * possiblePaths.length)];
            
                    this.lastPath.set(
                      Math.round(this.mtxLocal.translation.x),
                      Math.round(this.mtxLocal.translation.y),
                      0
                    );
            
                    // set moving direction
                    if (path) {
                      if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, 1 / 600, 0);
                      } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                        this.movement.set(1 / 600, 0, 0);
                      } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, -1 / 600, 0);
                      } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                        //this.movement.set(-1 / 600, 0, 0);
                        this.mtxLocal.translation.x -= 1;
                      }
                    }
                  }
                  this.mtxLocal.translate(this.movement);
                
            */
            /*if (
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
            ) {
              const possiblePaths: ƒ.Node[] = [];
      
              // get possible paths
              for (const path of _paths) {
                if (
                  path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                  !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                ) {
                  const isEvenPath =
                    (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
      
                  const isEvenLocal =
                    (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                      2 ===
                    0;
      
                  if (isEvenPath !== isEvenLocal) {
                    possiblePaths.push(path);
                  }
                }
              }
      
              // lower probability for going back to same path
              const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
      
              if (possiblePaths.length !== 1 && index !== -1) {
                const pathsCopy = possiblePaths.slice();
                pathsCopy.splice(index, 1);
      
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy);
              }
      
              const path = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];
      
              this.lastPath.set(
                Math.round(this.mtxLocal.translation.x),
                Math.round(this.mtxLocal.translation.y),
                0
              );
      
              // set moving direction
              if (path) {
                if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, 1 / 60, 0);
                } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(1 / 60, 0, 0);
                } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, -1 / 60, 0);
                } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(-1 / 60, 0, 0);
                }
              }
            }
            this.mtxLocal.translate(this.movement);*/
        }
    }
    Script.Mob = Mob;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class Mob2 extends ƒ.Node {
        //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
        //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        constructor(_name) {
            super(_name);
            const mesh = new ƒ.MeshSphere();
            const material = new ƒ.Material("MaterialMob2", ƒ.ShaderLit, new ƒ.CoatColored());
            const cmpTransform = new ƒ.ComponentTransform();
            const cmpMesh = new ƒ.ComponentMesh(mesh);
            const cmpMaterial = new ƒ.ComponentMaterial(material);
            cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
            this.addComponent(cmpTransform);
            this.addComponent(cmpMesh);
            this.addComponent(cmpMaterial);
            // sprites
            const sprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(Script.animations["mob2"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.1);
            sprite.mtxLocal.translateY(0.1);
            sprite.framerate = 8;
            sprite.mtxLocal.scale(new ƒ.Vector3(0.6, 0.6, 1));
            this.addChild(sprite);
            this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
        //Bevor das hier aufgerufen wird MUSS der Lokale vektor gespeichert werden, da man von diesem aus die Position wechselt.
        move() {
            //Press Key for move into direction once
            /*if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D,])
            ) {
               //Adjust this to max out for one field
              //if (iMoveX == 0 && !finishedMobPlacement){
                //iMoveX = 1;
              //mobs[currentUnitNumber].mtxLocal.translateX(1);
              //console.log("trying to move right");
      
            //}
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
            ) {
              if (iMoveYMinus == 0 && !finishedMobPlacement){
                iMoveYMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(-1);
              }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
            )  {
              if (iMoveXMinus == 0 && !finishedMobPlacement){
                iMoveXMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateX(-1);
            }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
            ) {
              if (iMoveY == 0 && !finishedMobPlacement){
                iMoveY = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(1); //do mobs[x] for the according unit in the rooster. mobs[2].mtxLocal... for 3rd created unit
            }
          }
      
            if ( //After pressing space or enter the unit is placed and cant be moved anymore -> jump to next mob
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ENTER, ƒ.KEYBOARD_CODE.SPACE])
            ) {
                //finishedMobPlacement = true;
                if (iLimitSpaceToOne == 0){
                  iLimitSpaceToOne = 1;
                  currentUnitNumber++;
                  iMoveX = 0;           //Setze imoves zurück damit neue unit wieder verschoben werden kann
                  iMoveXMinus = 0;
                  iMoveY = 0;
                  iMoveYMinus = 0;
                  if(currentUnitNumber){ //useless, yet.
      
                  }
              }
            }
      */
            /*
                  if (
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
                  ) {
                    const possiblePaths: ƒ.Node[] = [];
            
                    // get possible paths
                    for (const path of _paths) {
                      if (
                        path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                        !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                      ) {
                        const isEvenPath =
                          (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
            
                        const isEvenLocal =
                          (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                            2 ===
                          0;
            
                        if (isEvenPath !== isEvenLocal) {
                          possiblePaths.push(path);
                        }
                      }
                    }
            
                    // lower probability for going back to same path
                    const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
            
                    if (possiblePaths.length !== 1 && index !== -1) {
                      const pathsCopy = possiblePaths.slice();
                      pathsCopy.splice(index, 1);
            
                    }
            
                    const path = possiblePaths[Math.floor(0.2 * possiblePaths.length)];
            
                    this.lastPath.set(
                      Math.round(this.mtxLocal.translation.x),
                      Math.round(this.mtxLocal.translation.y),
                      0
                    );
            
                    // set moving direction
                    if (path) {
                      if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, 1 / 600, 0);
                      } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                        this.movement.set(1 / 600, 0, 0);
                      } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, -1 / 600, 0);
                      } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                        //this.movement.set(-1 / 600, 0, 0);
                        this.mtxLocal.translation.x -= 1;
                      }
                    }
                  }
                  this.mtxLocal.translate(this.movement);
                
            */
            /*if (
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
            ) {
              const possiblePaths: ƒ.Node[] = [];
      
              // get possible paths
              for (const path of _paths) {
                if (
                  path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                  !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                ) {
                  const isEvenPath =
                    (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
      
                  const isEvenLocal =
                    (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                      2 ===
                    0;
      
                  if (isEvenPath !== isEvenLocal) {
                    possiblePaths.push(path);
                  }
                }
              }
      
              // lower probability for going back to same path
              const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
      
              if (possiblePaths.length !== 1 && index !== -1) {
                const pathsCopy = possiblePaths.slice();
                pathsCopy.splice(index, 1);
      
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy);
              }
      
              const path = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];
      
              this.lastPath.set(
                Math.round(this.mtxLocal.translation.x),
                Math.round(this.mtxLocal.translation.y),
                0
              );
      
              // set moving direction
              if (path) {
                if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, 1 / 60, 0);
                } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(1 / 60, 0, 0);
                } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, -1 / 60, 0);
                } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(-1 / 60, 0, 0);
                }
              }
            }
            this.mtxLocal.translate(this.movement);*/
        }
    }
    Script.Mob2 = Mob2;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class Mob2P2 extends ƒ.Node {
        //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
        //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        constructor(_name) {
            super(_name);
            const mesh = new ƒ.MeshSphere();
            const material = new ƒ.Material("MaterialMob2P2", ƒ.ShaderLit, new ƒ.CoatColored());
            const cmpTransform = new ƒ.ComponentTransform();
            const cmpMesh = new ƒ.ComponentMesh(mesh);
            const cmpMaterial = new ƒ.ComponentMaterial(material);
            cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
            this.addComponent(cmpTransform);
            this.addComponent(cmpMesh);
            this.addComponent(cmpMaterial);
            // sprites
            const sprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(Script.animations["mob2P2"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.1);
            sprite.mtxLocal.translateY(0.1);
            sprite.framerate = 8;
            sprite.mtxLocal.scale(new ƒ.Vector3(0.6, 0.6, 1));
            this.addChild(sprite);
            this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
        //Bevor das hier aufgerufen wird MUSS der Lokale vektor gespeichert werden, da man von diesem aus die Position wechselt.
        move() {
            //Press Key for move into direction once
            /*if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D,])
            ) {
               //Adjust this to max out for one field
              //if (iMoveX == 0 && !finishedMobPlacement){
                //iMoveX = 1;
              //mobs[currentUnitNumber].mtxLocal.translateX(1);
              //console.log("trying to move right");
      
            //}
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
            ) {
              if (iMoveYMinus == 0 && !finishedMobPlacement){
                iMoveYMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(-1);
              }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
            )  {
              if (iMoveXMinus == 0 && !finishedMobPlacement){
                iMoveXMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateX(-1);
            }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
            ) {
              if (iMoveY == 0 && !finishedMobPlacement){
                iMoveY = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(1); //do mobs[x] for the according unit in the rooster. mobs[2].mtxLocal... for 3rd created unit
            }
          }
      
            if ( //After pressing space or enter the unit is placed and cant be moved anymore -> jump to next mob
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ENTER, ƒ.KEYBOARD_CODE.SPACE])
            ) {
                //finishedMobPlacement = true;
                if (iLimitSpaceToOne == 0){
                  iLimitSpaceToOne = 1;
                  currentUnitNumber++;
                  iMoveX = 0;           //Setze imoves zurück damit neue unit wieder verschoben werden kann
                  iMoveXMinus = 0;
                  iMoveY = 0;
                  iMoveYMinus = 0;
                  if(currentUnitNumber){ //useless, yet.
      
                  }
              }
            }
      */
            /*
                  if (
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
                  ) {
                    const possiblePaths: ƒ.Node[] = [];
            
                    // get possible paths
                    for (const path of _paths) {
                      if (
                        path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                        !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                      ) {
                        const isEvenPath =
                          (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
            
                        const isEvenLocal =
                          (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                            2 ===
                          0;
            
                        if (isEvenPath !== isEvenLocal) {
                          possiblePaths.push(path);
                        }
                      }
                    }
            
                    // lower probability for going back to same path
                    const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
            
                    if (possiblePaths.length !== 1 && index !== -1) {
                      const pathsCopy = possiblePaths.slice();
                      pathsCopy.splice(index, 1);
            
                    }
            
                    const path = possiblePaths[Math.floor(0.2 * possiblePaths.length)];
            
                    this.lastPath.set(
                      Math.round(this.mtxLocal.translation.x),
                      Math.round(this.mtxLocal.translation.y),
                      0
                    );
            
                    // set moving direction
                    if (path) {
                      if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, 1 / 600, 0);
                      } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                        this.movement.set(1 / 600, 0, 0);
                      } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, -1 / 600, 0);
                      } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                        //this.movement.set(-1 / 600, 0, 0);
                        this.mtxLocal.translation.x -= 1;
                      }
                    }
                  }
                  this.mtxLocal.translate(this.movement);
                
            */
            /*if (
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
            ) {
              const possiblePaths: ƒ.Node[] = [];
      
              // get possible paths
              for (const path of _paths) {
                if (
                  path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                  !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                ) {
                  const isEvenPath =
                    (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
      
                  const isEvenLocal =
                    (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                      2 ===
                    0;
      
                  if (isEvenPath !== isEvenLocal) {
                    possiblePaths.push(path);
                  }
                }
              }
      
              // lower probability for going back to same path
              const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
      
              if (possiblePaths.length !== 1 && index !== -1) {
                const pathsCopy = possiblePaths.slice();
                pathsCopy.splice(index, 1);
      
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy);
              }
      
              const path = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];
      
              this.lastPath.set(
                Math.round(this.mtxLocal.translation.x),
                Math.round(this.mtxLocal.translation.y),
                0
              );
      
              // set moving direction
              if (path) {
                if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, 1 / 60, 0);
                } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(1 / 60, 0, 0);
                } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, -1 / 60, 0);
                } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(-1 / 60, 0, 0);
                }
              }
            }
            this.mtxLocal.translate(this.movement);*/
        }
    }
    Script.Mob2P2 = Mob2P2;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class MobP2 extends ƒ.Node {
        //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
        //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        constructor(_name) {
            super(_name);
            const mesh = new ƒ.MeshSphere();
            const material = new ƒ.Material("MaterialMobP2", ƒ.ShaderLit, new ƒ.CoatColored());
            const cmpTransform = new ƒ.ComponentTransform();
            const cmpMesh = new ƒ.ComponentMesh(mesh);
            const cmpMaterial = new ƒ.ComponentMaterial(material);
            cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
            this.addComponent(cmpTransform);
            this.addComponent(cmpMesh);
            this.addComponent(cmpMaterial);
            // sprites
            const sprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(Script.animations["mobP2"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.1);
            sprite.mtxLocal.translateY(0.1);
            sprite.framerate = 8;
            sprite.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 1));
            this.addChild(sprite);
            this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
        //Bevor das hier aufgerufen wird MUSS der Lokale vektor gespeichert werden, da man von diesem aus die Position wechselt.
        move() {
            //Press Key for move into direction once
            /*if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D,])
            ) {
               //Adjust this to max out for one field
              //if (iMoveX == 0 && !finishedMobPlacement){
                //iMoveX = 1;
              //mobs[currentUnitNumber].mtxLocal.translateX(1);
              //console.log("trying to move right");
      
            //}
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
            ) {
              if (iMoveYMinus == 0 && !finishedMobPlacement){
                iMoveYMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(-1);
              }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
            )  {
              if (iMoveXMinus == 0 && !finishedMobPlacement){
                iMoveXMinus = 1;
                mobs[currentUnitNumber].mtxLocal.translateX(-1);
            }
            }
        
            if (
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
            ) {
              if (iMoveY == 0 && !finishedMobPlacement){
                iMoveY = 1;
                mobs[currentUnitNumber].mtxLocal.translateY(1); //do mobs[x] for the according unit in the rooster. mobs[2].mtxLocal... for 3rd created unit
            }
          }
      
            if ( //After pressing space or enter the unit is placed and cant be moved anymore -> jump to next mob
              ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ENTER, ƒ.KEYBOARD_CODE.SPACE])
            ) {
                //finishedMobPlacement = true;
                if (iLimitSpaceToOne == 0){
                  iLimitSpaceToOne = 1;
                  currentUnitNumber++;
                  iMoveX = 0;           //Setze imoves zurück damit neue unit wieder verschoben werden kann
                  iMoveXMinus = 0;
                  iMoveY = 0;
                  iMoveYMinus = 0;
                  if(currentUnitNumber){ //useless, yet.
      
                  }
              }
            }
      */
            /*
                  if (
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
                    (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
                  ) {
                    const possiblePaths: ƒ.Node[] = [];
            
                    // get possible paths
                    for (const path of _paths) {
                      if (
                        path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                        !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                      ) {
                        const isEvenPath =
                          (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
            
                        const isEvenLocal =
                          (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                            2 ===
                          0;
            
                        if (isEvenPath !== isEvenLocal) {
                          possiblePaths.push(path);
                        }
                      }
                    }
            
                    // lower probability for going back to same path
                    const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
            
                    if (possiblePaths.length !== 1 && index !== -1) {
                      const pathsCopy = possiblePaths.slice();
                      pathsCopy.splice(index, 1);
            
                    }
            
                    const path = possiblePaths[Math.floor(0.2 * possiblePaths.length)];
            
                    this.lastPath.set(
                      Math.round(this.mtxLocal.translation.x),
                      Math.round(this.mtxLocal.translation.y),
                      0
                    );
            
                    // set moving direction
                    if (path) {
                      if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, 1 / 600, 0);
                      } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                        this.movement.set(1 / 600, 0, 0);
                      } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                        this.movement.set(0, -1 / 600, 0);
                      } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                        //this.movement.set(-1 / 600, 0, 0);
                        this.mtxLocal.translation.x -= 1;
                      }
                    }
                  }
                  this.mtxLocal.translate(this.movement);
                
            */
            /*if (
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
              (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
            ) {
              const possiblePaths: ƒ.Node[] = [];
      
              // get possible paths
              for (const path of _paths) {
                if (
                  path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
                  !path.mtxLocal.translation.equals(this.mtxLocal.translation)
                ) {
                  const isEvenPath =
                    (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;
      
                  const isEvenLocal =
                    (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                      2 ===
                    0;
      
                  if (isEvenPath !== isEvenLocal) {
                    possiblePaths.push(path);
                  }
                }
              }
      
              // lower probability for going back to same path
              const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));
      
              if (possiblePaths.length !== 1 && index !== -1) {
                const pathsCopy = possiblePaths.slice();
                pathsCopy.splice(index, 1);
      
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy.reverse());
                possiblePaths.push(...pathsCopy);
                possiblePaths.push(...pathsCopy);
              }
      
              const path = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];
      
              this.lastPath.set(
                Math.round(this.mtxLocal.translation.x),
                Math.round(this.mtxLocal.translation.y),
                0
              );
      
              // set moving direction
              if (path) {
                if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, 1 / 60, 0);
                } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(1 / 60, 0, 0);
                } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
                  this.movement.set(0, -1 / 60, 0);
                } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
                  this.movement.set(-1 / 60, 0, 0);
                }
              }
            }
            this.mtxLocal.translate(this.movement);*/
        }
    }
    Script.MobP2 = MobP2;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map
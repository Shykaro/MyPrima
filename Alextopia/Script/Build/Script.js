"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class BackgroundCoinScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(BackgroundCoinScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "BackgroundCoinScript added to ";
        pointInTime = 0;
        // WELCOME TO THE CRITERIA COIN. HONESTLY JIRKA, IAM SORRY. BUT ALSO, I CAN'T REALLY INCLUDE ALL CRITERIAS IN MY GAME, SO HERE'S THE SOLUTION. 
        // THE GAME HAS NOW ITS OWN MASCOT. WHICH IS AN INDEFINITLY IMPORTANT PART OF THE CORE GAMEPLAY MECHANIC.
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
                    ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
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
        update = (_event) => {
            let deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.node.mtxLocal.rotateY(180 * deltaTime);
            this.pointInTime += 1 * deltaTime;
            let currPos = this.node.mtxLocal.translation;
            this.node.mtxLocal.translation = new ƒ.Vector3(currPos.x, (this.sin(this.pointInTime) - 1.5), currPos.z);
            //console.log("sin", this.sin(this.timeStamp));
        };
        sin(x) {
            return Math.sin(Math.PI * x) * 0.3;
        }
    }
    Script.BackgroundCoinScript = BackgroundCoinScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let dialog;
    window.addEventListener("load", init);
    document.addEventListener("interactiveViewportStarted", start); //HAD TO MAKE THIS UNKNOWN BECAUSE START IS NOW ASYNC
    let sounds; //outdated? i need it for later
    let water; //Blocks that cant be set foot on with normal units - Beinhaltet jeden Wasserblock in einem Array gespeichert
    Script.cityNode = []; //City = new ƒ.Node("CityP2");
    Script.cityNodeP2 = []; //City = new ƒ.Node("CityP2");
    //export let mobsAny: Mob[] = [];   //Array for all created mobs/units
    //export let mobsAny: Mob2[] = [];   //Array for all created mobs/units
    Script.mobsAnzPlayer1 = 0; //Ist die länge von beiden Arrays des Spielers zusammen
    //export let mobsP2Any: MobP2[] = [];   //Array for all created mobs/units
    //export let mobsP2Any: Mob2P2[] = [];   //Array for all created mobs/units
    Script.mobsAnzPlayer2 = 0; //Ist die länge von beiden Arrays des Spielers zusammen
    let mobsAny = [];
    let mobsP2Any = [];
    let anzMine = 0;
    let anzMineP2 = 0;
    // Balancing Field ############################################################################
    let costMob = 14; //Kosten für eine normale Einheit, NEEDED TO ADJUST PRICES
    //let costMob2: number = 26;  //Kosten für eine stärkere Einheit
    let costMineBuild = 10; //Kosten um eine Mine in der Stadt zu bauen, welche extra Gold generiert
    let goldMineOutput = 5; //Zusätzlicher Gold output einer Mine pro Runde
    let goldGain = 10; //Geld die jeder Spieler am Anfang seines Zuges bekommt ##Adjustable for balancing,  //Das stimmt NICHTMEHR-> beachte dass für den Start des Spiels jeder Spieler einmal den Goldgain erhält
    let gold = costMob + 0; //StartGeld für Spieler 1 PLUS costMob weil die Unit am anfang verschenkt wird!!
    let goldP2 = costMob + 0; //StartGeld für Spieler 2
    Script.healthUnitSmall = 10;
    Script.healthUnitBig = 20;
    Script.dmgUnitSmall = 5;
    Script.dmgUnitBig = 10;
    let turnsNeededForCapture = 5; //Turns needed to capture the enemy city with a troop ontop of it. -> currently the wincondition (WATCH OUT THAT ENEMY CANT PRODUCE UNITS WHILE A UNIT STANDS ON THIS FIELD)
    let mobBuyLimit = 1; //Adjust this number if players should be able to buy more than 1 unit per turn.
    //Balancing Field End ############################################################################
    let score = 0 - costMob; //Needs adjust for free first unit
    let scoreP2 = 0 - costMob; //Needs adjust for free first unit
    let turnPhaseOne = "Bewege deine Einheiten, drücke Enter zum Bestätigen der Position.";
    let turnPhaseTwo = "Produziere Truppen oder rüste deine Stadt auf, drücke Enter zum fortfahren.";
    let turnPhaseWinP1 = "Spieler 1 hat gewonnen! Drücke Enter zum neustarten.";
    let turnPhaseWinP2 = "Spieler 2 hat gewonnen! Drücke Enter zum neustarten.";
    let turnPhaseEnd = "Das Spiel ist zu Ende, drücke Enter zum reloaden!";
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
    Script.currentplayer = 1; //distinguishes between player 1 and 2 and also who starts!! //1 and 2 are PC's, 3 are the Bots and 0 is Standby
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
    // Random Map generator -> yea fuck that
    // adding all the requirements is more important
    // work on Networking this gon be fun, should try this -> aint working
    // Implement light to use as viewing distance, dont know how this works
    // Eventsystem angucken, kp wie das funktioniert -> did a thing jirka will very much like me for, but its for the criteria nonetheless
    // Physics zum Spaß einfügen
    // State machine für weißgott was, hauptsache kriterien erfüllt.
    //
    //
    // ++ DONE External Data via Highscore -> Punkte integrieren, oder züge bis zum win -> BRAUCHT WINCONDITION, EXTERNAL DATA AUF BALANCE SHEET ABÄNDERN -> did a balance json sheet which gets loaded.
    // ++ DONE Start implementing different rounds in a players turn -> unit moving -> unit producing -> playerswap
    // ++ DONE Add Gold mechanic -> expand with buying upgrades and getting gold from defeating units -> Defeating Units is Missing.
    // ++ DONE ARRAY KANN NUN MIT GESTORBENER EINHEIT AUF NULL GEHEN -> ausweichtregelung finden! bzw umgehen
    // ++ DONE ein fking UI <-- Important, less complexity, machen sobald ich kb auf programming aber Zeit habe.
    // ++ DONE Start on Unit to unit intercation ?? How do they interact, do they have HP or other Stats? -> Do another spawn RANDOM button for enemy units, let every unit move by one and automatically change side when everyone moved/interacted.
    // ++ DONE Unit should only be able to walk 1 field from starting position, maybe test with random spawnfields for Unit +1 button.
    // ++ DONE but maybe needs rework ++ Graphics, like terrain and Units
    //------------ TO-DO'S End ---------------------------------------------------------------
    //------------ Notizen -------------------------------------------------------------------
    // BUGFIX: wenn erste einheit des Arrays getötet wird rutscht es nicht nach wenn der andere Spieler dran ist.
    // Do random maps as external data save and load. -> needs random maps and that takes too much time, maybe at the end
    // Definitly should do an VUI update Function instead mentioning everything every time...
    //
    // Ui Zeigt leben der Einheiten wenn diese nicht onehit sterben sollten.
    // Physik einbauen indem man kästchen rumschiebt -> geht nicht wegen tp-ing, eher konfetti oder so einbauen am beginn oder ende der runde
    // SPÄTERES BUG PROBLEM: Unit spawnen während gegnerische einheit auf dem Cityfield steht. -> Unitinteraction nur möglich wenn einheit gemoved wird!!
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
    async function loadJSON() {
        let costOfMobs = await fetch("./Assets/balancesheet.json");
        Script.Balance.costOfMobs = (await costOfMobs.json()).costOfMobs;
        //console.log(Balance.costOfMobs[0].cost);
    }
    async function start(_event) {
        Script.viewport = _event.detail;
        Script.viewport.camera.mtxPivot.translate(new ƒ.Vector3(5, 2.5, 15));
        Script.viewport.camera.mtxPivot.rotateY(180);
        //FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        const graph = Script.viewport.getBranch();
        await loadJSON(); //gets balance adjustements.
        document.getElementById("--plusmob").innerHTML = "Cost: " + Script.Balance.costOfMobs[0].cost;
        document.getElementById("--plusmob2").innerHTML = "Cost: " + Script.Balance.costOfMobs[1].cost;
        document.getElementById("--plusmobP2").innerHTML = "Cost: " + Script.Balance.costOfMobs[0].cost;
        document.getElementById("--plusmob2P2").innerHTML = "Cost: " + Script.Balance.costOfMobs[1].cost;
        document.getElementById("--plusMine").innerHTML = "Cost: " + costMineBuild;
        document.getElementById("--plusMineP2").innerHTML = "Cost: " + costMineBuild;
        document.getElementById("--highscore").setAttribute('value', localStorage.getItem('highscore'));
        if (localStorage.getItem('highscore') === null) {
            let x = 0;
            document.getElementById("--highscore").setAttribute('value', x.toString());
        }
        ;
        document.getElementById("--score_player_one").setAttribute('value', score.toString());
        document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
        //window.localStorage.setItem('highscore', score); BENÖTIGT FÜR DAS ENDE
        ƒ.AudioManager.default.listenTo(graph);
        sounds = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio);
        //sounds[0].play(true);
        //sounds[3].play(true); //MUSIC CRAZY
        //sounds[4].play(true); //MUSIC Funky
        //pacman = graph.getChildrenByName("Pacman")[0];
        water = graph.getChildrenByName("Grid")[0].getChild(1).getChildren();
        Script.paths = graph.getChildrenByName("Grid")[0].getChild(0).getChildren();
        //const observer = new ObserverMob("ObserverMob");
        //console.log(cityPosition)
        //mob.mtxLocal.translate(new ƒ.Vector3(4, 3, 0));
        //observer.mtxLocal.translate(new ƒ.Vector3(0, 6, 0));
        //graph.addChild(observer);
        //mobsAny.push(observer);
        //observer.spawn();
        document.getElementById("vui").style.visibility = 'visible'; //Vui einschalten
        document.getElementById("--addMob").style.display = 'none'; //Mob menü ausschalten
        document.getElementById("--addMobP2").style.display = 'none'; //Mob menü ausschalten
        document.getElementById("--addBuildings").style.display = 'none'; //Mob menü ausschalten
        document.getElementById("--addBuildingsP2").style.display = 'none'; //Mob menü ausschalten
        //console.log(document.getElementById("--addBuildingsP2").style.display);
        const city = new Script.City("City");
        const cityP2 = new Script.CityP2("CityP2");
        //const city2 = new City("City");
        //const city2P2 = new CityP2("CityP2");
        Script.cityNode.push(city);
        Script.cityNodeP2.push(cityP2);
        //cityNode.push(city2);
        //cityNodeP2.push(city2P2);
        //Positions of starting Cities
        Script.paths[15].addChild(city);
        Script.paths[16].addChild(cityP2); //34
        //paths[1].addChild(city2);
        //paths[2].addChild(city2P2);
        //Test console Logs
        //console.log(paths);
        //console.log(water);
        //console.log(cityNode);
        //console.log(cityNodeP2);
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
        document.getElementById("--plusMine").addEventListener("click", (event) => {
            creatingBuildings();
        });
        document.getElementById("--plusMineP2").addEventListener("click", (event) => {
            creatingBuildings();
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
        graph.addEventListener("playSpawnSound", hndPlaySpawnSound);
        changeUnit(graph); //Funktion zum bewegen einer Unit in Main.ts
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
        unitInteraction(graph);
        logInUnit();
        handleEndOfCityProcedure(Script.currentUnitNumber, 2);
        unitInteraction(graph);
        logInUnitP2();
        handleEndOfCityProcedure(Script.currentUnitNumber, 1);
        console.log("Health of p1 unit: " + mobsAny[0].health);
        //console.log("Erster Mob: ");
        //console.log(mobs[0]);
        //mobsAny[0].material.se
        //Ende start items ---------------------------------------------------------------------------------------
    } //ENDKLAMMER FÜR START FUNKTION -------------------------------------------------------------------------------------
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        //document.getElementById("--goldInput").setAttribute('value', gold.toString());
        //document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
        mobsAny.map((g) => g.move()); //g.move(paths));
        mobsAny.map((g) => g.move()); //g.move(paths));
        mobsP2Any.map((g) => g.move()); //g.move(paths));
        mobsP2Any.map((g) => g.move()); //g.move(paths));
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
        if (Script.currentplayer === 0) {
            document.getElementById("--headingInfo").setAttribute('value', turnPhaseEnd);
        }
    }
    /*if(currentplayer === 1){
      document.getElementById("--infoBuiltMines").setAttribute('value', anzMine.toString());
    }
    if(currentplayer === 2){
      document.getElementById("--infoBuiltMines").setAttribute('value', anzMineP2.toString());
    }*/
    // ------------- Moving Mob abteil für beide Spieler ---------------------------------------------------
    function changeUnit(graph) {
        document.addEventListener('keydown', (event) => {
            //console.log(graph.getChildrenByName);
            var name = event.key;
            console.log("Current phase: " + currentPhase);
            if (Script.currentplayer === 0) { //STANDBY END OF GAME PROCEDURE
                if (name === 'Space' || name === 'Enter') {
                    const balls = graph.getChildrenByName("Physics")[0].getChildrenByName("Balls")[0];
                    balls.activate(true);
                    sounds[5].play(true);
                    if (score >= scoreP2) { }
                    window.localStorage.setItem("highscore", score.toString());
                }
                else {
                    window.localStorage.setItem("highscore", scoreP2.toString());
                }
                setTimeout(() => {
                    location.reload();
                }, 5000);
            }
            if (Script.currentplayer === 1) {
                if (currentPhase === 1) { //&& mobsAny.length > 0) {
                    if (mobsAny.length > 0) {
                        //console.log(mobs[currentUnitNumber].mtxLocal + " and " + currentUnitNumber);
                        if (name === 'd' || name === 'ArrowRight') {
                            //currentMobPosition = new ƒ.Vector3(mobs[currentUnitNumber].mtxLocal.translation.x, mobs[currentUnitNumber].mtxLocal.translation.y, 0);
                            if (checkIfMoveMob("x")) {
                                mobsAny[Script.currentUnitNumber].mtxLocal.translateX(1);
                                //console.log("trying to move right");
                            }
                        }
                        if (name === 'a' || name === 'ArrowLeft') {
                            if (checkIfMoveMob("-x")) {
                                mobsAny[Script.currentUnitNumber].mtxLocal.translateX(-1);
                                //console.log("trying to move Left");
                            }
                        }
                        if (name === 'w' || name === 'ArrowUp') {
                            if (checkIfMoveMob("y")) {
                                mobsAny[Script.currentUnitNumber].mtxLocal.translateY(1);
                                //console.log("trying to move up");
                            }
                        }
                        if (name === 's' || name === 'ArrowDown') {
                            if (checkIfMoveMob("-y")) {
                                mobsAny[Script.currentUnitNumber].mtxLocal.translateY(-1);
                                //console.log("trying to move down");
                            }
                        }
                        if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
                            if (Script.currentplayer === 1) {
                                sounds[2].play(true);
                                unitInteraction(graph); //UNIT INTERACTION HERE
                                //currentPhase = 2;
                                logInUnit(); //also end of turn 1 procedure if its not the last unit.
                            }
                            return;
                        }
                    }
                    else {
                        //logInUnit();
                        //
                        handleCityTurnPart(); //WEIRD INTERACTION
                        currentPhase = 2;
                    }
                }
                if (currentPhase === 2) { //Shuts down the other key down events, initiates or gives time for phase 2
                    if (name === 'Space' || name === 'Enter') {
                        handleEndOfCityProcedure(Script.currentUnitNumber, 2); //Wechselt zu zweitem angegebenen Parameter, aka current player wechselt nun zu 2
                        //ENDING OF PLAYER 1 PHASE 2
                        return;
                    }
                }
            }
            if (Script.currentplayer === 2) {
                if (currentPhase === 1) { //&& mobsP2Any.length > 0) {
                    if (mobsP2Any.length > 0) {
                        if (name === 'd' || name === 'ArrowRight') {
                            if (checkIfMoveMobP2("x")) {
                                mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translateX(1);
                                //console.log("trying to move right");
                            }
                        }
                        if (name === 'a' || name === 'ArrowLeft') {
                            if (checkIfMoveMobP2("-x")) {
                                mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translateX(-1);
                                //console.log("trying to move Left");
                            }
                        }
                        if (name === 'w' || name === 'ArrowUp') {
                            if (checkIfMoveMobP2("y")) {
                                mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translateY(1);
                                //console.log("trying to move up");
                            }
                        }
                        if (name === 's' || name === 'ArrowDown') {
                            if (checkIfMoveMobP2("-y")) {
                                mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translateY(-1);
                                //console.log("trying to move down");
                            }
                        }
                        if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
                            if (Script.currentplayer === 2) {
                                sounds[2].play(true);
                                //currentPhase = 2;
                                unitInteraction(graph); //UNIT INTERACTION HERE
                                logInUnitP2(); //also end of turn procedure if its not the last unit.
                            }
                            return;
                        }
                    }
                    else {
                        //unitInteraction(graph); //UNIT INTERACTION HERE
                        //logInUnitP2();
                        //
                        handleCityTurnPartP2();
                        currentPhase = 2;
                    }
                }
                if (currentPhase === 2) {
                    if (name === 'Space' || name === 'Enter') { //Space doesnt work for some reason.
                        handleEndOfCityProcedure(Script.currentUnitNumberP2, 1); //Wechselt zu zweitem angegebenen Parameter, aka current player wechselt nun zu 1
                        handleNPCAction();
                        //ENDING OF PLAYER 2 PHASE 2
                        return;
                    }
                }
            }
        });
    }
    // ------------- Check Moving Mob abteil Anfang für Spieler 1 ---------------------------------------------------
    function checkIfMoveMob(_direction) {
        const y = mobsAny[Script.currentUnitNumber].mtxLocal.translation.y;
        const x = mobsAny[Script.currentUnitNumber].mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? Script.movingDirection) {
            case "x":
                newPosition = new ƒ.Vector3(x + 1, y, 0);
                zwischenSpeicherCoordinateLRC.set(((mobsAny[Script.currentUnitNumber].mtxLocal.translation.x) + 1), mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
                break;
            case "-x":
                newPosition = new ƒ.Vector3(x - 1, y, 0);
                zwischenSpeicherCoordinateLRC.set(((mobsAny[Script.currentUnitNumber].mtxLocal.translation.x) - 1), mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
                break;
            case "y":
                newPosition = new ƒ.Vector3(x, y + 1, 0);
                zwischenSpeicherCoordinateLRC.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, ((mobsAny[Script.currentUnitNumber].mtxLocal.translation.y) + 1), 0);
                break;
            case "-y":
                newPosition = new ƒ.Vector3(x, y - 1, 0);
                zwischenSpeicherCoordinateLRC.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, ((mobsAny[Script.currentUnitNumber].mtxLocal.translation.y) - 1), 0);
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
        //console.log("x: " + x + " y: " + y);
        if (zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckStay) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckX)
            || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckY) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckXMinus) || zwischenSpeicherCoordinateLRC.equals(possibleLimitReachedCheckYMinus)) {
            //unitPositionPlaceholder.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0); //USED FOR UNIT INTERACTION to get position before it is moved
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
        const y = mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y;
        const x = mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x;
        let newPosition;
        switch (_direction ?? Script.movingDirection) {
            case "x":
                newPosition = new ƒ.Vector3(x + 1, y, 0);
                zwischenSpeicherCoordinateLRCP2.set(((mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x) + 1), mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
                break;
            case "-x":
                newPosition = new ƒ.Vector3(x - 1, y, 0);
                zwischenSpeicherCoordinateLRCP2.set(((mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x) - 1), mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
                break;
            case "y":
                newPosition = new ƒ.Vector3(x, y + 1, 0);
                zwischenSpeicherCoordinateLRCP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, ((mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y) + 1), 0);
                break;
            case "-y":
                newPosition = new ƒ.Vector3(x, y - 1, 0);
                zwischenSpeicherCoordinateLRCP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, ((mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y) - 1), 0);
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
            //unitPositionPlaceholder.set(mobsAny[currentUnitNumber].mtxLocal.translation.x, mobsAny[currentUnitNumber].mtxLocal.translation.y, 0); //USED FOR UNIT INTERACTION to get position before it is moved
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
        if ((Script.currentUnitNumber + 1) === mobsAny.length) {
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
            possibleLimitReachedCheckX.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x + 1, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckY.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinus.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x - 1, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinus.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStay.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            //handleUiPlayerswap();
            console.log("turnplayer is now: " + Script.currentplayer);
            //console.log("turnphase is now: " + currentPhase);
            return;
        }
        else {
            Script.currentUnitNumber++;
            possibleLimitReachedCheckX.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x + 1, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckY.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinus.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x - 1, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinus.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStay.set(mobsAny[Script.currentUnitNumber].mtxLocal.translation.x, mobsAny[Script.currentUnitNumber].mtxLocal.translation.y, 0);
            document.getElementById("--unitdiv" + (Script.currentUnitNumber + 1)).style.borderColor = "red"; //--unitdiv1P2 für spieler 2
            document.getElementById("--unitdiv" + Script.currentUnitNumber).style.borderColor = "#048836";
            //console.log(currentUnitNumber + " setze diese zahl auf grün");
            return;
        }
    }
    // ------------- Handle END TURN abteil END für Spieler 1 ---------------------------------------------------
    // ------------- Handle END TURN abteil Anfang für Spieler 2 ---------------------------------------------------
    function logInUnitP2() {
        document.getElementById("--headingInfo").setAttribute('value', turnPhaseTwo);
        if ((Script.currentUnitNumberP2 + 1) === mobsP2Any.length) { //############### mögliche Bugstelle, ij
            roundsPlayed++;
            if (roundsPlayed > 2) {
                currentPhase = 2;
            }
            handleCityTurnPartP2();
            //TURN ENDE (Not actually wenn danach noch city stuff kommt) für player 2 -> moved all pieces #################################################################################
            //currentplayer = 1;
            //document.getElementById("--unitdiv1").style.borderColor = "red";
            document.getElementById("--unitdiv" + (Script.currentUnitNumberP2 + 1) + "P2").style.borderColor = "#048836";
            //console.log("LRCStay before Unit count: " + possibleLimitReachedCheckStayP2);
            Script.currentUnitNumberP2 = 0;
            possibleLimitReachedCheckXP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x + 1, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinusP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x - 1, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinusP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStayP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            //console.log("LRCStay after Unit count: " + possibleLimitReachedCheckStayP2);
            //handleUiPlayerswap();
            console.log("turnplayer is now: " + Script.currentplayer);
            //console.log("turnphase is now: " + currentPhase);
            return;
        }
        else {
            //console.log("LRCStay before Unit count: " + possibleLimitReachedCheckStayP2);
            Script.currentUnitNumberP2++;
            possibleLimitReachedCheckXP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x + 1, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y + 1, 0);
            possibleLimitReachedCheckXMinusP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x - 1, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            possibleLimitReachedCheckYMinusP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y - 1, 0);
            possibleLimitReachedCheckStayP2.set(mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.x, mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.y, 0);
            //console.log("LRCStay after Unit count: " + possibleLimitReachedCheckStayP2);
            document.getElementById("--unitdiv" + (Script.currentUnitNumberP2 + 1) + "P2").style.borderColor = "red"; //--unitdiv1P2 für spieler 2
            document.getElementById("--unitdiv" + Script.currentUnitNumberP2 + "P2").style.borderColor = "#048836";
            return;
        }
    }
    // ------------- Handle END TURN abteil END für Spieler 2 ---------------------------------------------------
    function handleUiPlayerswap() {
        //console.log(currentplayer + "<- current player -> should be 1 and also gold for p1: " + gold + " p2 gold: " + goldP2);
        if (Script.currentplayer === 1) {
            //console.log(currentplayer + "<- current player and also gold for p1: " + gold);
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
            if ((mobsAny.length + mobsAny.length) != 9) {
                if (addMobLimitCounter > 0) {
                    if (gold >= Script.Balance.costOfMobs[0].cost) {
                        gold -= Script.Balance.costOfMobs[0].cost;
                        score += Script.Balance.costOfMobs[0].cost;
                        document.getElementById("--score_player_one").setAttribute('value', score.toString());
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
                        mobsAny.push(mob);
                        mob.spawn();
                        for (let iCounter = 0; iCounter < mobsAny.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === mobsAny.length) {
                                document.getElementById("--" + mobsAny.length + "img1").style.display = null;
                                document.getElementById("--" + mobsAny.length + "Filler").style.display = 'none';
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
            if ((mobsAny.length + mobsAny.length) != 9) {
                if (addMobLimitCounter > 0) {
                    if (gold >= Script.Balance.costOfMobs[1].cost) {
                        gold -= Script.Balance.costOfMobs[1].cost;
                        score += Script.Balance.costOfMobs[1].cost;
                        document.getElementById("--score_player_one").setAttribute('value', score.toString());
                        document.getElementById("--goldInput").setAttribute('value', gold.toString());
                        addMobLimitCounter--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mob2 = new Script.Mob2("Mob2" + i);
                        let cityPosition = new ƒ.Vector3(city.mtxWorld.translation.x, city.mtxWorld.translation.y, 0);
                        mob2.mtxLocal.translate(cityPosition);
                        graph.addChild(mob2);
                        mobsAny.push(mob2);
                        mob2.spawn();
                        for (let iCounter = 0; iCounter < mobsAny.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === mobsAny.length) {
                                document.getElementById("--" + mobsAny.length + "img3").style.display = null;
                                document.getElementById("--" + mobsAny.length + "Filler").style.display = 'none';
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
            if ((mobsP2Any.length + mobsP2Any.length) != 9) {
                if (addMobLimitCounterP2 > 0) {
                    if (goldP2 >= Script.Balance.costOfMobs[0].cost) {
                        goldP2 -= Script.Balance.costOfMobs[0].cost;
                        scoreP2 += Script.Balance.costOfMobs[0].cost;
                        document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
                        document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                        addMobLimitCounterP2--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mobP2 = new Script.MobP2("MobP2" + i);
                        mobP2.spawn();
                        let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
                        mobP2.mtxLocal.translate(cityPosition);
                        graph.addChild(mobP2);
                        mobsP2Any.push(mobP2);
                        mobP2.spawn();
                        for (let iCounter = 0; iCounter < mobsP2Any.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === mobsP2Any.length) {
                                document.getElementById("--" + mobsP2Any.length + "img2").style.display = null;
                                document.getElementById("--" + mobsP2Any.length + "FillerP2").style.display = 'none';
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
            if ((mobsP2Any.length + mobsP2Any.length) != 9) {
                if (addMobLimitCounterP2 > 0) {
                    if (goldP2 >= Script.Balance.costOfMobs[1].cost) {
                        goldP2 -= Script.Balance.costOfMobs[1].cost;
                        scoreP2 += Script.Balance.costOfMobs[1].cost;
                        document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
                        document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                        addMobLimitCounterP2--;
                        i++;
                        console.log("Gesamte anzahl an Units: Mob" + i);
                        const mob2P2 = new Script.Mob2P2("Mob2P2" + i);
                        let cityPosition = new ƒ.Vector3(cityP2.mtxWorld.translation.x, cityP2.mtxWorld.translation.y, 0);
                        mob2P2.mtxLocal.translate(cityPosition);
                        graph.addChild(mob2P2);
                        mobsP2Any.push(mob2P2);
                        mob2P2.spawn();
                        console.log(mobsP2Any + " :mobsP2 vs mob2P2: " + mob2P2);
                        for (let iCounter = 0; iCounter < mobsP2Any.length + 1; iCounter++) { //i ist hier von der function drüber die Zahl des gerade geaddeten mobs, bzw die länge des arrays.
                            if (iCounter === mobsP2Any.length) {
                                document.getElementById("--" + mobsP2Any.length + "img4").style.display = null;
                                document.getElementById("--" + mobsP2Any.length + "FillerP2").style.display = 'none';
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
        document.getElementById("--addBuildings").style.display = null;
        document.getElementById("--addBuildingsP2").style.display = 'none';
        document.getElementById("--infoBuildings").style.display = null;
        document.getElementById("--infoBuildingsP2").style.display = 'none';
        if (roundsPlayed > 2) {
            document.getElementById("--addMobP2").style.display = 'none';
            //console.log("Setze BuildingP2 und MobP2 zu none");
        }
        ;
        addMobLimitCounter = mobBuyLimit;
    }
    function handleCityTurnPartP2() {
        document.getElementById("--addBuildingsP2").style.display = null;
        document.getElementById("--infoBuildingsP2").style.display = null;
        document.getElementById("--addMobP2").style.display = null;
        document.getElementById("--addBuildings").style.display = 'none';
        document.getElementById("--infoBuildings").style.display = 'none';
        if (roundsPlayed > 2) {
            document.getElementById("--addMob").style.display = 'none';
            //console.log("Setze BuildingP1 und MobP1 zu none");
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
            gold += (goldGain + (anzMine * goldMineOutput));
            score += (goldGain + (anzMine * goldMineOutput));
            document.getElementById("--score_player_one").setAttribute('value', score.toString());
            document.getElementById("--goldInput").setAttribute('value', gold.toString());
            document.getElementById("--gold").style.display = null;
            document.getElementById("--goldP2").style.display = 'none';
        }
        else {
            if (roundsPlayed > 1) { //Fixes a bug, i dont know why p2 gets one tick more than P1 so iam reducing one turn for P2
                goldP2 += (goldGain + (anzMineP2 * goldMineOutput));
                scoreP2 += (goldGain + (anzMineP2 * goldMineOutput));
                document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
            }
            ;
            //console.log("P2 gets money. ")
            document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
            document.getElementById("--goldP2").style.display = null;
            document.getElementById("--gold").style.display = 'none';
        }
        document.getElementById("--unitdiv1" + playerPlaceHolder2).style.borderColor = "red";
        document.getElementById("--unitdiv" + (currentUnitNumb + 1) + "" + playerPlaceHolder).style.borderColor = "#048836";
        //console.log("ENDING P" + currentplayer);
        currentPhase = 1;
        Script.currentplayer = setPlayer;
        //console.log(setPlayer);
        document.getElementById("--addMob" + playerPlaceHolder).style.display = 'none';
        document.getElementById("--addBuildings" + playerPlaceHolder).style.display = 'none';
        document.getElementById("--infoBuildings" + playerPlaceHolder).style.display = 'none';
        //document.querySelector("#anz_mine")
        handleUiPlayerswap();
        document.getElementById("--headingInfo").setAttribute('value', turnPhaseOne);
        return;
    }
    function creatingBuildings() {
        if (Script.currentplayer === 1) {
            if (gold >= costMineBuild) {
                gold -= costMineBuild;
                document.getElementById("--goldInput").setAttribute('value', gold.toString());
                anzMine++;
                document.querySelector("#anz_mine").setAttribute('value', anzMine.toString());
            }
        }
        if (Script.currentplayer === 2) {
            if (goldP2 >= costMineBuild) {
                goldP2 -= costMineBuild;
                document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                anzMineP2++;
                document.querySelector("#anz_minep2").setAttribute('value', anzMineP2.toString());
            }
        }
    }
    function unitInteraction(graph) {
        //auf Placeholder zugreifen zum Vergleich mit ursprünglicher position
        //unitPositionPlaceholder NOT THIS ONE
        //possibleLimitReachedCheckStay IS ACTUALLY THE CORE POSITION FOR THE UNIT.
        if (Script.currentplayer === 1) {
            //In schleife unitPositionPlaceholder mit allen Figuren von Spieler 2 abfragen
            for (let iCounter2 = 0; iCounter2 < mobsP2Any.length; iCounter2++) {
                if (mobsAny[Script.currentUnitNumber].mtxLocal.translation.equals(mobsP2Any[iCounter2].mtxLocal.translation)) { // UNIT TO UNIT INTERACTION P1
                    mobsAny[Script.currentUnitNumber].mtxLocal.translation = (possibleLimitReachedCheckStay);
                    mobsP2Any[iCounter2].health -= mobsAny[Script.currentUnitNumber].dmg;
                    console.log("Health of p2 unit: " + mobsP2Any[iCounter2].health);
                    gold += goldGain / 2;
                    score += goldGain / 2;
                    document.getElementById("--score_player_one").setAttribute('value', score.toString());
                    document.getElementById("--goldInput").setAttribute('value', gold.toString());
                    sounds[1].play(true);
                    if (mobsP2Any[iCounter2].health < 1) {
                        let spliceRemoved = [];
                        //removeChild(mobsAny[iCounter3]);
                        graph.removeChild(mobsP2Any[iCounter2]);
                        spliceRemoved = mobsP2Any.splice(iCounter2, 1);
                        console.log(spliceRemoved);
                        console.log(mobsP2Any);
                        delete spliceRemoved[0];
                    }
                }
            }
            if (mobsAny[Script.currentUnitNumber].mtxLocal.translation.equals(Script.cityNodeP2[0].mtxWorld.translation)) { // CITY INTERACTION P1
                turnsNeededForCapture--;
                if (turnsNeededForCapture < 1) {
                    //alert("City of P2 has been captured!");
                    let spliceRemoved = [];
                    graph.removeChild(Script.cityNodeP2[Script.cityNodeP2.length - 1]);
                    spliceRemoved = Script.cityNodeP2.splice(Script.cityNodeP2.length - 1, 1);
                    console.log(spliceRemoved);
                    console.log(Script.cityNodeP2);
                    delete spliceRemoved[0];
                    if (Script.cityNodeP2.length === 0) {
                        console.log("bitch1");
                        currentPhase = 10;
                        Script.currentplayer = 0;
                        document.getElementById("--headingInfo").setAttribute('value', turnPhaseWinP1);
                    }
                }
            }
        }
        if (Script.currentplayer === 2) {
            //In schleife unitPositionPlaceholder mit allen Figuren von Spieler 1 abfragen
            for (let iCounter3 = 0; iCounter3 < mobsAny.length; iCounter3++) {
                if (mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.equals(mobsAny[iCounter3].mtxLocal.translation)) { // UNIT TO UNIT INTERACTION P2
                    mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation = (possibleLimitReachedCheckStayP2);
                    mobsAny[iCounter3].health -= mobsP2Any[Script.currentUnitNumberP2].dmg;
                    console.log("Health of p1 unit: " + mobsAny[iCounter3].health);
                    goldP2 += goldGain / 2;
                    scoreP2 += goldGain / 2;
                    document.getElementById("--score_player_two").setAttribute('value', scoreP2.toString());
                    document.getElementById("--goldInputP2").setAttribute('value', goldP2.toString());
                    sounds[1].play(true);
                    if (mobsAny[iCounter3].health < 1) {
                        let spliceRemoved = [];
                        //removeChild(mobsAny[iCounter3]);
                        graph.removeChild(mobsAny[iCounter3]);
                        spliceRemoved = mobsAny.splice(iCounter3, 1);
                        console.log(spliceRemoved);
                        console.log(mobsAny);
                        delete spliceRemoved[0];
                    }
                }
            }
            if (mobsP2Any[Script.currentUnitNumberP2].mtxLocal.translation.equals(Script.cityNode[0].mtxWorld.translation)) { // CITY INTERACTION P2
                turnsNeededForCapture--;
                if (turnsNeededForCapture < 1) { //THIS DOESNT WORK IF THE CAPTURED CITIES ARE RANDOM!!
                    //alert("City of P1 has been captured!");
                    let spliceRemoved = [];
                    //removeChild(mobsAny[iCounter3]);
                    graph.removeChild(Script.cityNode[Script.cityNode.length - 1]);
                    spliceRemoved = Script.cityNode.splice(Script.cityNode.length - 1, 1);
                    console.log(spliceRemoved);
                    console.log(Script.cityNode);
                    delete spliceRemoved[0];
                    if (Script.cityNode.length === 0) {
                        console.log("bitch");
                        currentPhase = 10;
                        Script.currentplayer = 0;
                        document.getElementById("--headingInfo").setAttribute('value', turnPhaseWinP2);
                    }
                }
            }
        }
    }
    function hndPlaySpawnSound() {
        //console.log("I was played");
        sounds[2].play(true);
    }
    function handleNPCAction() {
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
        //spritePaths.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 1); //FÜR COLORATION BZW TRANSPARENZ DER TILES
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
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["SPAWN"] = 0] = "SPAWN";
        JOB[JOB["IDLE"] = 1] = "IDLE";
        JOB[JOB["ESCAPE"] = 2] = "ESCAPE";
        JOB[JOB["STAY"] = 3] = "STAY";
    })(JOB || (JOB = {}));
    class StateMachine extends ƒAid.ComponentStateMachine {
        static iSubclass = ƒ.Component.registerSubclass(StateMachine);
        static instructions = StateMachine.get();
        //public forceEscape: number = 25;
        //public torqueIdle: number = 5;
        deltaTime = 0;
        timeStamp = 0;
        cmpBody;
        cmpMaterial;
        cmpTransform;
        constructor() {
            super();
            this.instructions = StateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            //const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
            //const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
            /*const sprite: ƒAid.NodeSprite = new ƒAid.NodeSprite("Sprite");
            sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
            sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations["mob"]);
            sprite.setFrameDirection(1);
            sprite.mtxLocal.translateZ(0.1);
            sprite.mtxLocal.translateY(0.1);
            sprite.framerate = 8;
            sprite.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 1));*/
            //this.addChild(sprite);
            //this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = StateMachine.transitDefault;
            setup.actDefault = StateMachine.actDefault;
            setup.setAction(JOB.SPAWN, this.actSpawn);
            setup.setAction(JOB.IDLE, this.actIdle);
            setup.setAction(JOB.ESCAPE, this.actEscape);
            setup.setAction(JOB.STAY, this.actDie);
            setup.setTransition(JOB.ESCAPE, JOB.STAY, this.transitStay);
            return setup;
        }
        static transitDefault(_machine) {
            console.log("Transit to", _machine.stateNext);
        }
        static async actSpawn(_machine) {
            //console.log(JOB[_machine.stateCurrent]);
            //let terrainInfo: ƒ.TerrainInfo = meshTerrain.getTerrainInfo(_machine.node.mtxWorld.translation, mtxTerrain);
            //if (terrainInfo.distance < 0.5)
            //  _machine.cmpBody.applyForce(ƒ.Vector3.Y(20));
            //const enemy = ƒ.Random.default.getElement(ObserverMob.observer);
            //observer.addChild(new Enemy("Enemy", enemy));
        }
        static async actDefault(_machine) {
            //console.log(JOB[_machine.stateCurrent]);
            //let terrainInfo: ƒ.TerrainInfo = meshTerrain.getTerrainInfo(_machine.node.mtxWorld.translation, mtxTerrain);
            //if (terrainInfo.distance < 0.5)
            //  _machine.cmpBody.applyForce(ƒ.Vector3.Y(20));
            console.log(JOB[_machine.stateCurrent]);
        }
        static async actIdle(_machine) {
            _machine.cmpMaterial.clrPrimary = ƒ.Color.CSS("magenta");
            let currPos = _machine.node.mtxLocal.translation;
            _machine.timeStamp += 1 * _machine.deltaTime;
            _machine.cmpTransform.mtxLocal.translation = new ƒ.Vector3(StateMachine.sinHorizontal(_machine.timeStamp), StateMachine.sin(_machine.timeStamp) + 0.5, currPos.z);
            StateMachine.actDefault(_machine);
        }
        static async actEscape(_machine) {
            _machine.cmpMaterial.clrPrimary = ƒ.Color.CSS("white");
            //let difference: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(_machine.node.mtxWorld.translation, cart.mtxWorld.translation);
            //difference.normalize(_machine.forceEscape);
            //_machine.cmpBody.applyForce(difference);
            StateMachine.actDefault(_machine);
        }
        static async actDie(_machine) {
            //
        }
        static transitStay(_machine) {
            //_machine.cmpBody.applyLinearImpulse(ƒ.Vector3.Y(5));
            //let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 100, 20, (_event: ƒ.EventTimer) => {
            //  _machine.cmpMaterial.clrPrimary = ƒ.Color.CSS("black", 1 - _event.count / 20);
            //  if (_event.lastCall)
            //    _machine.transit(JOB.STAY);
            //});
            //console.log(timer);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    ƒ.Loop.removeEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    this.cmpBody = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.cmpMaterial = this.node.getComponent(ƒ.ComponentMaterial);
                    this.cmpTransform = this.node.getComponent(ƒ.ComponentTransform);
                    this.cmpBody.addEventListener("TriggerEnteredCollision" /* ƒ.EVENT_PHYSICS.TRIGGER_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "runner")
                            this.transit(JOB.STAY);
                    });
                    let trigger = this.node.getChildren()[0].getComponent(ƒ.ComponentRigidbody);
                    trigger.addEventListener("TriggerEnteredCollision" /* ƒ.EVENT_PHYSICS.TRIGGER_ENTER */, (_event) => {
                        //console.log("TriggerEnter", _event.cmpRigidbody.node.name);
                        if (_event.cmpRigidbody.node.name == "runner" && this.stateCurrent != JOB.STAY)
                            this.transit(JOB.ESCAPE);
                    });
                    trigger.addEventListener("TriggerLeftCollision" /* ƒ.EVENT_PHYSICS.TRIGGER_EXIT */, (_event) => {
                        if (this.stateCurrent == JOB.ESCAPE)
                            this.transit(JOB.IDLE);
                    });
                    break;
            }
        };
        update = (_event) => {
            this.act();
            this.deltaTime = this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
        };
        static sin = (x) => {
            return Math.sin(Math.PI * x) * 0.3;
        };
        static sinHorizontal = (x) => {
            return Math.sin(1 * x) * 2;
        };
    }
    Script.StateMachine = StateMachine;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Balance extends ƒ.Node {
        static costOfMobs; //Sorry but we just gonna do this for external Data. -> could add all balances, but i just want to bugfix instead -> making a fun game!
    }
    Script.Balance = Balance;
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
            //const light = new Light("CityLight"); //FOR LINE OF SIGHT LIGHT I TRIED THIS
            //this.addChild(light);
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
    class Light extends ƒ.Node {
        constructor(_name) {
            super(_name);
            /*const mtrLight: ƒ.Material = new ƒ.Material(
                    "Light",
                    ƒ.ShaderLit,
                    new ƒ.CoatColored(ƒ.Color.CSS("#90d4ed"))
                );*/
            this.addComponent(new ƒ.ComponentLight());
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.scale(new ƒ.Vector3(5, 5, 5));
            this.mtxLocal.translateZ(3);
        }
    }
    Script.Light = Light;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    class Mob extends ƒ.Node {
        //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
        //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
        health = Script.healthUnitSmall;
        dmg = Script.dmgUnitSmall;
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
            //this.addChild(stats);
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
        //public getHealth(){
        //}
        spawn() {
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
            //console.log("Iam being dispatched");
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
        health = Script.healthUnitBig;
        dmg = Script.dmgUnitBig;
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
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
        }
        spawn() {
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
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
        health = Script.healthUnitBig;
        dmg = Script.dmgUnitBig;
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
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
        }
        spawn() {
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
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
        health = Script.healthUnitSmall;
        dmg = Script.dmgUnitSmall;
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
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
        }
        spawn() {
            this.dispatchEvent(new Event("playSpawnSound", { bubbles: true }));
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
/*namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
  
    export class ObserverMob extends ƒ.Node {
      //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
      //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  
      private health: number = healthUnitSmall;
      private dmg: number = dmgUnitSmall;
      
  
      constructor(_name: string) {
        super(_name);
  
        const mesh: ƒ.MeshSphere = new ƒ.MeshSphere();
        const material: ƒ.Material = new ƒ.Material(
          "MaterialMobP2",
          ƒ.ShaderLit,
          new ƒ.CoatColored()
        );
  
        const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        const cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
        const cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
        cmpMaterial.clrPrimary = ƒ.Color.CSS("red");
  
        this.addComponent(cmpTransform);
        this.addComponent(cmpMesh);
        this.addComponent(cmpMaterial);
  
        // sprites
        const sprite: ƒAid.NodeSprite = new ƒAid.NodeSprite("Sprite");
        sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations["mobP2"]);
        sprite.setFrameDirection(1);
        sprite.mtxLocal.translateZ(0.1);
        sprite.mtxLocal.translateY(0.1);
        sprite.framerate = 8;
        sprite.mtxLocal.scale(new ƒ.Vector3(1, 1, 1));
  
  
        this.addChild(sprite);
        this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
  
        this.dispatchEvent(new Event("playSpawnSound", {bubbles: true}));
      }



    }
}*/ 
//# sourceMappingURL=Script.js.map
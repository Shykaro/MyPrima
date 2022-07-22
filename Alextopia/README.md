### INFO #######################################################################################################################################################
Title: Coinmachine: Alextopia

Author: Alexander Thier

Year: 2022 Sommer 

Semester: OMB6

Course: Prototyping interactive Media and Apps PRIMA

Docent: Jirka Dell'Oro-Friedl


### LINKS #######################################################################################################################################################
Link to the finished and executable application on Github-Pages:
https://shykaro.github.io/MyPrima/Alextopia/

Link to the source code:
https://github.com/Shykaro/MyPrima/tree/main/Alextopia/Script/Source

Link to the design document:
Ursprungsdatei KANN NACHGEREICHT WERDEN (Liegt leider in physischer Form in Furtwangen, wo ich leider seit ca. einer Woche nichtmehr bin)
-> Additional design Notes: https://github.com/Shykaro/MyPrima/blob/main/Alextopia/Assets/DesignDocument.pdf


### DESCRIPTIONS #######################################################################################################################################################
Description for users on how to interact:
It's a 2 player game via the same input device. Both players are able to move their units in sequence by one tile each (With WASD or Arrowkeys).
Log in the position or rather proceed to the next step by pressing ENTER.
Each unit is able to attack enemy units when moved ontop. Each unit type has a specific cost, dmg as well as health value.
The game consists of two phases, after you moved every unit the current player has the possibility to build more troops in their corresponding city, 
or build mines to increase gold income every round.

Description on how to install, if applicable (additional services, database etc.)
Game was created and tested on Google Chrome. -> Preferebly use 4:3 aspect ratio.
FudgePhysics are used but included.
Nothing additional needed.

A copy of the catalogue of criteria above, the right column replaced with very brief explanations and descriptions of the fullfullments of these criteria

| Nr |	Criterion	   |	Explanation													 |
|---:|---------------------|---------------------------------------------------------------------------------------------------------------------|
| 1 |	Units and Positions|	Down left Tile is placed at x=0 y=0 z=0 to have overlookable tilegrid to work with. Additional assets have been created on top, below and behind to achieve criteria goal. |
| 2 |	Hierarchy	   | ![image](https://user-images.githubusercontent.com/9372410/180550909-40943bd8-d141-4db5-bc57-bb2eb5492956.png)
	Below the Game graph is the Grid graph which includes both the path and wall nodes, each of those has every single path and wall	attached. Sounds, Custom(Componentscript) as well as the Statemachine are independent. Light is also independent but has a childnode which helped me orientating the light. The coins are all childs of Ball node which also is directly a child of the Game. |
| 3 |	Editor		   |	I have premade most of the game in the editor but since i had a strong focus on 2D art sprites were added via code. The units themselves are added via code as well since they come and go as needed. |
| 4 |	Scriptcomponents|	I have a scriptcomponent Coin which is there to add to the aesthetic. Coin itself is mostly useless but scriptcomponents are definitly a good way to address node interaction, just not for my game. |
| 5 |	Extend		|	Scriptcomponent has been extended from FUDGECore, easiest way to handle that so it was indeed useful. |
| 6 |	Sound		|	Listener and Sounds played are on the same coordinate so there is no stereo, just mono. I have added placing sounds, building sounds and fighting sounds. |
| 7 |	VUI		|	The VUI shows the player info on Scores, what to do, which units are on the field, as well as which unit is currently being moved. On the right is an appearing VUI instrument which lets the player build and show general info in the city-phase of the turn. |
| 8 |	Event-System	|	Every unit has a playSpawnSound dispatch.event attached to trigger a Spawn sound in the Main.ts. This was not really useful because it couldve been done by just implementing the sound. Yet again could've been helpful on a greater scale.  |
| 9 |	External Data	|	Game is loading a Balancesheet.json from Assets and also saves Scores in browser storage. Json load is definitly useful if it's done on a greater scale -> more different Units, more Stats... |
| A |	Light (INCLUDED) 		|	Most of the game uses Shaderlit to not be dependent on light. (It's a 2D game, light can't really be used) I made a coin machine out of it though, so now i have a spotlight point at the Coin which includes falling coins when the game is Over. Spotlight is needed because the coins need to look like metal via gouraudShader, which is not possible with shaderlit. (1) |
| B |	Physics (INCLUDED)		|	Added falling rigidbody coins as Coinmachine aesthetic for the game end. They collide with the machine, the Customcomponentscript Coin and each other. (1) |
| C |	Net		|	- |
| D |	State Machines (INCLUDED)	|	Added a ComponentStateMachine which additionally interacts visibly with the game by being IDLE, THROWing when something is built and jumps of joy when the game has ended. (1) |
| E |	Animation (INCLUDED) 	|	I used Sprites to animate all Units, the different tiles on the Grid as well as the ComponentStateMachine on top of the game. Also added a little animation for the cities to rotate with. (2) |

Combined these are 14 Points.

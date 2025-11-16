/*

untitled webgame, 4Q25
author: Travis Klett (uncleboof)

Thanks for letting me use your MacBook
Air M2 for the development babe! <3 
(auntyboof/futurestepmilf69)

dev start: Nov. 9th, 2025

main char name: Hoodie

*/

import kaplay from "kaplay";
import "kaplay/global";
kaplay({
    width: 338,
    height: 190,
    scale: 4,
    root: document.getElementById("gameScreen"),
});
loadRoot("./");
loadSprite("background0", "assets/stringstarfields/background_0.png");
loadSprite("planks", "tilesets/tiles/woodplank.png");
loadSpriteAtlas("tilesets/tileset_0.png", {
    "plat-l": { x: 82, y: 64, width: 16, height: 8 },
    "plat-m": { x: 112, y: 64, width: 16, height: 8 },
    "plat-r": { x: 142, y: 64, width: 16, height: 8 },
    "Sm-tree": { x: 0, y: 80, width: 60, height: 65 },
    "Lg-tree": { x: 170, y: 10, width: 115, height: 200 },
    "ground": { x: 80, y: 144, width: 16, height: 16 },
    "ground0": { x: 0, y: 144, width: 16, height: 16 },
});
loadSprite("playerIdle-S", "sprites/HumanIdle.png", {
    sliceX: 16,
    sliceY: 4,
    anims: { "playerIdle-A": { from: 0, to: 15, loop: true, speed: 1/0.2 }, },
});
loadSprite("playerJump-S", "sprites/HumanJump.png", {
    sliceX: 4,
    sliceY: 4,
    anims: { "playerJump-A": { from: 0, to: 3, loop: false, speed: 1.25/0.2 }, },
});
loadSprite("playerWalk-S", "sprites/HumanWalk.png", {
    sliceX: 4,
    sliceY: 4,
    anims: { "playerWalk-A": { from: 0, to: 3, loop: true, speed: 1.66/0.2 }, },
});
loadSprite("playerAtk-S", "sprites/HumanAtk.png", {
    sliceX: 4,
    sliceY: 4,
    anims: { "playerAtk-A": { from: 0, to: 3, loop: false, speed: 2/0.2 }, },
});
loadSprite("zombieIdle-S", "sprites/ZombieIdle.png", {
    sliceX: 19,
    sliceY: 1,
    anims: { "zombieIdle-A": { from: 0, to: 18, loop: true, speed: 1/0.2 }, },
});
loadSprite("zombieWalk-S", "sprites/ZombieWalk.png", {
    sliceX: 4,
    sliceY: 4,
    anims: { "zombieWalk-A": { from: 0, to: 3, loop: true, speed: 1.33/0.2 }, },
});
loadSprite("zombieAtk-S", "sprites/ZombieAtk.png", {
    sliceX: 5,
    sliceY: 4,
    anims: { "zombieAtk-A": { from: 0, to: 4, loop: false, speed: 1/0.2 }, },
});
import { gameScene } from "./level0.js";
gameScene();
go("game", 1);

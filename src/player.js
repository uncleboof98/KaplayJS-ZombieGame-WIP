export function createPlayer(posX, posY) {
    // TILE_SIZE must match the tile size in level0.js map definition
    const TILE_SIZE = 16;

    const player = add([
        pos(posX, posY),
        sprite("playerIdle-S"),
        health(3),
        area({
        shape: new Rect(vec2(13,12) ,6,7),
        }),
        body(),
        state("idle", ["idle", "jump", "walk", "atk"], {
            "idle": ["idle", "jump", "walk", "atk"],
            "jump": ["idle", "jump", "walk", "atk"],
            "walk": ["idle", "jump", "walk", "atk"],
            "atk": ["idle", "jump", "walk", "atk"]
        }),
        {
            direction: "right",
            speed: 64,
            blocks: 0, // NEW: Inventory property
        },
        "player",
    ]);

    player.onGround(() => {
        player.enterState("idle");
    });

    player.onStateEnter("idle", () => {
        player.use(sprite("playerIdle-S"));
        player.play("playerIdle-A")
    });

    player.onAnimEnd((anim) => {
        if (anim === "playerAtk-A") {
            player.enterState("idle");
            player.use(sprite("playerIdle-S"));
            player.play("playerIdle-A");
        }
    });

    player.onDeath(() => {
        player.destroy();
    });

    onUpdate(() => {
        if (player.direction === 'left') {
            player.flipX = true;
        } else {
            player.flipX = false;
        }
    });

    onKeyDown("d", () => {
        if (player.state === "atk") return;
        if (player.curAnim() !== "playerWalk-A" && player.isGrounded()) {
            player.use(sprite("playerWalk-S"));
            player.enterState("walk");
            player.play("playerWalk-A")
        }
        if (player.direction !== "right") {player.direction = "right";}
        player.move(player.speed, 0)
    });

    onKeyRelease("d", () => {
        if (player.isGrounded()) {
            player.enterState("idle")
        }
    });

    onKeyDown("a", () => {
        if (player.state === "atk") return;
        if (player.curAnim() !== "playerWalk-A" && player.isGrounded()) {
            player.use(sprite("playerWalk-S"));
            player.enterState("walk");
            player.play("playerWalk-A");
        };
        if (player.direction !== "left") {player.direction = "left";}
        player.move(-player.speed, 0);
    });

    onKeyRelease("a", () => {
        if (player.isGrounded()) {
            player.enterState("idle");
        }
    });

    onKeyPress("space", () => {
        if (player.state === "atk") return;
        if (player.isGrounded()) {
            player.jump(225);
            player.enterState("jump");
            player.use(sprite("playerJump-S"));
            player.play("playerJump-A")
        }
    });

    // --- Block Placing Logic (NEW) ---
    onKeyPress("x", () => {
        if (player.blocks > 0) {

            // Calculate placement position: 1 tile in front of the player
            const xOffset = player.direction === "right" ? TILE_SIZE : -TILE_SIZE;

            // Target X position, snapped to the grid
            const snapX = Math.round((player.pos.x + xOffset) / TILE_SIZE) * TILE_SIZE;
            // Target Y position (player's feet level), snapped to the grid
            const placeY = Math.round(player.pos.y / TILE_SIZE) * TILE_SIZE;

            const placePos = vec2(snapX, placeY);

            // Create the new placeable block
            add([
                sprite("planks"),
                pos(placePos.x, placePos.y),
                area(),
                body({ isStatic: true }), // Block is static so it stays put
                health(2),
                "breakable", // Can be broken and collected again
                "ground", // Can be stood on
            ]);

            player.blocks -= 1;
        }
    });

    // --- Attack Logic (MODIFIED to use "attack_hitbox") ---
    onMousePress("left", () => {
        if (player.state === "jump") return;
        player.enterState("atk");
        player.use(sprite("playerAtk-S"));
        player.play("playerAtk-A");


        const atkBox = add([
            pos(player.pos.x + 7, player.pos.y + 12),
            rect(18, 7),
            //color(255,0,0),
            area(),
            opacity(0),
            "attack_hitbox", // <--- TAG IS NOW CORRECT
            { hasDealtDamage: false }
        ]);


        atkBox.onCollide("enemy", (enemy) => {
            if (!atkBox.hasDealtDamage) {
                enemy.hurt(1);
                atkBox.hasDealtDamage = true;
            }
        });

        wait(0.2, () => {
            atkBox.destroy();
        });
    });

    // onKeyPress("q", () => {player.hurt(1)}); // Good to keep commented for debugging

    return player;
}
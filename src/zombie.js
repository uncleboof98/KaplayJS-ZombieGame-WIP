export function createZombie(posX, posY) {
    // AI Constants
    const VISION_RANGE = 200;
    const ATTACK_RANGE = .001;
    const ZOMBIE_SPEED = 32;

    const zombie = add([
        pos(posX, posY),
        sprite("zombieIdle-S"),
        health(3),
        area({ shape: new Rect(vec2(11, 13), 8, 6) }),
        body(),
        state("idle", ["idle", "walk", "hunt", "atk"]),
        "enemy",
        {
            direction: "right",
            speed: ZOMBIE_SPEED,
            attackDamage: 0.5,
            patrolTimer: 0,
            hasAttacked: false, // Renaming to avoid conflict with attack logic
            attackHitbox: null, // To hold the active attack box
        }
    ]);

    // --- Helper: get the player safely ---
    function getPlayer() {
        return get("player")[0];
    }

    // --- AI Helper Functions ---
    function playerVisible() {
        const player = getPlayer();
        if (!player) return false;
        return zombie.pos.dist(player.pos) < VISION_RANGE;
    }

    function playerInAttackRange() {
        const player = getPlayer();
        if (!player) return false;
        // Increase the attack range slightly to account for the attack hitbox size
        return zombie.pos.dist(player.pos) < ATTACK_RANGE + 10;
    }

    // New (Fix): Flip when the player is on the left
    function facePlayer() {
        const player = getPlayer();
        if (!player) return;

        // If player is to the left of the zombie
        if (player.pos.x < zombie.pos.x) {
            zombie.direction = "left";
            zombie.flipX = true; // Flip the sprite to face left
        } 
        // If player is to the right of the zombie
        else {
            zombie.direction = "right";
            zombie.flipX = false; // Unflip (original orientation faces right)
        }
    }

    // --- IDLE State ---
    zombie.onStateEnter("idle", () => {
        zombie.use(sprite("zombieIdle-S"));
        zombie.play("zombieIdle-A");
        zombie.move(0, 0);
        zombie.patrolTimer = rand(3, 5);
    });

    zombie.onStateUpdate("idle", () => {
        if (playerVisible()) {
            zombie.enterState("hunt");
            return;
        }

        zombie.patrolTimer -= dt();
        if (zombie.patrolTimer <= 0) {
            zombie.enterState("walk");
        }
    });

    // --- WALK State ---
    zombie.onStateEnter("walk", () => {
        zombie.use(sprite("zombieWalk-S"));
        zombie.play("zombieWalk-A");
        zombie.patrolTimer = rand(3, 5);

        zombie.direction = randi(2) === 0 ? "left" : "right";
        zombie.flipX = (zombie.direction === "left"); // assign directly
    });

    zombie.onStateUpdate("walk", () => {
        if (playerVisible()) {
            zombie.enterState("hunt");
            return;
        }

        const moveDir = zombie.direction === "left" ? -1 : 1;
        zombie.move(moveDir * ZOMBIE_SPEED, 0);

        zombie.patrolTimer -= dt();
        if (zombie.patrolTimer <= 0) {
            zombie.enterState("idle");
        }
    });

    // --- HUNT State ---
    zombie.onStateEnter("hunt", () => {
        zombie.use(sprite("zombieWalk-S"));
        zombie.play("zombieWalk-A");
    });

    zombie.onStateUpdate("hunt", () => {
        const player = getPlayer();
        if (!player) {
            zombie.enterState("idle");
            return;
        }

        const distToPlayer = zombie.pos.dist(player.pos);

        if (distToPlayer > VISION_RANGE) {
            zombie.enterState("idle");
            return;
        }

        facePlayer();

        if (playerInAttackRange()) {
            zombie.move(0,0);
            zombie.enterState("atk");
            return;
        }

        const dir = player.pos.x - zombie.pos.x;
        zombie.move(Math.sign(dir) * ZOMBIE_SPEED, 0);
    });

// --- ATTACK State (FIXED: Using wait() for stable transition) ---
    zombie.onStateEnter("atk", () => {
        // Attack setup
        zombie.use(sprite("zombieAtk-S"));
        zombie.play("zombieAtk-A");
        zombie.move(0, 0);
        facePlayer();
        // 1. Determine attack box position and direction
        const isFacingLeft = zombie.flipX;
        const offset = isFacingLeft ? vec2(-7, 12) : vec2(7, 12); // Adjust offset based on facing direction
        const boxPos = zombie.pos.add(offset);

        // 2. Create the attack hitbox
        zombie.attackHitbox = add([
            pos(boxPos),
            rect(18, 7),
            //color(255,0,0),
            area(),
            opacity(0), // Invisible hitbox
            "zombieAttack",
            { hasDealtDamage: false }
        ]);

        // 3. Define collision logic for the attack hitbox
        zombie.attackHitbox.onCollide("player", (player) => {
            if (!zombie.attackHitbox.hasDealtDamage) {
                player.hurt(zombie.attackDamage);
                zombie.attackHitbox.hasDealtDamage = true;
            }
        });

        // Hitbox cleanup (0.2s is your specific hit frame window)
        wait(0.2, () => {
            if (zombie.attackHitbox) {
                zombie.attackHitbox.destroy();
                zombie.attackHitbox = null;
            }
        });
        
        // 4. State Transition (NEW FIX): Use wait() for reliable transition timing
        const ATTACK_ANIM_DURATION = 1; // <--- ADJUST THIS VALUE to match your full "zombieAtk-A" length!
        
        wait(ATTACK_ANIM_DURATION, () => {
            // After the attack animation completes, check the range and transition
                zombie.enterState("hunt"); // Resume hunting
        });
    });
    
    // --- State Exit for Cleanup ---
    // Ensure the hitbox is destroyed if the state changes before the animation ends
    /* zombie.onStateExit("atk", () => {
        if (zombie.attackHitbox) {
            zombie.attackHitbox.destroy();
            zombie.attackHitbox = null;
        }
    });*/

    // --- Cleanup ---
    zombie.onDeath(() => zombie.destroy());

    return zombie;
}
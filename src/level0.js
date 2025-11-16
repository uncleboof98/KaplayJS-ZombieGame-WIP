import { createPlayer } from "./player.js";
import { createZombie } from "./zombie.js";
const MAP_WIDTH_TILES = 55;
const TILE_SIZE = 8;
const MAP_WIDTH_PX = MAP_WIDTH_TILES * TILE_SIZE;

export function gameScene() {
	scene("game", (wave = 1) => {
		setGravity(800);
		camScale(1);

		add([
			sprite("background0"),
			fixed(),
			scale(1.2),
		]);
		add([
			sprite("Lg-tree"),
			scale(1),
			pos(72,155),
		]);
		add([
			sprite("Sm-tree"),
			scale(1),
			pos(182,208),
		]);

        const map0 = addLevel([
		'XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                          X',
		'X                      b   X',
		'X                     bbb  X',
		'X b                  b   b X',
		'Xbbb                 b   b X',
		'XbPb               GGGGGGGGG',
		'GGGGGG     GGGGG   ggggggggg',
		'ggggggGGGGGgggggGGGggggggggg',
		'gggggggggggggggggggggggggggg',
        ],{
				tileWidth: 16,
				tileHeight: 16,
				tiles: {
					b: () => [sprite("planks"), area(), body({ isStatic: true }), health(2), "breakable"],
					L: () => [sprite("plat-l"), area(), body({ isStatic: true })],
					M: () => [sprite("plat-m"), area(), body({ isStatic: true })],
					R: () => [sprite("plat-r"), area(), body({ isStatic: true })],
					G: () => [sprite("ground"), area(), body({ isStatic: true })],
					g: () => [sprite("ground0"), area(), body({ isStatic: true })],
					P: () => ["playerSpawn"],
					X: () => [rect(16,16), opacity(0), area(), body({ isStatic: true })],
				},
		});

        // --- Player and Spawning Setup ---
	 	const playerSpawnObj = map0.get("playerSpawn")[0];
		// Player creation
		const player = createPlayer(playerSpawnObj.pos.x, playerSpawnObj.pos.y - 5);

        // Calculate zombies for this wave (10 * wave number)
        const ZOMBIES_TO_SPAWN = wave * 3;


        // --- UI Display (Wave and Counter) ---
        const inventoryDisplay = add([
        	text("Blocks: 0", { size: 8 }),
        	pos(20,16),
        	fixed(),
        	"inventory_display",
        ]);
        const healthDisplay = add([
        	text("HP: 3", { size: 8 }),
        	pos(20,8),
        	fixed(),
        	"health_display",
        ])

        add([
            text(`WAVE ${wave}`, { size: 16 }),
            pos(width() / 2, 8),
            anchor("center"),
            fixed(),
            "wave_ui",
        ]);

        const zombieCounter = add([
            text(`Zombies: ${ZOMBIES_TO_SPAWN}`, { size: 10 }),
            pos(width() / 2, 28),
            anchor("center"),
            fixed(),
            "zombie_counter",
        ]);

        // --- Spawning Logic ---
        function spawnZombies(count) {
            for (let i = 0; i < count; i++) {
                // Randomize spawn X position within the main map area
                const spawnX = rand(TILE_SIZE * 5, MAP_WIDTH_PX - TILE_SIZE * 5);
                // Spawn on the ground level where the player starts
                const spawnY = playerSpawnObj.pos.y - 5;
                createZombie(spawnX, spawnY);
            }
        }

        // Initiate the spawn for the current wave
        spawnZombies(ZOMBIES_TO_SPAWN);

        // ----------------------------------------------------------------------
        // NEW/MODIFIED LOGIC
        // ----------------------------------------------------------------------

        // --- Attack Collision Logic (Hits Breakable Walls) ---
        onCollide("attack_hitbox", "breakable", (attack, block) => {
            // Damage the block
            block.hurt(1);
            // Destroy the hitbox so it doesn't hit multiple objects or hurt the same one twice
            attack.destroy();
        });

		// --- Breakable Block Destruction (Collection Logic) ---
		on("death", "breakable", (wall) => {
		 	wall.destroy();

	 	// Find the player object to increase their inventory
	 	const player = get("player")[0];
	 	if (player) {player.blocks += 1;}
		});

        // ----------------------------------------------------------------------
        // CORE GAME LOOP
        // ----------------------------------------------------------------------

        // --- Core Game Update Loop ---
		onUpdate(() => {
            const currentZombies = get("enemy").length;
            const player = get("player")[0];

            // 1. Update Zombie Counter UI
            zombieCounter.text = `Zombies: ${currentZombies}`;

            if (player) {
                // 2. Update Health and Inventory UI
				healthDisplay.text = `HP: ${player.hp()}`;
				inventoryDisplay.text = `Blocks: ${player.blocks}`;
            }

            // 3. Wave Completion Check
            if (currentZombies === 0) {
                // All zombies cleared, delay then transition to the next wave
                wait(2, () => {
                    go("game", wave + 1); // Go to the next wave!
                });
            }

            // 4. Camera Follow/Clamp
			camPos(
                // Clamp X position to keep the view within the map bounds
                clamp(player.pos.x, width() / 2, MAP_WIDTH_PX - width() / 2),
                player.pos.y
            );
		});

        // --- Player Death Event (Triggers Game Over) ---
        on("death", "player", () => {
            go("game_over", { finalWave: wave });
        });
	});

	// SCENE: "game_over" - Handles the end-of-game display and restart.
	scene("game_over", (data) => {
			add([
				rect(1000,1000),
				color(0,0,0),
				pos(center()),
				anchor("center"),
			])
			add([
			text(`G A M E   O V E R\n  Final Wave: ${data.finalWave}`, { size: 24 }),
			pos(center()),
			anchor("center"),
		]);

		add([
			text("Press L to restart", { size: 12 }),
			pos(center().add(0, 40)),
			anchor("center"),
		]);

		onKeyPress("l", () => {
			go("game", 1); // Restart the entire game
		});
	});
};
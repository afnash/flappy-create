// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    parent: 'game-canvas',
    backgroundColor: '#70C5CE',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game variables
let bird;
let pipes;
let movingPipes;
let ground;
let score = 0;
let scoreText;
let gameOver = false;
let gameStarted = false;
let showingTitle = true;
let bestScore = localStorage.getItem('flappyBestScore') || 0;

// Title screen elements
let gameTitle, gameSubtitle, startInstruction, gameOverlay;

// Sound variables
let flapSound, scoreSound, hitSound;

// Asset management for custom uploads
const assetManager = {
    customBirdTexture: null,
    customSounds: {
        flap: null,
        score: null,
        hit: null
    }
};

// Initialize Phaser game
const game = new Phaser.Game(config);

function preload() {
    // Show loading progress
    this.load.on('progress', function (value) {
        console.log('Loading progress:', Math.round(value * 100) + '%');
    });
    
    // Load official Flappy Bird sprites
    this.load.image('background', 'assets/sprite/background-day.png');
    this.load.image('ground', 'assets/sprite/base.png');
    this.load.image('pipe', 'assets/sprite/pipe-green.png');
    this.load.image('message', 'assets/sprite/message.png');
    this.load.image('gameover', 'assets/sprite/gameover.png');
    
    // Load bird animation frames
    this.load.image('bird-up', 'assets/sprite/yellowbird-upflap.png');
    this.load.image('bird-mid', 'assets/sprite/yellowbird-midflap.png');
    this.load.image('bird-down', 'assets/sprite/yellowbird-downflap.png');
    
    // Load official sounds
    this.load.audio('flapSound', 'assets/audio/wing.ogg');
    this.load.audio('scoreSound', 'assets/audio/point.ogg');
    this.load.audio('hitSound', 'assets/audio/hit.ogg');
    this.load.audio('dieSound', 'assets/audio/die.ogg');
    this.load.audio('swooshSound', 'assets/audio/swoosh.ogg');
    
    this.load.on('complete', function () {
        console.log('All assets loaded successfully');
    });
}

function create() {
    // Add background
    this.add.image(200, 300, 'background').setScale(1.5);
    
    // Create scrolling ground
    ground = this.physics.add.staticGroup();
    for (let i = 0; i < 3; i++) {
        const groundSprite = ground.create(i * 336, 568, 'ground');
        groundSprite.setOrigin(0, 0);
        groundSprite.refreshBody();
    }
    
    // Create bird with physics
    bird = this.physics.add.sprite(100, 250, 'bird-mid');
    bird.setCollideWorldBounds(false);
    bird.body.setSize(26, 18);
    bird.setScale(1.2);
    
    // Create bird flap animation
    this.anims.create({
        key: 'flap',
        frames: [
            { key: 'bird-down', duration: 120 },
            { key: 'bird-mid', duration: 120 },
            { key: 'bird-up', duration: 120 }
        ],
        frameRate: 8,
        repeat: -1
    });
    
    // Start flap animation
    bird.play('flap');
    
    // Title screen: counter gravity for floating effect
    bird.body.setGravityY(-1200);
    
    // Ensure camera is fixed
    this.cameras.main.stopFollow();
    
    // Create pipes group (using static group to prevent falling)
    pipes = this.physics.add.staticGroup();
    
    // Create moving pipes group for gameplay (static group that we'll move manually)
    movingPipes = this.physics.add.staticGroup();
    
    // Create some static pipes for the title screen
    createTitleScreenPipes.call(this);
    
    // Create score text (initially hidden)
    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '24px',
        fill: '#000000',
        fontWeight: 'bold',
        stroke: '#FFFFFF',
        strokeThickness: 3
    });
    scoreText.setVisible(false);
    
    // Create title screen overlay
    createTitleScreen.call(this);
    
    // Input handling
    this.input.on('pointerdown', handleInput);
    this.input.keyboard.on('keydown-SPACE', handleInput);
    
    // Collision detection
    this.physics.add.overlap(bird, pipes, hitPipe, null, this);
    this.physics.add.overlap(bird, movingPipes, hitPipe, null, this);
    this.physics.add.overlap(bird, ground, hitGround, null, this);
    
    // Initialize default sounds (silent audio for now)
    createDefaultSounds.call(this);
    
    // Update UI
    updateScoreDisplay();
    
    // Start floating animation for bird
    this.tweens.add({
        targets: bird,
        y: bird.y - 20,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function createTitleScreen() {
    // Create HTML overlay for title
    gameOverlay = document.createElement('div');
    gameOverlay.className = 'game-overlay active';
    gameOverlay.innerHTML = `
        <div class="game-title">FLAPPY BIRD</div>
        <div class="game-subtitle">Tap to customize your bird and sounds</div>
        <div class="start-instruction">Click or Press SPACE to Play!</div>
    `;
    document.querySelector('.game-container').appendChild(gameOverlay);
}

function createTitleScreenPipes() {
    // Create some pipes in the background for visual effect
    const pipePositions = [
        { x: 300, topHeight: 150 },
        { x: 500, topHeight: 250 },
        { x: 700, topHeight: 100 }
    ];
    
    pipePositions.forEach(pos => {
        const gap = 150;
        
        // Top pipe (flipped)
        const topPipe = pipes.create(pos.x, pos.topHeight, 'pipe');
        topPipe.setOrigin(0, 1);
        topPipe.setFlipY(true); // Flip the pipe for top position
        topPipe.isTitlePipe = true;
        
        // Bottom pipe
        const bottomPipe = pipes.create(pos.x, pos.topHeight + gap, 'pipe');
        bottomPipe.setOrigin(0, 0);
        bottomPipe.isTitlePipe = true;
    });
}

function createDefaultSounds() {
    // Create official Flappy Bird sounds with error handling
    try {
        flapSound = this.sound.add('flapSound', { volume: 0.5 });
        scoreSound = this.sound.add('scoreSound', { volume: 0.6 });
        hitSound = this.sound.add('hitSound', { volume: 0.5 });
        
        // Additional sounds
        this.dieSound = this.sound.add('dieSound', { volume: 0.5 });
        this.swooshSound = this.sound.add('swooshSound', { volume: 0.4 });
        
        console.log('Sounds loaded successfully');
    } catch (error) {
        console.error('Error loading sounds:', error);
    }
}

function handleInput() {
    if (showingTitle) {
        startGame.call(this);
    } else if (gameOver) {
        restartGame.call(this);
    } else {
        flap();
    }
}

function startGame() {
    showingTitle = false;
    gameStarted = true;
    
    // Remove title overlay
    if (gameOverlay) {
        gameOverlay.remove();
        gameOverlay = null;
    }
    
    // Show score text
    scoreText.setVisible(true);
    
    // Enable normal gravity for bird during gameplay
    bird.body.setGravityY(0); // Let world gravity (1200) affect the bird
    bird.setVelocity(0, 0);
    bird.setRotation(0);
    
    // Stop floating animation tween
    this.tweens.killTweensOf(bird);
    
    // Ensure bird animation continues
    if (!assetManager.customBirdTexture) {
        bird.play('flap');
    }
    
    // Clear title screen pipes
    pipes.children.entries.forEach(pipe => {
        if (pipe.isTitlePipe) {
            pipe.destroy();
        }
    });
    
    // Clear any existing moving pipes
    movingPipes.clear(true, true);
    
    // Start pipe spawning
    this.time.addEvent({
        delay: 1800,
        callback: spawnGamePipe,
        callbackScope: this,
        loop: true
    });
    
    // Initial flap to start
    flap();
}

function flap() {
    if (gameOver || showingTitle) return;
    
    // Apply upward velocity for flapping
    bird.setVelocityY(-420);
    
    // Rotate bird upward when flapping
    bird.setRotation(-0.3);
    
    // Play flap sound
    if (flapSound) {
        try {
            flapSound.play();
        } catch (error) {
            console.log('Flap sound play error:', error);
        }
    }
}

function spawnGamePipe() {
    if (!gameStarted || gameOver || showingTitle) return;
    
    const gap = 130;
    const pipeTop = Phaser.Math.Between(80, 400);
    const pipeBottom = pipeTop + gap;
    
    // Create top pipe (flipped upside down)
    const topPipe = movingPipes.create(450, pipeTop, 'pipe');
    topPipe.setOrigin(0, 1);
    topPipe.setFlipY(true);
    topPipe.isGamePipe = true;
    topPipe.refreshBody(); // Important: refresh physics body after transforms
    
    // Create bottom pipe
    const bottomPipe = movingPipes.create(450, pipeBottom, 'pipe');
    bottomPipe.setOrigin(0, 0);
    bottomPipe.isGamePipe = true;
    bottomPipe.refreshBody(); // Important: refresh physics body
    
    // Create scoring trigger zone (virtual)
    const scoreTrigger = {
        x: 450,
        y: pipeTop + gap/2,
        scored: false
    };
    
    // Attach score trigger to top pipe for tracking
    topPipe.scoreTrigger = scoreTrigger;
}

function increaseScore() {
    score++;
    scoreText.setText('Score: ' + score);
    updateScoreDisplay();
    
    // Play score sound
    if (scoreSound) {
        try {
            scoreSound.play();
        } catch (error) {
            console.log('Score sound play error:', error);
        }
    }
}

function hitPipe() {
    if (!gameOver && !showingTitle) {
        gameOver = true;
        
        // Stop bird animation and apply death rotation
        bird.anims.stop();
        bird.setRotation(1.57); // 90 degrees in radians - bird tilts down
        
        // Save best score if achieved
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('flappyBestScore', bestScore);
            updateScoreDisplay();
        }
        
        // Play collision sound
        if (hitSound) {
            try {
                hitSound.play();
            } catch (error) {
                console.log('Hit sound error:', error);
            }
        }
        
        // Play death sound after delay
        game.scene.scenes[0].time.delayedCall(500, () => {
            if (game.scene.scenes[0].dieSound) {
                try {
                    game.scene.scenes[0].dieSound.play();
                } catch (error) {
                    console.log('Die sound error:', error);
                }
            }
        });
        
        // Show game over screen after brief delay
        game.scene.scenes[0].time.delayedCall(1000, () => {
            showGameOver.call(game.scene.scenes[0]);
        });
    }
}

function hitGround() {
    hitPipe();
}

function showGameOver() {
    gameOverlay = document.createElement('div');
    gameOverlay.className = 'game-overlay active';
    gameOverlay.innerHTML = `
        <div class="game-title">GAME OVER</div>
        <div class="game-subtitle">Score: ${score} | Best: ${bestScore}</div>
        <div class="start-instruction">Click or Press SPACE to Play Again!</div>
    `;
    document.querySelector('.game-container').appendChild(gameOverlay);
}

function update() {
    // Continuously scroll ground
    ground.children.entries.forEach(groundSprite => {
        groundSprite.x -= 2;
        if (groundSprite.x <= -336) {
            groundSprite.x = 672;
        }
    });
    
    if (showingTitle) {
        // Title screen: move pipes slowly for visual effect
        pipes.children.entries.forEach(pipe => {
            if (pipe.isTitlePipe) {
                pipe.x -= 1;
                if (pipe.x < -100) {
                    pipe.x = 500;
                }
            }
        });
        return;
    }
    
    if (gameOver) {
        return; // Stop all movement when game over
    }
    
    // === BIRD PHYSICS ===
    // Keep bird at fixed horizontal position (authentic Flappy Bird behavior)
    bird.x = 100;
    
    // Apply bird rotation based on velocity (falls = rotate down, flaps = rotate up)
    if (bird.body.velocity.y > 100) {
        // Falling: rotate downward
        bird.setRotation(Math.min(bird.rotation + 0.05, 1.2));
    } else if (bird.body.velocity.y < -100) {
        // Rising: rotate upward
        bird.setRotation(Math.max(bird.rotation - 0.02, -0.5));
    }
    
    // === PIPE MOVEMENT ===
    const pipesToDestroy = [];
    
    movingPipes.children.entries.forEach(pipe => {
        if (pipe.isGamePipe) {
            // Move pipe left at constant speed
            pipe.x -= 3;
            
            // Update physics body position for accurate collision detection
            pipe.body.updateFromGameObject();
            
            // Handle scoring
            if (pipe.scoreTrigger) {
                pipe.scoreTrigger.x -= 3;
                
                // Check if bird passed through the gap (score once per pipe pair)
                if (!pipe.scoreTrigger.scored && bird.x > pipe.scoreTrigger.x + 15) {
                    pipe.scoreTrigger.scored = true;
                    increaseScore();
                }
            }
            
            // Mark off-screen pipes for destruction
            if (pipe.x < -100) {
                pipesToDestroy.push(pipe);
            }
        }
    });
    
    // Clean up off-screen pipes
    pipesToDestroy.forEach(pipe => pipe.destroy());
    
    // === COLLISION DETECTION ===
    // Check if bird hits ground or ceiling
    if (bird.y > 540 || bird.y < -10) {
        hitPipe();
    }
}

function restartGame() {
    // Remove game over overlay
    if (gameOverlay) {
        gameOverlay.remove();
        gameOverlay = null;
    }
    
    // Reset game state variables
    gameOver = false;
    gameStarted = true;
    showingTitle = false;
    score = 0;
    
    // Reset bird physics and position
    bird.setPosition(100, 250);
    bird.setVelocity(0, 0);
    bird.setRotation(0);
    bird.body.setGravityY(0); // Enable world gravity
    
    // Restart bird animation if using original sprite
    if (!assetManager.customBirdTexture) {
        bird.play('flap');
    }
    
    // Clear all moving pipes
    movingPipes.clear(true, true);
    
    // Reset score display
    scoreText.setText('Score: 0');
    scoreText.setVisible(true);
    updateScoreDisplay();
    
    // Restart pipe spawning timer
    this.time.addEvent({
        delay: 1800,
        callback: spawnGamePipe,
        callbackScope: this,
        loop: true
    });
}

function updateScoreDisplay() {
    document.getElementById('current-score').textContent = score;
    document.getElementById('best-score').textContent = bestScore;
}

// Custom asset management functions
function resizeImage(file, targetWidth, targetHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // Draw and resize the image
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Convert to blob
            canvas.toBlob(resolve, 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
}

function updateBirdSprite(imageBlob) {
    const img = new Image();
    img.onload = function() {
        // Create new texture from the resized image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 34;
        canvas.height = 24;
        ctx.drawImage(img, 0, 0);
        
        // Update Phaser texture
        game.scene.scenes[0].textures.addCanvas('customBird', canvas);
        
        // Stop current animation and set custom texture
        bird.anims.stop();
        bird.setTexture('customBird');
        
        // Store that we're using custom bird
        assetManager.customBirdTexture = 'customBird';
        
        URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(imageBlob);
}

function updateSound(audioFile, soundType) {
    const url = URL.createObjectURL(audioFile);
    
    // Load the new sound
    game.scene.scenes[0].load.audio(`custom${soundType}`, url);
    game.scene.scenes[0].load.once('complete', () => {
        // Replace the existing sound
        switch(soundType) {
            case 'Flap':
                if (flapSound) flapSound.destroy();
                flapSound = game.scene.scenes[0].sound.add(`custom${soundType}`, { volume: 0.3 });
                break;
            case 'Score':
                if (scoreSound) scoreSound.destroy();
                scoreSound = game.scene.scenes[0].sound.add(`custom${soundType}`, { volume: 0.5 });
                break;
            case 'Hit':
                if (hitSound) hitSound.destroy();
                hitSound = game.scene.scenes[0].sound.add(`custom${soundType}`, { volume: 0.4 });
                break;
        }
        
        // Clean up the blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    game.scene.scenes[0].load.start();
}

// UI Controls Management
document.addEventListener('DOMContentLoaded', function() {
    const controlsPanel = document.getElementById('controls-panel');
    const controlsToggle = document.getElementById('controls-toggle');
    
    // Toggle controls panel
    controlsToggle.addEventListener('click', function() {
        controlsPanel.classList.toggle('open');
        this.innerHTML = controlsPanel.classList.contains('open') ? '✖️' : '⚙️';
    });
    
    // Close controls when clicking outside
    document.addEventListener('click', function(e) {
        if (!controlsPanel.contains(e.target) && !controlsToggle.contains(e.target)) {
            controlsPanel.classList.remove('open');
            controlsToggle.innerHTML = '⚙️';
        }
    });
    
    // Bird image upload
    document.getElementById('bird-upload').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            this.classList.add('uploading');
            const resizedBlob = await resizeImage(file, 34, 24);
            updateBirdSprite(resizedBlob);
            this.classList.remove('uploading');
            this.classList.add('upload-success');
            setTimeout(() => this.classList.remove('upload-success'), 2000);
        } catch (error) {
            console.error('Error uploading bird image:', error);
            this.classList.remove('uploading');
            this.classList.add('upload-error');
            setTimeout(() => this.classList.remove('upload-error'), 2000);
        }
    });
    
    // Sound upload handlers
    document.getElementById('flap-sound-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.classList.add('uploading');
        updateSound(file, 'Flap');
        this.classList.remove('uploading');
        this.classList.add('upload-success');
        setTimeout(() => this.classList.remove('upload-success'), 2000);
    });
    
    document.getElementById('score-sound-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.classList.add('uploading');
        updateSound(file, 'Score');
        this.classList.remove('uploading');
        this.classList.add('upload-success');
        setTimeout(() => this.classList.remove('upload-success'), 2000);
    });
    
    document.getElementById('hit-sound-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        this.classList.add('uploading');
        updateSound(file, 'Hit');
        this.classList.remove('uploading');
        this.classList.add('upload-success');
        setTimeout(() => this.classList.remove('upload-success'), 2000);
    });
    
    // Reset bird button
    document.getElementById('reset-bird-btn').addEventListener('click', function() {
        // Reset to original bird animation
        assetManager.customBirdTexture = null;
        bird.setTexture('bird-mid');
        bird.play('flap');
        
        // Clear file input
        document.getElementById('bird-upload').value = '';
        
        // Visual feedback
        this.classList.add('upload-success');
        setTimeout(() => this.classList.remove('upload-success'), 1000);
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', function() {
        if (game.scene.scenes[0]) {
            if (showingTitle) {
                game.scene.scenes[0].scene.restart();
            } else {
                restartGame.call(game.scene.scenes[0]);
            }
        }
    });
}); 
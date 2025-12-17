// Main game logic with enhanced Yarn Fever mechanics
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.levelManager = new LevelManager();
        
        this.currentLevel = 1;
        this.moves = 0;
        this.score = 0;
        this.totalScore = 0;
        this.completedLevels = 0;
        
        this.yarns = [];
        this.slots = [];
        this.tempSlots = [];
        
        this.selectedYarn = null;
        this.draggedYarn = null;
        this.history = [];
        this.particles = [];
        this.gameLoopId = null;
        
        this.setupEventListeners();
        this.loadSettings();
    }
    
    start() {
        this.loadLevel(this.currentLevel);
    }
    
    async loadLevel(levelNum) {
        console.log(`📍 Loading level ${levelNum}...`);
        
        const levelData = await this.levelManager.getLevel(levelNum);
        
        if (!levelData) {
            console.log('🎉 All levels completed!');
            alert('🎉 Congratulations! You completed all levels!');
            return;
        }
        
        console.log(`✅ Level ${levelNum} data loaded:`, levelData);
        
        this.currentLevel = levelNum;
        this.moves = 0;
        this.score = 0;
        this.history = [];
        this.particles = [];
        
        // Create slots
        this.slots = [];
        this.tempSlots = [];
        
        for (let i = 0; i < levelData.targetSlots; i++) {
            this.slots.push(new Slot(i, 'target', levelData.slotCapacity, levelData.slotColors ? levelData.slotColors[i] : null));
        }
        
        for (let i = 0; i < levelData.tempSlots; i++) {
            this.tempSlots.push(new Slot(i, 'temp', levelData.slotCapacity));
        }
        
        console.log(`Created ${this.slots.length} target slots and ${this.tempSlots.length} temp slots`);
        
        // Create yarns
        this.yarns = [];
        levelData.yarns.forEach((yarnData, index) => {
            const yarn = new Yarn(yarnData.color, index);
            const slot = this.tempSlots[yarnData.startSlot % this.tempSlots.length];
            slot.addYarn(yarn);
            this.yarns.push(yarn);
        });
        
        console.log(`Created ${this.yarns.length} yarns`);
        
        this.updateUI();
        this.renderer.render(this.yarns, this.slots, this.tempSlots, this.draggedYarn, this.particles);
        this.startGameLoop();
    }
    
    startGameLoop() {
        console.log('🎮 Starting game loop...');
        
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        
        const loop = () => {
            // Update particles
            this.particles = this.particles.filter(p => p.life > 0);
            this.particles.forEach(p => p.update());
            
            this.renderer.render(this.yarns, this.slots, this.tempSlots, this.draggedYarn, this.particles);
            this.gameLoopId = requestAnimationFrame(loop);
        };
        this.gameLoopId = requestAnimationFrame(loop);
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e.changedTouches[0]);
        });
    }
    
    handleStart(e) {
        const pos = this.renderer.getMousePos(e);
        const clickedYarn = this.findYarnAt(pos);
        
        if (clickedYarn && clickedYarn.isTopOfStack()) {
            this.selectedYarn = clickedYarn;
            this.draggedYarn = clickedYarn;
            this.draggedYarn.isDragged = true;
        }
    }
    
    handleMove(e) {
        if (this.draggedYarn) {
            const pos = this.renderer.getMousePos(e);
            this.draggedYarn.dragPosition = pos;
        }
    }
    
    handleEnd(e) {
        if (this.draggedYarn) {
            const pos = this.renderer.getMousePos(e);
            const targetSlot = this.findSlotAt(pos);
            
            if (targetSlot && targetSlot.canAddYarn(this.draggedYarn)) {
                this.moveYarn(this.draggedYarn, targetSlot);
                this.createParticles(pos);
            }
            
            this.draggedYarn.dragPosition = null;
            this.draggedYarn.isDragged = false;
            this.draggedYarn = null;
            
            this.checkWinCondition();
        }
    }
    
    moveYarn(yarn, targetSlot) {
        const sourceSlot = yarn.currentSlot;
        
        if (sourceSlot) {
            this.history.push({
                yarn: yarn,
                from: sourceSlot,
                to: targetSlot
            });
            
            sourceSlot.removeYarn(yarn);
        }
        
        targetSlot.addYarn(yarn);
        this.moves++;
        this.updateUI();
        this.playSound('move');
    }
    
    findYarnAt(pos) {
        const allSlots = [...this.slots, ...this.tempSlots];
        
        for (const slot of allSlots) {
            const yarn = slot.getTopYarn();
            if (yarn && this.renderer.isYarnAtPosition(yarn, pos)) {
                return yarn;
            }
        }
        
        return null;
    }
    
    findSlotAt(pos) {
        const allSlots = [...this.slots, ...this.tempSlots];
        
        for (const slot of allSlots) {
            if (this.renderer.isSlotAtPosition(slot, pos)) {
                return slot;
            }
        }
        
        return null;
    }
    
    checkWinCondition() {
        // Check if all target slots are complete
        for (const slot of this.slots) {
            if (!slot.isComplete()) {
                return false;
            }
        }
        
        // Level complete!
        const baseScore = 1000;
        const movesPenalty = Math.min(this.moves * 5, 500);
        const levelBonus = this.currentLevel * 100;
        const isPerfect = this.moves <= this.currentLevel + 5;
        
        this.score = Math.max(baseScore - movesPenalty, 100) + levelBonus;
        if (isPerfect) this.score += 500;
        
        this.totalScore += this.score;
        this.completedLevels++;
        
        this.updateUI();
        this.playSound('levelComplete');
        
        console.log('🎉 Level complete! Showing modal...');
        showLevelComplete(this.moves, this.score, isPerfect);
        return true;
    }
    
    undo() {
        if (this.history.length === 0) return;
        
        const lastMove = this.history.pop();
        lastMove.to.removeYarn(lastMove.yarn);
        lastMove.from.addYarn(lastMove.yarn);
        
        this.moves++;
        this.updateUI();
        this.playSound('undo');
    }
    
    reset() {
        this.loadLevel(this.currentLevel);
    }
    
    showHint() {
        console.log('💡 Searching for hint...');
        
        // Clear any existing hints
        this.yarns.forEach(y => y.showHint = false);
        
        // Find first valid move
        const allSlots = [...this.slots, ...this.tempSlots];
        
        for (const sourceSlot of allSlots) {
            const yarn = sourceSlot.getTopYarn();
            if (yarn) {
                for (const targetSlot of allSlots) {
                    if (targetSlot !== sourceSlot && targetSlot.canAddYarn(yarn)) {
                        console.log('💡 Hint found! Highlighting yarn...');
                        yarn.showHint = true;
                        this.playSound('hint');
                        
                        // Clear hint after 2 seconds
                        setTimeout(() => {
                            yarn.showHint = false;
                        }, 2000);
                        
                        return; // Found hint, stop searching
                    }
                }
            }
        }
        
        console.log('❌ No valid moves found!');
        alert('No hints available. Try undoing some moves!');
    }
    
    nextLevel() {
        console.log(`➡️ Going to level ${this.currentLevel + 1}`);
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }
    
    createParticles(pos) {
        if (!this.settings.particlesEnabled) return;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const velocity = {
                x: Math.cos(angle) * 3,
                y: Math.sin(angle) * 3
            };
            this.particles.push(new Particle(pos.x, pos.y, velocity));
        }
    }
    
    playSound(type) {
        if (!this.settings.soundEnabled) return;
        console.log('🔊 Sound:', type);
    }
    
    loadSettings() {
        this.settings = {
            soundEnabled: true,
            particlesEnabled: true
        };
    }
    
    updateUI() {
        document.getElementById('level-display').textContent = `Level: ${this.currentLevel}`;
        document.getElementById('moves-display').textContent = `Moves: ${this.moves}`;
        document.getElementById('score-display').textContent = `Score: ${this.totalScore + this.score}`;
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, velocity) {
        this.x = x;
        this.y = y;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.life = 1;
        this.color = YARN_COLORS[Math.floor(Math.random() * YARN_COLORS.length)];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= 0.02;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
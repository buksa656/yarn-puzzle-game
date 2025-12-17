// Main game initialization
let game;

window.addEventListener('DOMContentLoaded', () => {
    console.log('🐴 DonkeyPuzzles Starting...');
    
    // Initialize game
    game = new Game();
    
    // Show menu
    showMenu();
    
    // Button event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    
    // Check if level select button exists (from updated HTML)
    const selectLevelBtn = document.getElementById('select-level-btn');
    if (selectLevelBtn) {
        selectLevelBtn.addEventListener('click', showLevelSelect);
    }
    
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }
    
    const closeSelectBtn = document.getElementById('close-select-btn');
    if (closeSelectBtn) {
        closeSelectBtn.addEventListener('click', hideModals);
    }
    
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', hideModals);
    }
    
    document.getElementById('undo-btn').addEventListener('click', () => game.undo());
    document.getElementById('reset-btn').addEventListener('click', () => game.reset());
    document.getElementById('hint-btn').addEventListener('click', () => game.showHint());
    
    // Settings toggles
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', (e) => {
            game.settings.soundEnabled = e.target.checked;
        });
    }
    
    const particlesToggle = document.getElementById('particles-toggle');
    if (particlesToggle) {
        particlesToggle.addEventListener('change', (e) => {
            game.settings.particlesEnabled = e.target.checked;
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (game) game.renderer.resize();
    });
});

function showMenu() {
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('level-complete').classList.add('hidden');
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) levelSelect.classList.add('hidden');
    const settings = document.getElementById('settings');
    if (settings) settings.classList.add('hidden');
}

function hideModals() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('level-complete').classList.add('hidden');
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) levelSelect.classList.add('hidden');
    const settings = document.getElementById('settings');
    if (settings) settings.classList.add('hidden');
}

function startGame() {
    hideModals();
    game.start();
}

function nextLevel() {
    console.log('Next Level button clicked');
    hideModals();
    game.nextLevel();
}

function showLevelSelect() {
    const levelSelect = document.getElementById('level-select');
    if (!levelSelect) return;
    
    levelSelect.classList.remove('hidden');
    
    // Create level buttons
    const levelButtons = document.getElementById('level-buttons');
    if (levelButtons) {
        levelButtons.innerHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.className = `level-btn ${i <= game.completedLevels + 1 ? '' : 'disabled'}`;
            btn.textContent = i;
            btn.disabled = i > game.completedLevels + 1;
            btn.addEventListener('click', () => {
                game.currentLevel = i;
                game.loadLevel(i);
                hideModals();
            });
            levelButtons.appendChild(btn);
        }
    }
}

function showSettings() {
    const settings = document.getElementById('settings');
    if (settings) {
        settings.classList.remove('hidden');
    }
}

function showLevelComplete(moves, score, isPerfect = false) {
    console.log(`showLevelComplete called: moves=${moves}, score=${score}, isPerfect=${isPerfect}`);
    
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-score').textContent = score;
    
    const perfectBonus = document.getElementById('perfect-bonus');
    if (perfectBonus) {
        if (isPerfect) {
            perfectBonus.classList.remove('hidden');
        } else {
            perfectBonus.classList.add('hidden');
        }
    }
    
    document.getElementById('level-complete').classList.remove('hidden');
}
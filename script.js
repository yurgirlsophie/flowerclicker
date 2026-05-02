// Game State
let gameState = {
    flowers: 0,
    clickPower: 1,
    perSecond: 0,
    items: {
        petal: { owned: 0, baseCost: 10, production: 0 },
        bee: { owned: 0, baseCost: 100, production: 0.1 },
        garden: { owned: 0, baseCost: 500, production: 0.5 },
        greenhouse: { owned: 0, baseCost: 2000, production: 2 },
        farm: { owned: 0, baseCost: 10000, production: 10 },
        paradise: { owned: 0, baseCost: 50000, production: 50 }
    }
};

const PRICE_MULTIPLIER = 1.15;

// Load game state from local storage
function loadGame() {
    const saved = localStorage.getItem('flowerClickerGame');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Save game state to local storage
function saveGame() {
    localStorage.setItem('flowerClickerGame', JSON.stringify(gameState));
}

// Get current cost of an item
function getItemCost(itemName) {
    const item = gameState.items[itemName];
    return Math.floor(item.baseCost * Math.pow(PRICE_MULTIPLIER, item.owned));
}

// Update the display
function updateDisplay() {
    // Update flower count
    document.getElementById('flowerCount').textContent = Math.floor(gameState.flowers).toLocaleString();
    document.getElementById('perSecond').textContent = gameState.perSecond.toFixed(1);

    // Update shop items
    Object.keys(gameState.items).forEach(itemName => {
        const cost = getItemCost(itemName);
        document.getElementById(`${itemName}-cost`).textContent = cost.toLocaleString();
        document.getElementById(`${itemName}-owned`).textContent = gameState.items[itemName].owned;

        // Update button disabled state
        const button = document.querySelector(`[data-item="${itemName}"]`);
        button.disabled = gameState.flowers < cost;
    });
}

// Calculate per second production
function calculatePerSecond() {
    let total = 0;
    Object.keys(gameState.items).forEach(itemName => {
        const item = gameState.items[itemName];
        total += item.owned * item.production;
    });
    gameState.perSecond = total;
}

// Create sparkle effect at a position
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.fontSize = (8 + Math.random() * 12) + 'px';
    
    const randomDelay = Math.random() * 0.3;
    sparkle.style.animationDelay = randomDelay + 's';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1200);
}

// Create glitter burst (multiple sparkles in a pattern)
function createGlitterBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        const sparkleX = x + Math.cos(angle) * distance;
        const sparkleY = y + Math.sin(angle) * distance;
        
        setTimeout(() => {
            createSparkle(sparkleX, sparkleY);
        }, Math.random() * 150);
    }
}

// Handle flower click
function clickFlower(event) {
    gameState.flowers += gameState.clickPower;
    
    // Create floating text
    createFloatingText(`+${gameState.clickPower}`, event.pageX, event.pageY);
    
    // Create flower particle burst
    createFlowerParticles(event.pageX, event.pageY);
    
    // Create glitter burst
    createGlitterBurst(event.pageX, event.pageY, 15);
    
    updateDisplay();
    saveGame();
}

// Create floating text effect
function createFloatingText(text, x, y) {
    const floatText = document.createElement('div');
    floatText.className = 'float-text';
    floatText.textContent = text;
    floatText.style.left = x + 'px';
    floatText.style.top = y + 'px';
    
    document.body.appendChild(floatText);
    
    setTimeout(() => {
        floatText.remove();
    }, 1000);
}

// Create flower particle burst effect
function createFlowerParticles(x, y) {
    const flowers = ['🌸', '🌼', '🌺', '🌻', '💐', '🌹', '🏵️', '🌷'];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'flower-particle';
        
        // Random flower emoji
        particle.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        
        // Calculate angle for this particle
        const angle = (i / particleCount) * Math.PI * 2;
        const vx = Math.cos(angle);
        const vy = Math.sin(angle);
        
        // Set CSS variables for the animation
        particle.style.setProperty('--vx', vx);
        particle.style.setProperty('--vy', vy);
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, 1200);
    }
}

// Create random glitter animation on the background
function createBackgroundGlitter() {
    const container = document.getElementById('glitterContainer');
    if (!container) return;
    
    const glitter = document.createElement('div');
    glitter.className = 'bg-glitter';
    glitter.innerHTML = '✨';
    glitter.style.left = Math.random() * 100 + '%';
    glitter.style.top = Math.random() * 100 + '%';
    glitter.style.fontSize = (6 + Math.random() * 14) + 'px';
    glitter.style.animationDuration = (2 + Math.random() * 3) + 's';
    
    container.appendChild(glitter);
    
    setTimeout(() => {
        glitter.remove();
    }, 5000);
}

// Buy an item
function buyItem(itemName) {
    const cost = getItemCost(itemName);
    
    if (gameState.flowers >= cost) {
        gameState.flowers -= cost;
        gameState.items[itemName].owned++;
        
        // Create sparkle burst at shop item
        const itemElement = document.getElementById(`item-${itemName}`);
        const rect = itemElement.getBoundingClientRect();
        createGlitterBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
        
        // Update click power if buying petal
        if (itemName === 'petal') {
            gameState.clickPower += 1;
        }
        
        calculatePerSecond();
        updateDisplay();
        saveGame();
    }
}

// Reset the game
function resetGame() {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
        gameState = {
            flowers: 0,
            clickPower: 1,
            perSecond: 0,
            items: {
                petal: { owned: 0, baseCost: 10, production: 0 },
                bee: { owned: 0, baseCost: 100, production: 0.1 },
                garden: { owned: 0, baseCost: 500, production: 0.5 },
                greenhouse: { owned: 0, baseCost: 2000, production: 2 },
                farm: { owned: 0, baseCost: 10000, production: 10 },
                paradise: { owned: 0, baseCost: 50000, production: 50 }
            }
        };
        localStorage.removeItem('flowerClickerGame');
        updateDisplay();
    }
}

// Passive income loop
function generatePassiveIncome() {
    const incomePerTick = gameState.perSecond / 10; // 10 ticks per second
    gameState.flowers += incomePerTick;
    updateDisplay();
    
    // Occasionally create background glitter
    if (Math.random() > 0.7) {
        createBackgroundGlitter();
    }
}

// Initialize the game
function initGame() {
    loadGame();
    calculatePerSecond();
    updateDisplay();
    
    // Create initial background glitter
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createBackgroundGlitter(), i * 300);
    }
    
    // Event listeners
    document.getElementById('flowerButton').addEventListener('click', clickFlower);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    // Buy buttons
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemName = e.target.dataset.item;
            buyItem(itemName);
        });
    });
    
    // Passive income every 100ms
    setInterval(generatePassiveIncome, 100);
    
    // Save game every 5 seconds
    setInterval(saveGame, 5000);
    
    // Create ambient glitter periodically
    setInterval(() => {
        if (Math.random() > 0.5) {
            createBackgroundGlitter();
        }
    }, 1500);
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
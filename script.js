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

// Handle flower click
function clickFlower(event) {
    gameState.flowers += gameState.clickPower;
    
    // Create floating text
    createFloatingText(`+${gameState.clickPower}`, event.pageX, event.pageY);
    
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

// Buy an item
function buyItem(itemName) {
    const cost = getItemCost(itemName);
    
    if (gameState.flowers >= cost) {
        gameState.flowers -= cost;
        gameState.items[itemName].owned++;
        
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
}

// Initialize the game
function initGame() {
    loadGame();
    calculatePerSecond();
    updateDisplay();
    
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
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
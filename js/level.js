// Level management system
class LevelManager {
    constructor() {
        this.levels = null;
    }
    
    async loadLevels() {
        if (this.levels) return this.levels;
        
        try {
            const response = await fetch('levels/levels.json');
            this.levels = await response.json();
            return this.levels;
        } catch (error) {
            console.error('Failed to load levels:', error);
            return this.getDefaultLevels();
        }
    }
    
    async getLevel(levelNum) {
        const levels = await this.loadLevels();
        return levels.levels[levelNum - 1] || null;
    }
    
    getDefaultLevels() {
        return {
            levels: [
                {
                    id: 1,
                    name: 'Getting Started',
                    targetSlots: 3, 
                    tempSlots: 2,
                    slotCapacity: 5,
                    yarns: [
                        { color: '#FF6B9D', startSlot: 0 },
                        { color: '#FF6B9D', startSlot: 0 },
                        { color: '#FF6B9D', startSlot: 0 },
                        { color: '#4ECDC4', startSlot: 1 },
                        { color: '#4ECDC4', startSlot: 1 },
                        { color: '#4ECDC4', startSlot: 0 },
                        { color: '#FFD93D', startSlot: 1 },
                        { color: '#FFD93D', startSlot: 1 },
                        { color: '#FFD93D', startSlot: 0 }
                    ]
                },
                {
                    id: 2,
                    name: 'Color Mix',
                    targetSlots: 4,
                    tempSlots: 2,
                    slotCapacity: 3,
                    yarns: [
                        { color: '#FF6B9D', startSlot: 0 },
                        { color: '#4ECDC4', startSlot: 0 },
                        { color: '#FFD93D', startSlot: 0 },
                        { color: '#A8E6CF', startSlot: 0 },
                        { color: '#FF6B9D', startSlot: 1 },
                        { color: '#4ECDC4', startSlot: 1 },
                        { color: '#FFD93D', startSlot: 1 },
                        { color: '#A8E6CF', startSlot: 1 },
                        { color: '#FF6B9D', startSlot: 0 },
                        { color: '#4ECDC4', startSlot: 1 },
                        { color: '#FFD93D', startSlot: 0 },
                        { color: '#A8E6CF', startSlot: 1 }
                    ]
                },
                {
                    id: 3,
                    name: 'Rainbow Challenge',
                    targetSlots: 5,
                    tempSlots: 3,
                    slotCapacity: 3,
                    yarns: [
                        { color: '#FF6B9D', startSlot: 0 },
                        { color: '#FF6B9D', startSlot: 1 },
                        { color: '#FF6B9D', startSlot: 2 },
                        { color: '#4ECDC4', startSlot: 0 },
                        { color: '#4ECDC4', startSlot: 1 },
                        { color: '#4ECDC4', startSlot: 2 },
                        { color: '#FFD93D', startSlot: 0 },
                        { color: '#FFD93D', startSlot: 1 },
                        { color: '#FFD93D', startSlot: 2 },
                        { color: '#A8E6CF', startSlot: 0 },
                        { color: '#A8E6CF', startSlot: 1 },
                        { color: '#A8E6CF', startSlot: 2 },
                        { color: '#FF8B94', startSlot: 0 },
                        { color: '#FF8B94', startSlot: 1 },
                        { color: '#FF8B94', startSlot: 2 }
                    ]
                }
            ]
        };
    }
}

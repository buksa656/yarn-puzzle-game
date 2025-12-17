// Rendering engine with enhanced visuals
class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        this.slotWidth = 70;
        this.slotHeight = 130;
        this.yarnRadius = 22;
        this.yarnSpacing = 35;
        
        this.resize();
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.scale = this.canvas.width / rect.width;
    }
    
    render(yarns, targetSlots, tempSlots, draggedYarn, particles = []) {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(245, 247, 250, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid pattern
        this.drawGridPattern();
        
        // Draw section labels
        this.drawLabels(targetSlots.length, tempSlots.length);
        
        // Draw slots
        this.drawSlots(targetSlots, 'target');
        this.drawSlots(tempSlots, 'temp');
        
        // Draw yarns (in order)
        yarns.forEach(yarn => {
            if (yarn !== draggedYarn && !yarn.isDragged) {
                this.drawYarn(yarn);
            }
        });
        
        // Draw particles
        particles.forEach(p => p.draw(this.ctx));
        
        // Draw dragged yarn on top
        if (draggedYarn) {
            this.drawYarn(draggedYarn, true);
        }
    }
    
    drawGridPattern() {
        this.ctx.strokeStyle = 'rgba(200, 200, 220, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawLabels(targetCount, tempCount) {
        this.ctx.fillStyle = '#666';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        
        // Target slots label
        this.ctx.fillText('🎯 TARGET SLOTS', this.canvas.width / 2, 25);
        
        // Temp slots label
        this.ctx.fillText('📦 TEMPORARY SLOTS', this.canvas.width / 2, this.canvas.height - 15);
    }
    
    drawSlots(slots, type) {
        const isTarget = type === 'target';
        const y = isTarget ? 50 : this.canvas.height - 170;
        const spacing = 18;
        const totalWidth = slots.length * (this.slotWidth + spacing);
        const startX = (this.canvas.width - totalWidth) / 2;
        
        slots.forEach((slot, index) => {
            const x = startX + index * (this.slotWidth + spacing);
            this.drawSlot(slot, x, y, isTarget);
            
            // Store position for hit detection
            slot.renderPosition = { x, y, width: this.slotWidth, height: this.slotHeight };
        });
    }
    
    drawSlot(slot, x, y, isTarget) {
        const isComplete = slot.isComplete();
        const isFull = slot.yarns.length >= slot.capacity;
        
        // Draw slot background
        const gradient = this.ctx.createLinearGradient(x, y, x, y + this.slotHeight);
        
        if (isTarget) {
            if (isComplete) {
                gradient.addColorStop(0, '#90EE90');
                gradient.addColorStop(1, '#66BB6A');
            } else {
                gradient.addColorStop(0, '#FFB6C1');
                gradient.addColorStop(1, '#FF69B4');
            }
        } else {
            gradient.addColorStop(0, '#E0E7FF');
            gradient.addColorStop(1, '#C7D2FE');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.strokeStyle = isTarget ? '#FF1493' : '#667eea';
        this.ctx.lineWidth = isFull ? 3 : 2;
        
        this.roundRect(x, y, this.slotWidth, this.slotHeight, 12);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw completion indicator
        if (isComplete) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('✓', x + this.slotWidth / 2, y + this.slotHeight / 2);
        }
        
        // Draw capacity indicator
        this.ctx.fillStyle = isTarget ? '#FF1493' : '#667eea';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(
            `${slot.yarns.length}/${slot.capacity}`,
            x + this.slotWidth / 2,
            y + this.slotHeight + 8
        );
    }
    
    drawYarn(yarn, isDragged = false) {
        const pos = this.getYarnScreenPosition(yarn);
        
        // Draw glow if dragged
        if (isDragged || yarn.showHint) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.yarnRadius + 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw yarn ball with gradient
        const gradient = this.ctx.createRadialGradient(
            pos.x - 6, pos.y - 6, 5,
            pos.x, pos.y, this.yarnRadius
        );
        gradient.addColorStop(0, this.lightenColor(yarn.color, 25));
        gradient.addColorStop(0.5, yarn.color);
        gradient.addColorStop(1, this.darkenColor(yarn.color, 15));
        
        this.ctx.fillStyle = gradient;
        this.ctx.strokeStyle = this.darkenColor(yarn.color, 30);
        this.ctx.lineWidth = isDragged ? 3 : 2;
        
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.yarnRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw texture/pattern on yarn
        this.ctx.strokeStyle = this.darkenColor(yarn.color, 50);
        this.ctx.lineWidth = 1.5;
        this.ctx.globalAlpha = 0.4;
        
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + (Date.now() / 5000);
            this.ctx.beginPath();
            this.ctx.arc(
                pos.x + Math.cos(angle) * 6,
                pos.y + Math.sin(angle) * 6,
                this.yarnRadius - 5,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
        
        // Store position for hit detection
        yarn.renderPosition = { x: pos.x, y: pos.y, radius: this.yarnRadius };
    }
    
    getYarnScreenPosition(yarn) {
        if (yarn.dragPosition) {
            return yarn.dragPosition;
        }
        
        const posData = yarn.getPosition();
        const slot = yarn.currentSlot;
        
        if (slot && slot.renderPosition) {
            const slotPos = slot.renderPosition;
            return {
                x: slotPos.x + slotPos.width / 2,
                y: slotPos.y + slotPos.height - 35 - (posData.index * this.yarnSpacing)
            };
        }
        
        return { x: 0, y: 0 };
    }
    
    isYarnAtPosition(yarn, pos) {
        if (!yarn.renderPosition) return false;
        
        const dx = pos.x - yarn.renderPosition.x;
        const dy = pos.y - yarn.renderPosition.y;
        return Math.sqrt(dx * dx + dy * dy) < yarn.renderPosition.radius;
    }
    
    isSlotAtPosition(slot, pos) {
        if (!slot.renderPosition) return false;
        
        const slotPos = slot.renderPosition;
        return pos.x >= slotPos.x &&
               pos.x <= slotPos.x + slotPos.width &&
               pos.y >= slotPos.y &&
               pos.y <= slotPos.y + slotPos.height;
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * this.scale,
            y: (e.clientY - rect.top) * this.scale
        };
    }
    
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        return this.lightenColor(color, -percent);
    }
}

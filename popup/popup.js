document.addEventListener('DOMContentLoaded', function() {
    const openSidebarBtn = document.getElementById('openSidebar');
    const settingsBtn = document.getElementById('settings');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    
    // Initialize bubble physics
    console.log('Chartu popup loaded, initializing bubbles...');
    initBubbles();

    // Check if we're on Google Docs
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        if (currentTab.url && currentTab.url.includes('docs.google.com')) {
            statusText.textContent = 'Active on Google Docs';
            statusIndicator.className = 'status-indicator ready';
        } else {
            statusText.textContent = 'Open Google Docs to start';
            statusIndicator.className = 'status-indicator processing';
        }
    });

    // Open Google Docs button
    openSidebarBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            
            if (currentTab.url && currentTab.url.includes('docs.google.com')) {
                // If already on Google Docs, inject the sidebar
                chrome.tabs.sendMessage(currentTab.id, {action: 'toggleSidebar'});
                window.close();
            } else {
                // Open Google Docs in new tab
                chrome.tabs.create({
                    url: 'https://docs.google.com/document/create'
                });
                window.close();
            }
        });
    });

    // Settings button
    settingsBtn.addEventListener('click', function() {
        // For now, just show a simple alert
        alert('Settings coming soon!');
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStatus') {
            statusText.textContent = request.status;
            
            // Update status indicator classes
            statusIndicator.className = 'status-indicator';
            
            if (request.status === 'Recording...') {
                statusIndicator.classList.add('recording');
            } else if (request.status === 'Processing...') {
                statusIndicator.classList.add('processing');
            } else {
                statusIndicator.classList.add('ready');
            }
        }
    });

    // Add subtle hover effects to feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add button press feedback
    openSidebarBtn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0) scale(0.98)';
    });
    
    openSidebarBtn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-2px) scale(1)';
    });
    
    openSidebarBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Bubble Physics System
function initBubbles() {
    console.log('initBubbles called');
    const container = document.getElementById('bubbleContainer');
    console.log('Bubble container:', container);
    
    if (!container) {
        console.error('Bubble container not found!');
        return;
    }
    
    const bubbles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF8A80', '#81C784'];
    
    // Create initial bubbles
    console.log('Creating initial bubbles...');
    for (let i = 0; i < 12; i++) {
        createBubble();
    }
    console.log('Created', bubbles.length, 'bubbles');
    
    function createBubble() {
        const bubble = document.createElement('div');
        const size = Math.random() * 60 + 40; // 40-100px (much bigger!)
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        bubble.className = 'bubble';
        bubble.style.setProperty('--size', size + 'px');
        bubble.style.setProperty('--color', color);
        
        // Random starting position
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.top = Math.random() * 100 + '%';
        
        // Physics properties
        bubble.vx = (Math.random() - 0.5) * 2; // Horizontal velocity
        bubble.vy = (Math.random() - 0.5) * 2; // Vertical velocity
        bubble.x = parseFloat(bubble.style.left);
        bubble.y = parseFloat(bubble.style.top);
        
        container.appendChild(bubble);
        bubbles.push(bubble);
        console.log('Created bubble:', {
            size: size + 'px',
            color: color,
            x: bubble.x,
            y: bubble.y,
            element: bubble
        });
        
        // Remove bubble after some time and create new one
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
                const index = bubbles.indexOf(bubble);
                if (index > -1) bubbles.splice(index, 1);
                createBubble();
            }
        }, 15000 + Math.random() * 10000);
    }
    
    // Physics animation loop
    function animate() {
        bubbles.forEach(bubble => {
            // Update position
            bubble.x += bubble.vx;
            bubble.y += bubble.vy;
            
            // Bounce off walls
            if (bubble.x <= 0 || bubble.x >= 100) {
                bubble.vx *= -0.8;
                bubble.x = Math.max(0, Math.min(100, bubble.x));
            }
            if (bubble.y <= 0 || bubble.y >= 100) {
                bubble.vy *= -0.8;
                bubble.y = Math.max(0, Math.min(100, bubble.y));
            }
            
            // Apply gravity (bubbles float up slightly)
            bubble.vy -= 0.02;
            
            // Damping
            bubble.vx *= 0.99;
            bubble.vy *= 0.99;
            
            // Update visual position
            bubble.style.left = bubble.x + '%';
            bubble.style.top = bubble.y + '%';
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
} 
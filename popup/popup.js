document.addEventListener('DOMContentLoaded', function() {
    const openSidebarBtn = document.getElementById('openSidebar');
    const settingsBtn = document.getElementById('settings');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');

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
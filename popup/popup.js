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
            statusIndicator.querySelector('.status-dot').style.background = '#10b981';
        } else {
            statusText.textContent = 'Open Google Docs to start';
            statusIndicator.querySelector('.status-dot').style.background = '#f59e0b';
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
            if (request.status === 'Recording...') {
                statusIndicator.querySelector('.status-dot').style.background = '#ef4444';
            } else if (request.status === 'Processing...') {
                statusIndicator.querySelector('.status-dot').style.background = '#f59e0b';
            } else {
                statusIndicator.querySelector('.status-dot').style.background = '#10b981';
            }
        }
    });
}); 
// Background service worker for ChartGPT
const GEMINI_API_KEY = 'AIzaSyAjnyE8evt6EWcQ2jD3h8DuxOu-48E7Ig0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Extension installation
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        console.log('ChartGPT installed successfully!');
        
        // Set default settings
        chrome.storage.local.set({
            isEnabled: true,
            autoComplete: true,
            voiceTranscription: true,
            imageAnalysis: true,
            geminiApiKey: GEMINI_API_KEY
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'callGeminiAPI') {
        callGeminiAPI(request.prompt, request.context)
            .then(response => {
                sendResponse({success: true, data: response});
            })
            .catch(error => {
                console.error('Gemini API error:', error);
                sendResponse({success: false, error: error.message});
            });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getSettings') {
        chrome.storage.local.get(['isEnabled', 'autoComplete', 'voiceTranscription', 'imageAnalysis'], function(result) {
            sendResponse(result);
        });
        return true;
    }
    
    if (request.action === 'updateSettings') {
        chrome.storage.local.set(request.settings, function() {
            sendResponse({success: true});
        });
        return true;
    }
});

// Gemini API call function
async function callGeminiAPI(prompt, context = '') {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: fullPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        }
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

// Tab update listener to inject content script when needed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('docs.google.com')) {
        // Content script will be automatically injected via manifest
        console.log('Google Docs detected, ChartGPT ready');
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
    if (tab.url && tab.url.includes('docs.google.com')) {
        chrome.tabs.sendMessage(tab.id, {action: 'toggleSidebar'});
    } else {
        chrome.tabs.create({
            url: 'https://docs.google.com/document/create'
        });
    }
}); 
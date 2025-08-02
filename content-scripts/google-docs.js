// ChartGPT Google Docs Content Script
class ChartGPT {
    constructor() {
        this.isInitialized = false;
        this.sidebarOpen = false;
        this.isRecording = false;
        this.recognition = null;
        this.messages = [];
        this.currentDocument = '';
        
        this.init();
    }

    init() {
        // Wait for Google Docs to fully load
        this.waitForGoogleDocs().then(() => {
            this.createFloatingButton();
            this.createSidebar();
            this.setupAutocomplete();
            this.setupVoiceRecognition();
            this.isInitialized = true;
            console.log('ChartGPT initialized on Google Docs');
        });
    }

    waitForGoogleDocs() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const docElement = document.querySelector('.kix-appview-editor');
                if (docElement) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    createFloatingButton() {
        const fab = document.createElement('button');
        fab.className = 'chartgpt-fab';
        fab.innerHTML = '📋';
        fab.title = 'ChartGPT - AI Medical Assistant';
        
        fab.addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.body.appendChild(fab);
    }

    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.className = 'chartgpt-sidebar';
        sidebar.innerHTML = `
            <div class="chartgpt-sidebar-header">
                <div class="chartgpt-sidebar-title">
                    <span>📋</span>
                    <span>ChartGPT</span>
                </div>
                <button class="chartgpt-sidebar-close">×</button>
            </div>
            
            <div class="chartgpt-chat">
                <div class="chartgpt-messages" id="chartgptMessages">
                    <div class="chartgpt-message assistant">
                        <div class="chartgpt-message-avatar">AI</div>
                        <div class="chartgpt-message-content">
                            <div class="chartgpt-message-text">
                                Hello! I'm your AI medical documentation assistant. I can help you with:
                                <br><br>
                                • Smart autocomplete for medical notes<br>
                                • Voice transcription of patient conversations<br>
                                • Medical image analysis<br>
                                • Clinical reasoning suggestions<br><br>
                                How can I help you today?
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chartgpt-quick-actions">
                    <div class="chartgpt-quick-action" data-action="autocomplete">Smart Autocomplete</div>
                    <div class="chartgpt-quick-action" data-action="voice">Voice Recording</div>
                    <div class="chartgpt-quick-action" data-action="image">Image Analysis</div>
                    <div class="chartgpt-quick-action" data-action="diagnosis">Differential Diagnosis</div>
                </div>
                
                <div class="chartgpt-input-area">
                    <div class="chartgpt-input-container">
                        <textarea class="chartgpt-input" id="chartgptInput" placeholder="Ask me anything about medical documentation..."></textarea>
                        <button class="chartgpt-send-btn" id="chartgptSend">→</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        sidebar.querySelector('.chartgpt-sidebar-close').addEventListener('click', () => {
            this.toggleSidebar();
        });

        sidebar.querySelector('#chartgptSend').addEventListener('click', () => {
            this.sendMessage();
        });

        sidebar.querySelector('#chartgptInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick actions
        sidebar.querySelectorAll('.chartgpt-quick-action').forEach(action => {
            action.addEventListener('click', () => {
                this.handleQuickAction(action.dataset.action);
            });
        });

        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        this.sidebar.classList.toggle('open', this.sidebarOpen);
        
        if (this.sidebarOpen) {
            this.updateDocumentContent();
        }
    }

    async sendMessage() {
        const input = this.sidebar.querySelector('#chartgptInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show loading
        this.addLoadingMessage();

        try {
            // Get current document context
            const context = this.getDocumentContext();
            
            // Call Gemini API
            const response = await this.callGeminiAPI(message, context);
            
            // Remove loading and add response
            this.removeLoadingMessage();
            this.addMessage(response, 'assistant');
            
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
            console.error('Error calling Gemini API:', error);
        }
    }

    async callGeminiAPI(prompt, context) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'callGeminiAPI',
                prompt: prompt,
                context: context
            }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'API call failed'));
                }
            });
        });
    }

    addMessage(text, sender) {
        const messagesContainer = this.sidebar.querySelector('#chartgptMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chartgpt-message ${sender}`;
        
        const avatar = sender === 'user' ? 'U' : 'AI';
        const avatarBg = sender === 'user' ? 'linear-gradient(135deg, #007AFF, #5856D6)' : 'linear-gradient(135deg, #10b981, #059669)';
        
        messageDiv.innerHTML = `
            <div class="chartgpt-message-avatar" style="background: ${avatarBg}">${avatar}</div>
            <div class="chartgpt-message-content">
                <div class="chartgpt-message-text">${this.formatMessage(text)}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.messages.push({ text, sender, timestamp: Date.now() });
    }

    formatMessage(text) {
        // Convert markdown-like formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    addLoadingMessage() {
        const messagesContainer = this.sidebar.querySelector('#chartgptMessages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chartgpt-message assistant';
        loadingDiv.id = 'chartgptLoading';
        
        loadingDiv.innerHTML = `
            <div class="chartgpt-message-avatar" style="background: linear-gradient(135deg, #10b981, #059669)">AI</div>
            <div class="chartgpt-message-content">
                <div class="chartgpt-message-text">
                    <div class="chartgpt-loading">Thinking...</div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeLoadingMessage() {
        const loadingDiv = this.sidebar.querySelector('#chartgptLoading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    handleQuickAction(action) {
        const input = this.sidebar.querySelector('#chartgptInput');
        
        switch (action) {
            case 'autocomplete':
                input.value = 'Help me complete this medical note with smart autocomplete suggestions.';
                break;
            case 'voice':
                this.toggleVoiceRecording();
                break;
            case 'image':
                input.value = 'I want to analyze a medical image. How do I upload it?';
                break;
            case 'diagnosis':
                input.value = 'Help me create a differential diagnosis based on the symptoms in my document.';
                break;
        }
        
        input.focus();
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                    this.handleVoiceInput(finalTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceRecording();
            };
        }
    }

    toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (!this.recognition) {
            this.addMessage('Voice recognition is not available in your browser.', 'assistant');
            return;
        }

        this.isRecording = true;
        this.recognition.start();
        
        // Update UI
        const voiceAction = this.sidebar.querySelector('[data-action="voice"]');
        voiceAction.textContent = 'Stop Recording';
        voiceAction.style.background = 'rgba(239, 68, 68, 0.1)';
        voiceAction.style.color = '#ef4444';
        
        // Show recording indicator
        this.showVoiceIndicator();
        
        // Notify popup
        chrome.runtime.sendMessage({action: 'updateStatus', status: 'Recording...'});
    }

    stopVoiceRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isRecording = false;
        
        // Update UI
        const voiceAction = this.sidebar.querySelector('[data-action="voice"]');
        voiceAction.textContent = 'Voice Recording';
        voiceAction.style.background = 'rgba(0, 122, 255, 0.1)';
        voiceAction.style.color = '#007AFF';
        
        // Hide recording indicator
        this.hideVoiceIndicator();
        
        // Notify popup
        chrome.runtime.sendMessage({action: 'updateStatus', status: 'Ready'});
    }

    handleVoiceInput(transcript) {
        // Insert transcript into Google Docs
        this.insertTextIntoDocs(transcript);
        
        // Add to chat
        this.addMessage(`Voice input: "${transcript}"`, 'user');
        
        // Process with AI
        this.processVoiceInput(transcript);
    }

    insertTextIntoDocs(text) {
        // Find the Google Docs editor
        const editor = document.querySelector('.kix-appview-editor');
        if (editor) {
            // Create a new paragraph with the transcribed text
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode(text + ' ');
                range.insertNode(textNode);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    async processVoiceInput(transcript) {
        try {
            const context = this.getDocumentContext();
            const prompt = `The doctor just said: "${transcript}". Please help me document this in medical terminology and suggest any relevant clinical observations or next steps.`;
            
            const response = await this.callGeminiAPI(prompt, context);
            this.addMessage(response, 'assistant');
            
        } catch (error) {
            console.error('Error processing voice input:', error);
        }
    }

    showVoiceIndicator() {
        if (!this.voiceIndicator) {
            this.voiceIndicator = document.createElement('div');
            this.voiceIndicator.className = 'chartgpt-voice-indicator';
            this.voiceIndicator.textContent = 'Recording...';
            document.body.appendChild(this.voiceIndicator);
        }
    }

    hideVoiceIndicator() {
        if (this.voiceIndicator) {
            this.voiceIndicator.remove();
            this.voiceIndicator = null;
        }
    }

    setupAutocomplete() {
        // Monitor Google Docs editor for typing
        const observer = new MutationObserver(() => {
            if (this.sidebarOpen) {
                this.updateDocumentContent();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    updateDocumentContent() {
        const editor = document.querySelector('.kix-appview-editor');
        if (editor) {
            this.currentDocument = editor.textContent || '';
        }
    }

    getDocumentContext() {
        return `Current medical document content: ${this.currentDocument.substring(0, 1000)}...`;
    }
}

// Initialize ChartGPT when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChartGPT();
    });
} else {
    new ChartGPT();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleSidebar') {
        if (window.chartGPT) {
            window.chartGPT.toggleSidebar();
        }
    }
});

// Store instance globally for message handling
window.chartGPT = null;
document.addEventListener('DOMContentLoaded', () => {
    window.chartGPT = new ChartGPT();
}); 
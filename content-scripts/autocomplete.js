// Chartu Smart Autocomplete System
class MedicalAutocomplete {
    constructor() {
        this.isActive = false;
        this.suggestions = [];
        this.currentSuggestionIndex = 0;
        this.autocompleteBox = null;
        this.lastCursorPosition = null;
        this.typingTimeout = null;
        this.medicalContext = '';
        
        this.init();
    }

    init() {
        this.createAutocompleteBox();
        this.setupEventListeners();
        console.log('Medical autocomplete initialized');
    }

    createAutocompleteBox() {
        this.autocompleteBox = document.createElement('div');
        this.autocompleteBox.className = 'chartgpt-autocomplete';
        this.autocompleteBox.style.display = 'none';
        document.body.appendChild(this.autocompleteBox);
    }

    setupEventListeners() {
        // Monitor Google Docs editor for typing
        const observer = new MutationObserver(() => {
            this.handleDocumentChange();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateSuggestions(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateSuggestions(-1);
                    break;
                case 'Tab':
                case 'Enter':
                    e.preventDefault();
                    this.acceptSuggestion();
                    break;
                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });
    }

    handleDocumentChange() {
        // Debounce typing
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.checkForAutocomplete();
        }, 300);
    }

    async checkForAutocomplete() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const cursorPosition = this.getCursorPosition();
        
        // Get text around cursor
        const context = this.getTextAroundCursor(range, 100);
        const currentWord = this.getCurrentWord(range);
        
        if (currentWord.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Check for medical autocomplete triggers
        const suggestions = await this.getMedicalSuggestions(context, currentWord);
        
        if (suggestions.length > 0) {
            this.showSuggestions(suggestions, cursorPosition);
        } else {
            this.hideSuggestions();
        }
    }

    getTextAroundCursor(range, chars) {
        const container = range.startContainer;
        const text = container.textContent || '';
        const offset = range.startOffset;
        
        const start = Math.max(0, offset - chars);
        const end = Math.min(text.length, offset + chars);
        
        return text.substring(start, end);
    }

    getCurrentWord(range) {
        const container = range.startContainer;
        const text = container.textContent || '';
        const offset = range.startOffset;
        
        // Find word boundaries
        let start = offset;
        while (start > 0 && /\w/.test(text[start - 1])) start--;
        
        let end = offset;
        while (end < text.length && /\w/.test(text[end])) end++;
        
        return text.substring(start, end);
    }

    getCursorPosition() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        return {
            x: rect.left,
            y: rect.bottom + window.scrollY,
            width: rect.width
        };
    }

    async getMedicalSuggestions(context, currentWord) {
        const medicalPrompts = this.getMedicalPrompts(context, currentWord);
        
        try {
            const response = await this.callGeminiAPI(medicalPrompts);
            return this.parseSuggestions(response);
        } catch (error) {
            console.error('Error getting medical suggestions:', error);
            return this.getFallbackSuggestions(context, currentWord);
        }
    }

    getMedicalPrompts(context, currentWord) {
        const prompts = [
            `Medical context: "${context}"
            Current word: "${currentWord}"
            
            Provide 3-5 medical autocomplete suggestions for the current word. Focus on:
            - Medical terminology and abbreviations
            - Common symptoms and conditions
            - Clinical observations
            - Treatment options
            - Anatomical terms
            
            Format as a simple list, one suggestion per line. Keep suggestions concise (1-3 words).`
        ];

        return prompts.join('\n\n');
    }

    async callGeminiAPI(prompt) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'callGeminiAPI',
                prompt: prompt,
                context: this.medicalContext
            }, (response) => {
                if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'API call failed'));
                }
            });
        });
    }

    parseSuggestions(response) {
        const lines = response.split('\n').filter(line => line.trim());
        return lines.slice(0, 5).map(line => line.replace(/^[-*•]\s*/, '').trim());
    }

    getFallbackSuggestions(context, currentWord) {
        // Fallback medical suggestions based on common patterns
        const fallbacks = {
            'chest': ['chest pain', 'chest tightness', 'chest discomfort', 'chest pressure'],
            'head': ['headache', 'head injury', 'head trauma', 'head pressure'],
            'abdominal': ['abdominal pain', 'abdominal distention', 'abdominal tenderness'],
            'fever': ['fever', 'febrile', 'pyrexia', 'hyperthermia'],
            'pain': ['pain', 'discomfort', 'tenderness', 'soreness'],
            'swelling': ['swelling', 'edema', 'inflammation', 'enlargement'],
            'nausea': ['nausea', 'vomiting', 'emesis', 'queasiness'],
            'dizziness': ['dizziness', 'vertigo', 'lightheadedness', 'unsteadiness'],
            'fatigue': ['fatigue', 'tiredness', 'exhaustion', 'lethargy'],
            'shortness': ['shortness of breath', 'dyspnea', 'breathlessness', 'SOB']
        };

        const lowerWord = currentWord.toLowerCase();
        for (const [key, suggestions] of Object.entries(fallbacks)) {
            if (lowerWord.includes(key)) {
                return suggestions;
            }
        }

        return [];
    }

    showSuggestions(suggestions, position) {
        this.suggestions = suggestions;
        this.currentSuggestionIndex = 0;
        this.isActive = true;

        this.autocompleteBox.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'chartgpt-suggestion';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                this.currentSuggestionIndex = index;
                this.acceptSuggestion();
            });
            this.autocompleteBox.appendChild(div);
        });

        // Position the autocomplete box
        if (position) {
            this.autocompleteBox.style.left = position.x + 'px';
            this.autocompleteBox.style.top = position.y + 'px';
            this.autocompleteBox.style.display = 'block';
        }

        this.updateSelection();
    }

    hideSuggestions() {
        this.isActive = false;
        this.autocompleteBox.style.display = 'none';
    }

    navigateSuggestions(direction) {
        this.currentSuggestionIndex += direction;
        
        if (this.currentSuggestionIndex < 0) {
            this.currentSuggestionIndex = this.suggestions.length - 1;
        } else if (this.currentSuggestionIndex >= this.suggestions.length) {
            this.currentSuggestionIndex = 0;
        }
        
        this.updateSelection();
    }

    updateSelection() {
        const suggestions = this.autocompleteBox.querySelectorAll('.chartgpt-suggestion');
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('selected', index === this.currentSuggestionIndex);
        });
    }

    acceptSuggestion() {
        if (!this.isActive || this.suggestions.length === 0) return;

        const selectedSuggestion = this.suggestions[this.currentSuggestionIndex];
        this.insertSuggestion(selectedSuggestion);
        this.hideSuggestions();
    }

    insertSuggestion(suggestion) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const currentWord = this.getCurrentWord(range);
        
        // Replace current word with suggestion
        const start = range.startOffset - currentWord.length;
        const end = range.startOffset;
        
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const text = range.startContainer.textContent;
            const newText = text.substring(0, start) + suggestion + text.substring(end);
            range.startContainer.textContent = newText;
            
            // Set cursor after the inserted text
            const newRange = document.createRange();
            newRange.setStart(range.startContainer, start + suggestion.length);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
}

// Initialize autocomplete when Chartu is ready
if (window.chartu) {
    window.medicalAutocomplete = new MedicalAutocomplete();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.medicalAutocomplete = new MedicalAutocomplete();
    });
} 
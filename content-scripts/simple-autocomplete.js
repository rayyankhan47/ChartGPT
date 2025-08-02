// Simple Medical Autocomplete System
class SimpleMedicalAutocomplete {
    constructor() {
        this.isActive = false;
        this.suggestions = [];
        this.currentIndex = 0;
        this.autocompleteBox = null;
        this.medicalTerms = this.getMedicalTerms();
        
        this.init();
    }

    init() {
        this.createAutocompleteBox();
        this.setupEventListeners();
        console.log('Simple medical autocomplete initialized');
    }

    createAutocompleteBox() {
        this.autocompleteBox = document.createElement('div');
        this.autocompleteBox.className = 'chartgpt-autocomplete';
        this.autocompleteBox.style.display = 'none';
        this.autocompleteBox.id = 'simple-autocomplete-box';
        document.body.appendChild(this.autocompleteBox);
    }

    setupEventListeners() {
        // Listen for typing in Google Docs
        document.addEventListener('keydown', (e) => {
            // Handle autocomplete navigation when active
            if (this.isActive) {
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.navigate(1);
                        return;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.navigate(-1);
                        return;
                    case 'Tab':
                    case 'Enter':
                        e.preventDefault();
                        this.acceptSuggestion();
                        return;
                    case 'Escape':
                        this.hideSuggestions();
                        return;
                }
            }

            // Check for typing (letters only)
            if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                setTimeout(() => {
                    this.checkForSuggestions();
                }, 50);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.autocompleteBox.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    checkForSuggestions() {
        const currentWord = this.getCurrentWord();
        console.log('Checking suggestions for:', currentWord);

        if (currentWord.length < 2) {
            this.hideSuggestions();
            return;
        }

        const suggestions = this.findSuggestions(currentWord);
        
        if (suggestions.length > 0) {
            this.showSuggestions(suggestions);
        } else {
            this.hideSuggestions();
        }
    }

    getCurrentWord() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return '';

        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        if (container.nodeType === Node.TEXT_NODE) {
            const text = container.textContent || '';
            const offset = range.startOffset;
            
            // Find the current word
            let start = offset;
            while (start > 0 && /\w/.test(text[start - 1])) start--;
            
            let end = offset;
            while (end < text.length && /\w/.test(text[end])) end++;
            
            return text.substring(start, end);
        }
        
        return '';
    }

    findSuggestions(word) {
        const lowerWord = word.toLowerCase();
        const suggestions = [];
        
        for (const term of this.medicalTerms) {
            if (term.toLowerCase().startsWith(lowerWord)) {
                suggestions.push(term);
                if (suggestions.length >= 5) break;
            }
        }
        
        return suggestions;
    }

    showSuggestions(suggestions) {
        this.suggestions = suggestions;
        this.currentIndex = 0;
        this.isActive = true;

        this.autocompleteBox.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'chartgpt-suggestion';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                this.currentIndex = index;
                this.acceptSuggestion();
            });
            this.autocompleteBox.appendChild(div);
        });

        // Position near cursor
        const position = this.getCursorPosition();
        if (position) {
            this.autocompleteBox.style.left = position.x + 'px';
            this.autocompleteBox.style.top = position.y + 'px';
        } else {
            // Fallback position
            this.autocompleteBox.style.left = '100px';
            this.autocompleteBox.style.top = '100px';
        }

        this.autocompleteBox.style.display = 'block';
        this.updateSelection();
    }

    hideSuggestions() {
        this.isActive = false;
        this.autocompleteBox.style.display = 'none';
    }

    navigate(direction) {
        this.currentIndex += direction;
        
        if (this.currentIndex < 0) {
            this.currentIndex = this.suggestions.length - 1;
        } else if (this.currentIndex >= this.suggestions.length) {
            this.currentIndex = 0;
        }
        
        this.updateSelection();
    }

    updateSelection() {
        const suggestions = this.autocompleteBox.querySelectorAll('.chartgpt-suggestion');
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('selected', index === this.currentIndex);
        });
    }

    acceptSuggestion() {
        if (!this.isActive || this.suggestions.length === 0) return;

        const selectedSuggestion = this.suggestions[this.currentIndex];
        this.insertSuggestion(selectedSuggestion);
        this.hideSuggestions();
    }

    insertSuggestion(suggestion) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const currentWord = this.getCurrentWord();
        
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
            const text = range.startContainer.textContent;
            const start = range.startOffset - currentWord.length;
            const end = range.startOffset;
            
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

    getCursorPosition() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        return {
            x: rect.left,
            y: rect.bottom + window.scrollY + 5
        };
    }

    getMedicalTerms() {
        return [
            // Symptoms
            'chest pain', 'headache', 'abdominal pain', 'fever', 'nausea', 'vomiting',
            'dizziness', 'fatigue', 'shortness of breath', 'cough', 'sore throat',
            'back pain', 'joint pain', 'swelling', 'rash', 'itching', 'bleeding',
            'bruising', 'tenderness', 'stiffness', 'weakness', 'numbness',
            
            // Body parts
            'chest', 'head', 'abdomen', 'arm', 'leg', 'hand', 'foot', 'neck',
            'shoulder', 'knee', 'hip', 'back', 'throat', 'eye', 'ear', 'nose',
            'mouth', 'stomach', 'heart', 'lung', 'liver', 'kidney',
            
            // Medical conditions
            'hypertension', 'diabetes', 'asthma', 'pneumonia', 'infection',
            'inflammation', 'fracture', 'sprain', 'strain', 'arthritis',
            'allergy', 'anemia', 'depression', 'anxiety', 'obesity',
            
            // Medications
            'aspirin', 'ibuprofen', 'acetaminophen', 'antibiotics', 'insulin',
            'metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'omeprazole',
            
            // Procedures
            'examination', 'assessment', 'evaluation', 'diagnosis', 'treatment',
            'surgery', 'biopsy', 'x-ray', 'ultrasound', 'blood test',
            'urinalysis', 'physical therapy', 'counseling', 'monitoring',
            
            // Medical terms
            'acute', 'chronic', 'severe', 'mild', 'moderate', 'bilateral',
            'unilateral', 'proximal', 'distal', 'anterior', 'posterior',
            'lateral', 'medial', 'superior', 'inferior', 'superficial', 'deep',
            
            // Common phrases
            'patient presents with', 'physical examination reveals', 'assessment',
            'plan', 'follow up', 'referral', 'consultation', 'discharge',
            'admission', 'emergency', 'urgent', 'routine', 'scheduled'
        ];
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.simpleAutocomplete = new SimpleMedicalAutocomplete();
    });
} else {
    window.simpleAutocomplete = new SimpleMedicalAutocomplete();
} 
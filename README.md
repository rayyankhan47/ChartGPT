# ChartGPT - AI Medical Documentation Assistant

An intelligent Chrome extension that revolutionizes clinical workflow by combining multi-modal AI inputs for medical documentation.

## 🚀 Features

- **Smart Autocomplete**: AI-powered medical note completion with clinical reasoning
- **Voice Transcription**: Real-time transcription of doctor-patient conversations
- **Image Analysis**: Medical image processing and diagnostic suggestions
- **Clinical Reasoning**: Intelligent differential diagnosis and treatment planning
- **Seamless Integration**: Works with Google Docs and other web-based EHR systems

## 🏆 Built for TerraHacks 2024

ChartGPT is designed to compete for:
- **Overall Solution** (Nintendo Switch x4)
- **Best Use of Emerging Tech** (Lenovo Legion 27" Gaming Monitor x4)
- **Best Healthcare Solution** (TheKapCo Keyboard Sets x4)
- **Best Pitch** (Apple Airpods 4th Generation x4)
- **Best Use of Gemini API** (Google Swag)

## 🛠️ Technical Stack

- **Chrome Extension**: Manifest V3
- **AI Integration**: Google Gemini 1.5 Flash API
- **Speech Recognition**: Web Speech API
- **Image Processing**: Browser-based analysis + mock responses
- **Design System**: Apple-inspired UI with San Francisco fonts

## 📦 Installation

### For Development (Hackathon)

1. Clone the repository:
```bash
git clone git@github.com:rayyankhan47/ChartGPT.git
cd ChartGPT
```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the ChartGPT folder

3. Open Google Docs and start using ChartGPT!

## 🎯 Use Cases

### Dermatology Appointment
- Doctor examines a suspicious mole while speaking
- Extension transcribes audio and analyzes uploaded photo
- Suggests ABCDE criteria documentation
- Auto-completes assessment with biopsy recommendations

### Emergency Room Scenario
- Physician uploads EKG image while dictating symptoms
- Extension processes EKG for ST-elevation patterns
- Suggests STEMI protocol and appropriate billing codes
- Creates complete consultation note from multimodal inputs

### Pediatric Visit
- Doctor photographs child's rash while explaining to parents
- Extension analyzes rash pattern and suggests diagnosis
- Transcribes conversation including parent concerns
- Generates both medical documentation and patient-friendly summary

## 🔧 Development

### Project Structure
```
ChartGPT/
├── manifest.json              # Extension configuration
├── popup/                     # Extension popup interface
├── content-scripts/           # Google Docs integration
├── background/                # Service worker
├── assets/                    # Icons and resources
└── README.md
```

### Key Components

1. **Popup Interface**: Apple-inspired design with feature overview
2. **Floating Action Button**: Seamless integration with Google Docs
3. **Sidebar Chat**: AI-powered medical consultation interface
4. **Voice Recognition**: Real-time speech-to-text processing
5. **Autocomplete System**: Context-aware medical note suggestions

### API Integration

ChartGPT uses the Google Gemini 1.5 Flash API for:
- Medical text completion
- Clinical reasoning suggestions
- Diagnostic assistance
- Treatment plan recommendations

## 🎨 Design Philosophy

- **Apple-inspired UI**: Clean, minimal design with San Francisco fonts
- **Medical-grade UX**: Intuitive interface for healthcare professionals
- **HIPAA-compliant**: Secure data handling with local processing options
- **Universal Compatibility**: Works across different EHR platforms

## 🚀 Roadmap

- [x] Basic extension structure
- [x] Google Docs integration
- [x] Gemini API integration
- [x] Voice transcription
- [ ] Image analysis (mock responses)
- [ ] Advanced autocomplete
- [ ] Specialty-specific models
- [ ] HIPAA compliance features

## 🤝 Contributing

This project is built for TerraHacks 2024. For hackathon purposes, focus on:
1. Core functionality demonstration
2. User experience polish
3. Medical accuracy and relevance
4. Innovation in healthcare technology

## 📄 License

Built for TerraHacks 2024 - Medical Innovation Challenge

---

**ChartGPT**: Transforming medical documentation with AI-powered intelligence. 
console.log('Shruti News Extractor Loaded');

function splitIntoSmallerChunks(sentence, maxWords = 6) {
    const words = sentence.trim().split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
        const chunk = words.slice(i, i + maxWords).join(' ');
        if (chunk) {
            chunks.push(chunk + (i + maxWords >= words.length ? '। ' : ''));
        }
    }
    
    return chunks;
}

// Add number conversion map and helper function
const nepaliNumberWords = {
  "०": "शून्य",
  "१": "एक",
  "२": "दुई",
  "३": "तीन",
  "४": "चार",
  "५": "पाँच",
  "६": "छ",
  "७": "सात",
  "८": "आठ",
  "९": "नौ",
  "१०": "दस",
  "११": "एघार",
  "१२": "बाह्र",
  "१३": "तेह्र",
  "१४": "चौध",
  "१५": "पन्ध्र",
  "१६": "सोह्र",
  "१७": "सत्र",
  "१८": "अठार",
  "१९": "उन्नाइस",
  "२०": "बीस",
  "२१": "एकाइस",
  "२२": "बाइस",
  "२३": "तेइस",
  "२४": "चौबीस",
  "२५": "पच्चिस",
  "२६": "छब्बिस",
  "२७": "सत्ताइस",
  "२८": "अठ्ठाइस",
  "२९": "उनन्तीस",
  "३०": "तीस",
  "३१": "एकतीस",
  "३२": "बत्तीस",
  "३३": "तेत्तीस",
  "३४": "चौँतीस",
  "३५": "पैंतीस",
  "३६": "छत्तीस",
  "३७": "सर्तीस",
  "३८": "अठतीस",
  "३९": "उनन्चालीस",
  "४०": "चालीस",
  "४१": "एकचालीस",
  "४२": "बयालीस",
  "४३": "त्रियालीस",
  "४४": "चवालीस",
  "४५": "पैंतालीस",
  "४६": "छयालीस",
  "४७": "सतचालीस",
  "४८": "अठचालीस",
  "४९": "उनन्चास",
  "५०": "पचास",
  "५१": "एकाउन्न",
  "५२": "बाउन्न",
  "५३": "त्रिपन्न",
  "५४": "चौवन्न",
  "५५": "पचपन्न",
  "५६": "छपन्न",
  "५७": "सन्ताउन्न",
  "५८": "अन्ठाउन्न",
  "५९": "उनान्साठी",
  "६०": "साठी",
  "६१": "एकसठ्ठी",
  "६२": "बयसठ्ठी",
  "६३": "त्रिसठ्ठी",
  "६४": "चौसठ्ठी",
  "६५": "पैंसठ्ठी",
  "६६": "छयसठ्ठी",
  "६७": "सतसठ्ठी",
  "६८": "अठसठ्ठी",
  "६९": "उनन्सत्तरी",
  "७०": "सत्तरी",
  "७१": "एकहत्तर",
  "७२": "बहत्तर",
  "७३": "त्रिहत्तर",
  "७४": "चौहत्तर",
  "७५": "पचहत्तर",
  "७६": "छयहत्तर",
  "७७": "सतहत्तर",
  "७८": "अठहत्तर",
  "७९": "उनासी",
  "८०": "असी",
  "८१": "एकासी",
  "८२": "बयासी",
  "८३": "त्रियासी",
  "८४": "चौरासी",
  "८५": "पचासी",
  "८६": "छयासी",
  "८७": "सतासी",
  "८८": "अठासी",
  "८९": "उनान्नब्बे",
  "९०": "नब्बे",
  "९१": "एकान्नब्बे",
  "९२": "बयान्नब्बे",
  "९३": "त्रियान्नब्बे",
  "९४": "चौरान्नब्बे",
  "९५": "पन्चान्नब्बे",
  "९६": "छयान्नब्बे",
  "९७": "सन्तान्नब्बे",
  "९८": "अन्ठान्नब्बे",
  "९९": "उनान्सय",
  "१००": "सय"
};

function convertNumbersToWords(text) {
    // First, find numbers with २,००० format (thousands)
    text = text.replace(/([०-९]+),([०-९]+)/g, '$1$2');
    
    // Sort numbers by length (longest first) to handle multi-digit numbers correctly
    const numbers = Object.keys(nepaliNumberWords).sort((a, b) => b.length - a.length);
    
    // Replace each number with its word equivalent
    for (const num of numbers) {
        const regex = new RegExp(num, 'g');
        text = text.replace(regex, nepaliNumberWords[num]);
    }
    
    return text;
}

function extractNewsContent() {
    // Get news slug from URL
    const urlParts = window.location.pathname.split('/');
    const newsSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    
    const selectors = {
        title: '.entry-title',
        content: '.ok18-single-post-content-wrap'
    };

    const titleElement = document.querySelector(selectors.title);
    const contentElement = document.querySelector(selectors.content);

    if (!titleElement || !contentElement) {
        console.log('Not a news article page');
        return null;
    }

    // Get all text content
    let rawText = '';
    if (titleElement) {
        rawText += titleElement.textContent.trim() + '। ';
    }

    if (contentElement) {
        const paragraphs = contentElement.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (!p.querySelector('script, iframe, .advertisement')) {
                const text = p.textContent.trim();
                if (text) {
                    rawText += text + '। ';
                }
            }
        });
    }

    // Clean and split text into sentences
    const cleanText = rawText
        .replace(/\s+/g, ' ')
        .replace(/।\s+।/g, '।')
        .trim();

    function splitLongSentences(sentence) {
        const words = sentence.split(/\s+/);
        const chunks = [];
        
        for (let i = 0; i < words.length; i += 4) {
            chunks.push(words.slice(i, Math.min(i + 4, words.length)).join(' '));
        }
        
        return chunks;
    }

    // Split into sentences, filter empty ones, and handle long sentences
    const newsArray = cleanText
        .split(/([।!?])\s*/)
        .filter(text => text.trim())
        .map(text => text.trim())
        .filter(text => text !== '।' && text !== '!' && text !== '?')
        .reduce((acc, sentence) => {
            const words = sentence.split(/\s+/);
            return words.length > 4 ? 
                [...acc, ...splitLongSentences(sentence)] : 
                [...acc, sentence];
        }, [])
        .map(sentence => convertNumbersToWords(sentence)); // Convert numbers to words

    if (newsArray.length > 0) {
        // Store both news array and slug
        chrome.storage.local.set({
            'extractedText': cleanText,
            'newsSlug': newsSlug,
            'newsArray': newsArray
        }, () => {
            console.log('News array stored:', { news: newsArray, slug:newsSlug });
        });

        // Create or update floating button
        createFloatingButton();
    }

    return { newsArray, newsSlug };
}

async function processNewsContent(newsArray, newsSlug) {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'processNews',
            newsArray,
            newsSlug
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to process news');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error processing news:', error);
        throw error;
    }
}

function createFloatingButton() {
    const existingButton = document.getElementById('shrutiReadButton');
    if (existingButton) {
        existingButton.remove();
    }

    const button = document.createElement('button');
    button.id = 'shrutiReadButton';
    
    // Create loader element
    const loader = document.createElement('span');
    loader.className = 'button-loader';
    loader.style.cssText = `
        display: none;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top: 2px solid transparent;
        margin-right: 8px;
        animation: spin 1s linear infinite;
    `;

    // Add animation keyframes to document
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    button.innerHTML = '🎧 YRSM Narrartion Engine';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    button.prepend(loader);
    let isProcessing = false;

    button.addEventListener('click', async () => {
        if (isProcessing) return;
        
        try {
            isProcessing = true;
            button.style.opacity = '0.8';
            loader.style.display = 'inline-block';
            button.innerHTML = 'Processing...';
            button.prepend(loader);

            const { newsArray, newsSlug } = await chrome.storage.local.get(['newsArray', 'newsSlug']);
            const urls = await processNewsContent(newsArray, newsSlug);
            
            await chrome.storage.local.set({ 'audioUrls': urls });
            
            // Create inline player instead of popup
            createInlinePlayer();
            
            // Update button
            loader.style.display = 'none';
            button.style.backgroundColor = '#28a745';
            button.style.opacity = '1';
            button.innerHTML = '✓ Playing';
            
            // Remove button after a delay
            setTimeout(() => button.remove(), 2000);
        } catch (error) {
            console.error('Error:', error);
            loader.style.display = 'none';
            button.style.backgroundColor = '#dc3545';
            button.innerHTML = '❌ Error';
            setTimeout(() => {
                button.style.backgroundColor = '#007bff';
                button.innerHTML = '🎧 Read with Shruti';
            }, 3000);
        } finally {
            isProcessing = false;
        }
    });

    document.body.appendChild(button);
    return button;
}

function createInlinePlayer() {
    const titleElement = document.querySelector('.entry-title');
    if (!titleElement) return;

    // Create player container
    const playerDiv = document.createElement('div');
    playerDiv.id = 'yrsm-inline-player';
    playerDiv.style.cssText = `
        background: #f5f5f5;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    // Add Font Awesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    fontAwesome.rel = 'stylesheet';
    document.head.appendChild(fontAwesome);

    playerDiv.innerHTML = `
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 15px; font-size: 14px; color: #666;">
                <span id="currentTrack">1</span> / <span id="totalTracks">0</span>
            </div>
            <div style="display: flex; justify-content: center; gap: 15px;">
                <button class="control-btn" id="prevBtn" disabled>
                    <i class="fas fa-backward"></i>
                </button>
                <button class="control-btn" id="playPauseBtn">
                    <i class="fas fa-play" id="playIcon"></i>
                </button>
                <button class="control-btn" id="nextBtn">
                    <i class="fas fa-forward"></i>
                </button>
            </div>
            <audio id="audioPlayer" style="display: none;"></audio>
        </div>
    `;

    // Add styles for controls
    const style = document.createElement('style');
    style.textContent = `
        .control-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: #007bff;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .control-btn:hover { background: #0056b3; }
        .control-btn:disabled { background: #ccc; cursor: not-allowed; }
        #playPauseBtn i { font-size: 20px; }
    `;
    document.head.appendChild(style);

    // Insert player before title
    titleElement.parentNode.insertBefore(playerDiv, titleElement);

    // Initialize audio controller
    const audioController = new AudioController();
    return playerDiv;
}

class AudioController {
    constructor() {
        this.currentAudio = document.getElementById('audioPlayer');
        this.nextAudio = new Audio();
        this.playIcon = document.getElementById('playIcon');
        this.currentTrackElement = document.getElementById('currentTrack');
        this.totalTracksElement = document.getElementById('totalTracks');
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.audioUrls = [];
        this.setupEventListeners();
        this.initializePlayer();
    }

    setupEventListeners() {
        // Main audio events
        this.currentAudio.addEventListener('ended', () => this.handleTrackEnd());
        this.currentAudio.addEventListener('canplay', () => this.preloadNext());
        
        // Controls
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prevBtn').addEventListener('click', () => this.playPrev());
        document.getElementById('nextBtn').addEventListener('click', () => this.playNext());
    }

    async initializePlayer() {
        const result = await chrome.storage.local.get(['audioUrls']);
        if (result.audioUrls && result.audioUrls.length) {
            await this.init(result.audioUrls);
        }
    }

    async init(urls) {
        this.audioUrls = urls;
        this.totalTracksElement.textContent = urls.length;
        if (urls.length > 0) {
            await this.loadTrack(0);
            this.updateControls();
        }
    }

    async loadTrack(index) {
        if (index >= 0 && index < this.audioUrls.length) {
            this.currentTrackIndex = index;
            this.currentAudio.src = this.audioUrls[index];
            this.currentTrackElement.textContent = index + 1;
            await this.currentAudio.load();
            if (this.isPlaying) {
                await this.currentAudio.play();
            }
            this.updateControls();
        }
    }

    preloadNext() {
        const nextIndex = this.currentTrackIndex + 1;
        if (nextIndex < this.audioUrls.length) {
            this.nextAudio.src = this.audioUrls[nextIndex];
            this.nextAudio.load();
        }
    }

    async togglePlayPause() {
        if (this.currentAudio.paused) {
            await this.currentAudio.play();
            this.playIcon.className = 'fas fa-pause';
            this.isPlaying = true;
        } else {
            this.currentAudio.pause();
            this.playIcon.className = 'fas fa-play';
            this.isPlaying = false;
        }
    }

    async handleTrackEnd() {
        if (this.currentTrackIndex < this.audioUrls.length - 1) {
            await this.playNext();
        } else {
            this.isPlaying = false;
            this.playIcon.className = 'fas fa-play';
        }
    }

    async playNext() {
        if (this.currentTrackIndex < this.audioUrls.length - 1) {
            await this.loadTrack(this.currentTrackIndex + 1);
        }
    }

    async playPrev() {
        if (this.currentTrackIndex > 0) {
            await this.loadTrack(this.currentTrackIndex - 1);
        }
    }

    updateControls() {
        document.getElementById('prevBtn').disabled = this.currentTrackIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentTrackIndex === this.audioUrls.length - 1;
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', extractNewsContent);

// Also run for dynamic content changes
const observer = new MutationObserver((mutations) => {
    // Check if the URL has changed (for SPA-like websites)
    if (!document.querySelector('#shrutiReadButton')) {
        extractNewsContent();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

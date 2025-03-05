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
        
        for (let i = 0; i < words.length; i += 6) {
            chunks.push(words.slice(i, Math.min(i + 6, words.length)).join(' '));
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
            return words.length > 6 ? 
                [...acc, ...splitLongSentences(sentence)] : 
                [...acc, sentence];
        }, []);

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
            
            // Update button to success state
            loader.style.display = 'none';
            button.style.backgroundColor = '#28a745';
            button.style.opacity = '1';
            button.innerHTML = '✓ Ready to Play';
            
            // Open audio player instead of popup
            chrome.runtime.sendMessage({ action: 'openAudioPlayer' });
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

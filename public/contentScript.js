console.log('Shruti News Extractor Loaded');

function extractNewsContent() {
    // Selectors for onlinekhabar.com
    const selectors = {
        title: '.entry-title',
        content: '.ok18-single-post-content-wrap'
    };

    const titleElement = document.querySelector(selectors.title);
    const contentElement = document.querySelector(selectors.content);

    console.log(titleElement);
    console.log(contentElement);

    if (!titleElement || !contentElement) {
        console.log('Not a news article page');
        return null;
    }

    let newsText = '';

    // Add title
    if (titleElement) {
        newsText += titleElement.textContent.trim() + '। ';
    }

    // Add content
    if (contentElement) {
        const paragraphs = contentElement.querySelectorAll('p');
        paragraphs.forEach(p => {
            // Skip advertisements and irrelevant content
            if (!p.querySelector('script, iframe, .advertisement')) {
                const text = p.textContent.trim();
                if (text) {
                    newsText += text + '। ';
                }
            }
        });
    }

    // Clean up the text
    newsText = newsText
        .replace(/\s+/g, ' ')
        .replace(/।\s+।/g, '।')
        .trim();

    if (newsText) {
        // Create a floating button
        createFloatingButton();
        // Store the extracted text
        chrome.storage.local.set({ 'extractedText': newsText });
    }
   console.log(newsText);
    return newsText;
}

function createFloatingButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('shrutiReadButton');
    if (existingButton) {
        existingButton.remove();
    }

    // Create new button
    const button = document.createElement('button');
    button.id = 'shrutiReadButton';
    button.innerHTML = '🎧 Read with Shruti';
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
    `;

    button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openPopup' });
    });

    document.body.appendChild(button);
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

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "narrateWithShruti",
        title: "Narrate with YRSM",
        contexts: ["selection"]
    });
});

console.log("Background script loaded");

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "narrateWithShruti") {
        const selectedText = info.selectionText;
        
        chrome.storage.local.set({ 'selectedText': selectedText }, () => {
            chrome.action.openPopup();
        });
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPopup') {
        chrome.action.openPopup();
    }
    if (request.action === 'processNews') {
        fetch(`http://127.0.0.1:8000/news/${request.newsSlug}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ news: request.newsArray })
        })
        .then(response => response.json())
        .then(data => sendResponse({ success: true, data: data.urls || data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true; // Will respond asynchronously
    }
});
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
});
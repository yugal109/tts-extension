chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "narrateWithShruti",
        title: "Narrate with Shruti",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "narrateWithShruti") {
        const selectedText = info.selectionText;
        
        chrome.storage.local.set({ 'selectedText': selectedText }, () => {
            chrome.action.openPopup();
        });
    }
});

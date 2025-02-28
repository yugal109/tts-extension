document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const convertBtn = document.getElementById('convertBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const playerContainer = document.getElementById('playerContainer');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const clipboardBtn = document.getElementById('clipboardBtn');

    axios.defaults.withCredentials = true;

    let audioQueue = [];
    let currentAudioIndex = 0;
    let isProcessing = false;

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseIcon.classList.replace('fa-play', 'fa-pause');
        } else {
            audioPlayer.pause();
            playPauseIcon.classList.replace('fa-pause', 'fa-play');
        }
    });

    audioPlayer.addEventListener('ended', () => {
        currentAudioIndex++;
        if (currentAudioIndex < audioQueue.length) {
            audioPlayer.src = audioQueue[currentAudioIndex];
            audioPlayer.play();
        } else {
            currentAudioIndex = 0;
            playPauseIcon.classList.replace('fa-pause', 'fa-play');
        }
    });

    function splitTextIntoChunks(text) {
        const chunks = text.split(/([।!?])/);
        return chunks.reduce((acc, chunk, i) => {
            if (i % 2 === 0) {
                if (chunk.trim()) {
                    acc.push(chunk.trim() + (chunks[i + 1] || ''));
                }
            }
            return acc;
        }, []);
    }

    async function processChunksSequentially(chunks) {
        const urls = [];
        for (let i = 0; i < chunks.length; i++) {
            try {
                const url = await processText(chunks[i]);
                urls.push(url);
                loadingIndicator.textContent = `Processing... ${Math.round(((i + 1)/chunks.length) * 100)}%`;
            } catch (error) {
                console.error(`Error processing chunk ${i}:`, error);
                throw error;
            }
        }
        return urls;
    }

    async function processText(text) {
        try {
            const response = await axios({
                method: 'post',
                url: 'http://localhost:8000/convert/',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: { "input_text": text },
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            if (response.status !== 200) {
                throw new Error(`Server returned status ${response.status}`);
            }

            console.log('API Response:', response.data);
            return response.data.file_url;
        } catch (error) {
            console.error('Error processing text:', error);
            throw error;
        }
    }

    convertBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text || isProcessing) return;

        isProcessing = true;
        loadingIndicator.style.display = 'block';
        playerContainer.style.display = 'none';
        convertBtn.disabled = true;

        try {
            const chunks = splitTextIntoChunks(text);
            const urls = await processChunksSequentially(chunks);
            audioQueue = urls;
            currentAudioIndex = 0;
            audioPlayer.src = audioQueue[0];
            loadingIndicator.style.display = 'none';
            playerContainer.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            loadingIndicator.style.display = 'none';
        } finally {
            isProcessing = false;
            convertBtn.disabled = false;
        }
    });

    clipboardBtn.addEventListener('click', async () => {
        if (isProcessing) return;
        
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            convertBtn.click();
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    });

    // Check for selected text when popup opens
    chrome.storage.local.get(['selectedText'], function(result) {
        if (result.selectedText) {
            textInput.value = result.selectedText;
            chrome.storage.local.remove('selectedText');
            // Automatically start conversion
            convertBtn.click();
        }
    });
});

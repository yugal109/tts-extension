document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const convertBtn = document.getElementById('convertBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const playerContainer = document.getElementById('playerContainer');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const timeDisplay = document.getElementById('timeDisplay');
    const resetBtn = document.getElementById('resetBtn');

    // Configure axios defaults
    axios.defaults.withCredentials = true;

    let audioQueue = [];
    let currentAudioIndex = 0;
    let isProcessing = false;

    function splitTextIntoChunks(text) {
        // Split by Nepali punctuation marks but keep the marks
        const chunks = text.split(/([।!?])/);
        // Combine punctuation with previous chunk and filter empty chunks
        return chunks.reduce((acc, chunk, i) => {
            if (i % 2 === 0) {
                // Text chunk
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

            console.log('API Response:', response.data); // Debug log
            return response.data.file_url;
        } catch (error) {
            console.error('Error processing text:', error);
            throw error;
        }
    }

    function resetAudioQueue() {
        audioQueue = [];
        currentAudioIndex = 0;
        resetPlayer();
        playerContainer.classList.remove('show');
    }

    function resetPlayer() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        progress.style.width = '0%';
        timeDisplay.textContent = '0:00';
        playPauseIcon.className = 'fas fa-play';
        playerContainer.classList.remove('show');
    }

    function playNextInQueue() {
        if (currentAudioIndex < audioQueue.length) {
            audioPlayer.src = audioQueue[currentAudioIndex];
            audioPlayer.play()
                .then(() => {
                    playPauseIcon.className = 'fas fa-pause';
                })
                .catch(e => {
                    console.error('Audio playback failed:', e);
                    alert('Failed to play audio');
                });
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progress.style.width = percent + '%';
        timeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('ended', () => {
        currentAudioIndex++;
        if (currentAudioIndex < audioQueue.length) {
            playNextInQueue();
        } else {
            playPauseIcon.className = 'fas fa-play';
            progress.style.width = '0%';
            currentAudioIndex = 0;
        }
    });

    convertBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text');
            return;
        }

        if (isProcessing) return;
        isProcessing = true;
        
        loadingIndicator.style.display = 'block';
        convertBtn.disabled = true;
        resetAudioQueue();

        try {
            const chunks = splitTextIntoChunks(text);
            audioQueue = await processChunksSequentially(chunks);
            
            loadingIndicator.style.display = 'none';
            playerContainer.classList.add('show');
            currentAudioIndex = 0;
            playNextInQueue();

            // Add the play/pause functionality
            playPauseBtn.addEventListener('click', () => {
                if (audioPlayer.paused) {
                    audioPlayer.play();
                    playPauseIcon.className = 'fas fa-pause';
                } else {
                    audioPlayer.pause();
                    playPauseIcon.className = 'fas fa-play';
                }
            });

        } catch (error) {
            console.error('Error:', error);
            let errorMessage = 'Failed to convert text to speech';
            if (error.response) {
                errorMessage += `: ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage += ': No response from server';
            } else {
                errorMessage += `: ${error.message}`;
            }
            alert(errorMessage);
        } finally {
            convertBtn.disabled = false;
            isProcessing = false;
        }
    });

    // Remove the original play/pause button event listener
    // It will be added back after first play

    // Add reset button event listener
    resetBtn.addEventListener('click', () => {
        resetAudioQueue();
    });
});

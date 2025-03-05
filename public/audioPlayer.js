let currentTrackIndex = 0;
let audioUrls = [];
let isPlaying = false;
let nextAudio = null;

class AudioController {
    constructor() {
        this.currentAudio = document.getElementById('audioPlayer');
        this.nextAudio = new Audio();
        this.playIcon = document.getElementById('playIcon');
        this.currentTrackElement = document.getElementById('currentTrack');
        this.totalTracksElement = document.getElementById('totalTracks');
        this.setupEventListeners();
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

    async init(urls) {
        audioUrls = urls;
        this.totalTracksElement.textContent = urls.length;
        if (urls.length > 0) {
            await this.loadTrack(0);
            this.updateControls();
        }
    }

    async loadTrack(index) {
        if (index >= 0 && index < audioUrls.length) {
            currentTrackIndex = index;
            this.currentAudio.src = audioUrls[index];
            this.currentTrackElement.textContent = index + 1;
            await this.currentAudio.load();
            if (isPlaying) {
                await this.currentAudio.play();
            }
            this.updateControls();
        }
    }

    preloadNext() {
        const nextIndex = currentTrackIndex + 1;
        if (nextIndex < audioUrls.length) {
            this.nextAudio.src = audioUrls[nextIndex];
            this.nextAudio.load();
        }
    }

    async togglePlayPause() {
        if (this.currentAudio.paused) {
            await this.currentAudio.play();
            this.playIcon.className = 'fas fa-pause';
            isPlaying = true;
        } else {
            this.currentAudio.pause();
            this.playIcon.className = 'fas fa-play';
            isPlaying = false;
        }
    }

    async handleTrackEnd() {
        if (currentTrackIndex < audioUrls.length - 1) {
            this.playNext();
        } else {
            isPlaying = false;
            this.playIcon.className = 'fas fa-play';
        }
    }

    async playNext() {
        if (currentTrackIndex < audioUrls.length - 1) {
            await this.loadTrack(currentTrackIndex + 1);
        }
    }

    async playPrev() {
        if (currentTrackIndex > 0) {
            await this.loadTrack(currentTrackIndex - 1);
        }
    }

    updateControls() {
        document.getElementById('prevBtn').disabled = currentTrackIndex === 0;
        document.getElementById('nextBtn').disabled = currentTrackIndex === audioUrls.length - 1;
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const player = new AudioController();
    const result = await chrome.storage.local.get(['audioUrls']);
    if (result.audioUrls && result.audioUrls.length) {
        await player.init(result.audioUrls);
    }
});

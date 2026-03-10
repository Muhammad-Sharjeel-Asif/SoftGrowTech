/**
 * Web Music Player - Main JavaScript
 * Implements playlist management, audio controls, and UI interactions
 */

// ========================================
// Song Data Structure
// ========================================
const songs = [
    {
        title: "SoundHelix Song 1",
        artist: "T. Schürger",
        src: "assets/songs/song1.mp3",
        duration: "6:12"
    },
    {
        title: "SoundHelix Song 2",
        artist: "T. Schürger",
        src: "assets/songs/song2.mp3",
        duration: "6:36"
    },
    {
        title: "SoundHelix Song 3",
        artist: "T. Schürger",
        src: "assets/songs/song3.mp3",
        duration: "5:42"
    }
];

// ========================================
// DOM Elements
// ========================================
const audio = document.getElementById("audioPlayer");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const playlist = document.getElementById("playlist");
const playPauseBtn = document.getElementById("playPause");
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

// ========================================
// State Variables
// ========================================
let currentSongIndex = 0;
let isPlaying = false;

// ========================================
// Initialize Player
// ========================================
function init() {
    renderPlaylist();
    loadSong(currentSongIndex);
    setupEventListeners();
}

// ========================================
// Playlist Rendering Logic
// ========================================
function renderPlaylist() {
    playlist.innerHTML = "";
    
    songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="song-info-playlist">
                <span class="song-title">${song.title}</span>
                <span class="song-artist">${song.artist}</span>
            </div>
            <span class="song-duration">${song.duration}</span>
        `;
        
        li.addEventListener("click", () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            playSong();
        });
        
        playlist.appendChild(li);
    });
    
    updatePlaylistActive();
}

// Update active state in playlist
function updatePlaylistActive() {
    const items = playlist.querySelectorAll("li");
    items.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// ========================================
// Core Audio Functions
// ========================================

/**
 * Load selected song
 * @param {number} index - Index of the song to load
 */
function loadSong(index) {
    currentSongIndex = index;
    const song = songs[index];
    
    audio.src = song.src;
    title.textContent = song.title;
    artist.textContent = song.artist;
    durationEl.textContent = song.duration;
    
    // Reset progress
    progress.value = 0;
    currentTimeEl.textContent = "0:00";
    
    // Update playlist active state
    updatePlaylistActive();
}

/**
 * Play the current song
 */
function playSong() {
    audio.play();
    isPlaying = true;
    updatePlayPauseButton();
    cover.classList.add("playing");
}

/**
 * Pause the current song
 */
function pauseSong() {
    audio.pause();
    isPlaying = false;
    updatePlayPauseButton();
    cover.classList.remove("playing");
}

/**
 * Toggle between play and pause
 */
function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

/**
 * Update play/pause button icon
 */
function updatePlayPauseButton() {
    if (isPlaying) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }
}

/**
 * Play next song
 */
function nextSong() {
    currentSongIndex++;
    
    if (currentSongIndex >= songs.length) {
        currentSongIndex = 0;
    }
    
    loadSong(currentSongIndex);
    playSong();
}

/**
 * Play previous song
 */
function prevSong() {
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    
    loadSong(currentSongIndex);
    playSong();
}

// ========================================
// Progress Bar Logic
// ========================================

/**
 * Update progress bar as song plays
 */
function updateProgress() {
    const { duration, currentTime } = audio;
    
    if (isNaN(duration)) return;
    
    const progressPercent = (currentTime / duration) * 100;
    progress.value = progressPercent;
    
    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
}

/**
 * Seek to position in song
 */
function setProgress() {
    const { duration } = audio;
    
    if (isNaN(duration)) return;
    
    audio.currentTime = (progress.value / 100) * duration;
}

/**
 * Format time in seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ========================================
// Volume Control
// ========================================

/**
 * Set volume level
 */
function setVolume() {
    audio.volume = volume.value;
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Play/Pause button
    playPauseBtn.addEventListener("click", togglePlayPause);
    
    // Next/Previous buttons
    nextBtn.addEventListener("click", nextSong);
    previousBtn.addEventListener("click", prevSong);
    
    // Progress bar
    progress.addEventListener("input", setProgress);
    
    // Volume control
    volume.addEventListener("input", setVolume);
    
    // Audio events
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", nextSong);
    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
    });
    
    // Keyboard support
    document.addEventListener("keydown", (e) => {
        switch(e.code) {
            case "Space":
                e.preventDefault();
                togglePlayPause();
                break;
            case "ArrowRight":
                nextSong();
                break;
            case "ArrowLeft":
                prevSong();
                break;
            case "ArrowUp":
                e.preventDefault();
                volume.value = Math.min(1, parseFloat(volume.value) + 0.1);
                setVolume();
                break;
            case "ArrowDown":
                e.preventDefault();
                volume.value = Math.max(0, parseFloat(volume.value) - 0.1);
                setVolume();
                break;
        }
    });
}

// ========================================
// Initialize on DOM Load
// ========================================
document.addEventListener("DOMContentLoaded", init);

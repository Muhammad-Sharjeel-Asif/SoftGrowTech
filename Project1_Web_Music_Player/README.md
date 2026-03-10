# Web Music Player

A modern, responsive web-based music player with a glassmorphism design and neon theme. Built with vanilla HTML, CSS, and JavaScript.

---

## Features

- **Glassmorphism UI** - Modern frosted glass effect with animated gradient background
- **Playlist Management** - Browse and select from multiple songs
- **Playback Controls** - Play, pause, next, and previous track functionality
- **Progress Bar** - Interactive seek bar with real-time time display
- **Volume Control** - Adjustable volume slider
- **Rotating Album Art** - Animated album cover that spins during playback
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Visual Feedback** - Active song highlighting and pulse animations

---

## Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required

### Installation

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd Project1_Web_Music_Player
   ```

2. Open `index.html` in your web browser:
   - Double-click the file, or
   - Use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js (npx)
     npx serve

     # Using PHP
     php -S localhost:8000
     ```

3. Navigate to `http://localhost:8000` in your browser

---

## Project Structure

```
Project1_Web_Music_Player/
├── index.html          # Main HTML structure
├── style.css           # Glassmorphism styles & animations
├── script.js           # Audio player logic & interactions
├── README.md           # Project documentation
└── assets/
    ├── images/
    │   └── cover.jpg   # Default album artwork
    └── songs/
        ├── song1.mp3   # Audio file 1
        ├── song2.mp3   # Audio file 2
        └── song3.mp3   # Audio file 3
```

---

## Usage

### Player Controls

| Control | Action |
|---------|--------|
| **Play/Pause** | Click center button or press `Space` |
| **Next Song** | Click right arrow or press `Right Arrow` |
| **Previous Song** | Click left arrow or press `Left Arrow` |
| **Increase Volume** | Press `Up Arrow` |
| **Decrease Volume** | Press `Down Arrow` |
| **Seek** | Click or drag on progress bar |
| **Select Song** | Click any song in the playlist |

### Adding Your Own Music

1. Place your MP3 files in the `assets/songs/` folder
2. Update the `songs` array in `script.js`:
   ```javascript
   const songs = [
       {
           title: "Your Song Title",
           artist: "Artist Name",
           src: "assets/songs/your-song.mp3",
           duration: "3:45"
       }
       // Add more songs...
   ];
   ```
3. Optionally replace `assets/images/cover.jpg` with your album artwork

---

## Design Highlights

### Visual Effects

- **Animated Gradient Background** - Smoothly shifting colors (15s loop)
- **Glassmorphism Card** - Frosted glass effect with backdrop blur
- **Neon Accents** - Cyan (#00F5FF) glow effects throughout
- **Floating Animation** - Subtle vertical movement on the player
- **Rotating Album Art** - Vinyl-style rotation during playback

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Deep Sea | #0f2027 | Background gradient |
| Ocean | #203a43 | Background gradient |
| Atlantic | #2c5364 | Background gradient |
| Neon Cyan | #00f5ff | Primary accent |
| Purple | #7c3aed | Secondary accent |

---

## Technical Details

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### CSS Features Used

- CSS Grid and Flexbox
- CSS Animations and Keyframes
- Backdrop Filter (glassmorphism)
- Custom Properties (CSS Variables)
- Media Queries (responsive design)
- Pseudo-elements

### JavaScript Features Used

- ES6+ Syntax (const, let, arrow functions)
- DOM Manipulation
- Event Listeners
- Audio API
- Template Literals
- JSDoc Comments

---

## Responsive Breakpoints

| Breakpoint | Max Width | Optimizations |
|------------|-----------|---------------|
| Desktop | > 768px | Full player with album art |
| Tablet | 768px | Slightly reduced sizes |
| Mobile | 480px | Compact layout |
| Small Mobile | 360px | Minimal spacing |
| Landscape | 500px height | Hidden album art |

---

## Customization

### Changing the Theme

Edit the gradient colors in `style.css`:

```css
.background {
    background: linear-gradient(135deg, #your-color-1, #your-color-2, #your-color-3);
}
```

### Adjusting the Accent Color

Find and replace `#00f5ff` throughout `style.css` with your preferred color.

### Modifying Animation Speed

```css
/* Background gradient speed */
@keyframes gradientShift {
    /* Adjust duration in animation property */
}

/* Album rotation speed */
#cover {
    animation: rotate 20s linear infinite paused; /* Change 20s */
}
```

---

## Contributing

Contributions are welcome. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## Acknowledgments

- **Audio Files**: SoundHelix songs by T. Schurger (Creative Commons)
- **Design Inspiration**: Glassmorphism UI trend
- **Icons**: Custom SVG icons

---

*Built with vanilla web technologies*

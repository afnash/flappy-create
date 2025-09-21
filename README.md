# 🐦 Customizable Flappy Bird Clone

A modern, fully customizable Flappy Bird clone built with **Phaser.js 3** and vanilla JavaScript. Play the classic game while personalizing your bird sprite and sound effects in real-time!

## ✨ Features

### 🎮 Core Game Mechanics
- **Classic Flappy Bird gameplay** with smooth physics
- **Gravity system** - bird falls naturally
- **Pipe spawning** with randomized gaps
- **Collision detection** with pipes and boundaries
- **Score tracking** with persistent best score storage
- **Responsive controls** - click or press SPACE to flap

### 🎨 Real-Time Customization
- **Custom Bird Sprite**: Upload any image that gets automatically resized to 38x26 pixels
- **Custom Sound Effects**:
  - Wing flap sound
  - Score/passing pipe sound  
  - Hit/collision sound
- **Instant Updates**: Changes apply immediately without page reload
- **Default Assets**: Game starts with built-in sprites and works without uploads

### 🎯 User Experience
- **Modern UI** with beautiful gradient backgrounds
- **Responsive design** works on desktop and mobile
- **Visual feedback** for file uploads (success/error states)
- **Score persistence** using localStorage
- **Restart functionality** to play again

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in a web browser, or
3. **Serve locally** for better performance:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 🎯 How to Play

1. **Start**: Click anywhere or press SPACE to begin
2. **Flap**: Click or press SPACE to make the bird flap upward
3. **Navigate**: Avoid hitting pipes or the ground
4. **Score**: Earn points by passing through pipe gaps
5. **Game Over**: Click/press SPACE to restart

## 🛠️ Customization Guide

### Bird Image Upload
- Click "Bird Image" file input
- Select any image file (PNG, JPG, GIF, etc.)
- Image automatically resizes to 38x26 pixels
- New sprite applies instantly

### Sound Effect Upload
- Use the three sound file inputs:
  - **Wing Flap Sound**: Plays when bird flaps
  - **Score Sound**: Plays when passing through pipes
  - **Hit Sound**: Plays on collision
- Supports common audio formats (MP3, WAV, OGG)
- Sounds replace immediately upon upload

## 📁 Project Structure

```
flappy-create/
├── index.html          # Main HTML file with game container and UI
├── style.css           # Modern CSS styling and responsive design
├── main.js             # Phaser.js game logic and customization system
└── README.md           # This documentation
```

## 🔧 Technical Implementation

### Core Technologies
- **Phaser.js 3.80.1** - Game engine and physics
- **HTML5 Canvas** - Rendering and image processing
- **Web Audio API** - Dynamic sound loading
- **FileReader API** - File upload handling
- **localStorage** - Score persistence

### Key Features Implementation

#### Image Resizing System
```javascript
// Automatic resize to 38x26 pixels using canvas
function resizeImage(file, targetWidth, targetHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            canvas.toBlob(resolve, 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
}
```

#### Dynamic Asset Loading
- Uses Blob URLs for client-side file processing
- Phaser texture replacement without scene restart
- Sound object management and cleanup

#### Responsive Game Design
- Flexible layout adapts to screen size
- Touch and keyboard input support
- Mobile-friendly controls

## 🎮 Game Mechanics Details

- **Bird Physics**: Gravity of 600, flap velocity of -300
- **Pipe Generation**: 150px gap, random height positioning
- **Collision System**: Accurate sprite-based detection
- **Scoring**: Trigger zones between pipe gaps
- **Game States**: Start screen, playing, game over

## 🌟 Extension Ideas

Want to enhance the game further? Here are some ideas:

- **Particle effects** for flapping and collisions
- **Background music** upload option
- **Multiple bird characters** with different physics
- **Power-ups** and special abilities
- **Multiplayer mode** with leaderboards
- **Animated backgrounds** and weather effects
- **Achievement system** and unlockables

## 🐛 Browser Compatibility

- **Modern browsers** with HTML5 Canvas support
- **Chrome, Firefox, Safari, Edge** (latest versions)
- **Mobile browsers** with touch support
- **Local file restrictions**: Use a web server for full functionality

## 📄 License

This project is open source and available under the MIT License. Feel free to modify, distribute, and use for learning purposes.

---

**Happy Flapping!** 🐦✨

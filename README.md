

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Rough Notation** - Hand-drawn annotations
- **Lucide React** - Beautiful icons
- **Google Fonts** - Caveat (handwriting), JetBrains Mono, Inter

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit `http://localhost:5173`

## 📦 Building for Production

Build the site:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🌐 Deploying to GitHub Pages

### Step 1: Update Configuration

1. Open `vite.config.js` and update the `base` to match your repository name:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
})
```

### Step 2: Create GitHub Repository

1. Create a new repository on GitHub (e.g., `personal-website`)
2. Initialize git in your project:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git push -u origin main
```

### Step 3: Deploy

Deploy to GitHub Pages:
```bash
npm run deploy
```

This will:
- Build your site
- Create/update the `gh-pages` branch
- Push the built files to GitHub Pages

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select the `gh-pages` branch
4. Click **Save**

Your site will be live at: `https://YOUR_USERNAME.github.io/your-repo-name/`

## 🎨 Customization

### Personal Information

Update the following files with your information:

1. **Hero Section** (`src/components/Hero.jsx`):
   - Replace the placeholder photo (line 32-34)
   - Update name, program, and university (lines 44-56)
   - Update advisor names and links (lines 60-66)
   - Update email and social links (lines 78-103)

2. **News Section** (`src/components/News.jsx`):
   - Add your recent news items (lines 6-31)
   - Update dates, titles, and descriptions

3. **Publications Section** (`src/components/Publications.jsx`):
   - Add your publications (lines 7-53)
   - Update paper links, DOIs, and slides
   - Update Google Scholar link (line 174)

### Colors and Styling

The site uses a custom color palette defined in `tailwind.config.js`:
- `paper`: Background color (#FFFEF9)
- `ink`: Primary text color (#2D3748)
- `sketch`: Secondary text color (#4A5568)

You can customize these and add more colors as needed.

### Fonts

The site uses three font families:
- **Caveat**: Handwriting style (for headings and decorative text)
- **JetBrains Mono**: Monospace (for code and technical content)
- **Inter**: Sans-serif (for body text)

Change fonts in `index.html` and `tailwind.config.js`.

## 📁 Project Structure

```
personal-website/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Hero.jsx
│   │   ├── Navigation.jsx
│   │   ├── Publications.jsx
│   │   └── Research.jsx
│   ├── App.jsx         # Main app component
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── index.html          # HTML template
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## 🐛 Troubleshooting

### Build fails
- Make sure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### GitHub Pages shows 404
- Check that `base` in `vite.config.js` matches your repo name
- Ensure GitHub Pages is enabled in repository settings
- Wait a few minutes for deployment to complete

### Styles not loading
- Check that Tailwind CSS is properly configured
- Verify `postcss.config.js` exists
- Rebuild the project: `npm run build`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and customize it for your own use!

## 📧 Contact

Yang Wu - yangwu@ethz.ch

---

Built with ❤️ using React, Vite, and Tailwind CSS

# Landen 2025 Graduation Project

An interactive art simulation celebrating Landen's graduation journey through a flowing display of memories, photos, and videos. Built with Phaser 3 and designed as a Progressive Web App.

## 🎓 About This Project

This is a personal art project that showcases memories from Landen's life in an immersive, game-like environment where images and videos drift across the screen like flowing memories. Features include:

- **Interactive Memory Stream** - Photos and videos continuously flow across the screen
- **Multiple Viewing Modes** - Main simulation, gallery view, and fishbowl mode  
- **Progressive Web App** - Can be installed on mobile and desktop devices
- **Fullscreen Experience** - Optimized for immersive viewing
- **Responsive Design** - Works on various screen sizes

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

### Build for GitHub Pages

```bash
npm run build:github
```

## 🎮 Controls & Features

- **F Key or ⛶ Button**: Toggle fullscreen mode
- **D Key**: Toggle debug mode (shows technical info)
- **Main Menu**: Access different viewing modes:
  - **Launch Project**: Main memory simulation
  - **Gallery**: Browse all photos and videos
  - **Fishbowl**: Alternative viewing experience

## 📱 Live Demo

Visit the live demo: [https://rgriola.github.io/Landen-2025-Graduation/](https://rgriola.github.io/Landen-2025-Graduation/)

## 🚀 Deploying to GitHub Pages

This project is set up to deploy easily to GitHub Pages:

1. **Build the project for GitHub Pages:**

   ```bash
   npm run build:github
   ```

2. **Commit and push the `docs` folder:**

   ```bash
   git add docs/
   git commit -m "Build for GitHub Pages"
   git push origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository settings on GitHub
   - Scroll down to "Pages" section
   - Set Source to "Deploy from a branch"
   - Select branch: `main` and folder: `/docs`
   - Click Save

The site will be available at: `https://yourusername.github.io/repository-name/`

### Automated Deployment (Optional)

The project includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the main branch. This means you only need to:

1. Make your changes
2. Commit and push to main
3. The site updates automatically!

If you prefer manual deployment, just use the steps above.

### Versions

This template has been updated for:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
- [Webpack 5.99.6](https://github.com/webpack/webpack)

![screenshot](screenshot.png)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the webpack documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Webpack will automatically recompile your code and then reload the browser.

## Project Structure

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `public/index.html`          | Main HTML page for the application                        |
| `public/assets/`             | Images, videos, audio files (100+ memories)               |
| `public/assets.json`         | Asset manifest with metadata and labels                   |
| `src/main.js`                | Application entry point                                    |
| `src/game/main.js`           | Phaser game configuration and startup                     |
| `src/game/scenes/`           | Game scenes (MainMenu, Game, AssetGallery, etc.)         |
| `src/game/gameObjects/`      | Custom game objects (ImageWithLabel, VideoWithLabel)     |
| `src/game/config/`           | Configuration files (fonts, etc.)                        |
| `docs/`                      | Built files for GitHub Pages deployment                  |
| `scripts/`                   | Build and asset generation scripts                       |

## Handling Assets

Webpack supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Babel

You can write modern ES6+ JavaScript and Babel will transpile it to a version of JavaScript that you want your project to support. The targeted browsers are set in the `.babelrc` file and the default currently targets all browsers with total usage over "0.25%" but excludes IE11 and Opera Mini.

```json
"browsers": [
  ">0.25%",
  "not ie 11",
  "not op_mini all"
]
```

### Webpack

If you want to customize your build, such as adding a new webpack loader or plugin (i.e. for loading CSS or fonts), you can modify the `webpack/config.js` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Webpack documentation](https://webpack.js.org/) for more information.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running. If you do decide to do this, please could you at least join our Discord and tell us which template you're using! Or send us a quick email. Either will be super-helpful, thank you.

## Join the Phaser Community

We love to see what developers like you create with Phaser! It really motivates us to keep improving. So please join our community and show-off your work 😄

- **Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)
- **Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)
- **Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)
- **Discord:** Join us on [Discord](https://discord.gg/phaser)
- **Code:** 2000+ [Examples](https://labs.phaser.io)
- **Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2025 Phaser Studio Inc.

All rights reserved.

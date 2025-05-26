const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle getting the list of position modules
ipcMain.handle('get-position-modules', () => {
    const modulePath = path.join(__dirname, 'module_rieng');
    const files = fs.readdirSync(modulePath);
    return files.filter(file => file.endsWith('.js'));
});

// Handle saving configuration
ipcMain.handle('save-config', (event, config) => {
    const botRegisterPath = path.join(__dirname, 'bot-register.js');
    let content = fs.readFileSync(botRegisterPath, 'utf8');

    // Update username
    content = content.replace(/username: ['"]Vanguard\d+['"]/, `username: '${config.username}'`);

    // Update position module
    content = content.replace(/vi_tri_Vanguard\d+/g, config.positionModule.replace('.js', ''));

    // Update coordinates
    const coordinateRegex = /await bot\.pathfinder\.goto\(new GoalBlock\(-?\d+, -?\d+, -?\d+\)\);/;
    const newCoordinates = `await bot.pathfinder.goto(new GoalBlock(${config.coordinates.x}, ${config.coordinates.y}, ${config.coordinates.z}));`;
    content = content.replace(coordinateRegex, newCoordinates);

    fs.writeFileSync(botRegisterPath, content);
    return true;
});

// Handle reading coordinates from position module
ipcMain.handle('get-coordinates', (event, positionModule) => {
    const modulePath = path.join(__dirname, 'module_rieng', positionModule);
    const content = fs.readFileSync(modulePath, 'utf8');

    // Extract coordinates using regex
    const coordinateRegex = /new GoalBlock\((-?\d+),\s*(-?\d+),\s*(-?\d+)\)/;
    const match = content.match(coordinateRegex);

    if (match) {
        return {
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
            z: parseInt(match[3], 10)
        };
    }

    return null; // Return null if no coordinates are found
});
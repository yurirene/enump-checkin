const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('node:path')
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./src/main/db/inscritos.db');
const fs = require("fs");
const { parse } = require("csv-parse");
const { fork } = require('child_process')
const ps = fork(`${__dirname}/server.js`)

function createWindow () {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    backgroundColor: '#eeeeee'
  })

  win.loadFile('./src/renderer/index.html')
  
  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(() => {

  ipcMain.handle('ping', () => {"pong, pong"});
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  
  ipcMain.handle('db-query', async (event, sqlQuery) => {
    return new Promise(res => {
        db.all(sqlQuery, (err, rows) => {
          res(rows);
        });
    });
  });

  ipcMain.on('importar-inscritos', (event, filePath) => {
    db.serialize(() => {
      db.run("DROP TABLE IF EXISTS inscritos;");
      db.run(`CREATE TABLE inscritos
        (
          id     INTEGER PRIMARY KEY AUTOINCREMENT,
          nome   TEXT,
          codigo TEXT,
          quarto TEXT,
          status INT,
          chave  INT
        )`);
    });
    var totalInsercoes = 0;
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ";", from_line: 2 }))
      .on("data", function (row) {
        db.serialize(() => {
          db.run(
            "INSERT INTO inscritos (nome, codigo, quarto, status, chave) VALUES (?, ?, ?, ?, ?);",
            [row[0], row[1], row[2], row[3], row[4]]
          );
        });
        totalInsercoes++;
      })
      .on("end", function () {
        dialog.showMessageBox({
          type: 'info',
          message: `Lista atualizada. ${totalInsercoes} inscritos cadastrados.` ,
          buttons: ['OK']
        });
      })
      .on("error", function (error) {
        dialog.showMessageBox({
          type: 'error',
          message: `Erro: ${error.message}`,
          buttons: ['OK']
        });
      });
  });

  ipcMain.handle('open-file-dialog-for-file', handleFileOpen);
  

});


async function handleFileOpen() {
  const {canceled, filePaths} = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Planilhas', extensions: ['csv'] }
    ]    
  });

  if (!canceled) {
    return filePaths[0];
  }
}

app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
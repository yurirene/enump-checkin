const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('node:path')
const sqlite3 = require('sqlite3');
const dbPath = path.resolve(__dirname, 'src/main/db/inscritos.db')
const db = new sqlite3.Database(dbPath);
const fs = require("fs");
const { parse } = require("csv-parse");
const { fork } = require('child_process')
const ps = fork(`${__dirname}/server.js`)
const dns = require('node:dns');
const os = require('node:os');

function createWindow () {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT,
          codigo TEXT,
          estado TEXT,
          oficina_1 TEXT,
          oficina_2 INT,
          camisa TEXT,
          quarto TEXT,
          status INT
        )`);
    });
    var totalInsercoes = 0;
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ";", from_line: 2 }))
      .on("data", function (row) {
        db.serialize(() => {
          db.run(
            "INSERT INTO inscritos (codigo, nome, estado, oficina_1, oficina_2, camisa, status, quarto) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
            [row[0], `${row[1]} ${row[2]}`, row[3], row[4], row[5], row[6], 0, row[8]]
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
  
ipcMain.handle('carregar-ip', async () => {
  return new Promise(res => {
    const options = { family: 4 };
    dns.lookup(os.hostname(), options, (err, addr) => {
      if (err) {
        console.log(err);
      } else {
        res(addr);
      }
    });
  });
});
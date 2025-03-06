const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('api', {
    ping: () => ipcRenderer.invoke('ping'),
    carregarIp: () => ipcRenderer.invoke('carregar-ip'),
    listarInscritos: () => ipcRenderer.invoke('db-query', "SELECT * FROM inscritos"),
    importarInscritos: (filePath) => ipcRenderer.send('importar-inscritos', filePath),
    totalizadores: () => ipcRenderer.invoke('db-query', "SELECT count(status) as total, status FROM inscritos GROUP BY status"),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog-for-file'),
    onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event) => callback())
});
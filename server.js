const express = require("express"); 
const appExpress = express();
const path = require('node:path');
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes } = require('sequelize');

// Defina o EJS como o mecanismo de visualização
appExpress.set('view engine','ejs'); 

// Defina o diretório onde seus arquivos HTML (visualizações) estão localizados
appExpress.set('views', path.join(__dirname, '/src/public')); 

// Opcionalmente, você pode definir um diretório de arquivos estáticos (CSS, JS, imagens, etc.)
appExpress.use(express. static (path.join (__dirname, 'src/public' ))); 
appExpress.use(bodyParser.urlencoded({ extended: false }));
appExpress.use(bodyParser.json());

appExpress.listen(5000, () => { 
    console.log("Servidor em execução na porta 5000"); 
});



appExpress.get("/", (req, res) => { 
    res.render('index');
});

appExpress.get('/consultar/:codigo', async (req, res) => {
    const {codigo} = req.params;
    const inscrito = await Inscritos.findOne({
        where: {
            codigo: codigo,
        }
    });
    if (!inscrito) {
        return res.json({
            codigoStatus: 500,
            msg: 'Não encontrado'
        });
    }
    res.json({
        codigoStatus: 200,
        data: inscrito
    });
});
appExpress.get('/check-in/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const inscrito = await Inscritos.findOne({
        where: {
            codigo: codigo,
        }
    });
    if (!inscrito) {
        return res.json({
            codigoStatus: 500,
            msg: 'Não encontrado'
        });
    }

    await inscrito.update(
        { status: 1 }
    );

    res.json({
        codigoStatus: 200,
        data: []
    });
});


// Create Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/main/db/inscritos.db'
  });
  
  // Define Inscrito model
  class Inscritos extends Model {}
  Inscritos.init({
    nome: DataTypes.INTEGER,
    codigo: DataTypes.STRING,
    quarto: DataTypes.STRING,
    status: DataTypes.INTEGER,
    chave: DataTypes.INTEGER
  },
  { 
    sequelize,
    modelName: 'inscritos',
    timestamps: false
}
);
  
  // Sync models with database
  sequelize.sync();
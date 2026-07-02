const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
  override: true,
});
 
const createApp = require('./app');
const { sequelize } = require('./models');
 
const PORT = process.env.PORT || 5001;
 
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexao com o MySQL estabelecida com sucesso.');
 
    // Cria as tabelas automaticamente caso nao existam (equivalente a db.create_all())
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');
 
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('Nao foi possivel iniciar a aplicacao:', err);
    process.exit(1);
  }
}
 
start();
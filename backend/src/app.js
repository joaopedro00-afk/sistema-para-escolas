const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const escolaRoutes = require('./routes/escolaRoutes');
const professorRoutes = require('./routes/professorRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/login', authRoutes);
  app.use('/api/users', usuarioRoutes);
  app.use('/api/schools', escolaRoutes);
  app.use('/api/teachers', professorRoutes);
  app.use('/api/students', alunoRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Recurso nao encontrado' });
  });

  app.use(errorHandler);

  return app;
}

module.exports = createApp;

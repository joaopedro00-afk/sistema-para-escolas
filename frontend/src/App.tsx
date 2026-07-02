import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import CadastroUsuario from './pages/CadastroUsuario'
import Escolas from './pages/Escolas'
import Professores from './pages/Professores'
import Alunos from './pages/Alunos'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroUsuario />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/escolas" element={<Escolas />} />
            <Route path="/professores" element={<Professores />} />
            <Route path="/alunos" element={<Alunos />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/escolas" replace />} />
      </Routes>
    </AuthProvider>
  )
}

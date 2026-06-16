import { LogIn } from 'lucide-react'
import { useState } from 'react'

import { loginUsuario } from '../services/api.js'


function extrairMensagemErro(error) {
  return error.response?.data?.detail || 'Nao foi possivel fazer login.'
}

function Login({ onLogin, onIrParaRegistro }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviarFormulario(event) {
    event.preventDefault()

    setErro('')
    setCarregando(true)

    try {
      const dados = await loginUsuario({
        email: email.trim(),
        senha,
      })

      localStorage.setItem('token', dados.access_token)
      onLogin()
    } catch (error) {
      setErro(extrairMensagemErro(error))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Mini-mercado</p>
        <h1>Entrar no sistema</h1>
        <p className="subtitle">
          Acesse sua conta para cadastrar, editar e remover produtos.
        </p>

        {erro && (
          <div className="alert error" role="status">
            {erro}
          </div>
        )}

        <form className="auth-form" onSubmit={enviarFormulario}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={carregando}>
            <LogIn size={18} />
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button className="link-button" type="button" onClick={onIrParaRegistro}>
          Ainda nao tenho conta
        </button>
      </section>
    </main>
  )
}

export default Login

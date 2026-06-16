import { UserPlus } from 'lucide-react'
import { useState } from 'react'

import { registrarUsuario } from '../services/api.js'


function extrairMensagemErro(error) {
  return error.response?.data?.detail || 'Nao foi possivel criar a conta.'
}

function Register({ onIrParaLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviarFormulario(event) {
    event.preventDefault()

    setErro('')
    setMensagem('')

    if (senha !== confirmacaoSenha) {
      setErro('As senhas nao conferem.')
      return
    }

    setCarregando(true)

    try {
      await registrarUsuario({
        email: email.trim(),
        senha,
      })

      setMensagem('Conta criada com sucesso. Agora faca login.')
      setEmail('')
      setSenha('')
      setConfirmacaoSenha('')
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
        <h1>Criar conta</h1>
        <p className="subtitle">
          Cadastre um usuario para acessar o controle de produtos.
        </p>

        {(erro || mensagem) && (
          <div className={erro ? 'alert error' : 'alert success'} role="status">
            {erro || mensagem}
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
              placeholder="Minimo de 6 caracteres"
              minLength="6"
              required
            />
          </label>

          <label>
            Confirmar senha
            <input
              type="password"
              value={confirmacaoSenha}
              onChange={(event) => setConfirmacaoSenha(event.target.value)}
              placeholder="Repita a senha"
              minLength="6"
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={carregando}>
            <UserPlus size={18} />
            {carregando ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <button className="link-button" type="button" onClick={onIrParaLogin}>
          Voltar para login
        </button>
      </section>
    </main>
  )
}

export default Register

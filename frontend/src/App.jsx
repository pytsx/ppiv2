import { LogOut, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import Login from './components/Login.jsx'
import ProdutoForm from './components/ProdutoForm.jsx'
import ProdutoList from './components/ProdutoList.jsx'
import Register from './components/Register.jsx'
import {
  atualizarProduto,
  buscarUsuarioAtual,
  criarProduto,
  listarProdutos,
  removerProduto,
} from './services/api.js'
import './App.css'


function extrairMensagemErro(error) {
  return error.response?.data?.detail || 'Nao foi possivel concluir a operacao.'
}

function App() {
  const [autenticado, setAutenticado] = useState(Boolean(localStorage.getItem('token')))
  const [telaAuth, setTelaAuth] = useState('login')
  const [usuario, setUsuario] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [resetFormulario, setResetFormulario] = useState(0)

  function sair() {
    localStorage.removeItem('token')
    setAutenticado(false)
    setUsuario(null)
    setProdutos([])
    setProdutoEditando(null)
    setTelaAuth('login')
  }

  useEffect(() => {
    function tratarLogoutAutomatico() {
      sair()
    }

    window.addEventListener('auth:logout', tratarLogoutAutomatico)

    return () => {
      window.removeEventListener('auth:logout', tratarLogoutAutomatico)
    }
  }, [])

  async function carregarUsuario() {
    try {
      const dadosUsuario = await buscarUsuarioAtual()
      setUsuario(dadosUsuario)
    } catch {
      sair()
    }
  }

  async function carregarProdutos() {
    setCarregando(true)
    setErro('')

    try {
      const dados = await listarProdutos()
      setProdutos(dados)
    } catch (error) {
      setErro('Nao foi possivel carregar os produtos. Verifique se o backend esta rodando.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (autenticado) {
      carregarUsuario()
      carregarProdutos()
    } else {
      setCarregando(false)
    }
  }, [autenticado])

  const totalEmEstoque = useMemo(
    () =>
      produtos.reduce(
        (total, produto) => total + Number(produto.quantidade_estoque),
        0,
      ),
    [produtos],
  )

  const valorTotal = useMemo(
    () =>
      produtos.reduce(
        (total, produto) =>
          total + Number(produto.preco_unitario) * Number(produto.quantidade_estoque),
        0,
      ),
    [produtos],
  )

  const formatadorMoeda = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
    [],
  )

  async function salvarProduto(dadosProduto) {
    setSalvando(true)
    setErro('')
    setMensagem('')

    try {
      if (produtoEditando) {
        await atualizarProduto(produtoEditando.id, dadosProduto)
        setMensagem('Produto atualizado com sucesso.')
      } else {
        await criarProduto(dadosProduto)
        setMensagem('Produto cadastrado com sucesso.')
      }

      setProdutoEditando(null)
      setResetFormulario((valorAtual) => valorAtual + 1)
      await carregarProdutos()
    } catch (error) {
      setErro(extrairMensagemErro(error))
    } finally {
      setSalvando(false)
    }
  }

  function iniciarEdicao(produto) {
    setProdutoEditando(produto)
    setErro('')
    setMensagem('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remover(produto) {
    const confirmou = window.confirm(`Remover o produto "${produto.nome}"?`)

    if (!confirmou) {
      return
    }

    setErro('')
    setMensagem('')

    try {
      await removerProduto(produto.id)

      if (produtoEditando?.id === produto.id) {
        setProdutoEditando(null)
      }

      setMensagem('Produto removido com sucesso.')
      await carregarProdutos()
    } catch (error) {
      setErro(extrairMensagemErro(error))
    }
  }

  function aposLogin() {
    setAutenticado(true)
    setTelaAuth('login')
  }

  if (!autenticado) {
    if (telaAuth === 'registro') {
      return <Register onIrParaLogin={() => setTelaAuth('login')} />
    }

    return (
      <Login
        onLogin={aposLogin}
        onIrParaRegistro={() => setTelaAuth('registro')}
      />
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Mini-mercado</p>
          <h1>Controle de Produtos</h1>
          <p className="subtitle">
            Cadastre, edite e acompanhe o estoque da loja.
            {usuario?.email ? ` Usuario conectado: ${usuario.email}` : ''}
          </p>
        </div>

        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={carregarProdutos}>
            <RefreshCw size={18} />
            Atualizar
          </button>

          <button className="danger-button" type="button" onClick={sair}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </header>

      <section className="stats-bar" aria-label="Resumo do estoque">
        <div>
          <span>Produtos</span>
          <strong>{produtos.length}</strong>
        </div>
        <div>
          <span>Unidades em estoque</span>
          <strong>{totalEmEstoque}</strong>
        </div>
        <div>
          <span>Valor estimado</span>
          <strong>{formatadorMoeda.format(valorTotal)}</strong>
        </div>
      </section>

      {(erro || mensagem) && (
        <div className={erro ? 'alert error' : 'alert success'} role="status">
          {erro || mensagem}
        </div>
      )}

      <div className="content-grid">
        <section className="panel">
          <ProdutoForm
            itemEditando={produtoEditando}
            resetKey={resetFormulario}
            onSubmit={salvarProduto}
            onCancel={() => setProdutoEditando(null)}
            salvando={salvando}
          />
        </section>

        <section className="panel list-panel">
          <div className="section-title">
            <h2>Produtos cadastrados</h2>
            <span>{produtos.length} itens</span>
          </div>

          <ProdutoList
            produtos={produtos}
            carregando={carregando}
            onEdit={iniciarEdicao}
            onRemove={remover}
          />
        </section>
      </div>
    </main>
  )
}

export default App

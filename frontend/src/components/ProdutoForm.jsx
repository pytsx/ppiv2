import { Plus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'


const formularioInicial = {
  codigo: '',
  nome: '',
  categoria: '',
  preco_unitario: '',
  quantidade_estoque: '',
}

const categorias = [
  'Bebidas',
  'Limpeza',
  'Hortifruti',
  'Mercearia',
  'Padaria',
  'Frios',
  'Outros',
]

function ProdutoForm({ itemEditando, resetKey, onSubmit, onCancel, salvando }) {
  const [formulario, setFormulario] = useState(formularioInicial)

  useEffect(() => {
    if (itemEditando) {
      setFormulario({
        codigo: itemEditando.codigo,
        nome: itemEditando.nome,
        categoria: itemEditando.categoria,
        preco_unitario: String(itemEditando.preco_unitario),
        quantidade_estoque: String(itemEditando.quantidade_estoque),
      })
      return
    }

    setFormulario(formularioInicial)
  }, [itemEditando, resetKey])

  function atualizarCampo(event) {
    const { name, value } = event.target
    setFormulario((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }))
  }

  function enviarFormulario(event) {
    event.preventDefault()

    onSubmit({
      codigo: formulario.codigo.trim(),
      nome: formulario.nome.trim(),
      categoria: formulario.categoria,
      preco_unitario: Number(formulario.preco_unitario),
      quantidade_estoque: Number(formulario.quantidade_estoque),
    })
  }

  const modoEdicao = Boolean(itemEditando)

  return (
    <form className="produto-form" onSubmit={enviarFormulario}>
      <div className="section-title">
        <h2>{modoEdicao ? 'Editar produto' : 'Novo produto'}</h2>
        <span>{modoEdicao ? `ID ${itemEditando.id}` : 'Cadastro'}</span>
      </div>

      <label>
        Codigo unico
        <input
          name="codigo"
          value={formulario.codigo}
          onChange={atualizarCampo}
          placeholder="Ex.: PRD-001"
          maxLength="30"
          required
        />
      </label>

      <label>
        Nome do produto
        <input
          name="nome"
          value={formulario.nome}
          onChange={atualizarCampo}
          placeholder="Ex.: Arroz tipo 1"
          maxLength="120"
          required
        />
      </label>

      <label>
        Categoria
        <select
          name="categoria"
          value={formulario.categoria}
          onChange={atualizarCampo}
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label>
          Preco unitario
          <input
            name="preco_unitario"
            type="number"
            min="0"
            step="0.01"
            value={formulario.preco_unitario}
            onChange={atualizarCampo}
            placeholder="0,00"
            required
          />
        </label>

        <label>
          Estoque
          <input
            name="quantidade_estoque"
            type="number"
            min="0"
            step="1"
            value={formulario.quantidade_estoque}
            onChange={atualizarCampo}
            placeholder="0"
            required
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={salvando}>
          {modoEdicao ? <Save size={18} /> : <Plus size={18} />}
          {salvando ? 'Salvando...' : modoEdicao ? 'Salvar edicao' : 'Cadastrar'}
        </button>

        {modoEdicao && (
          <button className="ghost-button" type="button" onClick={onCancel}>
            <X size={18} />
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default ProdutoForm

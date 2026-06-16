import { Pencil, Trash2 } from 'lucide-react'


const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function ProdutoList({ produtos, carregando, onEdit, onRemove }) {
  if (carregando) {
    return <p className="empty-state">Carregando produtos...</p>
  }

  if (produtos.length === 0) {
    return (
      <p className="empty-state">
        Nenhum produto cadastrado ainda. Use o formulario para adicionar o primeiro item.
      </p>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preco</th>
            <th>Estoque</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td className="code-cell">{produto.codigo}</td>
              <td>{produto.nome}</td>
              <td>{produto.categoria}</td>
              <td>{formatadorMoeda.format(produto.preco_unitario)}</td>
              <td>
                <span
                  className={
                    produto.quantidade_estoque <= 5 ? 'stock low-stock' : 'stock'
                  }
                >
                  {produto.quantidade_estoque}
                </span>
              </td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => onEdit(produto)}
                    title="Editar produto"
                    aria-label={`Editar ${produto.nome}`}
                  >
                    <Pencil size={17} />
                    Editar
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => onRemove(produto)}
                    title="Remover produto"
                    aria-label={`Remover ${produto.nome}`}
                  >
                    <Trash2 size={17} />
                    Remover
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProdutoList

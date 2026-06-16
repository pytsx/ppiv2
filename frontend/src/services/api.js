import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:logout'))
    }

    return Promise.reject(error)
  },
)

export async function registrarUsuario(usuario) {
  const response = await api.post('/auth/register', usuario)
  return response.data
}

export async function loginUsuario(credenciais) {
  const response = await api.post('/auth/login', credenciais)
  return response.data
}

export async function buscarUsuarioAtual() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function listarProdutos() {
  const response = await api.get('/produtos')
  return response.data
}

export async function criarProduto(produto) {
  const response = await api.post('/produtos', produto)
  return response.data
}

export async function atualizarProduto(id, produto) {
  const response = await api.put(`/produtos/${id}`, produto)
  return response.data
}

export async function removerProduto(id) {
  await api.delete(`/produtos/${id}`)
}

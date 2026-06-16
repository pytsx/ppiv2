Henrique Souza de Lima Pessoa [N279/N1]

# Controle de Produtos de Mini-mercado

## Tema escolhido

Tema 2 — Controle de Produtos de um Mini-mercado.

Sistema simples de cadastro de produtos vendidos em um pequeno comércio.

Campos sugeridos:

Nome do produto
Categoria (ex.: bebidas, limpeza, hortifruti)
Preço unitário
Quantidade em estoque

## Como rodar o back-end

No terminal:

```
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  // ou venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```


## Como rodar o front-end

Em outro terminal:

```
cd frontend
pnpm install
pnpm dev
```

Depois acesse:

```
http://localhost:5173
```

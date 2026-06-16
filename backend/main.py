import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
import schemas
from auth import criar_token_acesso, gerar_hash_senha, get_usuario_atual, verificar_senha
from database import Base, engine, get_db

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Controle de Produtos de Mini-mercado")

origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allow_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def buscar_produto_ou_404(produto_id: int, db: Session) -> models.Produto:
    produto = db.query(models.Produto).filter(models.Produto.id == produto_id).first()

    if produto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto nao encontrado.",
        )

    return produto


def codigo_ja_cadastrado(db: Session, codigo: str, produto_id: int | None = None) -> bool:
    query = db.query(models.Produto).filter(models.Produto.codigo == codigo)

    if produto_id is not None:
        query = query.filter(models.Produto.id != produto_id)

    return query.first() is not None


@app.get("/")
def healthcheck():
    return {"status": "ok", "app": "Controle de Produtos de Mini-mercado"}


@app.post(
    "/auth/register",
    response_model=schemas.UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    email_normalizado = usuario.email.lower().strip()

    usuario_existente = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == email_normalizado)
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ja existe um usuario cadastrado com este email.",
        )

    novo_usuario = models.Usuario(
        email=email_normalizado,
        senha_hash=gerar_hash_senha(usuario.senha),
    )

    db.add(novo_usuario)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ja existe um usuario cadastrado com este email.",
        )

    db.refresh(novo_usuario)
    return novo_usuario


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(usuario: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    email_normalizado = usuario.email.lower().strip()

    usuario_db = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == email_normalizado)
        .first()
    )

    if not usuario_db or not verificar_senha(usuario.senha, usuario_db.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha invalidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = criar_token_acesso({"sub": usuario_db.email})

    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.UsuarioResponse)
def obter_usuario_atual(
    usuario_atual: models.Usuario = Depends(get_usuario_atual),
):
    return usuario_atual


@app.get("/produtos", response_model=list[schemas.ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    return db.query(models.Produto).order_by(models.Produto.nome).all()


@app.post(
    "/produtos",
    response_model=schemas.ProdutoResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_produto(
    produto: schemas.ProdutoCreate,
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(get_usuario_atual),
):
    if codigo_ja_cadastrado(db, produto.codigo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ja existe um produto cadastrado com este codigo.",
        )

    novo_produto = models.Produto(**produto.model_dump())
    db.add(novo_produto)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ja existe um produto cadastrado com este codigo.",
        )

    db.refresh(novo_produto)
    return novo_produto


@app.put("/produtos/{produto_id}", response_model=schemas.ProdutoResponse)
def atualizar_produto(
    produto_id: int,
    produto: schemas.ProdutoUpdate,
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(get_usuario_atual),
):
    produto_db = buscar_produto_ou_404(produto_id, db)
    dados_atualizados = produto.model_dump(exclude_unset=True)

    novo_codigo = dados_atualizados.get("codigo")

    if novo_codigo and codigo_ja_cadastrado(db, novo_codigo, produto_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ja existe um produto cadastrado com este codigo.",
        )

    for campo, valor in dados_atualizados.items():
        setattr(produto_db, campo, valor)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ja existe um produto cadastrado com este codigo.",
        )

    db.refresh(produto_db)
    return produto_db


@app.delete("/produtos/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario_atual: models.Usuario = Depends(get_usuario_atual),
):
    produto_db = buscar_produto_ou_404(produto_id, db)

    db.delete(produto_db)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

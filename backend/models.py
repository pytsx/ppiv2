from sqlalchemy import Column, Float, Integer, String

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(30), unique=True, index=True, nullable=False)
    nome = Column(String(120), nullable=False)
    categoria = Column(String(80), nullable=False)
    preco_unitario = Column(Float, nullable=False)
    quantidade_estoque = Column(Integer, nullable=False)

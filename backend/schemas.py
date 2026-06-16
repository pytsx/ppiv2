from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCreate(BaseModel):
    email: EmailStr
    senha: str = Field(..., min_length=6)


class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str


class UsuarioResponse(BaseModel):
    id: int
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProdutoBase(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=30)
    nome: str = Field(..., min_length=1, max_length=120)
    categoria: str = Field(..., min_length=1, max_length=80)
    preco_unitario: float = Field(..., ge=0)
    quantidade_estoque: int = Field(..., ge=0)


class ProdutoCreate(ProdutoBase):
    pass


class ProdutoUpdate(BaseModel):
    codigo: Optional[str] = Field(default=None, min_length=1, max_length=30)
    nome: Optional[str] = Field(default=None, min_length=1, max_length=120)
    categoria: Optional[str] = Field(default=None, min_length=1, max_length=80)
    preco_unitario: Optional[float] = Field(default=None, ge=0)
    quantidade_estoque: Optional[int] = Field(default=None, ge=0)


class ProdutoResponse(ProdutoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

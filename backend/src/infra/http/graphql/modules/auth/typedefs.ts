export const authTypeDefs = `#graphql
  """
  Um usuário cadastrado no Financy.
  """
  type User {
    "Identificador único do usuário."
    id: ID!
    "Nome de exibição do usuário."
    name: String!
    "E-mail usado para login. Único por usuário."
    email: String!
    "Data de criação da conta, em formato ISO 8601."
    createdAt: String!
  }

  """
  Resposta retornada por operações de autenticação (cadastro, login, refresh).
  """
  type AuthPayload {
    "O usuário autenticado."
    user: User!
    "Token de acesso de curta duração (15 min), usado no header Authorization."
    accessToken: String!
    "Token de longa duração (7 dias), usado para obter um novo accessToken."
    refreshToken: String!
  }

  type Mutation {
    "Cria uma nova conta e já retorna os tokens de sessão (login automático)."
    signUp(name: String!, email: String!, password: String!): AuthPayload!

    "Autentica um usuário existente com e-mail e senha."
    signIn(email: String!, password: String!): AuthPayload!

    "Troca um refresh token válido por um novo par de tokens (rotação)."
    refreshToken(refreshToken: String!): AuthPayload!

    "Revoga um refresh token, encerrando aquela sessão."
    logout(refreshToken: String!): Boolean!
  }
`;

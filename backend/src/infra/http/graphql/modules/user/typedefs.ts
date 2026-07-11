export const userTypeDefs = `#graphql
  extend type Mutation {
    """
    Atualiza nome e/ou e-mail do usuário autenticado.
    Requer header Authorization com um accessToken válido.
    """
    updateUser(name: String, email: String): User!

    """
    Troca a senha do usuário autenticado. Exige a senha atual e revoga
    todos os refresh tokens existentes (força novo login em outras sessões).
    Requer header Authorization com um accessToken válido.
    """
    updatePassword(oldPassword: String!, newPassword: String!): Boolean!
  }
`;

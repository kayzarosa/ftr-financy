export const categoryTypeDefs = `#graphql
  """
  Uma categoria de transações, pertencente a um usuário.
  """
  type Category {
    "Identificador único da categoria."
    id: ID!
    "Nome da categoria. Único por usuário."
    name: String!
    "Cor de exibição da categoria, em hexadecimal."
    color: String
    "Data de criação, em formato ISO 8601."
    createdAt: String!
  }

  extend type Mutation {
    """
    Cria uma nova categoria
    Requer header Authorization com um accessToken válido.
    """
    createCategory(name: String!, color: String): Category!

    """
    Altera uma categoria existente vinculada ao usuário
    Requer header Authorization com um accessToken válido.
    """
    updateCategory(id: ID!, name: String, color: String): Category!

    """
    Remove uma categoria vinculada ao usuário.
    Transações que usavam essa categoria ficam sem categoria (não são apagadas).
    Requer header Authorization com um accessToken válido.
    """
    deleteCategory(id: ID!): Boolean!
  }

  extend type Query {
    """
    Lista todas as categorias do usuário autenticado.
    Requer header Authorization com um accessToken válido.
    """
    categories: [Category!]!
  }
`;

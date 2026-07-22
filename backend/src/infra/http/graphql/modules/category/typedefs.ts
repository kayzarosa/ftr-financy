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
    color: String!
    "Descrição livre da categoria."
    description: String
    "Nome do ícone (Lucide) escolhido pra representar a categoria."
    icon: String!
    "Data de criação, em formato ISO 8601."
    createdAt: String!
    "Quantidade de transações vinculadas a essa categoria. Só vem preenchido quando consultado via categoriesCountTransactions."
    transactionsCount: Int
  }

  """
  Gastos (despesas) de uma categoria em um mês específico.
  """
  type CategorySpending {
    "Identificador único da categoria."
    id: ID!
    "Nome da categoria."
    name: String!
    "Cor de exibição da categoria, em hexadecimal."
    color: String!
    "Nome do ícone (Lucide) da categoria."
    icon: String!
    "Total gasto na categoria no mês, em centavos (só despesas)."
    total: Int!
    "Quantidade de despesas na categoria no mês."
    count: Int!
  }

  extend type Mutation {
    """
    Cria uma nova categoria
    Requer header Authorization com um accessToken válido.
    """
    createCategory(name: String!, color: String!, description: String, icon: String!): Category!

    """
    Altera uma categoria existente vinculada ao usuário
    Requer header Authorization com um accessToken válido.
    """
    updateCategory(
      id: ID!
      name: String
      color: String
      description: String
      icon: String
    ): Category!

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

    """
    Lista todas as categorias do usuário autenticado, com a quantidade de transações de cada uma.
    Requer header Authorization com um accessToken válido.
    """
    categoriesCountTransactions: [Category!]!

    """
    Gastos por categoria no mês informado (só despesas), ordenado por total desc.
    Só retorna categorias com gasto no mês. Requer Authorization.
    """
    categorySpending(month: String!): [CategorySpending!]!
  }
`;

export const transactionTypeDefs = `#graphql
  enum TransactionType {
    INCOME
    EXPENSE
  }

  """
  Uma transação vinculada ao usuário
  """
  type Transaction {
    "Identificador único da transação."
    id: ID!
    "Nome/descrição da transação"
    name: String!
    "Valor da transação em centavos"
    value: Int!
    "Se é uma entrada (INCOME) ou saída (EXPENSE)."
    type: TransactionType!
    "Data em que a transação ocorreu, em formato ISO 8601"
    date: String!
    "Categoria da transação, se houver."
    category: Category
    "Data de criaçào do registro, em formato ISO 8601"
    createdAt: String!
  }

  extend type Mutation {
    """
    Cria uma nova transação para o usuário autenticado.
    Requer header Authorization com um accessToken válido.
    """
    createTransaction(
      name: String!
      value: Int!
      type: TransactionType!
      date: String
      categoryId: ID
    ): Transaction!

    """
    Altera uma transação existente vinculada ao usuário.
    Requer header Authorization com um accessToken válido.
    """
    updateTransaction(
      id: ID!
      name: String
      value: Int
      type: TransactionType
      date: String
      categoryId: ID
    ): Transaction!

    """
    Remove uma transação vinculada ao usuário.
    Requer header Authorization com um accessToken válido.
    """
    deleteTransaction(id: ID!): Boolean!
  }

  type TransactionsResult {
    items: [Transaction!]!
    total: Int!
  }

  extend type Query {
    """
    Lista todas as transações do usuário autenticado.
    Requer header Authorization com um accessToken válido.
    """
    transactions(
      page: Int
      limit: Int
      type: TransactionType
      categoryId: ID
      search: String
      month: String
    ): TransactionsResult!
  }
`;

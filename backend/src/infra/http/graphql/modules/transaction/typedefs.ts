export const transactionTypeDefs = `#graphql
  """
  Tipo de uma transação: entrada ou saída de dinheiro.
  """
  enum TransactionType {
    "Entrada de dinheiro (receita)."
    INCOME
    "Saída de dinheiro (despesa)."
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

  """
  Resumo financeiro do usuário. Todos os valores em centavos.
  """
  type TransactionSummary {
    "Saldo total: todas as receitas menos todas as despesas (histórico completo)."
    balance: Int!
    "Total de receitas do mês consultado."
    income: Int!
    "Total de despesas do mês consultado."
    expense: Int!
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

  """
  Página de transações acompanhada do total geral (para paginação).
  """
  type TransactionsResult {
    "As transações da página atual."
    items: [Transaction!]!
    "Total de transações que batem no filtro, ignorando a paginação."
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

    """
    Resumo financeiro do usuário autenticado: saldo acumulado (histórico) e
    receitas/despesas do mês informado (YYYY-MM; padrão o mês corrente do cliente).
    Requer header Authorization com um accessToken válido.
    """
    transactionSummary(month: String): TransactionSummary!
  }
`;

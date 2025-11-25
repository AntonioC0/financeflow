import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  accounts, 
  InsertAccount,
  creditCards,
  InsertCreditCard,
  categories,
  InsertCategory,
  subcategories,
  InsertSubcategory,
  transactions,
  InsertTransaction,
  budgets,
  InsertBudget,
  goals,
  InsertGoal,
  investments,
  InsertInvestment,
  reminders,
  InsertReminder,
  tags,
  InsertTag,
  userSettings,
  InsertUserSettings
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ ACCOUNT FUNCTIONS ============

export async function createAccount(account: InsertAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(accounts).values(account);
  return result;
}

export async function getAccountsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(accounts).where(eq(accounts.userId, userId));
}

export async function getAccountById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(accounts).where(
    and(eq(accounts.id, id), eq(accounts.userId, userId))
  ).limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateAccount(id: number, userId: number, data: Partial<InsertAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(accounts).set(data).where(
    and(eq(accounts.id, id), eq(accounts.userId, userId))
  );
}

export async function deleteAccount(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(accounts).where(
    and(eq(accounts.id, id), eq(accounts.userId, userId))
  );
}

// ============ CREDIT CARD FUNCTIONS ============

export async function createCreditCard(card: InsertCreditCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(creditCards).values(card);
  return result;
}

export async function getCreditCardsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(creditCards).where(eq(creditCards.userId, userId));
}

export async function getCreditCardById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(creditCards).where(
    and(eq(creditCards.id, id), eq(creditCards.userId, userId))
  ).limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateCreditCard(id: number, userId: number, data: Partial<InsertCreditCard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(creditCards).set(data).where(
    and(eq(creditCards.id, id), eq(creditCards.userId, userId))
  );
}

export async function deleteCreditCard(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(creditCards).where(
    and(eq(creditCards.id, id), eq(creditCards.userId, userId))
  );
}

// ============ CATEGORY FUNCTIONS ============

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(category);
  return result;
}

export async function getCategoriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).where(eq(categories.userId, userId));
}

export async function updateCategory(id: number, userId: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set(data).where(
    and(eq(categories.id, id), eq(categories.userId, userId))
  );
}

export async function deleteCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(categories).where(
    and(eq(categories.id, id), eq(categories.userId, userId))
  );
}

// ============ TRANSACTION FUNCTIONS ============

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactions).values(transaction);
  return result;
}

export async function getTransactionsByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(limit);
}

export async function updateTransaction(id: number, userId: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(transactions).set(data).where(
    and(eq(transactions.id, id), eq(transactions.userId, userId))
  );
}

export async function deleteTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(transactions).where(
    and(eq(transactions.id, id), eq(transactions.userId, userId))
  );
}

// ============ BUDGET FUNCTIONS ============

export async function createBudget(budget: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(budgets).values(budget);
  return result;
}

export async function getBudgetsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(budgets).where(eq(budgets.userId, userId));
}

// ============ GOAL FUNCTIONS ============

export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(goals).values(goal);
  return result;
}

export async function getGoalsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(goals).where(eq(goals.userId, userId));
}

export async function updateGoal(id: number, userId: number, data: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(goals).set(data).where(
    and(eq(goals.id, id), eq(goals.userId, userId))
  );
}

// ============ INVESTMENT FUNCTIONS ============

export async function createInvestment(investment: InsertInvestment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(investments).values(investment);
  return result;
}

export async function getInvestmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(investments).where(eq(investments.userId, userId)).orderBy(desc(investments.purchaseDate));
}

export async function updateInvestment(id: number, userId: number, data: Partial<InsertInvestment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(investments)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

export async function deleteInvestment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(investments)
    .where(and(eq(investments.id, id), eq(investments.userId, userId)));
}

// ============ USER SETTINGS FUNCTIONS ============

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  
  // Se não existir, cria com valores padrão
  if (result.length === 0) {
    await db.insert(userSettings).values({ userId });
    const newResult = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return newResult[0] || null;
  }
  
  return result[0];
}

export async function updateUserSettings(userId: number, data: Partial<InsertUserSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Garante que o registro existe
  await getUserSettings(userId);
  
  await db.update(userSettings).set(data).where(eq(userSettings.userId, userId));
}

// ============ STATISTICS FUNCTIONS ============

export async function getExpensesByCategory(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(transactions.userId, userId),
    eq(transactions.type, "expense"),
  ];
  
  if (startDate) {
    conditions.push(sql`${transactions.date} >= ${startDate}`);
  }
  
  if (endDate) {
    conditions.push(sql`${transactions.date} <= ${endDate}`);
  }
  
  const result = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      total: sql<number>`SUM(${transactions.amount})`.as('total'),
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .groupBy(transactions.categoryId, categories.name, categories.icon, categories.color);
  
  return result.map(r => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName || "Sem categoria",
    categoryIcon: r.categoryIcon || "📦",
    categoryColor: r.categoryColor || "#888888",
    total: r.total / 100, // Converte de centavos para reais
  }));
}

export async function getNetWorthEvolution(userId: number, days: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Busca todas as contas do usuário
  const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
  
  // Busca transações dos últimos N dias
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.date} >= ${startDate}`
      )
    )
    .orderBy(transactions.date);
  
  // Calcula o saldo inicial (soma de todas as contas)
  let currentBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Subtrai todas as transações anteriores à data inicial
  const oldTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.date} < ${startDate}`
      )
    );
  
  oldTransactions.forEach(t => {
    if (t.type === "income") {
      currentBalance -= t.amount;
    } else if (t.type === "expense") {
      currentBalance += t.amount;
    }
  });
  
  // Gera pontos de dados para cada dia
  const dataPoints: { date: string; netWorth: number }[] = [];
  const dateMap = new Map<string, number>();
  
  // Inicializa com o saldo inicial
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, currentBalance);
  }
  
  // Aplica as transações
  userTransactions.forEach(t => {
    const dateStr = new Date(t.date).toISOString().split('T')[0];
    const currentValue = dateMap.get(dateStr) || currentBalance;
    
    let newValue = currentValue;
    if (t.type === "income") {
      newValue += t.amount;
    } else if (t.type === "expense") {
      newValue -= t.amount;
    }
    
    dateMap.set(dateStr, newValue);
    currentBalance = newValue;
    
    // Atualiza todos os dias seguintes
    const transactionDate = new Date(t.date);
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(transactionDate);
      futureDate.setDate(futureDate.getDate() + i);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      if (dateMap.has(futureDateStr)) {
        const oldValue = dateMap.get(futureDateStr) || 0;
        const diff = t.type === "income" ? t.amount : -t.amount;
        dateMap.set(futureDateStr, oldValue + diff);
      }
    }
  });
  
  // Converte o mapa em array
  dateMap.forEach((value, date) => {
    dataPoints.push({
      date,
      netWorth: value / 100, // Converte de centavos para reais
    });
  });
  
  return dataPoints.sort((a, b) => a.date.localeCompare(b.date));
}




export async function deleteUserAccount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Excluir todos os dados do usuário em cascata
  await db.delete(reminders).where(eq(reminders.userId, userId));
  await db.delete(investments).where(eq(investments.userId, userId));
  await db.delete(goals).where(eq(goals.userId, userId));
  await db.delete(budgets).where(eq(budgets.userId, userId));
  await db.delete(transactions).where(eq(transactions.userId, userId));
  await db.delete(creditCards).where(eq(creditCards.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));
  await db.delete(categories).where(eq(categories.userId, userId));
  await db.delete(userSettings).where(eq(userSettings.userId, userId));
  
  // Por último, excluir o próprio usuário
  await db.delete(users).where(eq(users.id, userId));
}

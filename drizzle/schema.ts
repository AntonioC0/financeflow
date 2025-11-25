import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contas bancárias e carteiras
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["checking", "savings", "investment", "cash", "digital"]).notNull(),
  balance: int("balance").notNull().default(0), // Armazenado em centavos
  currency: varchar("currency", { length: 3 }).notNull().default("BRL"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  includeInTotal: boolean("includeInTotal").notNull().default(true),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * Cartões de crédito
 */
export const creditCards = mysqlTable("creditCards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  lastFourDigits: varchar("lastFourDigits", { length: 4 }),
  creditLimit: int("creditLimit").notNull().default(0), // Em centavos
  closingDay: int("closingDay").notNull(), // Dia do fechamento (1-31)
  dueDay: int("dueDay").notNull(), // Dia do vencimento (1-31)
  brand: varchar("brand", { length: 50 }), // Visa, Mastercard, etc
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = typeof creditCards.$inferInsert;

/**
 * Categorias de transações
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  isDefault: boolean("isDefault").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Subcategorias
 */
export const subcategories = mysqlTable("subcategories", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = typeof subcategories.$inferInsert;

/**
 * Tags personalizadas
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Transações financeiras
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["income", "expense", "transfer"]).notNull(),
  amount: int("amount").notNull(), // Em centavos
  description: text("description"),
  date: timestamp("date").notNull(),
  categoryId: int("categoryId"),
  subcategoryId: int("subcategoryId"),
  accountId: int("accountId"),
  creditCardId: int("creditCardId"),
  toAccountId: int("toAccountId"), // Para transferências
  isPaid: boolean("isPaid").notNull().default(false),
  isRecurring: boolean("isRecurring").notNull().default(false),
  recurringType: mysqlEnum("recurringType", ["fixed", "variable", "installment"]),
  installmentNumber: int("installmentNumber"), // Número da parcela atual
  totalInstallments: int("totalInstallments"), // Total de parcelas
  parentTransactionId: int("parentTransactionId"), // ID da transação pai (para recorrentes)
  receiptUrl: text("receiptUrl"), // URL do comprovante no S3
  location: text("location"), // Geolocalização
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Relação entre transações e tags (muitos para muitos)
 */
export const transactionTags = mysqlTable("transactionTags", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  tagId: int("tagId").notNull(),
});

/**
 * Orçamentos
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: int("amount").notNull(), // Em centavos
  period: mysqlEnum("period", ["monthly", "yearly", "custom"]).notNull().default("monthly"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  categoryId: int("categoryId"),
  alertThreshold: int("alertThreshold").default(80), // Percentual para alerta (ex: 80%)
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Metas financeiras
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: int("targetAmount").notNull(), // Em centavos
  currentAmount: int("currentAmount").notNull().default(0), // Em centavos
  deadline: timestamp("deadline"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  isCompleted: boolean("isCompleted").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

/**
 * Investimentos
 */
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["stocks", "funds", "fixed_income", "crypto", "real_estate", "other"]).notNull(),
  initialAmount: int("initialAmount").notNull(), // Em centavos
  currentAmount: int("currentAmount").notNull(), // Em centavos
  purchaseDate: timestamp("purchaseDate").notNull(),
  broker: varchar("broker", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

/**
 * Lembretes
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  transactionId: int("transactionId"),
  isCompleted: boolean("isCompleted").notNull().default(false),
  notifyBefore: int("notifyBefore").default(1), // Dias antes para notificar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Configurações do usuário
 */
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currency: varchar("currency", { length: 3 }).notNull().default("BRL"),
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).notNull().default("light"),
  language: varchar("language", { length: 5 }).notNull().default("pt-BR"),
  dateFormat: varchar("dateFormat", { length: 20 }).notNull().default("DD/MM/YYYY"),
  emailNotifications: boolean("emailNotifications").notNull().default(true),
  pushNotifications: boolean("pushNotifications").notNull().default(true),
  hasCompletedTour: boolean("hasCompletedTour").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

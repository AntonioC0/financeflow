import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const defaultCategories = [
  // Receitas
  { name: "Salário", type: "income", icon: "💰", color: "#10b981", isDefault: true, userId: 0 },
  { name: "Freelance", type: "income", icon: "💼", color: "#059669", isDefault: true, userId: 0 },
  { name: "Investimentos", type: "income", icon: "📈", color: "#34d399", isDefault: true, userId: 0 },
  { name: "Outros", type: "income", icon: "💵", color: "#6ee7b7", isDefault: true, userId: 0 },
  
  // Despesas
  { name: "Alimentação", type: "expense", icon: "🍔", color: "#ef4444", isDefault: true, userId: 0 },
  { name: "Transporte", type: "expense", icon: "🚗", color: "#f97316", isDefault: true, userId: 0 },
  { name: "Moradia", type: "expense", icon: "🏠", color: "#eab308", isDefault: true, userId: 0 },
  { name: "Saúde", type: "expense", icon: "🏥", color: "#06b6d4", isDefault: true, userId: 0 },
  { name: "Educação", type: "expense", icon: "📚", color: "#8b5cf6", isDefault: true, userId: 0 },
  { name: "Lazer", type: "expense", icon: "🎮", color: "#ec4899", isDefault: true, userId: 0 },
  { name: "Compras", type: "expense", icon: "🛍️", color: "#f43f5e", isDefault: true, userId: 0 },
  { name: "Contas", type: "expense", icon: "📄", color: "#64748b", isDefault: true, userId: 0 },
  { name: "Outros", type: "expense", icon: "💸", color: "#94a3b8", isDefault: true, userId: 0 },
];

async function seed() {
  console.log("Seeding default categories...");
  
  for (const category of defaultCategories) {
    await db.insert(categories).values(category);
  }
  
  console.log("✓ Default categories created!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding categories:", error);
  process.exit(1);
});

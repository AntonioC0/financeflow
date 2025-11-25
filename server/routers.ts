import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ ACCOUNTS ROUTER ============
  accounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAccountsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(["checking", "savings", "investment", "cash", "digital"]),
        balance: z.number().default(0),
        currency: z.string().length(3).default("BRL"),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
        includeInTotal: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const balanceInCents = Math.round(input.balance * 100);
        await db.createAccount({
          userId: ctx.user.id,
          ...input,
          balance: balanceInCents,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(["checking", "savings", "investment", "cash", "digital"]).optional(),
        balance: z.number().optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
        includeInTotal: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, balance, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (balance !== undefined) {
          updateData.balance = Math.round(balance * 100);
        }
        
        await db.updateAccount(id, ctx.user.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAccount(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ CREDIT CARDS ROUTER ============
  creditCards: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreditCardsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        lastFourDigits: z.string().length(4).optional(),
        creditLimit: z.number(),
        closingDay: z.number().min(1).max(31),
        dueDay: z.number().min(1).max(31),
        brand: z.string().max(50).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const limitInCents = Math.round(input.creditLimit * 100);
        await db.createCreditCard({
          userId: ctx.user.id,
          ...input,
          creditLimit: limitInCents,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        lastFourDigits: z.string().length(4).optional(),
        creditLimit: z.number().optional(),
        closingDay: z.number().min(1).max(31).optional(),
        dueDay: z.number().min(1).max(31).optional(),
        brand: z.string().max(50).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, creditLimit, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (creditLimit !== undefined) {
          updateData.creditLimit = Math.round(creditLimit * 100);
        }
        
        await db.updateCreditCard(id, ctx.user.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCreditCard(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ CATEGORIES ROUTER ============
  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCategoriesByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(["income", "expense"]),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createCategory({
          userId: ctx.user.id,
          ...input,
          isDefault: false,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...rest } = input;
        await db.updateCategory(id, ctx.user.id, rest);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCategory(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ TRANSACTIONS ROUTER ============
  transactions: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(100),
      }).optional())
      .query(async ({ ctx, input }) => {
        const limit = input?.limit ?? 100;
        return await db.getTransactionsByUserId(ctx.user.id, limit);
      }),

    create: protectedProcedure
      .input(z.object({
        type: z.enum(["income", "expense", "transfer"]),
        amount: z.number(),
        description: z.string().optional(),
        date: z.date(),
        categoryId: z.number().optional(),
        subcategoryId: z.number().optional(),
        accountId: z.number().optional(),
        creditCardId: z.number().optional(),
        toAccountId: z.number().optional(),
        isPaid: z.boolean().default(false),
        isRecurring: z.boolean().default(false),
        recurringType: z.enum(["fixed", "variable", "installment"]).optional(),
        installmentNumber: z.number().optional(),
        totalInstallments: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const amountInCents = Math.round(input.amount * 100);
        await db.createTransaction({
          userId: ctx.user.id,
          ...input,
          amount: amountInCents,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["income", "expense", "transfer"]).optional(),
        amount: z.number().optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        categoryId: z.number().optional(),
        subcategoryId: z.number().optional(),
        isPaid: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, amount, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (amount !== undefined) {
          updateData.amount = Math.round(amount * 100);
        }
        
        await db.updateTransaction(id, ctx.user.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTransaction(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ BUDGETS ROUTER ============
  budgets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getBudgetsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        amount: z.number(),
        period: z.enum(["monthly", "yearly", "custom"]).default("monthly"),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        categoryId: z.number().optional(),
        alertThreshold: z.number().default(80),
      }))
      .mutation(async ({ ctx, input }) => {
        const amountInCents = Math.round(input.amount * 100);
        await db.createBudget({
          userId: ctx.user.id,
          ...input,
          amount: amountInCents,
        });
        return { success: true };
      }),
  }),

  // ============ GOALS ROUTER ============
  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getGoalsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        targetAmount: z.number(),
        currentAmount: z.number().default(0),
        deadline: z.date().optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(7).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const targetInCents = Math.round(input.targetAmount * 100);
        const currentInCents = Math.round(input.currentAmount * 100);
        await db.createGoal({
          userId: ctx.user.id,
          ...input,
          targetAmount: targetInCents,
          currentAmount: currentInCents,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        targetAmount: z.number().optional(),
        currentAmount: z.number().optional(),
        deadline: z.date().optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, targetAmount, currentAmount, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (targetAmount !== undefined) {
          updateData.targetAmount = Math.round(targetAmount * 100);
        }
        if (currentAmount !== undefined) {
          updateData.currentAmount = Math.round(currentAmount * 100);
        }
        
        await db.updateGoal(id, ctx.user.id, updateData);
        return { success: true };
      }),
  }),

  // ============ INVESTMENTS ROUTER ============
  investments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getInvestmentsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(["stocks", "funds", "fixed_income", "crypto", "real_estate", "other"]),
        initialAmount: z.number(),
        currentAmount: z.number(),
        purchaseDate: z.date(),
        broker: z.string().max(255).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const initialInCents = Math.round(input.initialAmount * 100);
        const currentInCents = Math.round(input.currentAmount * 100);
        await db.createInvestment({
          userId: ctx.user.id,
          ...input,
          initialAmount: initialInCents,
          currentAmount: currentInCents,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(["stocks", "funds", "fixed_income", "crypto", "real_estate", "other"]).optional(),
        initialAmount: z.number().optional(),
        currentAmount: z.number().optional(),
        purchaseDate: z.date().optional(),
        broker: z.string().max(255).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, initialAmount, currentAmount, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (initialAmount !== undefined) {
          updateData.initialAmount = Math.round(initialAmount * 100);
        }
        if (currentAmount !== undefined) {
          updateData.currentAmount = Math.round(currentAmount * 100);
        }
        
        await db.updateInvestment(id, ctx.user.id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteInvestment(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ USER SETTINGS ROUTER ============
  userSettings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSettings(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        currency: z.string().length(3).optional(),
        theme: z.enum(["light", "dark", "auto"]).optional(),
        language: z.string().max(5).optional(),
        dateFormat: z.string().max(20).optional(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        hasCompletedTour: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserSettings(ctx.user.id, input);
        return { success: true };
      }),

    deleteAccount: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.deleteUserAccount(ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ STATISTICS ROUTER ============
  statistics: router({
    expensesByCategory: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getExpensesByCategory(ctx.user.id, input?.startDate, input?.endDate);
      }),

    netWorthEvolution: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }).optional())
      .query(async ({ ctx, input }) => {
        const days = input?.days ?? 30;
        return await db.getNetWorthEvolution(ctx.user.id, days);
      }),
  }),
});

export type AppRouter = typeof appRouter;

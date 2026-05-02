import z from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("E-mail invalido"),
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    }),
});

export const creatUserSchema = z.object({
    body: z.object({
        name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
        sex: z.enum(["M", "F", "m", "f"]).optional(),
        role: z.string().optional(),
        gymId: z.string().optional()
    }),
});


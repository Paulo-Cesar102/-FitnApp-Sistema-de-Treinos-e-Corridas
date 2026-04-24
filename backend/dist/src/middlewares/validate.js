"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
// Usamos 'any' aqui para o TS parar de chorar pelo nome do tipo
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (e) {
        if (e instanceof zod_1.ZodError) {
            return res.status(400).json({
                message: "Erro de validação",
                errors: e.issues.map((issue) => ({
                    field: issue.path[issue.path.length - 1],
                    message: issue.message
                })),
            });
        }
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};
exports.validate = validate;

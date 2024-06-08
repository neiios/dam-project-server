import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

// https://dev.to/franciscomendes10866/schema-validation-with-zod-and-expressjs-111p

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

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

export function extractPaginationParameters(req): {
  page: number;
  pageSize: number;
  offset: number;
} {
  // this is pretty unsafe and ugly, but oh well
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize as string)
    : 1000;
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

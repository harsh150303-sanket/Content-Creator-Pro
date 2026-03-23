import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clientsRouter from "./clients";
import blogsRouter from "./blogs";
import searchConsoleRouter from "./searchconsole";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientsRouter);
router.use(blogsRouter);
router.use(searchConsoleRouter);

export default router;

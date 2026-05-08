import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import profilesRouter from "./profiles";
import employersRouter from "./employers";
import applicationsRouter from "./applications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(profilesRouter);
router.use(employersRouter);
router.use(applicationsRouter);
router.use(dashboardRouter);

export default router;

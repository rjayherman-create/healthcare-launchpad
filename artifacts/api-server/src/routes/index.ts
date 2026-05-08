import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tradesRouter from "./trades";
import employersRouter from "./employers";
import opportunitiesRouter from "./opportunities";
import licenseRoadmapsRouter from "./license-roadmaps";
import profileRouter from "./profile";
import applicationsRouter from "./applications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tradesRouter);
router.use(employersRouter);
router.use(opportunitiesRouter);
router.use(licenseRoadmapsRouter);
router.use(profileRouter);
router.use(applicationsRouter);
router.use(dashboardRouter);

export default router;

import express from "express";
const router = express.Router();
import { checkAuthentication } from "../helpers/apiAuth.js";
import dotenv from "dotenv";
import ThirdPartyController from "../controllers/ThirdPartyController.js";
dotenv.config();

router.post("/CreateLicences", ThirdPartyController.CreateLicences);

router.post("/GtinWithLicence", ThirdPartyController.CreateOrModifyGTINsWithLicence);
router.post("/BulkGtinWithLicence", ThirdPartyController.BulkGtinWithLicence);

export default router;





import express from "express";
import ThirdPartyRoute from "./ThirdPartyRoute.js";
const router = express.Router();


// call all routes here

router.use("/", ThirdPartyRoute);




export default router;

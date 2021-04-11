import express from "express";
const router = express.Router();

//middleware
import { requireSignin } from "../middlewares";
//controllers
import { createConnectAccount, getAccountStatus, getAccountBalance, payoutSetting,stripeSessionId,stripeSuccess } 
from "../controllers/stripe";
//import { createConnectAccount, getAccountStatus, getAccountBalance } from "../controllers/stripe";
router.post("/create-connect-account",requireSignin,createConnectAccount);
router.post("/get-account-status",requireSignin,getAccountStatus);
router.post("/get-account-balance",requireSignin,getAccountBalance);
router.post("/payout-setting",requireSignin,payoutSetting);
router.post("/stripe-session-id", requireSignin, stripeSessionId);
router.post("/stripe-success", requireSignin, stripeSuccess);

module.exports = router;
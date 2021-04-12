import User from "../models/user";
import Stripe from "stripe";
import Hotel from "../models/hotel";
import Order from "../models/order";
//query string help us to create login link with stripe account id as its input
import queryString from "query-string";

const stripe = Stripe(process.env.STRIPE_SECRET);

export const createConnectAccount = async (req,res) => {
    //1.find user from db
    const user = await User.findById(req.user._id).exec();
    console.log("USER ==>",user);
    
    //2.if user don't have stripe account id yet,create now
    if(!user.stripe_account_id){
        const account = await stripe.accounts.create({
            type:"express",
            country: 'AU',
        });
        console.log("ACCOUNT===>",account);
        user.stripe_account_id = account.id;
        user.save();
    }

    //3.create login link based on account id(for frontend to complete onboarding)
    //return_url this link is all about when user finishes onboarding process where he want to redirect to.
    let accountLink = await stripe.accountLinks.create({
        account:user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type:'account_onboarding',
    })
    //prefill any info such as email..i.e add email to the above link
    accountLink = Object.assign(accountLink,{
        "stripe_user[email]":user.email || undefined,
    });
    //console.log(accountLink);
    //with query string we can merge gmail info with acc link
    let link=`${accountLink.url}?${queryString.stringify(accountLink)}`;
    console.log("LOGIN LINK",link);
    res.send(link);


};
// const updateDelayDays = async (accountId) => {
//     const account = await stripe.accounts.update(accountId,{
//         settings: {
//             payouts: {
//                 schedule: {
//                     delay_days: 7,
//                 },
//             }, 
//         },
//     });
//     return account;
// };


export const getAccountStatus = async (req, res) => {
    //console.log("Get acc status");
    const user = await User.findById(req.user._id).exec();
    const account = await stripe.accounts.retrieve(user.stripe_account_id)
    //console.log("USER ACCOUNT RETRIEVE",account);
    //update delay days
    //const updatedAccount = await updateDelayDays(account.id);
    //we are making sure that updated info is available in variable updateduser by making new=true
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            stripe_seller:account,
        },
        {new:true}
    )
    .select("-password")
    .exec();
    console.log(updatedUser);
    res.json(updatedUser);
};


export const getAccountBalance = async (req,res) => {
    const user = await User.findById(req.user._id).exec();
    try{
        const balance = await stripe.balance.retrieve({
            stripeAccount:user.stripe_account_id,
        });
        // console.log("BALANCE===>",balance);
        res.json(balance);
    }catch(err){
        console.log(err);
    }
};


export const payoutSetting = async (req,res) => {
    try{
        const user = await User.findById(req.user._id).exec();
        const loginLink = await stripe.accounts.createLoginLink(
            user.stripe_account_id,
            {
                redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
            }
        );
         //console.log("login link for payout setting",loginLink);
        res.json(loginLink);
    }catch(err){
        console.log("stripe payout setting err",err);
    }
};


export const stripeSessionId = async (req, res) => {
    // console.log("you hit stripe session id", req.body.hotelId);
    // 1 get hotel id from req.body
    const { hotelId } = req.body;
    // 2 find the hotel based on hotel id from db
    const item = await Hotel.findById(hotelId).populate("postedBy").exec();
    // 3 20% charge as application fee
    const fee = (item.price * 20) / 100;
    // 4 create a session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      // 5 purchasing item details, it will be shown to user on checkout
      line_items: [
        {
          name: item.title,
          amount: item.price * 1, // in cents
          currency: "inr",
          quantity: 1,
        },
      ],
      // 6 create payment intent with application fee and destination charge 80%
      payment_intent_data: {
        application_fee_amount: fee * 1,
        // this seller can see his balance in our frontend dashboard
        transfer_data: {
          destination: item.postedBy.stripe_account_id,
        },
      },
      // success and calcel urls
      success_url:`${process.env.STRIPE_SUCCESS_URL}/${item._id}` ,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
  
    // 7 add this session object to user in the db
    await User.findByIdAndUpdate(req.user._id, { stripeSession: session }).exec();
    // 8 send session id as resposne to frontend
    res.send({
      sessionId: session.id,
    });
  };


  export const stripeSuccess = async (req, res) => {
    try {
      // 1 get hotel id from req.body
      const { hotelId } = req.body;
      // 2 find currently logged in user
      const user = await User.findById(req.user._id).exec();
      // check if user has stripeSession
      if (!user.stripeSession) return;
      // 3 retrieve stripe session, based on session id we previously save in user db
      const session = await stripe.checkout.sessions.retrieve(
        user.stripeSession.id
      );
      // 4 if session payment status is paid, create order
      if (session.payment_status === "paid") {
        // 5 check if order with that session id already exist by querying orders collection
        const orderExist = await Order.findOne({
          "session.id": session.id,
        }).exec();
        if (orderExist) {
          // 6 if order exist, send success true
          res.json({ success: true });
        } else {
          // 7 else create new order and send success true
          let newOrder = await new Order({
            hotel: hotelId,
            session,
            orderedBy: user._id,
          }).save();
          // 8 remove user's stripeSession
          await User.findByIdAndUpdate(user._id, {
            $set: { stripeSession: {} },
          });
          res.json({ success: true });
        }
      }
    } catch (err) {
      console.log("STRIPE SUCCESS ERR", err);
    }
  };
  
  

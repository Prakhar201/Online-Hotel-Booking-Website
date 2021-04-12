import User from "../models/user";
import Stripe from "stripe";
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

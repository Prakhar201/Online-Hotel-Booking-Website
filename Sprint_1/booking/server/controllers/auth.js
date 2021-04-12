import User from '../models/user' 
import jwt from 'jsonwebtoken';
export const register = async(req, res) => {
    console.log(req.body);
    const {name,email,password} =req.body;
    //validation
    if(!name) return res.status(400).send("Name is required");
    if(!password || password.length <6)
    return res
        .status(400)
        .send("password is required and should be min 6 character long");

    let userExist =await User.findOne({email}).exec()
    if(userExist) return res.status(400).send('Email is taken')
    
    //register
    const user =new User(req.body);
    try{
        await user.save();
        console.log("USER CREATED",user);
        return res.json({ok:true});
    }catch (err){
        console.log("CREATE USER FAILED",err);
        return res.status(400).send("Error,Try again");
    }

};

export const login= async(req,res)=>{
    //console.log(req.body);
    const {email,password}=req.body;
    try{
        //check if user with that email exist
        let user = await User.findOne({email}).exec();
        //console.log("user exists",user);
        if(!user) res.status(400).send("User with that email not found");
        //compare password
        user.comparePassword(password,(err,match)=>
        {
            console.log("compare password in login err",err);
            if(!match || err) return res.status(400).send("wrong password");
            //Generate a token then send as response to client
            let token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{
            expiresIn:"7d",
            });
            res.json({token,
                user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                stripe_account_id: user.stripe_account_id,
                stripe_seller: user.stripe_seller,
                stripeSession: user.stripeSession,
            },
        });
        });
    }catch(err)
    {
        console.log("login error",err);
        res.status(400).send("signin Failed");
    }
};
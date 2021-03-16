import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const {Schema} = mongoose

const userSchema = new Schema({
    name: {
        type:String,
        trim:true,
        required:'Name is required'
    },
    email: {
        type:String,
        trim:true,
        required:'Email is required',
        unique:true,
    },
    password: {
       type:String,
       required:true,
       min:6,
       max:64,
    },

    stripe_account_id:"",
    stripe_seller:{},
    stripeSession:{},

},
{timestamps:true}
);
//hash password only if user is changing the password or registering for the first time
//make sure to use this other wise each time user.save() is executed,password
//will get auto updated and you cannot login with original password
userSchema.pre("save",function (next){
    let user=this;
    if (user.isModified("password")){
        return bcrypt.hash(user.password,12,function(err,hash){
            if(err){
                console.log("BCRYPT HASH ERR",err);
                return next(err);
            }
            user.password=hash;
            return next();
        });
    } else{
        return next();
    }
});

userSchema.methods.comparePassword =function(password,next)
{
    bcrypt.compare(password,this.password,function(err,match)
    {
        if(err){
            console.log("Comapare password err",err);
            return next(err,false);
        }
        console.log("match password",match);
        return next(null,match);
    });
};
export default mongoose.model("User",userSchema);
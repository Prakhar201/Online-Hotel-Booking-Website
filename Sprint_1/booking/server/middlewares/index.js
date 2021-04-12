import expressJwt from 'express-jwt'

//This middleware we can apply in the routes
//Any route we want to protect and to make sure it is accessed by a logged user with a valid token we can 
//apply this as a middleware and this will do job for us.
//This validates the user and gives his id and with this id we can do anything in db.

export const requireSignin = expressJwt({
    secret:process.env.JWT_SECRET,
    algorithms:["HS256"],
});

//above is the algorithm used to verify the token of the user..this token is generated using user id and jwt secret
//so,if the token is correct we can extract user id from token
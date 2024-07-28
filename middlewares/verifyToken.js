var jwt = require('jsonwebtoken');

function verifyToken (req, res, next) {
    const authToken= req.headers.authorization;

    if(authToken){
        const token= authToken.split(" ")[1];
        try{
            const decode= jwt.verify(token, process.env.JWT_SECRET);
            req.user= decode;
            next();
        } catch(error){
            res.status(401).json({message: 'Invalid Token'});
        }
    } else{
        res.status(401).json({message: 'No token Provided, access denied'});
    }
};

function verifyTokenAndAdmmin (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.isAdmin){
         next()
        } else {
            return res.status(403).json({message: 'You are not allowed, only Admin'})
        }
    })
};

function verifyTokenAndOnlyUser (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id){
         next()
        } else {
            return res.status(403).json({message: 'You are not allowed, only user himself'})
        }
    })
};

function verifyTokenAndAuthorization (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id || req.user.isAdmin){
         next()
        } else {
            return res.status(403).json({message: 'You are not allowed, only user himself and admin'});
        }
    })
};

module.exports= {
    verifyToken,
    verifyTokenAndAdmmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization
}
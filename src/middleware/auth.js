const User = require("../models/user")
const jwt = require("jsonwebtoken")

const auth = async(req, res, next)=>{

    try{
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = jwt.verify(token, process.env.JWT_SECRET)//whether the given token is made on given secrete string
        const user = await User.findOne({_id : decoded._id, "tokens.token" : token}) //we write queries on model 
        
        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user//this is the request to main route, cannot use return here. this is the user fetched from db

        next()
    }catch(e){
        res.status(401).send("Error : Please Authenticate.")
    }
}

module.exports = auth
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("../models/task")

//Userschema is basically a ideal document of collection.
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },
    email:{
        type: String,
        unique : true,
        required: true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Enter valid mail address :(")
            }
        }
    },
    password : {
        type : String,
        required : true,
        minlength : 7,
        trim : true,
        validate(value){
            if (value.toLowerCase().includes("password")){
                throw new Error("Password cannot include 'password' ")
            }
        }
    },
    age:{
        type : Number,
        default : 0,
        validate(value){
            if(value<0){
                throw new Error("Age must be positive integer ")
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
}, {
    timestamps : true
})

//setting up a virtual "tasks" field(array). it is not actual field stored in db, but a relationship between user and tasks.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', 
    foreignField: 'owner' 
})

userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()//gets raw object with our user data attached

    delete userObject.password
    delete userObject.tokens

    return userObject
}

//generate token for user, once grabbed, saving to db
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id : user._id.toString() }, "thisismynewcourse")

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({email})
    if (!user) {
        throw new Error("Unable to login!")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error("Unable to login!")
    }

    return user
}


//hash the plain text password before saving.
userSchema.pre('save', async function(next){
    //"this" is the document that is 'BEING SAVED'.
    const user = this
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)//override
    }

    next()
})

// Delete the user tasks when the user is removed.
userSchema.pre("remove", async function(next){
    const user = this

    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User
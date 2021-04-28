const mongoose = require("mongoose")
//const validator = require("validator")

mongoose.connect(process.env.DB_URL , {
    useNewUrlParser: true,  
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})


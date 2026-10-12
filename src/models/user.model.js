
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:[true, "username is required"],
        unique:[true, "Username must be unique"] 
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique" ]
    },
    password:{
        type: String,
        required: [true, "Password is required"]
    }
})

"after creating the schema, we create the model"

const userModel=mongoose.model("User", userSchema)

export default userModel
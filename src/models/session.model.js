import mongoose from "mongoose";

const sessionSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    refreshTokenHash:{
        type: String,
        required: [true, "Refresh token is required"]
    },
    ip:{
        type: String,
        required: [true, "ip is required"]
    },
    userAgent: { //it tells which browser user is using and its version
        type: String,
        required: [true, "user agent is required"]
    },
    revoked: { // when user logout only then we change its value 
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const sessionModel= mongoose.model("sessions", sessionSchema)

export default sessionModel

import mongoose from "mongoose";
import config from "./config.js";

"creating fn to connect with DB"

async function connectToDB(){
    await mongoose.connect(config.MONGO_URI)

    console.log("Connected to DB");
    
}

export default connectToDB 
"now import it in server.js"
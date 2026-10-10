import app from "./src/app";
import connectToDB from "./src/config/database";



connectToDB() // it will connect us to database

"starting the server at port 3000"
"also giving a callback"
app.listen(3000, ()=>{
    console.log('server is running on port 3000');
    
})
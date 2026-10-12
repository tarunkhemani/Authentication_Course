import express from 'express'
import morgan from 'morgan'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser';

const app=express();
app.use(express.json())


"importing morgan which is a logger"
app.use(morgan("dev")) // there are multipe options other than dev


"importing autRouter"
"now we use /api/auth"
"now all requests too /api/auth will move to authRouter"
app.use("/api/auth", authRouter) // now check auth.Routes.js

"using cookie parser"
app.use(cookieParser())


export default app
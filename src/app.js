import express from 'express'

"importing morgan which is a logger"

import morgan from 'morgan'

const app=express();

app.use(express.json())
app.use(morgan("dev")) // there are multipe options other than dev

export default app
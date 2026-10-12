
"first we need to import the router"
import { Router } from "express"
import * as authController from "../controllers/auth.controller.js"

const authRouter=Router()

"if req come at /api/auth/register with post method this below will handle it"
"what will happen , we write that in controllers "
"check auth.controller.js"
authRouter.post("/register", authController.register)

"now creating the endpoint to fetch the details of user from which the req is coming"
"and we create this getMe controller"
authRouter.get("/get-me", authController.getMe)

"creating endpoint for refresh token"

authRouter.get("/refresh-token", authController.refreshToken)


"creating endpoint for logout"
authRouter.get("/logout", authController.logout)

"logout all api"
authRouter.get("/logout-all", authController.logoutAll)

"also creating the login route"
authRouter.post("/login", authController.login)



export default authRouter // now we import it in app.js
import userModel from "../models/user.model.js"
import crypto from 'crypto'
import jwt from "jsonwebtoken"
import config from "../config/config.js"
import sessionModel from "../models/session.model.js"


"lets create this fn "

// export async function register(req, res) {

//     "using destructuring of object to get the data"
//     const {username, email, password}=req.body

//     "now we first need to check whether a user already exists with this username or email"
//     "because we need unique username and email"

//     "first import userModel"
//     "instead of trying to find with both one by one we can use this"
//     const isAlreadyRegistered= await userModel.findOne({
//         $or:[
//             {username},
//             {email}
//         ]
//     })
//     "this query will find if there is any user with that username or email"

//     if(isAlreadyRegistered){
//         return res.status(409).json({
//             message: "Username or Email already exists"
//         })
//     }

//     "we never store password as plain text, we store it in hash form"
//     "import crypto"

//     const hashedPassword= crypto.createHash("sha256").update(password).digest("hex")
//     "**learn about this above line**"

//     const user= await userModel.create({
//         username,
//         email,
//         password: hashedPassword
//     })

//     "now we need to create a token"
//     "use npm i jsonwebtoken"
//     " first generate a jwt secret key online"
//     "save it in .env file"
//     "now import config in this file"

//     "now lets create the token"

//     const token=jwt.sign({
//         id: user._id // _id contains the id of particular user in MongoDB
//     }, config.JWT_SECRET, {expiresIn: "1d"})


//     return res.status(201).json({ // resource is created so code is 201
//         message: "User registered succesfully",
//         user: {
//             email: user.email,
//             username: user.username
//         },
//         token
//     })

//     "now we test on nodemon"  
// }

export async function getMe(req, res){
     
    "our server will read the token"
    "and from that it will tell which user is sending the request"

    const token= req.headers.authorization?.split(" ")[1]

    "**why we write it this way above**"
    "we send the get req from postman"
    "in req in headers, we gave key as Authorization"
    "and value as 'Bearer token' this is industry standard"
    "because of that space in between we use split and [1]"

    if(!token){
        return res.status(401).json({
            message: "Token not found"
        })
    }

    "to read the data inside token"
    const decoded=jwt.verify(token, config.JWT_SECRET)

    "this will return the object in which the id of user will be there"
    "it also contains 'iat' which tells when this token was created, and 'exp' which will tell when it will expire"
    
    const user=await userModel.findById(decoded.id)

    res.status(200).json({
        message: "userfetched successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })

}

"lets create access and refresh token"
export async function register(req, res) {

    const {username, email, password}=req.body

    const isAlreadyRegistered= await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })


    if(isAlreadyRegistered){
        return res.status(409).json({
            message: "Username or Email already exists"
        })
    }

    const hashedPassword= crypto.createHash("sha256").update(password).digest("hex")


    const user= await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    
    // const accessToken=jwt.sign({
    //     id: user._id 
    // }, config.JWT_SECRET, {expiresIn: "15m"})

    const refreshToken=jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {expiresIn: "7d"})

    "read this later"
    "when we register the user we create its session"
    "first convert it to hash"

    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session= await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip, // your request also contains the ip address
        userAgent: req.headers["user-agent"]
    })

    "we going to store the session id too in our access token"

    const accessToken=jwt.sign({
        id: user._id ,
        sessionId: session._id
    }, config.JWT_SECRET, {expiresIn: "15m"})



    "we know access token is going to be saved in memory so we will send it in response"

    "but we store refresh token in cookies"
    "we install a package called cookie-parser"
    "import it in app.js and use it, check app.js"

    "now we store it in cookies"
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000 // 7 days
    })
    "httponly makes sure client side js wont be able to access cookie  "


    return res.status(201).json({
        message: "User registered succesfully",
        user: {
            email: user.email,
            username: user.username
        },
        accessToken
    })

}

"creating controller for refresh token"

export async function refreshToken(req, res) {
    
    "we will get the refresh token from cookies"
    const refreshToken=req.cookies.refreshToken

    if(!refreshToken){
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    "now we check whether that refreshtoken is revoked or not"

    const refreshTokenHash= crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session= await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })
    "in case of if refreshtoken is wrong or it has been revoked we wont find session"

    if(!session){
        return res.status(401).json({
            message: "invalid refresh token"
        })
    }

    const decoded=jwt.verify(refreshToken, config.JWT_SECRET)

    

    const accessToken=jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {expiresIn: "15m"})

    "we know refresh token live for long"
    "but for additional security"
    "we create a new refresh token with new accesstoken"

    const newRefreshToken=jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, {expiresIn: "7d"})

    "creating hash and putting it in database"

    const newRefreshTokenHash= crypto.createHash("sha256").update(newRefreshToken).digest("hex")
    //updating it in session
    session.refreshTokenHash=newRefreshTokenHash
    await session.save()


    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000 // 7 days
    })

    res.status(200).json({
        message: "new access token generated",
        accessToken
    })
}

"lets create the logout controller"

export async function logout(req, res) {

    "lets first get the refresh token"

    const refreshToken= req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
            message: "Refresh Token not found"
        })
    }

    "since refreshToken is stored as hash in database"

    const refreshTokenHash= crypto.createHash("sha256").update(refreshToken).digest("hex")

    "we going to find the session with this refreshtokenhash and with revoked as false"
    const session=await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
        return res.status(400).json({
            message: "session not found"
        })
    }

    "if session is found we will revoke it"
    session.revoked=true
    "now save it"
    await session.save()

    "now clear the cookie"
    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "session revoked successfully"
    })
    
}

"now we going to revoke all sessions using logout all"
export async function logoutAll(req, res) {

    const refreshToken= req.cookies.refreshToken

    if(!refreshToken){
        return res.status(400).json({
            message: "refresh token not found"
        })
    }

    const decoded= jwt.verify(refreshToken, config.JWT_SECRET)

    "so we are finding all the session with user id which are not revoked and then reovking them"
    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "Logged out all devices"
    })
    
}

"lets also create a login controller"

export async function login(req, res) {
    
    const {email, password}= req.body

    const user= await userModel.findOne({
        email
    })

    if(!user){
        return res.status(401).json({
            message: "Invalid credential"
        })
    }

    const hashedPassword= crypto.createHash("sha256").update(password).digest("hex")

    const isPasswordValid= hashedPassword===user.password

    if(!isPasswordValid){
        return res.status(401).json({
            message: "Wrong email or password"
        })
    }
    "now we will create refresh token from which we will create session and then create access token"

    const refreshToken= jwt.sign({
        id: user._id
    }, config.JWT_SECRET, {expiresIn: "7d"})

    "first create its hash"
    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["userAgent"]
    })

    "now lets create access token"

    const accessToken= jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET, {expiresIn: "15m"})

    "now set the refresh token in our cookie"

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7*24*60*60*1000
    })

    res.status(200).json({
        message: "logged in successfully",
        user: {
            username: user.username,
            email: user.email
        },
        accessToken
    })


}
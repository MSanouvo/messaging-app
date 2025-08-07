const { body, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const validateUser = [
    body("username")
        .trim()
        .isLength({ min: 1, max: 15 })
        .withMessage("Username must be between 1 and 15 characters long"),
    body("email")
        .trim()
        .isEmail()
        .withMessage("Email is not valid"),
    // body("confirm_password")
    //     .custom((value, { req }) => {
    //         return value === req.body.password
    //     })
    //     .withMessage("Passwords do not match, please try again")
]

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try{
            const user = await prisma.users.findUnique({
                where: {
                    username: username
                }
            })
            console.log(user)
            if(!user) {
                return done(null, false, { message: "Username does not exist" })
            }
            const match = await bcrypt.compare(password, user.password)
            if(!match) {
                return done(null, false, { message: "Invalid password" })
            }
            return done(null, user)
        } catch(err) {
            console.log('attempt failed')
            return done(err)
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try{
        const user = await prisma.users.findUnique({
            where: {
                id: id
            }
        })
        done(null, user)
    } catch(err) {
        done(err)
    }
})

const signUp = [
    validateUser,
    async function(req, res){
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(403).json({ errors: errors.array() })
        }
        try{
            const user = req.body
            const hashedPassword = await bcrypt.hash(user.password, 10)
            const newUser = await prisma.users.create({
                data: {
                    username: user.username,
                    display_name: user.display,
                    password: hashedPassword,
                    email: user.email
                }
            })
            // console.log(newUser)
            res.status(200).json({ success: true, message: "User account created successfully" })
        } catch(err) {
            console.log(err)
        }
    }
]

const login = [
    passport.authenticate('local'),
    function(req, res){
        // console.log('received')
        // console.log(req.body)
        try {
            console.log('logged in')
            res.status(200).json({ success: true, message: "User logged in successfully" })
        } catch(err){
            console.log('not logged in')
            console.log(err)
        }
    }
]

// function login(req, res, next){
//   passport.authenticate('local', (err, user, info) => {
//     console.log('Passport callback:', { err, user, info });
//     if (err) return next(err);
//     if (!user) return res.status(401).json({ message: 'Unauthorized' });
//     req.logIn(user, (err) => {
//       if (err) return next(err);
//       return res.json({ message: 'Login successful' });
//     });
//   });
// }

async function getUsers(req, res){
    const users = await prisma.Users.findMany({
        select: {
            id: true,
            username: true,
            display: true
        }
    })
    //WIP
    const onlineUsers = []
    res.status(200).json({ success: true, users: onlineUsers })
}

async function deleteUser(req, res){
    const current = req.session.user
    const target = await prisma.Users.findUnique({
        where: {
            id: current.id
        }
    })

    if(target.id != current.id){
        res.status(403).json({ error: "User not Authorized" })
    }

    const deleteTarget = await prisma.Users.delete({
        where: {
            id: target.id
        }
    })

    res.status(200).json({ success: true, message: `User: ${current.username} was deleted` })
}

module.exports = {
    signUp,
    login,
    getUsers,
    deleteUser,
    passport
}
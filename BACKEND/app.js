const express = require('express')
const cors = require('cors')
// const router = require('/Routers/router.js')
// const controller = require('/Controllers/controller.js')
const session = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const { PrismaClient } = require("@prisma/client")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }))

// app.use(
//     session({
//       cookie: {
//        maxAge: 7 * 24 * 60 * 60 * 1000 // ms
//       },
//       secret: 'secret message key',
//       resave: true,
//       saveUninitialized: true,
//       store: new PrismaSessionStore(
//         new PrismaClient(),
//         {
//           checkPeriod: 2 * 60 * 1000,  //ms
//           dbRecordIdIsSessionId: true,
//           dbRecordIdFunction: undefined,
//         }
//       )
//     })
//   );
// app.use(controller.passport.session())


// app.use('/', router)

app.listen(PORT, () =>  {
	console.log(`Server Running on port: ${PORT}`)
})
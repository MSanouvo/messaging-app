const router = require("../Router/router")
const request = require("supertest")
const express = require('express')
const app = express()
const session = require("express-session")
const bcrypt = require('bcrypt')
const { PrismaClient } = require("@prisma/client")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")

const prisma = new PrismaClient()

app.use(express.urlencoded({ extended: false }))
app.use(
    session({
      cookie: {
       maxAge: 7 * 24 * 60 * 60 * 1000 // ms
      },
      secret: 'secret message key',
      resave: true,
      saveUninitialized: true,
      store: new PrismaSessionStore(
        new PrismaClient(),
        {
          checkPeriod: 2 * 60 * 1000,  //ms
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }
      )
    })
  );
app.use('/', router)

beforeEach(async () => {
    //REFACTOR TO BE OUR SIGN UP ROUTE SO WE CAN INCLUDE GENEREATED PROFILES
    const test = await request(app)
        .post("/sign-up")
        .type('form')
        .send({
            username: 'test',
            password: 'testPassword',
            email: 'test@email.test',
            display: "Test Login"
        })
    // try {
    //     const pass = await bcrypt.hash('testPassword', 10)
    //     await prisma.users.create({
    //         data: {
    //             username: "test",
    //             password: pass,
    //             display_name: "Test Login",
    //             email: "test@email.test"
    //         }
    //     })
    // } catch (err) {
    //     console.log(err)
    // }
})

afterEach(async () => {
    await prisma.users.deleteMany()
})

// afterAll(async ()=> {
//     await prisma.$disconnect();
// })

test('sign up', async () => {
    const test = await request(app)
        .post("/sign-up")
        .type('form')
        .send({
            username: 'TestUser',
            password: 'test',
            email: 'test@fakeemail.com',
            display: "Test"
        })
    expect(test.status).toBe(200)
    expect(test.body).toEqual({
        success: true,
        message: "User account created successfully"
    })

    const query = await prisma.users.findUnique({
        where: {
            username: "TestUser"
        }
    })

    expect(query).not.toBeNull()
    expect(query.username).toEqual('TestUser')
})

test('login', async () => {
    // const checkUser = await prisma.users.findMany()
    // console.log(checkUser)
    const test = await request(app)
        .post("/login")
        .type('form')
        .send({
            username: 'test',
            password: "testPassword"
        })
    expect(test.status).toBe(200)
    expect(test.body).toEqual({
        success: true,
        message: "User logged in successfully"
    })
})

test('check user profile', async() => {
    const checkUser = await prisma.users.findFirst()
    const testUser = checkUser.id
    // const login = await request(app)
    //     .post('/login')
    //     .type('form')
    //     .send({
    //         username: 'test',
    //         password: 'testPassword'
    //     })
    const test = await request(app)
        .get(`/${testUser}/profile`)
    expect(test.status).toBe(200)
})

test('edit user profile', async() => {
    const checkUser = await prisma.users.findFirst()
    const test = await request(app)
        .put(`/${checkUser.id}/profile/edit`)
        .type('form')
        .send({
            color: 'red',
            bio: 'updated bio',
            pfp: 'update.url'
        })
    expect(test.status).toBe(200)
})
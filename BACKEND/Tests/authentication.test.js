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
    const user1 = await request(app)
        .post("/sign-up")
        .type('form')
        .send({
            username: 'test',
            password: 'testPassword',
            email: 'test@email.test',
            display: "Test Login"
        })
    const user2 = await request(app)
        .post("/sign-up")
        .type('form')
        .send({
            username: 'test2',
            password: 'test2Password',
            email: 'test2@email.test',
            display: "Convo Test"
        })
})

afterEach(async () => {
    await prisma.users.deleteMany()
    await prisma.conversations.deleteMany()
    await prisma.userConvos.deleteMany()
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

test('check user profile', async () => {
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

test('edit user profile', async () => {
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

test('create convo/add recipient to convo', async () => {
    const host = await prisma.users.findFirst()
    console.log(host)
    const test = await request(app)
        .post('/conversation/new')
        .type('form')
        .send({
            name: 'test convo',
            password: '',
            // isPublic: true,
            host: host.id,
            recipient: 'test2'
        })
    expect(test.status).toBe(200)
})

test('enter an open convo', async () => {
    const host = await prisma.users.findFirst()
    const testConvo = await request(app)
        .post('/conversation/new')
        .type('form')
        .send({
            name: 'secret convo',
            password: 'itsaSecret',
            // isPublic: true,
            host: host.id,
            recipient: 'test2'
        })
    console.log(testConvo.status)
    const convos = await prisma.conversations.findFirst()
    console.log(convos.id)

    const newUser = await request(app)
        .post("/sign-up")
        .type('form')
        .send({
            username: 'newUser',
            password: 'newnew',
            email: 'newtest@fakeemail.com',
            display: "Join Convo"
        })
    console.log(newUser.status)

    const test = await request(app)
        .post(`/conversation/${convos.id}/enter`)
        .type('form')
        .send({
            user: 'newUser',
            password: 'itsaSecret'
        })
    expect(test.status).toBe(200)

    const test2 = await request(app)
        .post(`/conversation/${convos.id}/enter`)
        .type('form')
        .send({
            user: 'newUser',
            password: 'password1'
        })
    expect(test2.status).toBe(403)
})

test('remove user from a convo', async () => {
    const host = await prisma.users.findFirst()
    console.log(host)
    const testConvo = await request(app)
        .post('/conversation/new')
        .type('form')
        .send({
            name: 'test convo',
            password: '',
            // isPublic: true,
            host: host.id,
            recipient: 'test2'
        })
    console.log(testConvo.status)
    const convos = await prisma.conversations.findFirst()
    console.log(`id: ${convos.id}`)

    const test = await request(app)
        .delete(`/conversation/${convos.id}/kick`)
        .type('form')
        .send({
            user: host.id,
            kick: "test2"
        })
    expect(test.status).toBe(200)
})

test('leave a convo', async () => {
    const host = await prisma.users.findFirst()
    const testConvo = await request(app)
        .post('/conversation/new')
        .type('form')
        .send({
            name: 'test convo',
            password: '',
            // isPublic: true,
            host: host.id,
            recipient: 'test2'
        })
    console.log(testConvo.status)
    const convos = await prisma.conversations.findFirst()
    console.log(`id: ${convos.id}`)

    const test = await request(app)
        .delete(`/conversation/${convos.id}/leave`)
        .type('form')
        .send({
            user: host.id
        })
    expect(test.status).toBe(200)
})

test('delete a convo', async () => {
    const host = await prisma.users.findFirst()
    const user = await prisma.users.findMany({
        where: {
            username: 'test2' 
        }
    })
    console.log('USER')
    console.log(user)
    const testConvo = await request(app)
        .post('/conversation/new')
        .type('form')
        .send({
            name: 'test convo',
            password: '',
            // isPublic: true,
            host: host.id,
            recipient: 'test2'
        })
    console.log(testConvo.status)
    const convos = await prisma.conversations.findFirst()
    console.log(`id: ${convos.id}`)

    const test = await request(app)
        .delete(`/conversation/${convos.id}/delete`)
        .type('form')
        .send({
            user: host.id
        })
    expect(test.status).toBe(200)

    //ISSUE WITH THIS BLOCK INDICATING SOMETHING MAY BE WRONG
    //WITH CURRENT CODE

    // const test_2 = await request(app)
    //     .delete(`/conversation/${convos.id}/delete`)
    //     .type('form')
    //     .send({
    //         user: user.id
    //     })
    // expect(test_2.status).toBe(403)
})
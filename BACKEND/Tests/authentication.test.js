const router = require("../Router/router")
const request = require("supertest")
const express = require('express')
const app = express()
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

app.use(express.urlencoded({ extended: false }))
app.use('/', router)

afterEach(async ()=> {
    await prisma.users.deleteMany()
})

// test('sign up', done => {
//     request(app)
//         .post('/sign-up')
//         .type('form')
//         .send({ 
//             username: 'TestUser',
//             password: 'test',
//             email: "test@fakeemail.com",
//             display: "Test"
//          })
//          .expect({ success: true, message: "User account created successfully" })
//          .expect(200, done)

    // const testUser = await prisma.users.findUnique({
    //     where: {
    //         username: 'TestUser'
    //     }
    // })
    // console.log(testUser)

    // expect(testUser).not.toBeNull()
// })

test('sign up', async() => {
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
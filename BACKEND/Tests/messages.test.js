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
    const host = await prisma.users.findFirst()
    const convo = await request(app)
        .post('/conversation/new')
        .type('form')
        .send({
            name: 'Convo',
            password: '',
            host: host.id,
            recipient: 'test2'
        })
})

afterEach(async () => {
    await prisma.users.deleteMany()
    await prisma.conversations.deleteMany()
    await prisma.userConvos.deleteMany()
    await prisma.messages.deleteMany()
})

test('see all messages in a convo', async () => {
    const convo = await prisma.conversations.findFirst()
    const user = await prisma.users.findFirst()

    const message = await request(app)
    .post(`/conversation/${convo.id}/message/add`)
    .type('form')
    .send({
        message: 'test message goes here',
        user: user.username
    })
    const message2 = await request(app)
        .post(`/conversation/${convo.id}/message/add`)
        .type('form')
        .send({
            message: 'test message 2 goes here',
            user: user.username
        })

    const test = await request(app)
        .get(`/conversation/${convo.id}/messages`)
    expect(test.status).toBe(200)
    
    //Check DB has correct message count
    const messages = await prisma.messages.findMany({
        where: {
            convoId: convo.id
        }
    })
    expect(messages.length).toBe(2)
})

test('add a message to the convo', async () => {
    const convo = await prisma.conversations.findFirst()
    const user = await prisma.users.findFirst()
    // console.log(user)

    const test = await request(app)
        .post(`/conversation/${convo.id}/message/add`)
        .type('form')
        .send({
            message: 'test message goes here',
            user: user.username
        })
    expect(test.status).toBe(200)
})

test('edit existing message in a convo', async () => {
    const convo = await prisma.conversations.findFirst()
    const user = await prisma.users.findFirst()

    const message = await request(app)
        .post(`/conversation/${convo.id}/message/add`)
        .type('form')
        .send({
            message: 'test message goes here',
            user: user.username
        })

    const newMessage = await prisma.messages.findFirst({
        where: {
            convoId: convo.id
        }
    })
    console.log(newMessage)
    const test = await request(app)
        .put(`/conversation/${convo.id}/message/${newMessage.id}/edit`)
        .type('form')
        .send({
            message: 'updated message',
            user: user.id
        })
    expect(test.status).toBe(200)

    const test2 = await request(app)
        .put(`/conversation/${convo.id}/message/${newMessage.id}/edit`)
        .type('form')
        .send({
            message: 'updated message',
            user: 100
        })
    expect(test2.status).toBe(403)
})

test('delete message from convo', async () => {
    const convo = await prisma.conversations.findFirst()
    const user = await prisma.users.findFirst()

    const message = await request(app)
        .post(`/conversation/${convo.id}/message/add`)
        .type('form')
        .send({
            message: 'test message goes here',
            user: user.username
        })

    const newMessage = await prisma.messages.findFirst({
        where: {
            convoId: convo.id
        }
    })
    console.log(newMessage)

    const test2 = await request(app)
        .delete(`/conversation/${convo.id}/message/${newMessage.id}/delete`)
        .type('form')
        .send({
            user: (user.id+1)
        })
    expect(test2.status).toBe(403)

    const test = await request(app)
        .delete(`/conversation/${convo.id}/message/${newMessage.id}/delete`)
        .type('form')
        .send({
            user: user.id
        })
    expect(test.status).toBe(200)

    
})
const { PrismaClient } = require("@prisma/client")
const { connect } = require("../Router/router")

const prisma = new PrismaClient()

async function getConversations(req, res){
    const conversation = await prisma.conversations.findMany({
        where: {
            isPublic: true
        }
    })
    res.status(200).json({ conversations: conversation})
}

async function createConvo(req, res){
    const name = req.body.name
    const password = req.body.password
    const isPublic = req.body.isPublic
    const user = req.session.user
    const recipients = req.body.users

    const newConvo = await prisma.conversations.create({
        data:{
            name: name,
            password: password,
            isPublic: isPublic
        }
    })

    const host = await prisma.userConvos.create({
        data: {
            user: {
                connect: {
                    id: user.id
                }
            },
            convo: {
                connect: {
                    id: newConvo.id
                }
            },
            role: 'Admin'
        }
    })

    //Add recipients to convo
   res.status(200).json({ success: true })
}

async function addUserToConvo(req, res){
    const user = req.session.user
    const convoId = req.param.id
    const recipient = req.body.user

    const findUser = await prisma.users.findUnique({
        where:{
            username: recipient
        }
    })

    const addUser = await prisma.userConvos.create({
        data: {
            userId: {
                connect: {
                    id: findUser.id
                }
            },
            convoId: {
                connect: {
                    id: convoId
                }
            }
        }
    })
    res.status(200).json({ success: true })
}

async function enterConvo(req,res){
    const user = req.session.user
    const convoId = req.param.id
    const password = req.body.password

    const convo = await prisma.conversations.findUnique({
        where:{
            id: convoId
        }
    })

    if(convo.password != password){
        res.status(403).json({ message: 'Incorrect password' })
    }

    const entry = await prisma.userConvos.create({
        data: {
            user: {
                connect: {
                    id: user.id
                }
            },
            convo: {
                connect: {
                    id: convoId
                }
            }
        }
    })
    res.status(200).json({ success: true })
}

async function kickUser(req, res){
    const user = req.session.user
    const convoId = req.param.id
    const victim = req.body.user
    
    const findUser = await prisma.users.findUnique({
        where: {
            username: victim
        }
    })

    const userRole = await prisma.userConvos.findUnique({
        where: {
            userId: user.id,
            convoId: convoId
        }
    })

    if(userRole.role != 'Admin'){
        res.status(403).json({ message: 'User not authorized!' })
    }

    const removedUser = await prisma.userConvos.delete({
        where: {
            userId: findUser.id,
            convoId: convoId
        }
    })
    res.status(200).json({ success: true })
}

async function changeRole(req, res){
    const user = req.session.user
    const convoId = req.param.id
    const recipient = req.body.user
    const newRole = req.body.role

    const requester = await prisma.userConvos.findUnique({
        where:{
            userId: user.id,
            convoId: convoId
        }
    })

    const recipientUser= await prisma.user.findUnique({
        where:{
            username: recipient
        }
    })

    if(requester.id != user.id){
        res.status(403).json({ error: 'User not authorized!' })
    }

    const connection = await prisma.userConvos.update({
        where: {
            userId: recipientUser.id,
            convoId: convoId
        },
        data: {
            role: newRole
        }
    })
    res.status(200).json({ success: true })
}

async function leaveConvo(req, res){
    const user = req.session.user
    const convoId = req.param.id

    const convoConnection = await prisma.userConvos.findUnique({
        where: {
            userId: userId,
            convoId: convoId
        }
    })

    if(convoConnection != undefined){
        res.status(403).json({ message: 'Cannot find user in conversation' })
    }

    if(convoConnection.userId != user.id){
        res.status(403).json({ message: 'User not authorized!' })
    }

    const removedUserConvo = await prisma.userConvos.delete({
        where:{
            userId: userId,
            convoId: convoId
        }
    })
    res.status(200).json({ success: true })
}

async function deleteConversation(req, res){
    const convoId = req.param.id
    const user =  req.session.user

    const userRole = await prisma.userConvos.findUnique({
        where:{ 
            userId: user.id,
            convoId: convoId
        }
    })

    if(userRole.role != 'Admin'){
        return res.status(403).json({ error: 'User not authorized!' })
    }

    const deleteConvo = await prisma.conversations.delete({
        where:{
            id: convoId
        }
    })
    res.status(200).json({ success: true })
}
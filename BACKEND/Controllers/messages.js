const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function getMessages(req, res){
    const messages = await prisma.messages.findMany({
        where: {
            convoId: Number(req.param)
        }
    })
    res.status(200).json({ messges: messages})
}

async function createMessage(req, res){
    const message = req.body.message
    // const user = req.session.user
    const user = req.body.user
    const convo = req.params.id
    const newMessage = await prisma.messages.create({
        data: {
            message: message,
            author: {
                connect: {
                    username: user
                }
            },
            convo: {
                connect: {
                    id: convo
                }
            }
        }
    })
    res.status(200).json({ success: true })
}

async function editMessage(req, res){
    const newMessage = req.body.message
    const messageId = req.params.messageId
    // const user = req.session.user
    const user = req.body.user
    const message = await prisma.messages.findUnique({
        where: {
            id: messageId
        }
    })

    // if(message.authorId != user.id){
    //     return res.status(403).json({ error: 'User not authroized!' })
    // }

    const edit = await prisma.messages.update({
        where: {
            id: messageId
        },
        data: {
            message: newMessage
        }
    })
    res.status(200).json({ success: true })
}

async function deleteMessage(req, res){
    const messageId = req.param.id
    const user = req.session.user
    const message = await prisma.messages.findUnique({
        where:{
            id: messageId
        }
    })

    // const userRole = await prisma.users.findUnique({
    //     where:{
    //         id: user.id
    //         //find user role
    //     }
    // })

    // if(message.author != user.username || userRole.role != 'Admin'){
    //     return res.status(403).json({ error: 'User not authorized!' })
    // }

    const deleteMessage = await prisma.messages.delete({
        where: {
            id: messageId
        }
    })
    res.status(200).json({ success: true })
}

module.exports = {
    getMessages,
    createMessage,
    editMessage,
    deleteMessage
}
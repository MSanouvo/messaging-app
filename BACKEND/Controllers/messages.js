const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function getMessages(req, res){
    const messages = await prisma.messages.findMany({
        where: {
            convoId: Number(req.params.id)
        }
    })
    res.status(200).json({ messges: messages})
}

async function createMessage(req, res){
    const message = req.body.message
    // const user = req.session.user
    const user = req.body.user
    const convo = Number(req.params.id)
    const newMessage = await prisma.messages.create({
        data: {
            message: message,
            author: {
                connect: {
                    username: user
                }
            },
            conversation: {
                connect: {
                    id: convo
                }
            }
        }
    })
    console.log(newMessage)
    res.status(200).json({ success: true })
}

//CHANGE TO EDIT ONLY IF IT IS MOST RECENT MESSAGE
async function editMessage(req, res){
    const newMessage = req.body.message
    // console.log(newMessage)
    const convoId = Number(req.params.id)
    const messageId = Number(req.params.messageId)
    // const user = req.session.user
    const user = Number(req.body.user)
    const message = await prisma.messages.findFirst({
        where: {
            id: messageId,
            convoId: convoId
        }
    })
    console.log(message)
    if(message.authorId != user /* user.id */ ){
        return res.status(403).json({ error: 'User not authroized!' })
    }

    const edit = await prisma.messages.update({
        where: {
            id: messageId
        },
        data: {
            message: newMessage
        }
    })
    console.log(edit)
    res.status(200).json({ success: true })
}

async function deleteMessage(req, res){
    const messageId = Number(req.params.messageId)
    // const user = req.session.user
    const user = Number(req.body.user)
    const convoId = Number(req.params.id)
    const message = await prisma.messages.findFirst({
        where:{
            id: messageId,
            convoId: convoId
        }
    })
    const userRole = await prisma.userConvos.findFirst({
        where:{
            userId: user,
            convoId: convoId
        }
    })
    console.log(userRole)

    if(message.authorId != user /* user.id */ || userRole.role != 'Admin'){
        return res.status(403).json({ error: 'User not authorized!' })
    }

    const deleteMessage = await prisma.messages.delete({
        where: {
            id: messageId,
            convoId: convoId
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
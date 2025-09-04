const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function getConversations(req, res) {
    const conversation = await prisma.conversations.findMany({
        where: {
            isPublic: true
        }
    })
    res.status(200).json({ conversations: conversation })
}

async function createConvo(req, res) {
    const name = req.body.name
    const password = req.body.password
    const isPublic = req.body.isPublic
    // const user = req.session.user
    // Need to refactor host/recipient selection
    const user = req.body.host
    const recipients = req.body.recipient
    // ------------------------------------------
    const newConvo = await prisma.conversations.create({
        data: {
            name: name,
            password: password,
            isPublic: isPublic
        },
    })
    console.log(newConvo)
    const host = await prisma.userConvos.create({
        data: {
            user: {
                connect: {
                    id: Number(user),
                }
            },
            convo: {
                connect: {
                    id: Number(newConvo.id)
                }
            },
            role: 'Admin'
        }
    })
    console.log(host)
    await addUser(recipients, newConvo.id)
    // const recipient = await prisma.userConvos.create({
    //     data: {
    //         user: {

    //         }
    //     }
    // })
    //Add recipients to convo
    res.status(200).json({ success: true })
}

async function addUser(display, convo) {
    const user = await prisma.users.findUnique({
        where: {
            username: display
        }
    })

    const addUser = await prisma.userConvos.create({
        data: {
            user: {
                connect: {
                    id: Number(user.id)
                }
            },
            convo: {
                connect: {
                    id: Number(convo)
                }
            }
        }
    })
    console.log(addUser)
}

//Come back and test this later or find way to distinguish it
async function addUserToConvo(req, res) {
    const user = req.session.user
    const convoId = req.param.id
    const recipient = req.body.user
    await addUser(recipient, convoId)
    // const findUser = await prisma.users.findUnique({
    //     where:{
    //         username: recipient
    //     }
    // })

    // const addUser = await prisma.userConvos.create({
    //     data: {
    //         userId: {
    //             connect: {
    //                 id: findUser.id
    //             }
    //         },
    //         convoId: {
    //             connect: {
    //                 id: convoId
    //             }
    //         }
    //     }
    // })
    res.status(200).json({ success: true })
}

async function enterConvo(req, res) {
    // const user = req.session.user
    const user = req.body.user
    const convoId = req.params.id
    const password = req.body.password
    console.log(req.body)
    const convo = await prisma.conversations.findUnique({
        where: {
            id: Number(convoId)
        }
    })
    console.log(convo)
    if (convo.password != password) {
        res.status(403).json({ message: 'Incorrect password' })
    }

    await addUser(user, convoId)
    res.status(200).json({ success: true })
}

async function kickUser(req, res) {
    // const user = req.session.user
    const user = req.body.user
    const convoId = Number(req.params.id)
    const victim = req.body.kick

    const findUser = await prisma.users.findUnique({
        where: {
            username: victim
        }
    })

    const userRole = await prisma.userConvos.findFirst({
        where: {
            userId: Number(user),
            convoId: convoId
        }
    })
    console.log(userRole)

    if (userRole.role != 'Admin') {
        res.status(403).json({ message: 'User not authorized!' })
    }

    //SEE IF WE CAN SIMPLIFY THIS 
    const findUserConvo = await prisma.userConvos.findFirst({
        where: {
            userId: Number(findUser.id),
            convoId: convoId
        }
    })

    const removedUser = await prisma.userConvos.delete({
        where: {
            id: findUserConvo.id
        }
    })
    res.status(200).json({ success: true })
}

//NO ROUTE YET
async function changeRole(req, res) {
    const user = req.session.user
    const convoId = req.param.id
    const recipient = req.body.user
    const newRole = req.body.role

    const requester = await prisma.userConvos.findUnique({
        where: {
            userId: user.id,
            convoId: convoId
        }
    })

    const recipientUser = await prisma.user.findUnique({
        where: {
            username: recipient
        }
    })

    if (requester.id != user.id) {
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
//

async function leaveConvo(req, res) {
    // const user = req.session.user
    const user = req.body.user
    const convoId = Number(req.params.id)

    const convoConnection = await prisma.userConvos.findFirst({
        where: {
            userId: Number(user),
            convoId: convoId
        }
    })

    if (convoConnection === null) {
        res.status(403).json({ message: 'Cannot find user in conversation' })
    }

    if (convoConnection.userId != user /* user.id */) {
        res.status(403).json({ message: 'User not authorized!' })
    }

    const removedUserConvo = await prisma.userConvos.delete({
        where: {
            id: convoConnection.id
        }
    })
    res.status(200).json({ success: true })
}

async function deleteConversation(req, res) {
    const convoId = Number(req.params.id)
    // const user = req.session.user
    const user = Number(req.body.user)

    const userRole = await prisma.userConvos.findFirst({
        where: {
            userId: user.id,
            convoId: convoId
        }
    })
    console.log(userRole)
    if (userRole.role != 'Admin') {
        res.status(403).json({ error: 'User not authorized!' })
    }

    const deleteConvo = await prisma.conversations.delete({
        where: {
            id: convoId
        }
    })
    res.status(200).json({ success: true })
}

// async function addTestConvo(req, res){
//     const test = await prisma.conversations.create({

//     })
// }

module.exports = {
    getConversations,
    createConvo,
    addUserToConvo,
    enterConvo,
    kickUser,
    leaveConvo,
    deleteConversation,
    changeRole
}
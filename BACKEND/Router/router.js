const { Router } = require("express")
const authentication = require("../Controllers/authetication")
// const messageController = require("../Controllers/messages")
// const conversationController = require("../Controllers/conversations")
// const profileController = require("../Controllers/profiles")
const router = Router()

router.get("/users", authentication.getUsers)
router.post("/login", authentication.login)
router.post("/sign-up", authentication.signUp)
router.delete("/:user/delete", authentication.deleteUser)

// router.get("/:user/profile/", profileController.getProfile)
// router.put("/:user/profile/edit", profileController.editProfile)

// router.get("/conversation/all", conversationController.getConvos)
// router.post("/conversation/new", conversationController.createConvo)
// router.post("/conversation/:id/add", conversationController.addUserToConvo)
// router.post("/conversation/:id/enter", conversationController.enterConvo)
// router.delete("/conversation/:id/kick", conversationController.kickUserFromConvo)
// router.delete("/conversations/:id/leave", conversationController.leaveConvo)
// router.delete("/conversation/:id/delete", conversationController.deleteConversation)

// router.get("/conversation/:id/messages", messageController.getMessages)
// router.post("/conversation/:id/message/add", messageController.createMessage)
// router.put("/converstation/:id/message/:id/edit", messageController.editMessage)
// router.delete("/conversation:/id/message/:id/delete", messageController.deleteMessage)

module.exports = router
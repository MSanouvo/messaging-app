const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getProfile(req, res){
	// const user = req.session.user

    //USED PARAMS FOR TESTING NEED TO REFACTOR FOR REQ.SESSIONS AGAIN
    const user = req.params.user
	console.log(user)
	const profile = await prisma.profiles.findMany({
		where: {
			userId: Number(user)
		}
	})
	console.log(profile)
	res.status(200).json({ success: true, profile: profile })
}

//Call in the sign up route after user is successfully created
async function createProfile(userID){
	const newProfile = await prisma.profiles.create({
		data: {
			user: {
				connect: {
					id: userID.id
				}
			},
		}
	})
    // console.log(newProfile)
}

async function editProfile(req, res){
	// const user = req.session.user
    const user = req.params.user
	const color = req.body.color
	const bio = req.body.bio
	const pfp = req.body.url
	
	const checkProfile = await prisma.profiles.findMany({
		where: {
			userId: Number(user)
		}
	})
	
	// if(user.id != checkProfile.userId){
	// 	res.status(403).json({ error: 'User Not Authorized' })
	// }
	
	const editProfile = await prisma.profiles.updateMany({
		where: {
			userId: Number(user)
		},
		data: {
			bio: bio,
			color: color,
			pfp: pfp
		}
	})
	
	res.status(200).json({ success: true })
}

module.exports = {
    getProfile,
    createProfile,
    editProfile
}
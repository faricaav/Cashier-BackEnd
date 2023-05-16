const jwt = require("jsonwebtoken")
const SECRET_KEY = "Cafe"

auth = (role1, role2, role3) => {
    let role = [role1, role2, role3]
    return (req, res, next) => {
    let header = req.headers.authorization
    let token = header && header.split(" ")[1]

    let jwtHeader = {
        algorithm: "HS256"
    }
    if(token == null){
        res.status(401).json({ message: "Unauthorized"})
    }else{
        jwt.verify(token, SECRET_KEY, jwtHeader, (error,user) => {
            if (error) {
                res
                .status(401)
                .json({
                    message: "Invalid token"
                })
            } else {
                if(role.includes(user.resultUser.role)){
                    console.log(user);
                    next()
                } else {
                    return res.json({message: "You don't have access"})
                }
            }   
        })
    }
    }
}

module.exports = auth
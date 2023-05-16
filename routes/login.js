//import library
const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const model = require('../models/index');
const user = model.user

//import auth
const auth = require("../auth")
const jwt = require("jsonwebtoken")
const SECRET_KEY = "Cafe"

app.post("/", async (req,res) => {
    let data= {
        username: req.body.username,
        password: md5(req.body.password)
    }

    const resultUser = await user.findOne({where: data})
    if (resultUser){
        let payload = {resultUser}
        // generate token
        let token = jwt.sign(payload, SECRET_KEY, {expiresIn: "1d"})
        res.json({
            logged: true,
            data: resultUser,
            token: token
        })
    } else{
        res.json({
            logged: false,
            message: "Invalid username or password"
        })
    }
})

module.exports = app
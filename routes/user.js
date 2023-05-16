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

const auth = require('../auth')

//endpoint menampilkan semua data user, method: GET, function: findAll()
app.get("/", auth("manajer", "kasir", 'admin'), (req,res) => {
    user.findAll()
        .then(result => {
            res.json({
                user : result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//endpoint untuk menampilkan data user berdasarkan id
app.get("/:id", auth("manajer", "admin"), (req, res) =>{
    user.findOne({ where: {id_user: req.params.id}})
    .then(result => {
        res.json({
            user: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})
//endpoint untuk menyimpan data user, METHOD: POST, function: create
app.post("/", auth("admin"), async(req,res) => {
    let data = {
        nama_user : req.body.nama_user,
        password : md5(req.body.password),
        role: req.body.role
    }

    const query = {
        username : req.body.username
    }

    const resultuser = await user.findOne({where: query})

    if(resultuser){
        return res.json({message: "Username has been used"})
    } else {
        data.username = query.username 
        user.create(data)
            .then(result => {
                res.json({
                    message: "data has been inserted"
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
    }
})

//endpoint mengupdate data user, METHOD: PUT, function:update
app.put("/:id", auth("manajer", "admin"), (req,res) => {
    let param = {
        id_user : req.params.id
    }
    let data = {
        nama_user : req.body.nama_user,
        username : req.body.username,
        password : md5(req.body.password),
        role: req.body.role
    }
    user.findOne({where: {username: req.body.username}})
    .then(existingUser => {
        if (existingUser && existingUser.id_user !== Number(param.id_user)) {
            // If the username already exists and it's not the same user being updated,
            // then respond with an error message.
            res.json({
                message: "Username already taken"
            })
        } else {
            // If the username is available, proceed with updating the user's data.
            user.update(data, {where: param})
                .then(result => {
                    res.json({
                        message: "Data has been updated"
                    })
                })
                .catch(error => {
                    res.json({
                        message: error.message
                    })
                })
        }
    })
})

//endpoint menghapus data user, METHOD: DELETE, function: destroy
app.delete("/:id", auth("manajer", "admin"), (req,res) => {
    let param = {
        id_user : req.params.id
    }
    user.destroy({where: param})
        .then(result => {
            res.json({
                message: "data has been deleted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

module.exports = app
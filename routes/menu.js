//import library
const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');

//implementasi library
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import multer
const multer = require("multer")
const path = require("path")
const fs = require("fs")

//import model
const model = require('../models/index');
const menu = model.menu

const auth = require("../auth")

//config storage image
const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,"./image")
    },
    filename: (req,file,cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

//endpoint menampilkan semua data menu, method: GET, function: findAll()
app.get("/", auth("kasir","admin","manajer"), (req,res) => {
    menu.findAll()
        .then(result => {
            res.json({
                menu : result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//endpoint untuk menampilkan data menu berdasarkan id
app.get("/:id", auth("kasir","admin"), (req, res) =>{
    menu.findOne({ where: {id_menu: req.params.id}})
    .then(result => {
        res.json({
            menu: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.get("/makanan", auth("manajer", "admin", "kasir"), (req, res) =>{
    menu.findAll({ where: {jenis: 'makanan'}})
    .then(result => {
        res.json({
            menu: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//endpoint untuk menyimpan data menu, METHOD: POST, function: create
app.post("/", auth("kasir","admin"), upload.single("gambar"), (req,res) => {
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            nama_menu : req.body.nama_menu,
            jenis: req.body.jenis,
            deskripsi: req.body.deskripsi,
            gambar: req.file.filename,
            harga: req.body.harga
        }

        if(data.harga>0){
        menu.create(data)
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
        } else {
            res.json({
                message: "price can not smaller than 0"
            })
        }
    }
})

//endpoint mengupdate data menu, METHOD: PUT, function:update
app.put("/:id", auth("kasir","admin"), upload.single("gambar"), (req,res) => {
    let param = {
        id_menu : req.params.id
    }
    let data = {
        nama_menu : req.body.nama_menu,
        jenis: req.body.jenis,
        deskripsi: req.body.deskripsi,
        harga: req.body.harga
    }
    if (req.file) {
        // get data by id
        const row = menu.findOne({where: param})
        .then(result => {
            let oldFileName = result.gambar
           
            // delete old file
            let dir = path.join(__dirname,"../image",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            console.log(error.message);
        })

        // set new filename
        data.gambar = req.file.filename
    }
    if(data.harga>0){
    menu.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    } else {
        res.json({
            message: "price can not smaller than 0"
        })
    }
})

//endpoint menghapus data menu, METHOD: DELETE, function: destroy
app.delete("/:id", auth("kasir","admin"), (req,res) => {
    let param = {
        id_menu : req.params.id
    }
    menu.destroy({where: param})
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
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
const meja = model.meja

const auth = require('../auth')

//endpoint menampilkan semua data meja, method: GET, function: findAll()
app.get("/", auth("kasir","admin","manajer"), (req,res) => {
    meja.findAll()
        .then(result => {
            res.json({
                meja : result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//endpoint untuk menampilkan data meja berdasarkan id
app.get("/:id", auth("kasir","admin"), (req, res) =>{
    meja.findOne({ where: {id_meja: req.params.id}})
    .then(result => {
        res.json({
            meja: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//endpoint untuk menyimpan data meja, METHOD: POST, function: create
app.post("/", auth("kasir","admin"), async (req,res) => {
    let data = {
        nomor_meja: req.body.nomor_meja,
        status: req.body.status
    }

    meja.create(data)
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
})

//endpoint mengupdate data meja, METHOD: PUT, function:update
app.put("/:id", auth("kasir","admin"), (req,res) => {
    let param = {
        id_meja : req.params.id
    }
    let data = {
        nomor_meja: req.body.nomor_meja,
        status: req.body.status
    }
    meja.update(data, {where: param})
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
})

//endpoint menghapus data meja, METHOD: DELETE, function: destroy
app.delete("/:id", auth("kasir","admin"), (req,res) => {
    let param = {
        id_meja : req.params.id
    }
    meja.destroy({where: param})
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
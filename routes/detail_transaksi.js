//import express
const express = require("express")
const app = express()
app.use(express.json())

//import model
const model = require("../models/index")
const detail_transaksi = model.detail_transaksi

const auth = require('../auth')

//endpoint untuk menampilkan semua data transaksi
app.get("/", auth("kasir","manajer","admin"), async (req, res) =>{
    let result = await detail_transaksi.findAll({
        include: [
            "transaksi",
            "menu"
        ]
    })
    res.json(result)
})

//endpoint untuk menampilkan data transaksi berdasarkan id
app.get("/:id", auth("kasir","manajer","admin"), async (req, res) =>{
    let param = { id_detail_transaksi: req.params.id}
    let result = await detail_transaksi.findOne({
        where: param,
        include: [
            "transaksi",
            "menu"
        ]
    })
    res.json(result)
})

module.exports = app
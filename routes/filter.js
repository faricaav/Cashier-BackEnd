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
const menu = model.menu
const meja = model.meja
const transaksi = model.transaksi
const detail_transaksi = model.detail_transaksi
const sequelize = require('sequelize')

const auth = require('../auth')

app.get("/admin", auth("manajer", "admin"), (req, res) =>{
    user.findAll({ where: {role: 'admin'}})
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

app.get("/manajer", auth("manajer", "admin"), (req, res) =>{
    user.findAll({ where: {role: 'manajer'}})
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

app.get("/kasir", auth("manajer", "admin"), (req, res) =>{
    user.findAll({ where: {role: 'kasir'}})
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

app.get("/minuman", auth("manajer", "admin", "kasir"), (req, res) =>{
    menu.findAll({ where: {jenis: 'minuman'}})
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

app.get("/tersedia", auth("manajer", "admin", "kasir"), (req, res) =>{
    meja.findAll({ where: {status: 'tersedia'}})
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

app.get("/tidak_tersedia", auth("manajer", "admin", "kasir"), (req, res) =>{
    meja.findAll({ where: {status: 'tidak_tersedia'}})
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

app.get("/lunas", auth("manajer", "admin", "kasir"), (req, res) =>{
    transaksi.findAll({ where: {status: 'lunas'}, include: [
        "user",
        "meja",
        {
            model: model.detail_transaksi,
            as : "detail_transaksi",
            include: ["menu"]
        }
    ]})
    .then(result => {
        res.json({
            transaksi: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.get("/belum_bayar", auth("manajer", "admin", "kasir"), (req, res) =>{
    transaksi.findAll({ where: {status: 'belum_bayar'}, include: [
        "user",
        "meja",
        {
            model: model.detail_transaksi,
            as : "detail_transaksi",
            include: ["menu"]
        }
    ]})
    .then(result => {
        res.json({
            transaksi: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.get("/most", async (req, res) =>{
    const result = await detail_transaksi.findAll({
        attributes: [
          'id_menu', // Group by id_menu
          [sequelize.fn('sum', sequelize.col('qty')), 'total_qty'] // Sum the qty for each id_menu
        ],
        include: [
                "transaksi",
                "menu"
        ],
        group: ['id_menu'], // Group by id_menu
        order: [[sequelize.literal('total_qty'), 'DESC']], // Order by total_qty in descending order
    });
  
    const mostOrderedItem = result[0]; // retrieve the menu item with the highest total_qty
    res.send(mostOrderedItem); 
})

module.exports = app
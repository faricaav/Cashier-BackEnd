//import express
const express = require("express")
const app = express()
app.use(express.json())
const {Op, literal} = require("sequelize")

//import model
const model = require("../models/index")
const transaksi = model.transaksi
const detail_transaksi = model.detail_transaksi
const menu = model.menu
const meja = model.meja
const user = model.user
const moment = require('moment-timezone');

const auth = require('../auth')

const toISOString = (date) => {
    var tzo = -date.getTimezoneOffset(), 
        dif = tzo>=0?'+':'-',
        pad = function(num){
            var norm = Math.floor(Math.abs(num))
            return (norm<10?'0':'')+norm
        }
    return date.getFullYear()+
        '-'+pad(date.getMonth()+1)+
        '-'+pad(date.getDate())+
        'T'+pad(date.getHours())+
        ':'+pad(date.getMinutes())+
        ':'+pad(date.getSeconds())+
        '.'+pad(date.getMilliseconds())+'Z'
}

//endpoint untuk menampilkan semua data transaksi
app.get("/", auth("kasir","manajer","admin"), async (req, res) =>{
    let result = await transaksi.findAll({
        include: [
            "user",
            "meja",
            {
                model: model.detail_transaksi,
                as : "detail_transaksi",
                include: ["menu"]
            }
        ]
    })
    res.json(result)
})

//endpoint untuk menampilkan data transaksi berdasarkan id
app.get("/:id", auth("kasir","manajer","admin"), async (req, res) =>{
    let param = { id_transaksi: req.params.id}
    let result = await transaksi.findOne({
        where: param,
        include: [
            "user",
            "meja",
            {
                model: model.detail_transaksi,
                as : "detail_transaksi",
                include: ["menu"]
            }
        ]
    })
    res.json(result)
})

app.get("/byUser/:id", auth("kasir","manajer","admin"), async (req, res) =>{
    let param = { id_user: req.params.id}
    let result = await transaksi.findAll({
        where: param,
        include: [
            "user",
            "meja",
            {
                model: model.detail_transaksi,
                as : "detail_transaksi",
                include: ["menu"]
            }
        ]
    })
    res.json(result)
})

//endpoint untuk menambahkan data transaksi baru
app.post("/", auth("kasir","manajer","admin"), async (req, res) =>{
    let current = new Date(Date.now())
    let data = {
        tgl_transaksi: toISOString(current),
        id_user: req.body.id_user,
        nama_pelanggan: req.body.nama_pelanggan,
        status: req.body.status
    }
    const query_meja = {
        id_meja : req.body.id_meja
    }
    const resultMeja = await meja.findOne({where: query_meja})

    if(resultMeja.status==="tidak_tersedia"){
        return res.json({message: "Meja tidak tersedia"})
    } else {
        data.id_meja = query_meja.id_meja
        transaksi.create(data)
        .then(result => {
            console.log(result)
            let lastID = result.id_transaksi
            detail = req.body.detail_transaksi
            detail.forEach(async element => {
                element.id_transaksi = lastID
            });
            meja.findOne({where: query_meja})
            .then(result=>{
                let query={
                    status: "tidak_tersedia"
                }
                let param={
                    id_meja:result.id_meja
                }
                meja.update(query,{where: param})
            })
            .catch(error=>{
                res.json({
                    message: error.message
                });
            });
            detail_transaksi.bulkCreate(detail)
                res.json({
                    message: "Data has been inserted"
                })
            })
            .catch(error => {
                res.json({
                    message: error.message
                })
            })
        .catch(error=>{
            res.json({
                message: error.message
            });
        });
    }
})

// endpoint update data transaksi
app.put("/:id", auth("kasir","manajer","admin"), async (req, res) => {
  let param = {
    id_transaksi: req.params.id
  }
  let data = {
    status: req.body.status,
    
  };
  transaksi
  .update(data, { where: param })
  .then(async (result) => {
    if(data.status==="lunas"){
      let result =  await transaksi.findOne({where: param})
      console.log(result)
      const query_meja = {
        id_meja : result.id_meja
      }
      console.log(query_meja.id_meja)
      let data = {
        status: 'tersedia'
      }
      meja.update(data, {where: query_meja})
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
    } else {
        let result =  await transaksi.findOne({where: param})
        console.log(result)
        const query_meja = {
          id_meja : result.id_meja
        }
        console.log(query_meja.id_meja)
        let data = {
          status: 'tidak_tersedia'
        }
        meja.update(data, {where: query_meja})
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
  .catch((error) => {
    return res.json({
      message: error.message,
    });
  })
});

// filtering data transaksi berdasarkan nama karyawan
app.get('/user/:id_user', (req,res) => {
    let indicator = {id_user: req.params.id_user}
    transaksi.findAll({
        where: indicator,
        order: [
            ["tgl_transaksi", "DESC"]
        ],
    })
    .then(result => {
        res.json(result)
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

// filtering data transaksi berdasarkan tanggal tertentu
app.post('/tanggal', (req,res) => {
    let tgl_transaksi_awal = moment(req.body.tgl_transaksi_awal).tz('Asia/Jakarta').format('YYYY-MM-DD');
    let tgl_transaksi_akhir = moment(req.body.tgl_transaksi_akhir).tz('Asia/Jakarta').format('YYYY-MM-DD');
    if(tgl_transaksi_akhir === tgl_transaksi_awal){
        console.log("true")
    }
    console.log(tgl_transaksi_akhir, tgl_transaksi_awal)
    if(tgl_transaksi_akhir != tgl_transaksi_awal){
    transaksi.findAll({
        where: {
            tgl_transaksi: {
                [Op.between]: [
                    literal(`DATE('${tgl_transaksi_awal}')`),
                    literal(`DATE('${tgl_transaksi_akhir}')`)
                ]
            }
        },
        order: [
            ["tgl_transaksi", "DESC"]
        ],
        include: [
            "user",
            "meja",
            {
                model: model.detail_transaksi,
                as : "detail_transaksi",
                include: ["menu"]
            }
        ]
    })
    .then(result => {
        res.json(result)
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })} else if(tgl_transaksi_akhir == tgl_transaksi_awal){
        transaksi.findAll({
            where: {
                [Op.and]: [
                    literal(`DATE(tgl_transaksi) = '${tgl_transaksi_awal}'`)
                ]
            },
            include: [
                "user",
                "meja",
                {
                    model: model.detail_transaksi,
                    as : "detail_transaksi",
                    include: ["menu"]
                }
            ]
        })
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    }
})

//endpoint untuk menghapus data transaksi
app.delete("/:id", auth("kasir","manajer","admin"), async (req, res) =>{
    let param = { id_transaksi: req.params.id}
    try {
        await detail_transaksi.destroy({where: param})
        await transaksi.destroy({where: param})
        res.json({
            message : "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = app
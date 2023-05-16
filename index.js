//import
const express = require('express');
const cors = require('cors');

//implementasi
const app = express();
app.use(cors());

//endpoint nanti ditambahkan di sini
//endpoint user
const user = require('./routes/user');
app.use("/user", user)

//endpoint menu
const menu = require('./routes/menu');
app.use("/menu", menu)

//endpoint meja
const meja = require('./routes/meja');
app.use("/meja", meja)

//endpoint transaksi
const transaksi = require('./routes/transaksi');
app.use("/transaksi", transaksi)

//endpoint detail transaksi
const detail_transaksi = require('./routes/detail_transaksi');
app.use("/detail_transaksi", detail_transaksi)

//endpoint login
const login = require('./routes/login');
app.use("/login", login)

const filter = require('./routes/filter');
app.use("/filter", filter)

app.use(express.static(__dirname))

//run server
app.listen(8080, () => {
    console.log('server run on port 8080')
})

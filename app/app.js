const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRouter = require("./routes/user.routes")

const db = require('./config/database');

mongoose.connect(db());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//--------------------------------------> routes
// app.get('/', (req, res) => {
//     res.status(200).json({
//         name: 'Foo Fooing Bar'
//     });
// });

app.use("/user", userRouter)

//--------------------------------------> misc
//404
app.use((req, res, next) => {
    return res.status(404).send('404 - Page Not Found.');
});

//500
app.use((err, req, res) => {
    res.status = err.status || 500;
    return res.send(res.status + '. An unknown error has occured.');
});


module.exports = app;
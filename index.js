const express = require('express');

const port = 8080;
const app = express();


app.get('/' , (req , res) => {
    res.json({
        location : 'home',
        path : __dirname
    });
})

app.get('/download' , (req , res) => {
    res.json({
        location : 'download',
        path : __dirname
    });
})



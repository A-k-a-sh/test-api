const express = require('express');

const port = 8080;
const app = express();


app.listen(port , () => {
    console.log(`App is listening at port: ${port}`);
})


const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
    path: './config.env',
});

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app running on port ${port}.......`);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB)
    .then(() => {
        console.log('DB is connected');
    })
    .catch((err) => console.error('DB IS NOT CONNECTED\n', err));

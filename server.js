const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
    path: './config.env',
});

// process.on('uncaughtException', (err) => {
//     console.log(err.name, err.message);
//     console.log('UNCAUGHT EXCEPTION, SHUTING DOWN.......');
//     process.exit(1);
// });

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app running on port ${port}.......`);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => {
    console.log('DB is connected');
});
//.catch((err) => console.error('DB IS NOT CONNECTED\n', err));

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION, SHUTING DOWN.......');
    server.close(() => {
        process.exit(1);
    });
});

const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.checkId = (req, res, next, val) => {
    console.log(`tour id: ${val}`);
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }
    next();
};

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(404).json({
            status: 'fail',
            message: 'Missing name or price',
        });
    }
    next();
};

exports.getAllTours = function (req, res) {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        arrivalTime: req.requestTime,
        results: tours.length,
        data: {
            tours: tours,
        },
    });
};

exports.getTour = function (req, res) {
    const id = req.params.id * 1;

    const tour = tours.find((el) => el.id === id);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tour,
        },
    });
};

exports.updateTour = function (req, res) {
    const id = req.params.id * 1;

    const tour = tours.find((el) => el.id === id);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tour: 'updating data...',
        },
    });
};

exports.createTour = function (req, res) {
    const newId = tours[tours.length - 1].id + 1;
    const newTours = Object.assign({ id: newId }, req.body);
    tours.push(newTours);

    fs.writeFile(`./dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTours,
            },
        });
    });
};

exports.deleteTour = function (req, res) {
    const id = req.params.id * 1;

    const tour = tours.find((el) => el.id === id);

    // delete tour
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tour: null,
        },
    });
};

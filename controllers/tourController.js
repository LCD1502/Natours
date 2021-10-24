const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

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

    if (!tour) {
        return res.status(404).json({
            status: 'error',
            message: 'Invalid ID',
        });
    }
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

    if (!tour) {
        return res.status(404).json({
            status: 'error',
            message: 'Invalid ID',
        });
    }
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

    if (!tour) {
        return res.status(404).json({
            status: 'error',
            message: 'Invalid ID for delete',
        });
    }
    // delete tour
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tour: null,
        },
    });
};

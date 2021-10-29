// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const Tour = require('../models/tourModel');

// exports.checkId = (req, res, next, val) => {
//     console.log(`tour id: ${val}`);
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID',
//         });
//     }
//     next();
// };

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Missing name or price',
//         });
//     }
//     next();
// };

exports.getAllTours = async (req, res) => {
    try {
        // build query
        // 1a) filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];

        excludeFields.forEach((field) => {
            delete queryObj[field];
        });
        console.log(req.query);
        console.log(queryObj);

        // 1b) advance filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        console.log(JSON.parse(queryStr));

        const query = Tour.find(JSON.parse(queryStr));

        // execute query
        const tours = await query;
        // const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        //send response
        res.status(200).json({
            status: 'success',
            arrivalTime: req.requestTime,
            results: tours.length,
            data: {
                tours: tours,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail to get all tours',
            message: err,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        //Tour.findOne({_id: req.params.id})
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to get tour',
            message: err,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to update tour',
            message: err,
        });
    }
};

exports.createTour = async (req, res) => {
    // const newTour = new Tour();
    // newTour.save();
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail to create tour',
            message: err,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'deleted',
            data: null,
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to delete tour',
            message: err,
        });
    }
};

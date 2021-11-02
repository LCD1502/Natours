// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
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

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;
        // const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        //SEND RESPONSE
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

//  Aggregation Pipeline: Matching and Grouping
exports.getTourStats = async (req, res) => {
    try {
        const tourStats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
            {
                $sort: { avgPrice: 1 },
            },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                tourStats,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to stats tours',
            message: err,
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            {
                $addFields: { month: '$_id' },
            },
            {
                $project: {
                    _id: 0,
                },
            },
            {
                $sort: { month: 1 },
            },
            // {
            //     $limit: 12,
            // }
        ]);

        res.status(201).json({
            status: 'success',
            data: {
                plan,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail to get monthly plan',
            message: err,
        });
    }
};

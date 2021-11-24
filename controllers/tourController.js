const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//  Aggregation Pipeline: Matching and Grouping
exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) return next(new AppError('Please provide latitutr and longitude in the format lat,lgn.', 400));

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) return next(new AppError('Please provide latitutr and longitude in the format lat,lgn.', 400));

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});

// catchAsync(async (req, res, next) => {
//     // EXECUTE QUERY
//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     const tours = await features.query;
//     // const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

//     //SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         arrivalTime: req.requestTime,
//         results: tours.length,
//         data: {
//             tours: tours,
//         },
//     });
// });

// catchAsync(async (req, res, next) => {
//     //Tour.findOne({_id: req.params.id})
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     if (!tour) {
//         const err = new AppError('No tour found', 404);
//         return next(err);
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//     });
//     if (!tour) {
//         const err = new AppError('No tour found', 404);
//         return next(err);
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//     // const newTour = new Tour();
//     // newTour.save();
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour,
//         },
//     });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//         const err = new AppError('No tour found', 404);
//         return next(err);
//     }
//     res.status(204).json({
//         status: 'deleted',
//         data: null,
//     });
// });

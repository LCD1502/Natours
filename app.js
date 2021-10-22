const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`));

const getAllTours = function (req, res) {
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

const getTour = function (req, res) {
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

const updateTour = function (req, res) {
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

const createTour = function (req, res) {
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

const deleteTour = function (req, res) {
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

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.post('/api/v1/tours', createTour);

// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);

const port = 3000;
app.listen(port, () => {
    console.log(`app running on port ${port}`);
});

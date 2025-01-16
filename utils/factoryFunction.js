const APIFeatures = require('./APIFeatures');
const AppError = require('./AppError');
const catchAsync = require('./catchAsync');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const deleteDocument = await model.findByIdAndDelete(req.params.id);

    if (!deleteDocument) {
      return next(new AppError('Cannot find this ID', 404));
    }

    res.status(204).json({
      status: 'success',
    });
  });

exports.updateOne = (model, dataName) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!updatedDoc) {
      return next(new AppError('Cannot find this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      [dataName]: { updatedDoc },
    });
  });

exports.createOne = (model, dataName) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        [dataName]: newDoc,
      },
    });
  });

exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    // await Tour.findOne({_id: req.params.id})
    let query = Model.findById(req.params.id);
    if (populateOption) {
      query = query.populate(populateOption);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('Cant find the doc with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, dataName) =>
  catchAsync(async (req, res, next) => {

    // For GET endpoint reviews on tour
    let filterObject = {};
    if (req.params.tourId) filterObject = { tour: req.params.tourId };

    // Execute query
    const features = new APIFeatures(Model.find(filterObject), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      [dataName]: doc,
    });
  });

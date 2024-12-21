const express = require('express');
const Ajv = require('ajv');
const createError = require('http-errors');
const router = express.Router();
const { Garden } = require('../../models/garden');
const { addGardenSchema, updateGardenSchema } = require('../../schemas');

const ajv = new Ajv();
const validateAddGarden = ajv.compile(addGardenSchema);
const validateUpdateGarden = ajv.compile(updateGardenSchema);

// find all gardens
router.get('/', async (req, res, next) => {
  try {
    const gardens = await Garden.find({});
    res.send(gardens);
  } catch (err) {
    console.error(`Error while getting gardens: ${err}`);
    next(err);
  }
});

// find a garden by Id
router.get('/:gardenId', async (req, res, next) => {
  try {
    const garden = await Garden.findOne({ gardenId: req.params.gardenId });
    res.send(garden);
  } catch (err) {
    console.error(`Error while getting garden: ${err}`);
    next(err);
  }
});

// add a garden
router.post('/', async (req, res, next) => {
  try {
    const valid = validateAddGarden(req.body);

    if(!valid) {
      return next(createError(400, ajv.errorsText(validateAddGarden.errors)));
    }

    const newGarden = new Garden(req.body);
    await newGarden.save();

    res.send({
      message: 'Garden created successfully',
      gardenId: newGarden.Garden
    });
  } catch (err) {
    console.error(`Error while creating garden: ${err}`);
    next(err);
  }
});

// update a garden
router.patch('/:gardenId', async (req, res, next) => {
  try {
    const garden = await Garden.findOne({ gardenId: req.params.gardenId });

    const valid = validateUpdateGarden(req.body);

    if(!valid) {
      return next(createError(400, ajv.errorsText(validateAddGarden.errors)));
    }

    garden.set({
      name: req.body.name,
      location: req.body.location,
      description: req.body.description
    });

    await garden.save();

    res.send({
      message: 'Garden updated successfully',
      gardenId: garden.gardenId
    })
  } catch (err) {
    console.error(`Error while updating garden: ${err}`);
    next(err);
  }
});

// delete a garden
router.delete('/:gardenId', async (req, res, next) => {
  try {
    await Garden.deleteOne({ gardenId: req.params.gardenId });
    res.send({
      message: 'Garden deleted successfully',
      gardenId: req.params.gardenId
    });
  } catch (err) {
    console.error(`Error while deleting garden: ${err}`);
    next(err);
  }
});

module.exports = router;
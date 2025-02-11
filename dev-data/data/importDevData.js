const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `../../config.env` });
// const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const userModel = require('../../models/userModel');

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

// Read JSON file
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    await userModel.create(users, {validateBeforeSave: false});
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete all data from collections

const deleteAllData = async () => {
  try {
    await userModel.deleteMany();
    console.log('Data deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteAllData();
}

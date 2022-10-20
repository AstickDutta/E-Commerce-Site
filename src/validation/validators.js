const mongoose = require("mongoose");


const isValid = function (value) {
  if (typeof value == undefined || value == null || value.length == 0 )
    return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidSize = function (size) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) !== -1;
};

const isValidPrice = (value) => {
  const regEx =/^[1-9]\d{0,8}(?:\.\d{1,2})?$/
  const result = regEx.test(value)
  return result
};

const isValidBody = function (data) {
  return Object.keys(data).length > 0;
};


const isValidPassword = function (password) {
  return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(
    password
  );
};


const isValidName = function (name) {
  if (/^[a-z ,.'-]+$/i.test(name)) return true;
  return false;
};

const isValidWords = function (name) {
  if (/^[a-z0-9 ,.#@*&%$-]+$/i.test(name)) return true;
  return false;
};

const isValidNumber = function (number) {
  if (/^[0]?[6789]\d{9}$/.test(number)) return true;
  return false;
};

const isValidNumbers = function (value){
  let user = /^[0-9]+$/.test(value)
  return user
}

const isValidId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidPincode = function (pincode){
  return /^[1-9][0-9]{5}$/.test(pincode);
};

const isValidEmail = function (mail) {
  if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
};

const isValidAvailableSizes = (availablesizes) => {
  for( i=0 ;i<availablesizes.length; i++){
    if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availablesizes[i])) return false
  }
  return true
};

const isValidFile = (img) => {
  const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
  return regex
}






module.exports = {
  isValid,
  isValidBody,
  isValidPassword,
  isValidName,
  isValidNumber,
  isValidId,
  isValidPincode,
  isValidEmail,
  isValidSize,
  isValidPrice,
  isValidAvailableSizes,
  isValidNumbers,
  isValidWords,
  isValidFile
};
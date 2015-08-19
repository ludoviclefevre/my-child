'use strict';

var express = require('express');
var controller = require('./tools.controller');

var router = express.Router();

router.get('/throwException', controller.throwException);

module.exports = router;

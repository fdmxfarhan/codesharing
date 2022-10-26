var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res, next) => {
    if(req.user){
        res.redirect('/dashboard');
    }
    else{
        res.render('home');
    }
});

module.exports = router;

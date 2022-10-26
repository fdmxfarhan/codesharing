var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
const bcrypt = require('bcryptjs');
const mail = require('../config/mail');
const passport = require('passport');
const sms2 = require('../config/sms2');
const sms = require('../config/sms');
const generateCode = require('../config/generateCode');

router.get('/register', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('register');
});

router.get('/login', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('login');
});
  
router.post('/register', (req, res, next) => {
    const { firstName, lastName, phone, idNumber, password, configpassword } = req.body;
    const role = 'user', card = 0;
    const ipAddress = req.connection.remoteAddress;
    let errors = [];
    /// check required
    if(!firstName || !lastName || !phone || !idNumber || !password || !configpassword){
        errors.push({msg: 'لطفا موارد خواسته شده را کامل کنید!'});
    }
    /// check password match
    if(password !== configpassword){
        errors.push({msg: 'تایید رمز عبور صحیح نمیباشد!'});
    }
    /// check password length
    if(password.length < 4){
        errors.push({msg: 'رمز عبور شما بسیار ضعیف میباشد!'});
    }
    ///////////send evreything 
    if(errors.length > 0 ){
        res.render('register', { firstName, lastName, phone, idNumber, errors});
    }
    else{
        const fullname = firstName + ' ' + lastName;
        // validation passed
        User.findOne({ idNumber: idNumber})
            .then(user =>{
            if(user){
                // user exist
                errors.push({msg: 'کد ملی قبلا ثبت شده است.'});
                res.render('register', { firstName, lastName, phone, idNumber, errors });
            }
            else {
                const newUser = new User({ipAddress, fullname, firstName, lastName, phone, idNumber, password, role, card});
                // Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                    .then(user => {
                        req.flash('success_msg', 'ثبت نام با موفقیت انجام شد. اکنون میتوانید وارد شوید.');
                        res.redirect('/users/login');
                         
                    }).catch(err => console.log(err));
                }));
                console.log(newUser);
            }
        });
    }  
});
  
router.post('/send-sms', (req, res, next) => {
    var {phone} = req.body;
    var smsCode = generateCode(6);
    sms(phone, `کد تایید شما ${smsCode}`);
    User.findOne({phone}, (err, user) => {
        if(user){
            User.updateMany({_id: user._id}, {$set: {smsCode}}, (err, doc) => {
                res.render('./confirm', {user});
            })
        }
        else{
            var newUser = new User({
                phone,
                smsCode,
                role: 'user',
                dateOfRegisteration: new Date(),
                profileCompeleted: false,
            });
            newUser.save().then(doc => {
                res.render('./confirm', {user: newUser});
            }).catch(err => console.log(err));
        }
    })
})
router.post('/login', function(req, res, next){
    const { userID, confcode } = req.body;
    User.findById(userID, (err, user) => {
        if(user.smsCode == confcode){
            if(user.profileCompeleted){
                passport.authenticate('local', {
                    successRedirect: '/dashboard?login=true',
                    failureRedirect: '/users/login',
                    failureFlash: true
                })(req, res, next);
            }
            else{
                res.render('./register', {user});
            }
        }
        else{
            res.render('./confirm', {
                user,
                errors: [{msg: 'کد تایید اشتباه وارد شده.'}],
            });
        }
    })
});
  
// Logout handle
router.get('/logout', function(req, res, next){
    req.logOut();
    req.flash('success_msg', 'شما با موفقیت خارج شدید');
    res.redirect('/users/login');
});

module.exports = router;

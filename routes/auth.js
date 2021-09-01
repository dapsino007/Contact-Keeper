const c = require('config');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

//@route GET api/auth
//@desc  Get logged in user
//@acess Private

router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route POST api/auth
//@desc  Auth user & get token
//@acess Public

router.post('/', 
body('email', 'Please enter a valid email').isEmail(),
body('password', 'Please enter a valid password').isLength({min : 6}),
async (req, res)=>{
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    };

    const {email, password} = req.body;

   try {
       let user = await User.findOne({email});
       const isMatch = await bcrypt.compare(password, user.password);
       const payload = {user: {id: user.id}};

       if(!user){
           res.json({msg: "Invalid Credentials"});
       }

       if(!isMatch){
           res.json({msg: 'Invalid Credentials'});
       }
       
       jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000 }, (err, token) => {
        if(err) throw err;
        res.json({token});
      });
        

   } catch (err) {
       console.error(err.message);
        res.status(500).json({msg: "server error"});
   }


});


module.exports = router;
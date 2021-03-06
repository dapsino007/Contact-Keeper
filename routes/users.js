const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const { body, validationResult } = require('express-validator');

//@route POST api/users
//@desc  Register a User
//@acess Public

router.post('/', 
body('name', 'Please add name').not().isEmpty(),
body('email', 'Please enter an email').isEmail(),
body('password', 'Please enter a password with a min of 6 characters').isLength({min: 6}),
 async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({msg: 'User already exists'});
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {user: {id: user.id}};
        
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
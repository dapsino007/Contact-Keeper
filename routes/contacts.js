const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const mongoose = require('mongoose');
const User = require('../models/User');
const Contact = require('../models/Contact');
// const jwt = require('jsonwebtoken');
// const config = require('config');
const auth = require('../middleware/auth');

//@route GET api/contacts
//@desc  Get all users contacts
//@acess Private

router.get('/', auth, async (req, res)=>{
    try {
        const contacts = await Contact.find({user: req.user.id}).sort({date: -1});
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route POST api/contacts
//@desc  Add new contacts
//@acess Private

router.post('/', auth, body('name', 'name is required').not().isEmpty(), async (req, res)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, phone, type } = req.body;

   try {
        const newContact = new Contact({
            name,
            email,
            phone,
            type,
            user: req.user.id
        });

        const contact = await newContact.save();

        res.json(contact);

   } catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error');
   }
});

//@route PUT api/contacts/:id
//@desc  Edit users contacts
//@acess Private

router.put('/:id', auth, async (req, res)=>{
    
    
    const { name, email, phone, type } = req.body;

	// Build contact object
	const contactFields = {};
	if (name) contactFields.name = name;
	if (email) contactFields.email = email;
	if (phone) contactFields.phone = phone;
	if (type) contactFields.type = type;

	try {
		let contact = await Contact.findById(req.params.id);

		if (!contact) return res.status(404).json({ msg: 'Contact not found' });

		// Make sure user owns contact
		if (contact.user.toString() !== req.user.id)
			return res.status(401).json({ msg: 'Not authorized' });

		contact = await Contact.findByIdAndUpdate(
			req.params.id,
			{ $set: contactFields },
			{ new: true }
		);

		res.json(contact);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});


//@route DEL api/contacts/:id
//@desc  Auth user & get token
//@acess Private

router.delete('/:id', auth, async (req, res)=>{
    
    try {
		const contact = await Contact.findById(req.params.id);

		if (!contact) return res.status(404).json({ msg: 'Contact not found' });

		// Make sure user owns contact
		if (contact.user.toString() !== req.user.id)
			return res.status(401).json({ msg: 'Not authorized' });

		await Contact.findByIdAndRemove(req.params.id);

		res.json({ msg: 'Contact removed' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});


module.exports = router;
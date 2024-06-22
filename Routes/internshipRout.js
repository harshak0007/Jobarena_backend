const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const InternshipShcema = require('../Model/Internship');

const English_Internship = mongoose.model(
	'English_Internship',
	InternshipShcema,
	'english_Internship'
);
const Spanish_Internship = mongoose.model(
	'Spanish_Internship',
	InternshipShcema,
	'spanish_Internship'
);
const Hindi_Internship = mongoose.model(
	'Hindi_Internship',
	InternshipShcema,
	'hindi_Internship'
);
const Portuguese_Internship = mongoose.model(
	'Portuguese_Internship',
	InternshipShcema,
	'portuguese_Internship'
);
const Chinese_Internship = mongoose.model(
	'Chinese_Internship',
	InternshipShcema,
	'chinese_Internship'
);
const French_Internship = mongoose.model(
	'French_Internship',
	InternshipShcema,
	'french_Internship'
);
const models = {
	en: English_Internship,
	es: Spanish_Internship,
	hi: Hindi_Internship,
	pt: Portuguese_Internship,
	zh: Chinese_Internship,
	fr: French_Internship,
};

router.post('/', async (req, res) => {
	const { lang } = req.body;
	const Model = models[lang];

	if (!Model) {
		return res.status(400).send('Invalid language');
	}
	const internshipData = new Model({
		title: req.body.title,
		company: req.body.company,
		location: req.body.location,
		Duration: req.body.Duration,
		category: req.body.category,
		aboutCompany: req.body.aboutCompany,
		aboutInternship: req.body.aboutInternship,
		Whocanapply: req.body.Whocanapply,
		perks: req.body.perks,
		AdditionalInfo: req.body.AdditionalInfo,
		stipend: req.body.stipend,
		StartDate: req.body.StartDate,
	});
	await internshipData
		.save()
		.then(data => {
			res.send(data);
		})
		.catch(error => {
			console.log(error, 'not able to post the data');
		});
});

router.get('/', async (req, res) => {
	try {
		const { lang } = req.query;
		const Model = models[lang];

		if (!Model) {
			return res.status(400).send('Invalid language');
		}
		const data = await Model.find();
		res.json(data).status(200);
	} catch (error) {
		console.log(error);
		res.status(404).json({ error: 'Internal server error ' });
	}
});

router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const { lang } = req.query;
	const Model = models[lang];

	if (!Model) {
		return res.status(400).send('Invalid language');
	}
	try {
		const data = await Model.findById(id);
		if (!data) {
			res.status(404).json({ error: 'Internship is not found ' });
		}
		res.json(data).status(200);
	} catch (error) {
		console.log(error);
		res.status(404).json({ error: 'Internal server error ' });
	}
});

module.exports = router;

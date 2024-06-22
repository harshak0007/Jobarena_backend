const express = require('express');
const router = express.Router();
const InternshipShcema = require('../Model/Jobs');
const mongoose = require('mongoose');

const English_Internship = mongoose.model(
	'English_Job',
	InternshipShcema,
	'english_Job'
);
const Spanish_Internship = mongoose.model(
	'Spanish_Job',
	InternshipShcema,
	'spanish_Job'
);
const Hindi_Internship = mongoose.model(
	'Hindi_Job',
	InternshipShcema,
	'hindi_Job'
);
const Portuguese_Internship = mongoose.model(
	'Portuguese_Job',
	InternshipShcema,
	'portuguese_Job'
);
const Chinese_Internship = mongoose.model(
	'Chinese_Job',
	InternshipShcema,
	'chinese_Job'
);
const French_Internship = mongoose.model(
	'French_Job',
	InternshipShcema,
	'french_Job'
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
	const JobData = new Model({
		title: req.body.title,
		company: req.body.company,
		location: req.body.location,
		Experience: req.body.experience,
		category: req.body.category,
		aboutCompany: req.body.aboutCompany,
		aboutInternship: req.body.aboutInternship,
		Whocanapply: req.body.Whocanapply,
		perks: req.body.perks,
		AdditionalInfo: req.body.AdditionalInfo,
		CTC: req.body.ctc,
		StartDate: req.body.StartDate,
	});
	await JobData.save()
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

// const InternshipShcema = require('../Model/JobsHi');

// const English_Internship = mongoose.model(
// 	'English_Job',
// 	InternshipShcema,
// 	'english_Job'
// );
// const Spanish_Internship = mongoose.model(
// 	'Spanish_Job',
// 	InternshipShcema,
// 	'spanish_Job'
// );
// const Hindi_Internship = mongoose.model(
// 	'Hindi_Job',
// 	InternshipShcema,
// 	'hindi_Job'
// );
// const Portuguese_Internship = mongoose.model(
// 	'Portuguese_Job',
// 	InternshipShcema,
// 	'portuguese_Job'
// );
// const Chinese_Internship = mongoose.model(
// 	'Chinese_Job',
// 	InternshipShcema,
// 	'chinese_Job'
// );
// const French_Internship = mongoose.model(
// 	'French_Job',
// 	InternshipShcema,
// 	'french_Job'
// );
// const models = {
// 	en: English_Internship,
// 	es: Spanish_Internship,
// 	hi: Hindi_Internship,
// 	pt: Portuguese_Internship,
// 	zh: Chinese_Internship,
// 	fr: French_Internship,
// };

// router.post('/save-translations', async (req, res) => {
// 	const { lang, translations } = req.body;
// 	const Model = models[lang];

// 	if (!Model) {
// 		return res.status(400).send('Invalid language');
// 	}

// 	try {
// 		// Remove the _id field from translations to avoid duplicate key error
// 		const { _id, ...transWithoutId } = translations;

// 		const document = new Model(transWithoutId);
// 		await document.save();

// 		res.status(200).send('Translations saved successfully');
// 	} catch (error) {
// 		console.error('Error saving translations:', error);
// 		res.status(500).send('Error saving translations');
// 	}
// });

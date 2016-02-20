// BASED ON http://www.uis.unesco.org/literacy/Documents/Intl-literacy-day/literacy-infographic-2013-en.pdf
// AND http://data.uis.unesco.org/Index.aspx?DataSetCode=EDULIT_DS&popupcustomise=true&lang=en FOR 2015 DATA

var illiteracy_aggregate = [
	/*{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 1,
		//highlight: { v: ['DZA', 'BHR', 'EGY', 'IRN', 'IRQ', 'JOR', 'KWT', 'LBN', 'YEM', 'ARE', 'LBY', 'MAR', 'OMN', 'PSX', 'ISR', 'QAT', 'SAU', 'SYR', 'TUN'], c: '#2c3e4a' }, 
		text: { p: 'Having basic reading and writing skills is necessary in many everyday situations like for understanding a prescription, filling out a form, or sending a text message. 737 million adults around the world do not have these skills.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},*/
	{
		action: 'narrate',
		text: { p: 'Having basic reading and writing skills is necessary in many everyday situations like understanding a prescription, filling out a form, or sending a text message. 737 million adults around the world do not have these skills.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
		background: '#4fbe93'
	},
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 2.5,
		highlight: { v: ['IND', 'PAK', 'BGD', 'CHN', 'NGA', 'ETH', 'EGY', 'IDN', 'AFG'], c: '#2c3e4a' }, 
		text: { p: 'Over 60% of illiterate adults live in only nine countries.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},
	{ 
		action: 'draw', 
		chart: 'pie', 
		data: [
			{ n: 'Illiterate women', v: 467595310 },
			{ n: 'Illiterate men', v: 270392699 }
		], 
		highlight: { v: ['Illiterate women'], c: '#2c3e4a' },
		text: { p: 'There are more than twice as many illiterate women as men in the world.', x: 0, y: 25, w: 50, s: 'slow', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},
	{ 
		action: 'draw', 
		chart: 'bar', 
		data: [
			{ n: 'South and West Asia', v: 378992373 },
			{ n: 'Sub-Saharan Africa', v: 192120702 },
			{ n: 'East Asia and Pacific', v: 75146416 },
			{ n: 'Arab States', v: 49541133 },
			{ n: 'Latin America', v: 31240921 },
			{ n: 'Central and Eastern Europe', v: 4178669 },
			{ n: 'Central Asia', v: 218190 }
		],
		text: { p: 'Overall the situation is by far the worst in South and West Asia, where illiteracy is a concern for almost 380 million people.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},
	
	{
		action: 'narrate',
		text: { p: 'Help us develop better education systems for both men and women around the world with a single donation.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
	}
];

var illiteracy_humanize = [
	/*{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.eckert1(),
		scale: 155,
		zoom: 5,
		highlight: { v: ['DZA', 'BHR', 'EGY', 'IRN', 'IRQ', 'JOR', 'KWT', 'LBN', 'YEM', 'ARE', 'LBY', 'MAR', 'OMN', 'PSX', 'ISR', 'QAT', 'SAU', 'SYR', 'TUN'], c: '#2c3e4a' }, 
		text: { p: 'Between 2009 and 2014, the number of conflicts in the Middle East and North Africa has increased by 35%, from 55 to 74.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},*/
	{
		action: 'narrate',
		text: { p: 'Having basic reading and writing skills is necessary in many everyday situations like understanding a prescription, filling out a form, or sending a text message. 737 million adults around the world do not have these skills.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
		background: '#4fbe93'
	},
	{ 
		action: 'draw',
		chart: 'unit',
		type: 'absolute',
		distribtion: 'ordered',
		data: [
			{ n: 'Syria', v: 4181 }, // 4180920
			{ n: 'Iraq', v: 378 }, // 377747
			{ n: 'Mauritania', v: 34 }, // 34121
			{ n: 'Egypt', v: 16 }, // 16105
			{ n: 'Yemen', v: 6 } // 5832
		],
		units: { t: 'isotype', l: 'grid', lbl: 'One thousand refugees from ' },
		text: { p: 'This led to a massive flow of migrations in the region, which Syrian refugees currently and by far suffer the most.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		background: '#4fbe93'
	},
	{
		action: 'update',
		chart: 'unit',
		type: 'absolute',
		distribtion: 'random',
		data: [
			{ n: 'Syrian', v: 4181 }, // 4180920
			{ n: 'any other country ', v: 10261 } // 10260754 // Total = 14441674
		], 
		highlight: { v: ['Syrian'], c: '#2c3e4a' },
		units: { t: 'isotype', l: 'grid', lbl: 'One thousand refugees from ' },
		text: { p: 'Indeed, of the 14.5 millions refugees in the world today, almost one out of three is Syrian.', x: 0, y: 25, w: 50, s: 'slow', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},
	{ 
		action: 'draw',
		chart: 'unit',
		type: 'absolute',
		distribtion: 'ordered',
		data: [
			{ n: 'refugee in Turkey', v: 1 }, // 1838848
			{ n: 'native Turk', v: 42 } // 75857056
		], 
		units: { t: 'isotype', l: 'grid', lbl: 'One ' },
		highlight: { v: ['refugee in Turkey'], c: '#2c3e4a' },
		text: { p: 'But this refugee crisis is not only a problem for the countries people are fleeing. It is also an important concern for countries in which refugees seek refuge. Turkey is the country that counts the most refugees on Earth: roughly one out of fourty three people in Turkey is a refugee.', x: 0, y: 25, w: 50, s: 'slow', c: null },
		color: '#a67c52',
		background: '#4fbe93'
	},
	{
		action: 'narrate',
		text: { p: 'Help us support families who have had to flee their home country with a single donation.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
	}
];

var illiteracy_story = 

	{	title: 'Education for All',
		color: '#333',
		highlight: '#a67c52',
		text: '#333',
		textbg: '#4fbe93',
		story: [
			{ n: 'a', v: illiteracy_aggregate },
			{ n: 'h', v: illiteracy_humanize }
		]
	};

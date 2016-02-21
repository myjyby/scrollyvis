// BASED ON http://www.who.int/reproductivehealth/publications/monitoring/infographic/en/


var maternal_aggregate = [
	/*{ 
		action: 'draw', 
		chart: 'area',
		data: [
			{ n: '19900101', v: 532000 },
			{ n: '19910101', v: 522000 },
			{ n: '19920101', v: 513000 },
			{ n: '19930101', v: 504000 },
			{ n: '19940101', v: 495000 },
			{ n: '19950101', v: 486000 },
			{ n: '19960101', v: 478000 },
			{ n: '19970101', v: 470000 },
			{ n: '19980101', v: 461000 },
			{ n: '19990101', v: 452000 },
			{ n: '20000101', v: 442000 },
			{ n: '20010101', v: 432000 },
			{ n: '20020101', v: 421000 },
			{ n: '20030101', v: 408000 },
			{ n: '20040101', v: 396000 },
			{ n: '20050101', v: 384000 },
			{ n: '20060101', v: 371000 },
			{ n: '20070101', v: 363000 },
			{ n: '20080101', v: 351000 },
			{ n: '20090101', v: 348000 },
			{ n: '20100101', v: 339000 },
			{ n: '20110101', v: 329000 },
			{ n: '20120101', v: 323000 },
			{ n: '20130101', v: 315000 },
			{ n: '20140101', v: 309000 },
			{ n: '20150101', v: 303000 }
		],
		yrange: [0, 532000],
		highlight: { t: 'point', v: ['19900101', '20150101'], c: 'palevioletred' },
		text: { p: 'Since 1990, there has been a 44% reduction of maternal deaths worldwide.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},*/
	{
		action: 'narrate',
		text: { p: 'Need quick explanation sentence. Since 1990, there has been a 44% reduction of maternal deaths worldwide.', x: 25, y: 30, w: 50, s: 'slow', c: 'takeaway' },
		background: '#a7e5fa'
	},
	/*{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		//projection: d3.geo.vanDerGrinten(),
		//scale: 90,
		zoom: 1,
		text: { p: 'Need quick explanation sentence. Since 1990, there has been a 44% reduction of maternal deaths worldwide.', x: 50.2, y: 45, w: 37, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},*/
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		//projection: d3.geo.vanDerGrinten(),
		//scale: 90,
		zoom: 3,
		highlight: { v: ['BTN', 'CPV', 'KHM', 'IRN', 'LAO', 'MDV', 'MNG', 'RWA', 'TLS'], c: 'palevioletred' }, 
		text: { p: 'These have even diminished by 75% in Bhutan, Cabo Verde, Cambodia, Iran, Lao People’s Democratic Republic, Maldives, Mongolia, Rwanda and Timor-Lester.', x: 0, y: 85.6, w: 50, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{ 
		action: 'draw', 
		chart: 'pie', 
		data: [
			{ n: 'Mothers who die', v: 1 },
			{ n: 'Mothers who live', v: 4900 }
		], 
		highlight: { v: ['Mothers who die'], c: 'palevioletred' },
		text: { p: 'However, while in developed countries only one out of four thousand nine hundred mothers die in pregnanacy and childbirth…', x: 51.5, y: 28, w: 50, s: 'slow', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{ 
		action: 'update', 
		chart: 'pie', 
		data: [
		{ n: 'Mothers who die', v: 1 },
			{ n: 'Mothers who live', v: 54 }		
		],
		highlight: { v: ['Mothers who die'], c: 'palevioletred' },
		text: { p: '…in fragile settings like countries experiencing crisis and conflict, one out of fifty-four still die.', x: 0, y: 47, w: 50, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{
		action: 'narrate',
		text: { p: 'Help us continue to reduce maternal mortality around the world with a single donation.', x: 25, y: 30, w: 50, s: 'slow', c: 'takeaway' },
	}
];

var maternal_humanize = [
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		//projection: d3.geo.vanDerGrinten(),
		//scale: 90,
		zoom: 1,
		text: { p: 'Need quick explanation sentence. Since 1990, there has been a 44% reduction of maternal deaths worldwide.', x: 50.2, y: 45, w: 37, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{ 
		action: 'update', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		//projection: d3.geo.vanDerGrinten(),
		//scale: 90,
		zoom: 3,
		highlight: { v: ['BTN', 'CPV', 'KHM', 'IRN', 'LAO', 'MDV', 'MNG', 'RWA', 'TLS'], c: 'palevioletred' }, 
		text: { p: 'These have even diminished by 75% in Bhutan, Cabo Verde, Cambodia, Iran, Lao People’s Democratic Republic, Maldives, Mongolia, Rwanda and Timor-Lester.', x: 0, y: 85.6, w: 50, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{ 
		action: 'draw', 
		chart: 'unit',
		type: 'absolute',
		distribution: 'ordered', 
		data: [
			{ n: 'Mother who died', v: 1 },
			{ n: 'Mother who lived', v: 4900 }
		], 
		highlight: { v: ['Mother who died'], c: 'palevioletred' },
		units: { t: 'isotype', l: 'grid', lbl: 'A ' },
		text: { p: 'However, while in developed countries only one out of four thousand nine hundred mothers die in pregnanacy and childbirth…', x: 50, y: 28, w: 39, s: 'slow', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{ 
		action: 'update', 
		chart: 'unit', 
		type: 'absolute',
		distribution: 'ordered',
		data: [
			{ n: 'Mother who died', v: 1 },
			{ n: 'Mother who lived', v: 54 }
		],
		highlight: { v: ['Mother who died'], c: 'palevioletred' },
		units: { t: 'isotype', l: 'grid', lbl: 'A ' },
		text: { p: '…in fragile settings like countries experiencing crisis and conflict, one out of fifty-four still die.', x: 9.7, y: 5.6, w: 40, s: 'fast', c: null },
		color: '#FFF',
		background: '#a7e5fa'
	},
	{
		action: 'narrate',
		text: { p: 'Help us continue to reduce maternal mortality around the world with a single donation.', x: 25, y: 30, w: 50, s: 'slow', c: 'takeaway' },
	}
];

var maternal_story =
	{ 	title: 'Saving Mothers’ Lives',
		color: '#16213f',
		highlight: 'palevioletred',
		text: '#FFF',
		textbg: '#16213f',
		story: [
			{ n: 'a', v: maternal_aggregate },
			{ n: 'h', v: maternal_humanize }
		]
	};

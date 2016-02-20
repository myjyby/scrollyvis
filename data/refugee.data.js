// BASED ON http://online.fliphtml5.com/srhi/mtgf/#p=34
// AND http://www.unhcr.org/56701b969.html FOR 2015 DATA
// AND http://www.unhcr.org/4ce5327f9.html FOR 2009 DATA
// AND http://www.unhcr.org/pages/4a02db416.html FOR COUNTRY LIST
// AND https://en.wikipedia.org/wiki/List_of_countries_by_refugee_population FOR ASYLUM COUNTRIES

var refugee_aggregate = [
	{
		action: 'narrate',
		text: { p: 'Need quick explanation sentence. Between 2009 and 2014, the number of conflicts in the Middle East and North Africa has increased by 35%, from 55 to 74.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
		background: '#EAEAEA'
	},
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 5,
		highlight: { v: ['DZA', 'BHR', 'EGY', 'IRN', 'IRQ', 'JOR', 'KWT', 'LBN', 'YEM', 'ARE', 'LBY', 'MAR', 'OMN', 'PSX', 'ISR', 'QAT', 'SAU', 'SYR', 'TUN'], c: '#2c3e4a' }, 
		text: { p: 'Need quick explanation sentence. Between 2009 and 2014, the number of conflicts in the Middle East and North Africa has increased by 35%, from 55 to 74.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
	},
	/*{ 
		action: 'update', 
		chart: 'map', 
		projection: d3.geo.eckert1(),
		scale: 155,
		zoom: 5,
		highlight: { v: ['DZA', 'BHR', 'EGY', 'IRN', 'IRQ', 'JOR', 'KWT', 'LBN', 'YEM', 'ARE', 'LBY', 'MAR', 'OMN', 'PSX', 'ISR', 'QAT', 'SAU', 'SYR', 'TUN'], c: '#2c3e4a' }, 
		text: { p: 'This led to a massive increase in internally displaced people, as well a in refugees.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
	},*/
	/*{ 
		action: 'draw', 
		chart: 'area',
		data: [
			{ n: '20090101', v: 2073633 },
			{ n: '20100101', v: 1967653 },
			{ n: '20110101', v: 1717962 },
			{ n: '20120101', v: 1743684 },
			{ n: '20130101', v: 3112851 },
			{ n: '20140101', v: 4499740 },
			{ n: '20150101', v: 4634384 }
		],
		yrange: [0, 4634384],
		highlight: { t: 'point', v: ['20090101', '20150101'], c: '2c3e4a' },
		text: { p: 'Since 1990, there has been a 44% reduction of maternal deaths worldwide.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
	},*/



	{ 
		action: 'draw', 
		chart: 'bar', 
		data: [
			{ n: 'Syria', v: 4180920 },
			{ n: 'Iraq', v: 377747 },
			{ n: 'Mauritania', v: 34121 },
			{ n: 'Egypt', v: 16105 },
			{ n: 'Yemen', v: 5832 }
		],
		text: { p: 'This led to a massive flow of migrations in the region, which Syrian refugees currently and by far suffer the most.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
	},
	{ 
		action: 'draw', 
		chart: 'pie', 
		data: [
			{ n: 'Syrian refugees', v: 4180920 },
			{ n: 'Refugees from all other countries in the world', v: 10260754 }
		], 
		highlight: { v: ['Syrian refugees'], c: '#2c3e4a' },
		text: { p: 'Indeed, of the 14.5 millions refugees in the world today, almost one out of three is Syrian.', x: 0, y: 25, w: 50, s: 'slow', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
	},
	/*{ 
		action: 'draw', 
		chart: 'pie', 
		data: [
			{ n: 'Refugees', v: 1838848 },
			{ n: 'Natives', v: 75857056 }
		], 
		highlight: { v: ['Refugees'], c: '#2c3e4a' },
		text: { p: 'But this refugee crisis is not only a problem for the countries people are fleeing. It is also an important concern for countries in which refugees seek refuge. Turkey is the country that counts the most refugees on Earth: roughly one out of fourty three people in Turkey is a refugee.', x: 0, y: 25, w: 50, s: 'slow', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
	},*/
	{
		action: 'narrate',
		text: { p: 'Help us support families who have had to flee their home country with a single donation.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
	}
];

var refugee_humanize = [
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 5,
		highlight: { v: ['DZA', 'BHR', 'EGY', 'IRN', 'IRQ', 'JOR', 'KWT', 'LBN', 'YEM', 'ARE', 'LBY', 'MAR', 'OMN', 'PSX', 'ISR', 'QAT', 'SAU', 'SYR', 'TUN'], c: '#2c3e4a' }, 
		text: { p: 'Need quick explanation sentence. Between 2009 and 2014, the number of conflicts in the Middle East and North Africa has increased by 35%, from 55 to 74.', x: 50.2, y: 5, w: 75, s: 'fast', c: null },
		color: '#a67c52',
		background: '#EAEAEA'
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
		background: '#EAEAEA'
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
		background: '#EAEAEA'
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
		background: '#EAEAEA'
	},
	{
		action: 'narrate',
		text: { p: 'Help us support families who have had to flee their home country with a single donation.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
	}
];

var refugee_story = 

	{	title: 'A long way from home',
		color: '#333',
		highlight: '#a67c52',
		text: '#333',
		textbg: '#EAEAEA',
		colorscale: ['#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a'],
		story: [
			{ n: 'a', v: refugee_aggregate },
			{ n: 'h', v: refugee_humanize }
		]
	};

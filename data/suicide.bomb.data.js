// BASED ON https://aoav.org.uk/infographic/2015-the-year-of-the-suicide-bomber/

var bomb_aggregate = [
	/*{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 1,
		text: { p: 'Between 2011 and 2015 there was a 78% increase in civilians killed or injured by suicide bombings globally. 2015 saw suicide attacks happening in twenty one countries worldwide&mdash;more than ever reported before.', x: 5, y: 63, w: 50, s: 'fast', c: null },
		color: '#c6c7b7',
		background: '#333'
	},*/
	{ 
		action: 'narrate', 
		text: { p: 'Between 2011 and 2015 there was a 78% increase in civilians killed or injured by suicide bombings globally. 2015 saw suicide attacks happening in twenty one countries worldwide&mdash;more than ever reported before.', x: 20, y: 22, w: 60, s: 'slow', c: 'takeaway' },
		background: '#333'
	},
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 3,
		highlight: { v: ['NGA', 'IRQ', 'AFG', 'TUR', 'SYR', 'YEM', 'TCD', 'CMR', 'PAK', 'LBN', 'KWT', 'FRA', 'SAU', 'SOM', 'LBY', 'EGY', 'CHN', 'IND', 'BGD', 'MLI', 'TUN'], c: '#9e4e40' }, 
		text: { p: 'The countries affected were Nigeria, Iraq, Afghanistan, Turkey, Syria, Yemen, Chad, Cameroon, Pakistan, Lebanon, Kuwait, France, Saudi Arabia, Somalia, Libya, Egypt, China, India, Bangladesh, Mali and Tunisia.', x: 40, y: 5, w: 50, s: 'fast', c: null },
		color: '#c6c7b7',
		background: '#333'
	},
	{ 
		action: 'draw', 
		chart: 'bar', 
		data: [
			{ n: 'Nigeria', v: 2062 },
			{ n: 'Iraq', v: 1516 },
			{ n: 'Afghanistan', v: 1052 },
			{ n: 'Turkey', v: 709 },
			{ n: 'Syria', v: 684 }
		],
		text: { p: 'Nigeria, Iraq, Afghanistan, Turkey and Syria were most affected: over 6,000 civilians were harmed by suicide attackers in these countries.', x: 43, y: 9.6, w: 50, s: 'fast', c: null },
		color: '#c6c7b7',
		background: '#333'
	},
	{ 
		action: 'draw', 
		chart: 'pie', 
		data: [
			{ n: 'Killed', v: 28 },
			{ n: 'Injured', v: 72 }
		], 
		highlight: { v: ['Killed'], c: '#9e4e40' },
		text: { p: 'All together, there were 248 bombings worldwide, which harmed 9109 civilians. Almost one out of three of these people were killed, while the others were injured.', x: 0, y: 42, w: 50, s: 'slow', c: null },
		color: '#c6c7b7',
		background: '#333'
	},
	{
		action: 'narrate',
		/*chart: 'pie',
		data: [
			{ n: 'Killed', v: 28 },
			{ n: 'Injured', v: 72 }
		],*/
		text: { p: 'Help us support families who have suffered from suicide bombings with a single donation.', x: 20, y: 25, w: 60, s: 'slow', c: 'takeaway' },
	}
];

var bomb_humanize = [
	/*{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 1,
		text: { p: 'Between 2011 and 2015 there was a 78% increase in civilians killed or injured by suicide bombings globally. 2015 saw suicide attacks happening in twenty one countries worldwide&mdash;more than ever reported before.', x: 5, y: 63, w: 50, s: 'fast', c: null },
		color: '#c6c7b7',
		background: '#333'
	},*/
	{ 
		action: 'narrate', 
		text: { p: 'Between 2011 and 2015 there was a 78% increase in civilians killed or injured by suicide bombings globally. 2015 saw suicide attacks happening in twenty one countries worldwide&mdash;more than ever reported before.', x: 20, y: 22, w: 60, s: 'slow', c: 'takeaway' },
		background: '#333'
	},
	{ 
		action: 'draw', 
		chart: 'map', 
		projection: d3.geo.kavrayskiy7(),
		scale: 150,
		zoom: 3,
		highlight: { v: ['NGA', 'IRQ', 'AFG', 'TUR', 'SYR', 'YEM', 'TCD', 'CMR', 'PAK', 'LBN', 'KWT', 'FRA', 'SAU', 'SOM', 'LBY', 'EGY', 'CHN', 'IND', 'BGD', 'MLI', 'TUN'], c: '#9e4e40' }, 
		text: { p: 'The countries affected were Nigeria, Iraq, Afghanistan, Turkey, Syria, Yemen, Chad, Cameroon, Pakistan, Lebanon, Kuwait, France, Saudi Arabia, Somalia, Libya, Egypt, China, India, Bangladesh, Mali and Tunisia.', x: 40, y: 5, w: 50, s: 'fast', c: null },
		color: '#c6c7b7',
		background: '#333'
	},
	{
		action: 'draw',
		chart: 'unit',
		type: 'absolute',
		distribtion: 'ordered',
		data: [
			{ n: 'Nigeria', v: 2062 },
			{ n: 'Iraq', v: 1516 },
			{ n: 'Afghanistan', v: 1052 },
			{ n: 'Turkey', v: 709 },
			{ n: 'Syria', v: 684 }
		],
		//highlight: { v: ['cat 4'], c: '#9e4e40' }, 
		units: { t: 'isotype', l: 'grid', lbl: 'A civilian harmed in' },
		text: { p: 'Nigeria, Iraq, Afghanistan, Turkey and Syria were most affected: over 6,000 civilians were harmed by suicide attackers in these countries.', x: 19, y: 3.6, w: 50, s: 'fast', c: null },
		background: '#333'
	},
	{
		action: 'update',
		chart: 'unit',
		type: 'absolute',
		distribtion: 'random',
		data: [
			{ n: 'Killed', v: 2550 },
			{ n: 'Injured', v: 6559 }
		], 
		highlight: { v: ['Killed'], c: '#9e4e40' },
		units: { t: 'isotype', l: 'grid', lbl: 'A civilian ' },
		//units: { t: 'bubble', l: 'force' }
		text: { p: 'All together, there were 248 bombings worldwide, which harmed 9109 civilians. Almost one out of three of these people were killed, while the others were injured.', x: 0.14, y: 42, w: 50, s: 'slow', c: null },
		color: '#c6c7b7',
		background: '#333'
	},
	{
		action: 'narrate',
		text: { p: 'Help us support families who have suffered from suicide bombings with a single donation.', x: 20, y: 22, w: 60, s: 'slow', c: 'takeaway' },
	}
	/*{
		action: 'narrate',
		text: { p: 'Help us support families who have suffered from suicide bombings, as well as get people out of the cycle of violence with a single donation.', x: 25, y: 22, w: 50, s: 'slow', c: 'takeaway' },
	}*/
];

var bomb_story = 
	{ 	title: 'Aiding the victims of suicide bombings',
		color: '#FFF',
		highlight: '#9e4e40',
		text: '#FFF',
		textbg: '#333',
		colorscale: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'],
		story: [
			{ n: 'a', v: bomb_aggregate },
			{ n: 'h', v: bomb_humanize }
		]
	};

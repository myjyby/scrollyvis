var xscale, yscale, xaxis, yaxis, arc;
var formatDate = d3.time.format('%Y%m%d');

function setSVG () {
	return d3.select('#svg-container')
		.append('svg')
			.attr('width', __svg__.w)
			.attr('height', __svg__.h)
		.append('defs');
}

function drawMAP (stepdata) {

	var svg = d3.select('#svg-container > svg');
	//var velocity = .01,
		//then = Date.now();

	var projection = d3.geo.orthographic()
		.scale(250)
		.translate([__svg__.w / 2, __svg__.h / 2])
		.clipAngle(90)
		.rotate([-15,-30,0])
		.precision(.1);
	
	var path = d3.geo.path()
		.projection(projection);

	var graticule = d3.geo.graticule();

	svg.select('defs').append('path')
	    .datum({ type: 'Sphere' })
	    .attr('id', 'sphere')
	    .attr('d', path);

	var map = svg.append('g')
		.datum({ type: 'map' })
		.attr('class', 'map chart');

	map.append('use')
	    .attr('class', 'stroke')
	    .attr('xlink:href', '#sphere');

	map.append('use')
	    .attr('class', 'fill')
	    .attr('xlink:href', '#sphere');

	map.append('path')
	    .datum(graticule)
	    .attr('class', 'graticule')
	    .attr('d', path);

	d3.json('data/world.data.json', function(error, world) {
		if (error) throw error;
		
		map.insert('path', '.graticule')
			.datum(topojson.feature(world, world.objects.land))
			.attr('class', 'land')
			.attr('d', path)
			.style('fill', function (d) { 
				if (d.id == 250) return red;
				return d.fill = stepdata.color; 
			});
		
		map.insert('path', '.graticule')
			.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			.attr('class', 'boundary')
			.attr('d', path)
			.style('stroke', function (d) { return d.stroke = stepdata.color; });
		
		/*d3.timer(function() {
			var angle = velocity * (Date.now() - then);
			projection.rotate([angle,0,0]);
			svg.selectAll("path")
				.attr("d", path.projection(projection));
		});*/
		checkWHEEL();
	});

	d3.select(self.frameElement).style('height', __svg__.h + 'px');

}

function drawBAR (stepdata) {
	var svg = d3.select('#svg-container > svg');
	var data = stepdata.data,
		range = stepdata.yrange,
		highlights = stepdata.highlight;

	// UPDATE THE SCALES
	xscale = d3.scale.ordinal()
		.rangeRoundBands([__svg__.pl, __svg__.pl], .1)
		.domain(data.map(function (d) { return d.n; }));
	if (range) {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.h - __svg__.pb])
			.domain(range);
	} else {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.h - __svg__.pb])
			.domain([0, d3.max(data, function (d) { return d.v; })]);
	}

	xaxis = d3.svg.axis()
		.scale(xscale)
		.orient('bottom');
	yaxis = d3.svg.axis()
		.scale(yscale)
		.orient('left')
		.ticks(5)

	var barchart = svg.append('g')
		.datum({ type: 'bar' })
		.attr('class', 'barchart chart')
		.attr('transform', 'translate(' + [0, __svg__.pt] + ')')
		.style('opacity', 0);

	barchart.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + [__svg__.pl, 0] + ')')
		.call(yaxis)
	.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.h + __svg__.pb, 0] + ')')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.style('opacity', 0)
		.text('Value');

	var bars = barchart.selectAll('.bar:not(.complementary)')
		.data(data, function (d) { return d.n; });

	bars.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr('width', 0)
		.attr('x', __svg__.pl)
		.attr('height', 0)
		.attr('y', __svg__.h - __svg__.pb)
		.style('fill', function (d) { 
			if (stepdata.color) return d.fill = stepdata.color;
			return d.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.fill; });

	// FOR THE BAR CHART SET THE X AXIS IN FRONT
	barchart.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(' + [0, __svg__.h - __svg__.pb] + ')')
		.call(xaxis);

	// ANIMATE THE GROUP IN
	xscale.rangeRoundBands([__svg__.pl, __svg__.w - __svg__.pr], .1);
	yscale.range([__svg__.h - __svg__.pb, __svg__.pt]);

	barchart.transition()
		.duration(__animation__.dur / 2)
		.ease('cubic-out')
		.attr('transform', 'translate(' + [0, 0] + ')')
		.style('opacity', 1)
		.each('end', checkWHEEL);

	// ANIMATE THE BARS IN
	bars.attr('width', xscale.rangeBand())
		.attr('x', function (d) { return xscale(d.n); })
		.transition()
		.duration(__animation__.dur)
		.ease('elastic-in')
		.delay(function (d, i) { return i * __animation__.del + __animation__.dur / 2; })
		.attr('height', function (d) { return __svg__.h - __svg__.pb - yscale(d.v); })
		.attr('y', function (d) { return yscale(d.v); })
		.each('end', function (d, i) {
			if (highlights) return highlightBAR(stepdata);
		});

	// ANIMATE THE AXES IN
	barchart.select('.x.axis')
		.transition()
		.duration(__animation__.dur)
		.call(xaxis)
		.each('end', function () {
			d3.select(this).selectAll('g.tick > line')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('y2', 15)
				.style('opacity', 1);

			return d3.select(this).selectAll('g.tick > text')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('y', 25)
				.style('opacity', 1);
		});
	barchart.select('.y.axis')
		.transition()
		.duration(__animation__.dur)
		.call(yaxis)
		.each('end', function () {
			d3.select(this).selectAll('g.tick > line')
				.attr('stroke-dasharray', '5, 5')
			.transition()
				.duration(__animation__.dur / 2)
				.attr('x2', __svg__.w - __svg__.pr - __svg__.pl)
				.style('opacity', .33);

			return d3.select(this).selectAll('g.tick > text')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('x', -20)
				.style('opacity', 1);
		});
	
	/*.select('text.axis-label')
		.style('opacity', 1)
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')');*/
}

function highlightBAR (stepdata) {
	var data = stepdata.data,
		highlights = stepdata.highlight;
	// ANIMATE THE HIGHLIGHT
	return d3.selectAll('.bar')
		.each(function (d, i) {
			if (highlights.v.indexOf(d.n) !== -1) {
				d3.select(this)
					.classed('highlight', true)
					.transition()
					.duration(__animation__.dur)
					.delay(i * __animation__.del)
					.style('fill', highlights.c)
					//.style('fill-opacity', .75)
					.style('stroke', highlights.c)
					.each('end', checkWHEEL);
			}
		});
}

function updateBAR (stepdata, reset) {
	var svg = d3.select('#svg-container > svg');
	var updaterange = false;
	
	var data = stepdata.data,
		range = stepdata.yrange,
		highlights = stepdata.highlight;

	// CHECK IF RANGE HAS CHANGED
	if (range && range.equals(yscale.domain()) == false) updaterange = true;

	// UPDATE THE SCALES
	xscale = d3.scale.ordinal()
		.rangeRoundBands([__svg__.pl, __svg__.w - __svg__.pr], .1)
		.domain(data.map(function (d) { return d.n; }));
	
	if (range) {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.pt])
			.domain(range);
	} else {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.pt])
			.domain([0, d3.max(data, function (d) { return d.v; })]);
	}


	xaxis = d3.svg.axis()
		.scale(xscale)
		.orient('bottom');
	yaxis = d3.svg.axis()
		.scale(yscale)
		.orient('left');

	var barchart = svg.select('g.barchart');

	/*barchart.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + [__svg__.pl, 0] + ')')
		.call(yaxis)
	.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.h + __svg__.pb, 0] + ')')
		//.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.style('opacity', 0)
		.text('Value');*/ // MAY NEED TO UPDATE THE AXIS LABEL

	var bars = barchart.selectAll('.bar:not(.complementary)')
		.data(data, function (d) { return d.n; });

	bars.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr('width', 0)
		.attr('x', __svg__.pl)
		.attr('height', 0)
		.attr('y', __svg__.h - __svg__.pb)
		.style('fill', function (d) { 
			if (stepdata.color) return d.fill = stepdata.color;
			return d.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.fill; });

	// ANIMATE THE GROUP IN
	barchart.transition()
		.duration(__animation__.dur / 2)
		.ease('cubic-out')
		.attr('transform', 'translate(' + [0, 0] + ')')
		.style('opacity', 1)
		.each('end', checkWHEEL);

	// ANIMATE THE BARS IN
	bars.attr('width', xscale.rangeBand())
		.attr('x', function (d) { return xscale(d.n); })
		.classed('highlight', function (d) {
			if (highlights && highlights.v.indexOf(d.n) !== -1) return true;
			return false
		})
	.transition()
		.duration(__animation__.dur)
		.delay(function (d, i) { return i * __animation__.del; })
		.attr('height', function (d) { return __svg__.h - __svg__.pb - yscale(d.v); })
		.attr('y', function (d) { return yscale(d.v); })
		.style('fill', function (d) { 
			if (highlights && highlights.v.indexOf(d.n) !== -1) return highlights.c;
			return d.fill; 
		})
		.style('stroke', function (d) { 
			if (highlights && highlights.v.indexOf(d.n) !== -1) return highlights.c;
			return d.fill; 
		})
		.style('stroke-width', 1)
		//.style('fill-opacity', function (d) { return d.fillOpacity; })
		.each('end', function (d, i) {
			if (highlights) return highlightBAR(stepdata);
		});


	bars.exit()
		.remove();

	// ANIMATE THE AXES IN
	if (reset || updaterange) {
		barchart.select('.x.axis')
			.transition()
			.duration(__animation__.dur)
			.call(xaxis)
			.style('opacity', 1)
			.each('end', function () {
				d3.select(this).selectAll('g.tick > line')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('y2', 15)
					.style('opacity', 1);

				return d3.select(this).selectAll('g.tick > text')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('y', 25)
					.style('opacity', 1);
			});
		barchart.select('.y.axis')
			.transition()
			.duration(__animation__.dur)
			.call(yaxis)
			.style('opacity', 1)
			.each('end', function () {
				d3.select(this).selectAll('g.tick > line')
					.attr('stroke-dasharray', '5, 5')
				.transition()
					.duration(__animation__.dur / 2)
					.attr('x2', __svg__.w - __svg__.pr - __svg__.pl)
					.style('opacity', .33);

				return d3.select(this).selectAll('g.tick > text')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('x', -20)
					.style('opacity', 1);
			});
		/*.select('text.axis-label')
			.style('opacity', 1)
			.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')');*/
	}
}

function drawPIE (stepdata) {
	var svg = d3.select('#svg-container > svg');
	var radius = Math.min(__svg__.w - __svg__.pl - __svg__.pr, __svg__.h - __svg__.pt - __svg__.pb) / 2;

	var data = stepdata.data,
		highlights = stepdata.highlight;
	
	arc = d3.svg.arc()
		.outerRadius(radius)
		.innerRadius(0);

	var labelArc = d3.svg.arc()
		.outerRadius(radius - 50)
		.innerRadius(radius - 50);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.v; });

	var piechart = svg.append('g')
		.datum({ type: 'pie' })
		.attr('class', 'piechart chart')
		.attr('transform', 'translate(' + [__svg__.w / 2, __svg__.h / 2] + ') scale(0.25)');

	var slices = piechart.selectAll('.arc')
		.data(pie(data), function (d) { return d.data.n; })

	slices.enter()
		.append('g')
		.attr('class', 'arc');

	slices.append('path')
		.attr('d', arc)
		.style('fill', function (d) { 
			if (stepdata.color) return d.data.fill = stepdata.color;
			return d.data.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.data.fill; });

	slices.append('text')
		.attr('transform', function(d) { return 'translate(' + labelArc.centroid(d) + ')'; })
		.attr('dy', '.35em')
		.attr('text-anchor', 'middle')
		.text(function(d) { return d.data.n; });

	// ANIMATE THE GROUP IN
	piechart.transition()
		.duration(__animation__.dur)
		.ease('elastic-in')
		.attr('transform', 'translate(' + [__svg__.w / 2, __svg__.h / 2] + ') scale(1)')
		//.style('opacity', 1)
		.each('end', checkWHEEL);


	if (highlights) {
		setTimeout(function () {
			return highlightPIE(stepdata);
		}, __animation__.dur);
	}

	// ANIMATE THE TEXT
	/*d3.selectAll('.text-pie')
		.style('top', '100px');*/
}

function highlightPIE (stepdata) {
	var data = stepdata.data,
		highlights = stepdata.highlight;

	// ANIMATE THE HIGHLIGHT
	return d3.selectAll('.arc > path')
		.each(function (d) {
			if (highlights.v.indexOf(d.data.n) !== -1) {
				d3.select(this)
					.classed('highlight', true)
				.transition()
					.duration(__animation__.dur)
					.delay(function (d, i) { return i * __animation__.del; })
					.style('fill', highlights.c)
					.style('stroke', highlights.c)
					.attr('transform', function (d){
						var angleRadian = angle(d) * (Math.PI/180),
							cartesian_x = 25 * Math.cos(angleRadian),
							cartesian_y = 25 * Math.sin(angleRadian);

						return 'translate('+ [Math.round(cartesian_x), Math.round(cartesian_y)] +')';		
					})
					.each('end', checkWHEEL);
			}
		});
}

function updatePIE (stepdata) {
	var svg = d3.select('#svg-container > svg');
	var radius = Math.min(__svg__.w - __svg__.pl - __svg__.pr, __svg__.h - __svg__.pt - __svg__.pb) / 2;

	var data = stepdata.data,
		highlights = stepdata.highlight;
	
	var arc = d3.svg.arc()
		.outerRadius(radius)
		.innerRadius(0);

	var labelArc = d3.svg.arc()
		.outerRadius(radius - 50)
		.innerRadius(radius - 50);

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.v; });

	var piechart = svg.select('.piechart');

	var slices = piechart.selectAll('.arc')
		.data(pie(data), function (d) { return d.data.n; })

	slices.transition()
		.duration(__animation__.dur)
		.delay(function (d, i) { return i * __animation__.del })
	.select('path')
		.attr('class', function (d) {
			if (highlights && highlights.v.indexOf(d.data.n) == -1) return null;
			return 'highlight';
		})
		.attr('d', arc)
		.attr('transform', function (d) {
			var t = d3.transform(d3.select(this).attr('transform')),
				x = t.translate[0],
				y = t.translate[1];
			if (highlights && highlights.v.indexOf(d.data.n) == -1) return 'translate(' + [0, 0] + ')';
			return 'translate(' + [x, y] + ')'
		})
		.style('fill', function (d) {
			var color = d3.select(this).style('fill');
			if (highlights && highlights.v.indexOf(d.data.n) == -1) return d.data.fill; 
			return color;
		})
		.style('stroke', function (d) {
			var color = d3.select(this).style('fill');
			if (highlights && highlights.v.indexOf(d.data.n) == -1) return d.data.fill; 
			return color;
		})
		.each('end', checkWHEEL)

	slices.exit()
		.remove();

	if (highlights) {
		setTimeout(function () {
			return highlightPIE(stepdata);
		}, __animation__.dur);
	}
}

function drawLINE (stepdata) {
	var svg = d3.select('#svg-container > svg');
	//var formatDate = d3.time.format('%Y%m%d');
	var temp_highlight = ['v2'];

	var data = stepdata.data,
		range = stepdata.yrange,
		highlights = stepdata.highlight;

	data = data.map(function (d) {
		if (d.n instanceof Date == false) {
			d.n = formatDate.parse(d.n);
		}
		return d;
	});

	var keys = d3.keys(data[0]).filter(function(key) { return key !== 'n'; });
	var mappeddata = keys.map(function (key) {
		return {
			k: key,
			v: data.map(function (d) {
				return { n: d.n, v: d[key] };
			})
		}
	});

	xscale = d3.time.scale()
		.range([__svg__.pl, __svg__.pl])
		.domain(d3.extent(data, function(d) { return d.n; }));

	
	if (range) {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.h - __svg__.pb])
			.domain(range);
	} else {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.h - __svg__.pb])
			.domain([
				d3.min(mappeddata, function(c) { return d3.min(c.v, function(b) { return b.v; }); }),
				d3.max(mappeddata, function(c) { return d3.max(c.v, function(b) { return b.v; }); })
			]);
	}

	xaxis = d3.svg.axis()
		.scale(xscale)
		.orient('bottom');
	yaxis = d3.svg.axis()
		.scale(yscale)
		.orient('left');

	var line = d3.svg.line()
		.x(function(d) { return xscale(d.n); })
		.y(function(d) { return yscale(d.v); });

	var clip = d3.select('defs').append('clipPath')
		.attr('id', 'linegraph-reveal')
	.append('rect')
		.attr('width', __svg__.w - __svg__.pl - __svg__.pr)
		.attr('x', -__svg__.w + __svg__.pl + __svg__.pr)
		.attr('height', __svg__.h - __svg__.pt - __svg__.pb)
		.attr('y', __svg__.pt);

	var linechart = svg.append('g')
		.datum({ type: 'line' })
		.attr('class', 'linegraph chart')
		.attr('transform', 'translate(' + [0, __svg__.pt] + ')')
		.style('opacity', 0);

	linechart.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(' + [0, __svg__.h - __svg__.pb] + ')')
		.call(xaxis);

	linechart.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + [__svg__.pl, 0] + ')')
		.call(yaxis)
	.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.h + __svg__.pb, 0] + ')')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.style('opacity', 0)
		.text('Value');

	// ANIMATE THE GROUP IN
	xscale.range([__svg__.pl, __svg__.w - __svg__.pr]);
	yscale.range([__svg__.h - __svg__.pb, __svg__.pt]);

	linechart.transition()
		.duration(__animation__.dur / 2)
		.ease('cubic-out')
		.attr('transform', 'translate(' + [0, 0] + ')')
		.style('opacity', 1);

	var lines = linechart.selectAll('.line-container')
		.data(mappeddata, function (d) { return d.k; });
	lines.enter()
		.append('g')
		.attr('class', 'line-container');
	lines.append('path')
		.attr('class', function (d) {
			if (temp_highlight.indexOf(d.k) !== -1) return 'line selected';
			return 'line';
		})
		.attr('d', function (d) { return line(d.v); })
		.attr('clip-path', 'url(#linegraph-reveal)')
		.style('stroke', function (d) { 
			if (stepdata.color) return d.stroke = stepdata.color;
			return d.stroke = d3.select(this).style('stroke'); // GET IT FROM THE CSS
		})
		//.style('stroke', function (d) { return d.stroke = d3.select(this).style('stroke'); })
		.style('stroke-width', 6);

	// ANIMATE THE LINE IN
	clip.transition()
		.duration(__animation__.dur)
		.ease('ease-in')
		.delay(__animation__.dur / 2)
		.attr('x', __svg__.pl)
		.each('end', checkWHEEL);

	// ANIMATE THE LINE THICKNESS
	linechart.selectAll('.line')
		.transition()
		.duration(__animation__.dur / 2)
		.ease('ease-out')
		.delay(__animation__.dur / 2)
		.style('stroke-width', 2)
		.each('end', function () {
			if (highlights) {
				if (highlights.t == 'line') return highlightLINE(data, highlights);
				if (highlights.t == 'point') return highlightLINEPOINT(data, highlights);
			}
		});

	// ANIMATE THE AXES IN
	linechart.select('.x.axis')
		.transition()
		.duration(__animation__.dur)
		.call(xaxis)
		.each('end', function () {
			d3.select(this).selectAll('g.tick > line')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('y1', -__svg__.h + __svg__.pt + __svg__.pb)
				.attr('y2', 15);
				//.style('opacity', .33);

			d3.select(this).selectAll('path')
				.attr('stroke-dasharray', '5, 5')
				.style('opacity', 1);

			return d3.select(this).selectAll('g.tick > text')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('y', 25)
				.style('opacity', 1);
		});
	linechart.select('.y.axis')
		.transition()
		.duration(__animation__.dur)
		.call(yaxis)
		.each('end', function () {
			d3.select(this).selectAll('g.tick > line')
				.attr('stroke-dasharray', '5, 5')
			.transition()
				.duration(__animation__.dur / 2)
				.attr('x2', __svg__.w - __svg__.pr - __svg__.pl)
				.style('opacity', .33);

			return d3.select(this).selectAll('g.tick > text')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('x', -20)
				.style('opacity', 1);
		});
	/*.select('text.axis-label')
		.style('opacity', 1)
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')');*/
}

function highlightLINEDISPATCH (stepdata) {
	var data = stepdata.data,
		highlights = stepdata.highlight;

	if (highlights) {
		if (highlights.t == 'line') return highlightLINE(data, highlights);
		if (highlights.t == 'point') return highlightLINEPOINT(data, highlights);
	}
}

function highlightLINE (data, lines) {
	// ANIMATE THE HIGHLIGHT
	return d3.selectAll('.line')
		.each(function (d, i) {
			if (lines.v.indexOf(d.k) !== -1) {
				d3.select(this)
					.moveToFront()
					.classed('highlight', true)
					.transition()
					.duration(__animation__.dur)
					.delay(i * __animation__.del)
					.style('stroke', lines.c)
					.style('stroke-width', 2)
					.each('end', checkWHEEL);
			}
		});
}

function highlightLINEPOINT (data, points) { 
	// ANIMATE THE HIGHLIGHT
	hp = points.v;
	hp = hp.map(function (d) {
		return formatDate.parse(d).getTime();
	});
	var highlightdata = data.filter(function (d) {
		return hp.indexOf(d.n.getTime()) !== -1;
	});
	return highlightdata.forEach(function (d, i) {
		var posx = xscale(d.n),
			posy = yscale(d.v);
		var pointw = 10;

		var chart = d3.select('g.chart')
			.append('g')
			.datum(points)
			.attr('class', 'point highlight')
			.attr('transform', 'translate(' + [posx, 0] + ')');
		/*chart.append('circle')
			.attr('class', 'highlight')
			.attr('cx', posx)
			.attr('cy', posy)
			.attr('r', d3.max([__svg__.w, __svg__.h]) / 4)
			.style('opacity', 0)
			.style('stroke', points.c)
			.style('stroke-width', 50)
		.transition()
			.duration(__animation__.dur / 4)
			.ease('ease-in')
			.delay(i * __animation__.del)
			.attr('r', 10)
			.style('opacity', 1)
			.style('stroke-width', 2)
			.each('end', checkWHEEL);*/

		chart.append('circle')
			//.datum(points)
			//.attr('class', 'point highlight')
			.attr('cx', 0)
			.attr('cy', posy)
			//.attr('r', d3.max([__svg__.w, __svg__.h]) / 4)
			.attr('r', 0)
			//.style('opacity', 0)
			.style('fill', points.c)
			//.style('stroke', highlights.c)
			//.style('stroke-width', 50)
			//.style('stroke', '#FFF')
		.transition()
			.duration(__animation__.dur / 4)
			//.ease('ease-in')
			.ease('elastic-in')
			.delay(i * __animation__.del)
			.attr('r', pointw)
			//.style('opacity', 1)
			//.style('stroke-width', 2)
			.each('end', checkWHEEL);

		chart.insert('line', 'circle')
			//.attr('class', 'highlight')
			.attr('x1', 0)
			.attr('y1', posy)
			.attr('x2', 0)
			.attr('y2', posy)
			.style('stroke', points.c)
			.style('stroke-width', 4)
		.transition()
			.duration(__animation__.dur / 2)
			.attr('y2', __svg__.h - __svg__.pb);
	});
}

function updateLINE (stepdata, reset) {
	var svg = d3.select('#svg-container > svg');
	//var formatDate = d3.time.format('%Y%m%d');
	var updaterange = false;
	
	var data = stepdata.data,
		range = stepdata.yrange,
		highlights = stepdata.highlight;

	// CHECK IF RANGE HAS CHANGED
	if (range && range.equals(yscale.domain()) == false) updaterange = true;

	data = data.map(function (d) {
		if (d.n instanceof Date == false) {
			d.n = formatDate.parse(d.n);
		}
		return d;
	});

	var keys = d3.keys(data[0]).filter(function(key) { return key !== 'n'; });
	var mappeddata = keys.map(function (key) {
		return {
			k: key,
			v: data.map(function (d) {
				return { n: d.n, v: d[key] };
			})
		}
	});

	xscale = d3.time.scale()
		.range([__svg__.pl, __svg__.w - __svg__.pr])
		.domain(d3.extent(data, function(d) { return d.n; }));

	
	if (range) {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.pt])
			.domain(range);
	} else {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.pt])
			.domain([
				d3.min(mappeddata, function(c) { return d3.min(c.v, function(b) { return b.v; }); }),
				d3.max(mappeddata, function(c) { return d3.max(c.v, function(b) { return b.v; }); })
			]);
	}

	xaxis = d3.svg.axis()
		.scale(xscale)
		.orient('bottom');
	yaxis = d3.svg.axis()
		.scale(yscale)
		.orient('left');

	var line = d3.svg.line()
		.x(function(d) { return xscale(d.n); })
		.y(function(d) { return yscale(d.v); });

	/*if (reset) {
		var clip = d3.select('#linegraph-reveal > rect')
			.attr('width', __svg__.w - __svg__.pl - __svg__.pr)
			.attr('x', -__svg__.w + __svg__.pl + __svg__.pr)
			.attr('height', __svg__.h - __svg__.pt - __svg__.pb)
			.attr('y', __svg__.pt);
	}*/

	var linechart = svg.select('g.linegraph');

	// REMOVE ANY PREVIOUS HIGHLIGHTS
	linechart.selectAll('.point.highlight').remove();

	/*linechart.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + [__svg__.pl, 0] + ')')
		.call(yaxis)
	.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.h + __svg__.pb, 0] + ')')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.style('opacity', 0)
		.text('Value');*/ /// MAY NEED TO CHANGE THE LABEL OF THE Y AXIS

	// ANIMATE THE GROUP IN
	var lines = linechart.selectAll('.line-container')
		.data(mappeddata, function (d) { return d.k; });
	
	lines.enter()
		.append('g')
		.attr('class', 'line-container')
	.append('path')
		.attr('class', 'line')
		.attr('d', function (d) { return line(d.v); })
		.attr('clip-path', 'url(#linegraph-reveal)')
		.style('stroke-width', 6)
		.style('fill', function (d) { 
			if (stepdata.color) return d.stroke = stepdata.color;
			return d.stroke = d3.select(this).style('stroke'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.stroke; });

	lines.exit()
		.remove();

	// ANIMATE THE LINE IN
	/*if (reset) {
		clip.transition()
			.duration(__animation__.dur)
			.ease('ease-in')
			.delay(__animation__.dur / 2)
			.attr('x', __svg__.pl)
			.each('end', checkWHEEL);
	}*/

	// ANIMATE THE LINE THICKNESS
	linechart.selectAll('.line')
		.classed('highlight', function (d) {
			if (highlights && highlights.v.indexOf(d.n) == -1) return false;
			return true;
		})
		.transition()
		.duration(__animation__.dur / 2)
		.ease('ease-out')
		.delay(__animation__.dur / 2)
		.style('stroke', function (d) { 
			if (highlights && highlights.v.indexOf(d.n) !== -1) return highlights.c;
			return d.stroke; 
		})
		.style('stroke-width', 2)
		.each('end', function () {
			//d3.select(this).style('stroke', null);
			if (highlights && reset) {
				if (highlights.t == 'line') return highlightLINE(data, highlights);
				if (highlights.t == 'point') return highlightLINEPOINT(data, highlights);
			}
		});

	// IF THIS IS NOT RESETTING THE CHART, THEN SHOW THE HIGHLIGHTS STRAIGHT AWAY
	if (highlights && !reset) {
		if (highlights.t == 'line') return highlightLINE(data, highlights);
		if (highlights.t == 'point') return highlightLINEPOINT(data, highlights);
	}

	// ANIMATE THE AXES IN
	if (updaterange) {
		linechart.select('.x.axis')
			.transition()
			.duration(__animation__.dur)
			.call(xaxis)
			.each('end', function () {
				d3.select(this).selectAll('g.tick > line')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('y1', -__svg__.h + __svg__.pt + __svg__.pb)
					.attr('y2', 15);
					//.style('opacity', .33);

				d3.select(this).selectAll('path')
					.attr('stroke-dasharray', '5, 5')
					.style('opacity', 1);

				return d3.select(this).selectAll('g.tick > text')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('y', 25)
					.style('opacity', 1);
			});
		linechart.select('.y.axis')
			.transition()
			.duration(__animation__.dur)
			.call(yaxis)
			.each('end', function () {
				d3.select(this).selectAll('g.tick > line')
					.attr('stroke-dasharray', '5, 5')
				.transition()
					.duration(__animation__.dur / 2)
					.attr('x2', __svg__.w - __svg__.pr - __svg__.pl)
					.style('opacity', .33);

				return d3.select(this).selectAll('g.tick > text')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('x', -20)
					.style('opacity', 1);
			});
		/*.select('text.axis-label')
			.style('opacity', 1)
			.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')');*/
	}
}

function drawAREA (stepdata) {
	var svg = d3.select('#svg-container > svg');
	//var formatDate = d3.time.format('%Y%m%d');
	var temp_highlight = ['v2'];

	var data = stepdata.data,
		range = stepdata.yrange,
		highlights = stepdata.highlight;

	data = data.map(function (d) {
		if (d.n instanceof Date == false) {
			d.n = formatDate.parse(d.n);
		}
		return d;
	});

	var keys = d3.keys(data[0]).filter(function(key) { return key !== 'n'; });
	var mappeddata = keys.map(function (key) {
		return {
			k: key,
			v: data.map(function (d) {
				return { n: d.n, v: d[key] };
			})
		}
	});

	xscale = d3.time.scale()
		.range([__svg__.pl, __svg__.pl])
		.domain(d3.extent(data, function(d) { return d.n; }));
	
	if (range) {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.h - __svg__.pb])
			.domain(range);
	} else {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.h - __svg__.pb])
			.domain([
				d3.min(mappeddata, function(c) { return d3.min(c.v, function(b) { return b.v; }); }),
				d3.max(mappeddata, function(c) { return d3.max(c.v, function(b) { return b.v; }); })
			]);
	}

	xaxis = d3.svg.axis()
		.scale(xscale)
		.orient('bottom');
	yaxis = d3.svg.axis()
		.scale(yscale)
		.orient('left');

	var area = d3.svg.area()
		.x(function(d) { return xscale(d.n); })
		.y0(__svg__.h - __svg__.pb)
		.y1(function(d) { return yscale(d.v); });

	var clip = d3.select('defs').append('clipPath')
		.attr('id', 'area-reveal')
	.append('rect')
		.attr('width', __svg__.w - __svg__.pl - __svg__.pr)
		.attr('x', -__svg__.w + __svg__.pl + __svg__.pr)
		.attr('height', __svg__.h - __svg__.pt - __svg__.pb)
		.attr('y', __svg__.pt);

	var areachart = svg.append('g')
		.datum({ type: 'area' })
		.attr('class', 'areachart chart')
		.attr('transform', 'translate(' + [0, __svg__.pt] + ')')
		.style('opacity', 0);

	areachart.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(' + [0, __svg__.h - __svg__.pb] + ')')
		.call(xaxis);

	areachart.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + [__svg__.pl, 0] + ')')
		.call(yaxis)
	.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.h + __svg__.pb, 0] + ')')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.style('opacity', 0)
		.text('Value');

	// ANIMATE THE GROUP IN
	xscale.range([__svg__.pl, __svg__.w - __svg__.pr]);
	yscale.range([__svg__.h - __svg__.pb, __svg__.pt]);

	areachart.transition()
		.duration(__animation__.dur / 2)
		.ease('cubic-out')
		.attr('transform', 'translate(' + [0, 0] + ')')
		.style('opacity', 1);

	var areas = areachart.selectAll('.area-container')
		.data(mappeddata, function (d) { return d.k; });
	areas.enter()
		.append('g')
		.attr('class', 'area-container');
	areas.append('path')
		.attr('class', 'area')
		.attr('d', function (d) { return area(d.v); })
		.attr('clip-path', 'url(#area-reveal)')
		.style('fill', function (d) { 
			if (stepdata.color) return d.fill = stepdata.color;
			return d.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.fill; });

	// ANIMATE THE LINE IN
	clip.transition()
		.duration(__animation__.dur)
		.ease('ease-in')
		.delay(__animation__.dur / 2)
		.attr('x', __svg__.pl)
		.each('end', checkWHEEL);

	// ANIMATE THE LINE THICKNESS
	/*areachart.selectAll('.line')
		.transition()
		.duration(__animation__.dur / 2)
		.ease('ease-out')
		.delay(__animation__.dur / 2)
		.each('end', function () {*/
	setTimeout(function () {		
		if (highlights) {
			return highlightAREA(stepdata);
		}
	}, __animation__.dur);

	// ANIMATE THE AXES IN
	areachart.select('.x.axis')
		.transition()
		.duration(__animation__.dur)
		.call(xaxis)
		.each('end', function () {
			d3.select(this).selectAll('g.tick > line')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('y1', -__svg__.h + __svg__.pt + __svg__.pb)
				.attr('y2', 15);
				//.style('opacity', .33);

			d3.select(this).selectAll('path')
				.attr('stroke-dasharray', '5, 5')
				.style('opacity', 1);

			return d3.select(this).selectAll('g.tick > text')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('y', 25)
				.style('opacity', 1);
		});
	areachart.select('.y.axis')
		.transition()
		.duration(__animation__.dur)
		.call(yaxis)
		.each('end', function () {
			d3.select(this).selectAll('g.tick > line')
				.attr('stroke-dasharray', '5, 5')
			.transition()
				.duration(__animation__.dur / 2)
				.attr('x2', __svg__.w - __svg__.pr - __svg__.pl)
				.style('opacity', .33);

			return d3.select(this).selectAll('g.tick > text')
				.transition()
				.duration(__animation__.dur / 2)
				.attr('x', -20)
				.style('opacity', 1);
		});
	/*.select('text.axis-label')
		.style('opacity', 1)
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')');*/
}

function updateAREA (stepdata, reset) {
	var svg = d3.select('#svg-container > svg');
	//var formatDate = d3.time.format('%Y%m%d');
	var temp_highlight = ['v2'];

	var updaterange = false;
	
	var data = stepdata.data,
		range = stepdata.yrange,
		highlights = stepdata.highlight;

	// CHECK IF RANGE HAS CHANGED
	if (range && range.equals(yscale.domain()) == false) updaterange = true;

	data = data.map(function (d) {
		if (d.n instanceof Date == false) {
			d.n = formatDate.parse(d.n);
		}
		return d;
	});

	var keys = d3.keys(data[0]).filter(function(key) { return key !== 'n'; });
	var mappeddata = keys.map(function (key) {
		return {
			k: key,
			v: data.map(function (d) {
				return { n: d.n, v: d[key] };
			})
		}
	});

	xscale = d3.time.scale()
		.range([__svg__.pl, __svg__.w - __svg__.pr])
		.domain(d3.extent(data, function(d) { return d.n; }));

	if (range) {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.pt])
			.domain(range);
	} else {
		yscale = d3.scale.linear()
			.range([__svg__.h - __svg__.pb, __svg__.pt])
			.domain([
				d3.min(mappeddata, function(c) { return d3.min(c.v, function(b) { return b.v; }); }),
				d3.max(mappeddata, function(c) { return d3.max(c.v, function(b) { return b.v; }); })
			]);
	}

	xaxis = d3.svg.axis()
		.scale(xscale)
		.orient('bottom');
	yaxis = d3.svg.axis()
		.scale(yscale)
		.orient('left');

	var area = d3.svg.area()
		.x(function(d) { return xscale(d.n); })
		.y0(__svg__.h - __svg__.pb)
		.y1(function(d) { return yscale(d.v); });

	/*if (reset) {
		var clip = d3.select('#area-reveal > rect')
			.attr('width', __svg__.w - __svg__.pl - __svg__.pr)
			.attr('x', -__svg__.w + __svg__.pl + __svg__.pr)
			.attr('height', __svg__.h - __svg__.pt - __svg__.pb)
			.attr('y', __svg__.pt);
	}*/

	var areachart = svg.select('.areachart');

	areachart.selectAll('.point.highlight').remove();

	/*areachart.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + [__svg__.pl, 0] + ')')
		.call(yaxis)
	.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90) translate(' + [-__svg__.h + __svg__.pb, 0] + ')')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.style('opacity', 0)
		.text('Value');*/

	// ANIMATE THE GROUP IN
	var areas = areachart.selectAll('.area-container')
		.data(mappeddata, function (d) { return d.k; });

	areas.enter()
		.append('g')
		.attr('class', 'area-container')
	.append('path')
		.attr('class', 'area')
		.attr('d', function (d) { return area(d.v); })
		.attr('clip-path', 'url(#area-reveal)')
		.style('fill', function (d) { 
			if (stepdata.color) return d.fill = stepdata.color;
			return d.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.fill; });

	areas.exit()
		.remove();

	// ANIMATE THE LINE IN
	/*if (reset) {
		clip.transition()
			.duration(__animation__.dur)
			.ease('ease-in')
			.delay(__animation__.dur / 2)
			.attr('x', __svg__.pl)
			.each('end', checkWHEEL);
	}*/

	// ANIMATE THE LINE THICKNESS
	var timer = __animation__.dur;
	if (highlights && !reset) timer = 0;
	setTimeout(function () {		
		if (highlights) {
			return highlightAREA(stepdata);
		}
	}, timer);

	// ANIMATE THE AXES IN
	if (updaterange) {
		areachart.select('.x.axis')
			.transition()
			.duration(__animation__.dur)
			.call(xaxis)
			.each('end', function () {
				d3.select(this).selectAll('g.tick > line')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('y1', -__svg__.h + __svg__.pt + __svg__.pb)
					.attr('y2', 15);
					//.style('opacity', .33);

				d3.select(this).selectAll('path')
					.attr('stroke-dasharray', '5, 5')
					.style('opacity', 1);

				return d3.select(this).selectAll('g.tick > text')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('y', 25)
					.style('opacity', 1);
			});
		areachart.select('.y.axis')
			.transition()
			.duration(__animation__.dur)
			.call(yaxis)
			.each('end', function () {
				d3.select(this).selectAll('g.tick > line')
					.attr('stroke-dasharray', '5, 5')
				.transition()
					.duration(__animation__.dur / 2)
					.attr('x2', __svg__.w - __svg__.pr - __svg__.pl)
					.style('opacity', .33);

				return d3.select(this).selectAll('g.tick > text')
					.transition()
					.duration(__animation__.dur / 2)
					.attr('x', -20)
					.style('opacity', 1);
			});
		/*.select('text.axis-label')
			.style('opacity', 1)
			.attr('transform', 'rotate(-90) translate(' + [-__svg__.pt, 0] + ')');*/
	}
}

function highlightAREA (stepdata) { 
	var data = stepdata.data,
		highlights = stepdata.highlight;	

	// ANIMATE THE HIGHLIGHT
	hp = highlights.v;
	hp = hp.map(function (d) {
		return formatDate.parse(d).getTime();
	});
	var highlightdata = data.filter(function (d) {
		return hp.indexOf(d.n.getTime()) !== -1;
	});
	//console.log(highlightdata)
	return highlightdata.forEach(function (d, i) {
		var posx = xscale(d.n),
			posy = yscale(d.v);
		var pointw = 10;

		var chart = d3.select('g.chart')
			.append('g')
			.datum(highlights)
			.attr('class', 'point highlight')
			.attr('transform', 'translate(' + [posx, 0] + ')');
		/*chart.append('circle')
			.attr('class', 'highlight')
			.attr('cx', posx)
			.attr('cy', posy)
			.attr('r', d3.max([__svg__.w, __svg__.h]) / 4)
			.style('opacity', 0)
			.style('stroke', points.c)
			.style('stroke-width', 50)
		.transition()
			.duration(__animation__.dur / 4)
			.ease('ease-in')
			.delay(i * __animation__.del)
			.attr('r', 10)
			.style('opacity', 1)
			.style('stroke-width', 2)
			.each('end', checkWHEEL);*/

		chart.append('circle')
			//.datum(points)
			//.attr('class', 'point highlight')
			.attr('cx', 0)
			.attr('cy', posy)
			//.attr('r', d3.max([__svg__.w, __svg__.h]) / 4)
			.attr('r', 0)
			//.style('opacity', 0)
			.style('fill', highlights.c)
			//.style('stroke', highlights.c)
			//.style('stroke-width', 50)
			//.style('stroke', '#FFF')
		.transition()
			.duration(__animation__.dur / 4)
			//.ease('ease-in')
			.ease('elastic-in')
			.delay(i * __animation__.del)
			.attr('r', pointw)
			//.style('opacity', 1)
			//.style('stroke-width', 2)
			.each('end', checkWHEEL);

		chart.insert('line', 'circle')
			//.attr('class', 'highlight')
			.attr('x1', 0)
			.attr('y1', posy)
			.attr('x2', 0)
			.attr('y2', posy)
			.style('stroke', highlights.c)
			.style('stroke-width', 4)
		.transition()
			.duration(__animation__.dur / 2)
			.attr('y2', __svg__.h - __svg__.pb);
	});
}

function drawSCATTER () {
	return null;
}

function updateSCATTER () {
	return null;
}

function updateMAP () {
	return null;
}


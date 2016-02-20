var xscale, yscale, xaxis, yaxis, arc;
var formatDate = d3.time.format('%Y%m%d');
//var timeoutvar;

var projection, path;

function setSVG () {
	return d3.select('#svg-container')
		.append('svg')
			.attr('width', __svg__.w)
			.attr('height', __svg__.h)
		.append('defs');
}

function drawMAP (stepdata) {

	var svg = d3.select('#svg-container > svg');

	var clip = svg.select('defs').append('clipPath')
		.attr('id', 'map-reveal')
	.append('circle')
		.attr('cx', __svg__.w / 2)
		.attr('cy', __svg__.h / 2)
		.attr('r', 0);

	var map = svg.append('g')
		.datum({ type: 'map' })
		.attr('class', 'map chart')
		.attr('clip-path', 'url(#map-reveal)');

	var highlights = stepdata.highlight;

	projection = stepdata.projection
		.scale(stepdata.scale)
		.translate([__svg__.w / 2, __svg__.h / 2])
		.precision(.1);

	path = d3.geo.path()
		.projection(projection);

	var graticule = d3.geo.graticule();

	svg.select('defs').append('path')
		.datum({type: 'Sphere'})
		.attr('id', 'sphere')
		.attr('d', path);

	map.append('use')
	    .attr('class', 'boundary')
	    .attr('xlink:href', '#sphere')
	    .style('stroke', styling.c);

	map.append('path')
		.datum(graticule)
		.attr('class', 'graticule')
		.attr('d', path)
		.style('stroke', styling.c);


	//if (d3.selectAll('.land')[0].length == 0) {
		d3.json('data/worldlowdetail.json', function(error, world) {
			if (error) throw error;

			map.selectAll('.land')
				.data(topojson.feature(world, world.objects.subunits).features)
				//.attr('class', 'land')
			.enter().append('path')
				.attr('class', 'land')
				.attr('d', path)
				.style('fill', function (d) { return d.fill = stepdata.color; })
				.style('stroke', function (d) { return d.fill; });
				/*.on('mouseover', function (d) {
					return drawINFOBUBBLE(this, d.properties.name);
				})
				.on('mousemove', function (d) {
					return updateINFOBUBBLE(this);
				})
				.on('mouseout', function (d) {
					return clearINFOBUBBLE(this);
				});*/


			// ANIMATE THE LINE IN
			clip.transition()
				.duration(__animation__.dur)
				.ease('ease-out')
				.delay(function () {
					if (stepdata.background) {
						return __animation__.dur / 2;
					} else {
						return 0;
					}
				})
				.attr('r', d3.max([__svg__.w, __svg__.h]))
				.each('end', function () {
					return highlightMAP(stepdata);
					//return checkWHEEL();
				});


		});
	//}

	d3.select(self.frameElement).style('height', __svg__.h + 'px');

}

function highlightMAP (stepdata, stroke) {
	var svg = d3.select('#svg-container > svg'),
		map = svg.select('.map');

	var highlights = stepdata.highlight,
		timer = 0;
	if (highlights !== undefined) {
		/*d3.selectAll('.country:not(.highlight)').filter(function (d) { return highlights.v.indexOf(d.id) !== -1; })
			.transition()
				.duration(__animation__.dur)
				.delay(function (d, i) { return i * __animation__.del; })
				.style('fill', highlights.c)
				.style('stroke', highlights.c)
				.style('stroke-width', function () {
					if (stroke) return stroke;
					return 1;
				})
				.each('end', function () {
					return d3.select(this).classed('highlight', true);
					//return checkWHEEL();
				});*/

		d3.json('data/worldlowdetail.administrative.json', function(error, world) {
			if (error) throw error;

			world.objects.subunits.geometries = world.objects.subunits.geometries.filter(function (d) {
				return highlights.v.indexOf(d.id) !== -1;
			});
			

			map.selectAll('.country')
				.data(topojson.feature(world, world.objects.subunits).features)
				//.attr('class', 'land')
			.enter().append('path')
				.attr('class', 'country land highlight')
				.attr('d', path)
				.style('fill', function (d) { return highlights.c; })
				.style('stroke', function (d) { return highlights.c; })
				.style('opacity', 0)
				.on('mouseover', function (d) {
					return drawINFOBUBBLE(this, d.properties.name);
				})
				.on('mousemove', function (d) {
					return updateINFOBUBBLE(this);
				})
				.on('mouseout', function (d) {
					return clearINFOBUBBLE(this);
				})
			.transition()
				.duration(__animation__.dur)
				.delay(function (d, i) { return i * __animation__.del; })
				.style('opacity', .9);

		});

		timer = (highlights.v.length - d3.selectAll('.country.highlight')[0].length) * __animation__.del + __animation__.dur;
	}
	
	return setTimeout(function () {
		if (highlights !== undefined) {	
			var boundariesx = new Array(),
				boundariesy = new Array();

			d3.selectAll('.land')
				.each(function (d) {
					if (highlights.v.indexOf(d.id) !== -1) {
						var bbox = this.getBBox();
						boundariesx.push(bbox.x);
						boundariesx.push(bbox.x + bbox.width);
						boundariesy.push(bbox.y);
						boundariesy.push(bbox.y + bbox.height);
					}
				});

			var minx = d3.min(boundariesx), maxx = d3.max(boundariesx),
				miny = d3.min(boundariesy), maxy = d3.max(boundariesy);

			var x, y, k;

			
			x = minx + (maxx - minx) / 2;
			y = miny + (maxy - miny) / 2;
			k = 1;
			if (stepdata.zoom) k = stepdata.zoom;

			map.transition()
				.duration(__animation__.dur)
				.attr('transform', 'translate(' + __svg__.w / 2 + ',' + __svg__.h / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
				.each('end', checkWHEEL);
			//map.selectAll('path:not(.highlight)')
			map.selectAll('path')
				.transition()
				.duration(__animation__.dur)
				.style('stroke-width', 1 / k);
		} else {
			return checkWHEEL();
		}
	}, timer);
}

function updateMAP (stepdata) {
	var svg = d3.select('#svg-container > svg'),
		map = svg.select('.map'),
		highlights = stepdata.highlight;
		//ctrs = 0;

	//if (highlights !== undefined) ctrs = d3.selectAll('.country').filter(function (d) { return highlights.v.indexOf(d.id) !== -1 })[0].length;

	if (highlights !== undefined) {

		var boundariesx = new Array(),
			boundariesy = new Array();

		d3.selectAll('.country')
			.each(function (d) {
				if (highlights.v.indexOf(d.id) !== -1) {
					var bbox = this.getBBox();
					boundariesx.push(bbox.x);
					boundariesx.push(bbox.x + bbox.width);
					boundariesy.push(bbox.y);
					boundariesy.push(bbox.y + bbox.height);
				}
			});

		var minx = d3.min(boundariesx), maxx = d3.max(boundariesx),
			miny = d3.min(boundariesy), maxy = d3.max(boundariesy);

		var x, y, k;

		
		if (minx !== undefined && maxx !== undefined) x = minx + (maxx - minx) / 2;
		if (miny !== undefined && maxy !== undefined) y = miny + (maxy - miny) / 2;
		k = 1;
		if (stepdata.zoom) k = stepdata.zoom;
			//centered = d;
		/*} else {
			x = width / 2;
			y = height / 2;
			k = 1;
			//centered = null;
		}*/

		map.transition()
			.duration(__animation__.dur)
			.attr('transform', function () {
				if (x !== undefined && y !== undefined) return 'translate(' + __svg__.w / 2 + ',' + __svg__.h / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')';
				return 'translate(' + [0, 0] + ')';
			});
		//map.selectAll('path:not(.highlight)')
		map.selectAll('path')
			.transition()
			.duration(__animation__.dur)
			.style('stroke-width', 1 / k);

		return highlightMAP(stepdata, 1 / k);

	} else {
		map.transition()
			.duration(__animation__.dur)
			.attr('transform', 'translate(' + [0, 0] + ')')
			.each('end', checkWHEEL);
		map.selectAll('path:not(.highlight)')
			.transition()
			.duration(__animation__.dur)
			.style('stroke-width', 1);
		return map.selectAll('.country')
			.classed('highlight', false)
			.transition()
			.duration(__animation__.dur)
			.style('opacity', 0)
			.style('stroke-width', 1)
		.each('end', function () {
			return d3.select(this).remove();
		})
	}
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
		.ticks(5);

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
		.style('stroke', function (d) { return d.fill; })
		.on('mouseover', function (d) {
			return drawINFOBUBBLE(this, d.v);
		})
		.on('mousemove', function (d) {
			return updateINFOBUBBLE(this);
		})
		.on('mouseout', function (d) {
			return clearINFOBUBBLE(this);
		});

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
		.style('opacity', 1);
		//.each('end', checkWHEEL);

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
			checkWHEEL();
			if (highlights) return highlightBAR(stepdata);
		});

	// ANIMATE THE AXES IN
	barchart.select('.x.axis')
		.transition()
		.duration(__animation__.dur)
		.call(xaxis)
		.each(function () {
			var node = d3.select(this);
			node.selectAll('text')
				.style('fill', styling.c);
			node.selectAll('path')
				.style('stroke', styling.c);
			return node.selectAll('line')
				.style('stroke', styling.c);
		})
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
		.each(function () {
			var node = d3.select(this);
			node.selectAll('text')
				.style('fill', styling.c);
			node.selectAll('path')
				.style('stroke', styling.c);
			return node.selectAll('line')
				.style('stroke', styling.c);
		})
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
		.insert('g', ':first-child')
		.attr('class', 'arc');

	slices.append('path')
		.attr('d', arc)
		.style('fill', function (d) { 
			if (stepdata.color) return d.data.fill = stepdata.color;
			return d.data.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) { return d.data.fill; })
		.on('mouseover', function (d) {
			return drawINFOBUBBLE(this, d.data.v);
		})
		.on('mousemove', function (d) {
			return updateINFOBUBBLE(this);
		})
		.on('mouseout', function (d) {
			return clearINFOBUBBLE(this);
		})
		.each(function (d) { this._current = d; });

	slices.append('text')
		.attr('transform', function(d) { return 'translate(' + labelArc.centroid(d) + ')'; })
		.attr('dy', '.35em')
		.attr('text-anchor', 'middle')
		.style('fill', styling.tbg)
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

	//return slices.selectAll('text').moveToFront();

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
	
	/*var arc = d3.svg.arc()
		.outerRadius(radius)
		.innerRadius(0);*/

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
		//.ease('linear')
		//.delay(function (d, i) { return i * __animation__.del })
	.select('path')
		.attr('class', function (d) {
			if (highlights && highlights.v.indexOf(d.data.n) == -1) return null;
			return 'highlight';
		})
		//.attr('d', arc)
		.attrTween("d", arcTween)
		.attr('transform', function (d) {
			var t = d3.transform(d3.select(this).attr('transform')),
				x = t.translate[0],
				y = t.translate[1];
			if (highlights && highlights.v.indexOf(d.data.n) == -1) return 'translate(' + [0, 0] + ')';
			return 'translate(' + [x, y] + ')'
		})
		.style('fill', function (d) {
			if (d3.select(this).classed('highlight')) return d3.select(this).style('fill');
			if (stepdata.color) return d.data.fill = stepdata.color;
			return d.data.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.style('stroke', function (d) {
			if (d3.select(this).classed('highlight')) return d3.select(this).style('fill');
			if (stepdata.color) return d.data.fill = stepdata.color;
			return d.data.fill = d3.select(this).style('fill'); // GET IT FROM THE CSS
		})
		.each('end', checkWHEEL)

	slices.exit()
		.remove();

	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
			return function(t) {
				return arc(i(t));
			};
	}

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
		.each(function () {
			var node = d3.select(this);
			node.selectAll('text')
				.style('fill', styling.c);
			node.selectAll('path')
				.style('stroke', styling.c);
			return node.selectAll('line')
				.style('stroke', styling.c);
		})
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
		.each(function () {
			var node = d3.select(this);
			node.selectAll('text')
				.style('fill', styling.c);
			node.selectAll('path')
				.style('stroke', styling.c);
			return node.selectAll('line')
				.style('stroke', styling.c);
		})
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
		.each(function () {
			var node = d3.select(this);
			node.selectAll('text')
				.style('fill', styling.c);
			node.selectAll('path')
				.style('stroke', styling.c);
			return node.selectAll('line')
				.style('stroke', styling.c);
		})
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
		.each(function () {
			var node = d3.select(this);
			node.selectAll('text')
				.style('fill', styling.c);
			node.selectAll('path')
				.style('stroke', styling.c);
			return node.selectAll('line')
				.style('stroke', styling.c);
		})
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


function drawINFOBUBBLE (node, info) {
	clearINFOBUBBLE(node);
	var svg = d3.select('#svg-container > svg');

	var pos = d3.mouse(svg.node()),
		boxpadding = 5;

	var x, y, align;
	if (pos[0] <= __svg__.w / 2) {
		x = pos[0] + boxpadding;
		align = 'start';
	} else if (pos[0] > __svg__.w / 2) {
		x = pos[0] - boxpadding * 2;
		align = 'end';
	}

	y = pos[1];

	var infobubble = svg.append('g')
		.attr('class', 'info')
		.attr('transform', 'translate(' + [x, y] + ')');

	var rect = infobubble.append('rect')
		.style('fill', styling.tbg);

	var text = infobubble.append('text')
		.attr('x', function () {
			if (align == 'start') return boxpadding;
			return 0;
		})
		.style('text-anchor', align)
		.style('fill', styling.t)
		.text(info);
	var textBBox = text.node().getBBox();

	rect.attr('x', function () {
			if (align == 'start') return 0;
			return -textBBox.width - boxpadding;
		})
		.attr('y', -textBBox.height * 3 / 4)
		.attr('width', textBBox.width + boxpadding * 2)
		.attr('height', textBBox.height);

	infobubble.attr('transform', 'translate(' + [x, pos[1] + textBBox.height / 4] + ')');

	d3.select(node)
		.classed('glow', true)
		.style('stroke-width', function () {
			var node = d3.select(this);
			if (node.classed('persona')) {
				var scale = d3.transform(node.attr('transform')).scale[0];
				return 1 / scale;
			} else if (node.classed('country')) {
				var scale = d3.transform(d3.select('.map').attr('transform')).scale[0];
				return 1 / scale;
			}
			return 1;
		})
		.style('stroke', styling.c)
		.moveToFront();

	return d3.select(node.parentNode).select('text')
		.moveToFront();
}

function updateINFOBUBBLE (node) {
	var svg = d3.select('#svg-container > svg');

	var pos = d3.mouse(svg.node()),
		boxpadding = 5;

	var x, y, align;
	if (pos[0] <= __svg__.w / 2) {
		x = pos[0] + boxpadding;
		align = 'start';
	} else if (pos[0] > __svg__.w / 2) {
		x = pos[0] - boxpadding * 2;
		align = 'end';
	}

	y = pos[1];

	var infobubble = svg.select('.info');

	var text = infobubble.select('text')
		.attr('x', function () {
			if (align == 'start') return boxpadding;
			return 0;
		})
		.style('text-anchor', align);

	var textBBox = text.node().getBBox();

	infobubble.select('rect')
		.attr('x', function () {
			if (align == 'start') return 0;
			return -textBBox.width - boxpadding;
		})
		.attr('y', -textBBox.height * 3 / 4);


	return infobubble.attr('transform', 'translate(' + [x, pos[1] + textBBox.height / 4] + ')');
}

function clearINFOBUBBLE (node) {
	d3.selectAll('.glow')//.filter(function () { return this !== node; })
		.classed('glow', false)
		.style('stroke-width', function () {
			var node = d3.select(this);
			if (node.classed('persona')) {
				var scale = d3.transform(node.attr('transform')).scale[0];
				return 1 / scale;
			} else if (node.classed('country')) {
				var scale = d3.transform(d3.select('.map').attr('transform')).scale[0];
				return 1 / scale;
			}
			return 1;
		})
		.style('stroke', function (d) { 
			if (d3.select(this).classed('highlight')) return d3.select(this).style('fill');
			if (d3.select(this.parentNode).classed('arc')) return d.data.fill;
			return d.fill; 
		});
	return d3.selectAll('.info').remove();
}
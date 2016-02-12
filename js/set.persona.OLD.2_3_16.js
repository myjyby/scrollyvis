var descrbie_units = true;

var centers = new Array(), 
	unitradius = 10, unitize;

var force = d3.layout.force()
	.gravity(0)
	//.charge(-unitradius * 3) // FOR SIMPLE CIRCLE
	.size([__svg__.w, __svg__.h]);

var nodes = force.nodes();

function setFORCE (stepdata) {
	var charge = 3;
	if (stepdata.units.t == 'isotype') charge = 5;
	force.charge(-unitradius * charge);

	force.on('tick', function(e) {
		var svg = d3.select('#svg-container > svg');
		var k = e.alpha * .1;
		nodes.forEach(function(node) {
			var center = centers.filter(function (d) { return d.type == node.type; });
			node.x += (center[0].x - node.x) * k;
			node.y += (center[0].y - node.y) * k;

		var shapeoffset = 1;
		if (stepdata.units.t == 'isotype') shapeoffset = 40;


			// FOR SIMPLE CIRCLE
			//if (stepdata.units.type == 'bubble') {
			if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
				if (node.y < unitradius + shapeoffset) node.y = unitradius + shapeoffset; // THE +1 IS FOR THE BORDER STROKE
				if (node.y > __svg__.h - unitradius - shapeoffset) node.y = __svg__.h - unitradius - shapeoffset;
			}
			// FOR ISOTYPE
			//} else if (stepdata.units.type == 'isotype') {
				//if (node.y <= unitradius + 30) node.y = unitradius + 30; // THE +1 IS FOR THE BORDER STROKE
				//if (node.type == 'above' && node.y >= __svg__.h / 2 - 30) node.y = __svg__.h / 2 - 30;
				//if (node.y >= __svg__.h - unitradius - 30) node.y = __svg__.h - unitradius - 30;
				//if (node.type == 'below' && node.y <= __svg__.h / 2 + 30) node.y = __svg__.h / 2 + 30;
			//}
			
			// FOR THE LINEGRAPH
			//if (node.x <= xscale(node.idx -1) + unitradius * 2) node.x = xscale(node.idx -1) + unitradius * 2 + unitradius / 2;
			//if (node.x >= xscale(node.idx + 1) - unitradius * 2) node.x = xscale(node.idx + 1) - unitradius * 2 -unitradius / 2;

			// FOR THE BARCHART
			//if (node.x < xscale_bar(node.idx) + unitradius) node.x = xscale_bar(node.idx) + unitradius * 2 + unitradius / 2;
			//if (node.x > xscale_bar(node.idx + 1) - unitradius * 2) node.x = xscale_bar(node.idx + 1) - unitradius *2 - unitradius / 2;
		});

		svg.selectAll('.persona')
			//.attr('cx', function(d) { return d.x; })
			//.attr('cy', function(d) { return d.y; });
			.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')'; });
	});
}

function drawPERSONA (stepdata) {
	var svg = d3.select('#svg-container > svg'),
		chart = d3.select('g.chart');

	// CLEAR ALL HIGHLIGHTS
	d3.selectAll('.highlight').classed('highlight', false);

	var highlightcolor = stepdata.highlight.c;

		//index = i; // MISSING INDEX > USED TO BE RETRIEVED FROM THE d3.selectAll

	var displayed = d3.selectAll('.persona')[0].length,
		fromAbove = d3.selectAll('.persona.above')[0].length,
		fromBelow = d3.selectAll('.persona.below')[0].length;

	// CLEAR PREVIOUS POPULATIONS
	clearInterval(unitize);
	//clearPersona();

	// DISPLAY THE ANIMATION FEEDBACK
	d3.select('.animation-feedback-container')
		.classed('hide', false)
		.attr('transform', function () {
			var section = d3.select('.section.selected'),
				cx = section.attr('cx'),
				cy = section.attr('cy');
			return 'translate (' + [cx - 7.5 / 2, cy - 7.5 / 2] + ')';
		});


	// CHECK FOR CHART TYPE
	// IF BARCHART
	if (stepdata.from == 'bar') {
		var datum = stepdata.data.filter(function (d) { return stepdata.highlight.v.indexOf(d.n) !== -1; })[0],
			threshold = Math.round(datum.v);

		var population = d3.max(yscale.domain());
		// AND PUT THE FOLLOWING CODE IN THERE
		if (displayed == 0) { // FIRST DRAW THE UNITS
			// RESET THE NUMBER OF NODES
			nodes.length = 0;

			d3.selectAll('.bar')
				.each(function (d) { 
					if (stepdata.highlight.v.indexOf(d.n) !== -1) {
						return d3.select(this).classed('highlight', true);
					}
				});

			var origin = d3.select('.bar.highlight');
			var bardelay = (d3.selectAll('.bar')[0].length - 1) * __animation__.pers;


			d3.selectAll('.bar')
				.each(function (d, i) {
					// DRAW THE COMPLEMENTARY VALUE
					var bottom = yscale(d.v);
					var ishighlighted = d3.select(this).classed('highlight');

					chart.append('rect')
						.datum(d)
						.attr('class', 'complementary bar')
						.classed('highlight', ishighlighted)
						.attr('width', xscale.rangeBand())
						.attr('x', xscale(d.n))
						.attr('height', 0)
						.attr('y', __svg__.pt)
					.transition()
						.duration(__animation__.dur)
						.delay(i * __animation__.pers)
						.attr('height', bottom - __svg__.pt);

					// REDUCE OPACITY OF IRRELEVANT BARS
					if (!ishighlighted) {
						d3.select(this)
							.transition()
							.duration(bardelay + __animation__.dur)
							.style('opacity', 0.5);
					}

				});

			// MOVE ALL THE HIGHLIGHTED BARS TO THE FRONT
			d3.selectAll('.bar.highlight').moveToFront();
			// UPDATE THE DELAY
			bardelay += __animation__.dur * 1.25

			chart
				.selectAll('*:not(.highlight)')
				.transition()
				.duration(__animation__.dur / 2)
				.delay(bardelay)
				.style('opacity', 0);

			d3.selectAll('.highlight')
				.transition()
				.duration(__animation__.dur / 2)
				.delay(bardelay)
				.attr('x', 0)
				.attr('width', 20);

			bardelay += __animation__.dur / 2;

			// ANIMATE THE DOTS
			if (stepdata.units.l == 'force') setFORCE(stepdata);

			if (descrbie_units) {
				bardelay += addINITIALUNITBELOW(stepdata, datum, bardelay, highlightcolor);
				bardelay += addINITIALUNITABOVE(stepdata, datum, bardelay, highlightcolor);
				population -= 2;
			}

			d3.selectAll('.highlight')
				.transition()
				//.duration(__animation__.dur)
				.delay(bardelay)
				//.attr('x', 0)
				/*.attr('y', function () {
					if (d3.select(this).classed('complementary')) return 0;
					return __svg__.h / 2
				})
				.attr('height', __svg__.h / 2)*/
				.each('end', function (d) {
					var count = threshold;
					if (d3.select(this).classed('complementary') && threshold < population - threshold) count = population;
					if (!d3.select(this).classed('complementary') && threshold > population - threshold) count = population;

					d3.select(this)
						.transition()
						.duration(function () {
							if (displayed == 0) { // CHECK IF THE STAT PERSONA ARE DISPLAYED
								return __animation__.pers * count;
							} else {
								return __animation__.dur;
							}
						})
						.attr('height', 2)
						.attr('y', function (d) { return yscale(d.v); });
				});

			bardelay += addUNITS(stepdata, population, datum, bardelay, highlightcolor);

			// ANIMATE THE LEFTOVER BARS
			var necessarybar = d3.select('.bar.highlight:not(.complementary)'),
				unnecessarybar = d3.select('.bar.highlight.complementary');
			//bardelay += __animation__.pers * population;
			if (threshold < population - threshold) {
				necessarybar = d3.select('.bar.highlight.complementary');
				unnecessarybar = d3.select('.bar.highlight:not(.complementary)');
			}
				
			setTimeout(function () {
				
				// REMOVE THE UNECESSARY BAR
				unnecessarybar.remove();


				necessarybar
					.transition()
					.duration(__animation__.dur)
					//.delay(bardelay + __animation__.dur * 3.5 + waitforit)
					.attr('width', __svg__.w)
					.attr('x', 0)
					.attr('height', 1)
					.attr('y', __svg__.h / 2)
					.style('fill', '#FFF')
					.style('stroke', 'none')
					.style('stroke-width', 0)
					.each('end', checkWHEEL);
					
				chart.append('text')
					.attr('class', 'above axis-label')
					.attr('x', 0)
					.attr('y', __svg__.h / 2)
					.style('opacity', 0)
					.text('above')
				.transition()
					.duration(__animation__.dur / 2)
					.ease('elastic-in')
					//.delay(bardelay + __animation__.dur * 3.5 + waitforit)
					.delay(__animation__.dur)
					.attr('y', __svg__.h / 2 - 11)
					.style('opacity', 1);

				chart.append('text')
					.attr('class', 'below axis-label')
					.attr('x', __svg__.w)
					.attr('y', __svg__.h / 2)
					.style('text-anchor', 'end')
					.style('opacity', 0)
					.text('below')
				.transition()
					.duration(__animation__.dur / 2)
					.ease('elastic-in')
					//.delay(bardelay + __animation__.dur * 3.5 + waitforit)
					.delay(__animation__.dur)
					.attr('y', __svg__.h / 2 + 30)
					.style('opacity', 1);
			}, bardelay);
	
		} else { // THIS IS FOR THE UPDATE
			force.stop();
			
			d3.selectAll('.highlight').classed('highlight', false);
			d3.selectAll('.bar')
				.each(function (d) {
					if (stepdata.highlight.v.indexOf(d.n) !== -1) d3.select(this).classed('highlight', true);
				});

			var origin = svg.select('.highlight:not(.complementary)');
				//highlightcolor = stepdata.highlight.c;
			/*var datum = origin.datum(),
				threshold = Math.round(datum.v);*/


			var rands = new Array();
			if (fromBelow < threshold) {
				var diff = threshold - fromBelow;
				for (var n = 0; n < diff; n++) {
					var random = Math.round(Math.random() * fromAbove);
					if (rands.indexOf(random) == -1) {
						rands[n] = random;
					} else {
						var random = Math.round(Math.random() * fromAbove);
						rands[n] = random;
					}
				}

				d3.selectAll('.persona.above')
					.each(function (d, i) {
						if (rands.indexOf(i) !== -1) {
							d.type = 'below';
							d3.select(this)
								.moveToFront()
								.classed('above', false)
								.classed('below', true);
							
							d3.select(this.firstChild)
							.transition()
								.duration(__animation__.dur / 2)
								.delay(function (d, i) { return i * __animation__.pers; })
								.style('fill', function (d) {
									if (d.type == 'below') return highlightcolor;
									return null;
								})
								.style('stroke', function (d) {
									if (d.type == 'below') return highlightcolor;
									return null;
								});
							if (stepdata.units.t == 'bubble') return addHELLOLABEL(d3.select(this));
						}
					})

			} else if (fromBelow > threshold) {
				var diff = fromBelow - threshold;
				for (var n = 0; n < diff; n++) {
					var random = Math.round(Math.random() * fromBelow);
					if (rands.indexOf(random) == -1) {
						rands[n] = random;
					} else {
						var random = Math.round(Math.random() * fromBelow);
						rands[n] = random;
					}
				}

				d3.selectAll('.persona.below')
					.each(function (d, i) {
						var topcolor = d3.select('.persona.above').style('fill');
						if (rands.indexOf(i) !== -1) {
							d.type = 'above';
							d3.select(this)
								.moveToFront()
								.classed('below', false)
								.classed('above', true);
							
							d3.select(this.firstChild)
							.transition()
								.duration(__animation__.dur / 2)
								.delay(function (d, i) { return i * __animation__.pers; })
								.style('fill', topcolor)
								.style('stroke', topcolor);
							if (stepdata.units.t == 'bubble') return addHELLOLABEL(d3.select(this));
						}
					});
			}

			if (stepdata.units.l == 'force') {
				setTimeout(function () {
					force.start();
					return checkWHEEL();
				}, __animation__.dur);
				return setTimeout(function () {
					return d3.selectAll('.speech-bubble')
						.remove();
				}, __animation__.dur * 4);
			} else if (stepdata.units.l == 'grid') {
				setTimeout(function () {
					var diff = fromBelow - threshold;
					updateUNITS(stepdata, fromAbove, fromBelow, threshold);
					return checkWHEEL();
				}, __animation__.dur);
			}
		}
	
	} else if (stepdata.from == 'pie') {
		var sum = d3.sum(stepdata.data, function (d) { return d.v; });

		var proportionscale = d3.scale.linear()
			.domain([0, sum])
			.range([0, 100]);

		/*var complementarydatum = stepdata.data.filter(function (d) { return stepdata.highlight.v.indexOf(d.n) == -1; });
		complementarydatum = { n: 'complementary', v: d3.sum(complementarydatum, function (d) { return d.v; }), fill: complementarydatum[0].fill };*/

		var datum = stepdata.data.filter(function (d) { return stepdata.highlight.v.indexOf(d.n) !== -1; })[0],
			//threshold = Math.round(datum.v);
			threshold = Math.round(proportionscale(datum.v));

		//var fulldata = [datum, complementarydatum];

		/*var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.v; });*/

		var population = d3.max(proportionscale.range());
		//threshold = proportionscale(threshold);

		
		if (displayed == 0) { // FIRST DRAW THE UNITS
			// RESET THE NUMBER OF NODES
			nodes.length = 0;

			d3.selectAll('.arc')
			.each(function (d) { 
				if (stepdata.highlight.v.indexOf(d.data.n) !== -1) {
					return d3.select(this).classed('highlight', true);
				} else {
					return d3.select(this).classed('complementary', true);
				}
			});

			var origin = d3.select('.arc.highlight');
			var piedelay = (d3.selectAll('.arc')[0].length - 1) * __animation__.pers;

			//origin.moveToFront();


			if (stepdata.units.l == 'force') setFORCE(stepdata);

			if (descrbie_units) {
				piedelay += addINITIALUNITBELOW(stepdata, datum, piedelay, highlightcolor);
				//bardelay += addINITIALUNITABOVE(stepdata, datum, bardelay, highlightcolor);
				population -= 1;
			}

			arc = d3.svg.arc()
				.outerRadius(1)
				.innerRadius(0);

			d3.selectAll('.arc > path')
				.transition()
				.duration(function () {
					var count = threshold;
					if (d3.select(this.parentNode).classed('highlight') && threshold > population - threshold) count = population;
					if (!d3.select(this.parentNode).classed('highlight') && threshold < population - threshold) count = population;
					
					if (displayed == 0) { // CHECK IF THE STAT PERSONA ARE DISPLAYED
						return __animation__.pers * count;
					} else {
						return __animation__.dur;
					}
					//return population * __animation__.pers;
				})
				.delay(piedelay)
				.attr('d', arc)
				.each('end', function () {
					return d3.select(this).classed('hide', true);
				});

			d3.selectAll('.arc > text')
				.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 0);

			/*d3.selectAll('.arc.highlight > path')
				.transition()
				.duration(__animation__.dur)
				.delay(bardelay)
				.attr('d', arc);
			d3.selectAll('.arc:not(.highlight) > path')
				.transition()
				.duration(__animation__.dur)
				.delay(function (d, i) { return bardelay + __animation__.pers; })
				.attr('d', arc);*/

			piedelay += addUNITS(stepdata, population, datum, piedelay, highlightcolor);

			setTimeout(function () {
				

				chart.append('line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('x2', 0)
					.attr('y2', 0)
					.style('stroke', function () {
						if (threshold > population - threshold) return highlightcolor;
						return d3.select('.complementary').style('fill');
					})
				.transition()
					.duration(__animation__.dur)
					.attr('x1', 0)
					.attr('y1', -__svg__.h / 2)
					.attr('x2', 0)
					.attr('y2', __svg__.h / 2)
					.style('stroke', '#FFF')
					.each('end', checkWHEEL);

				/*d3.select('.point.highlight > circle')
					.transition()
					.duration(__animation__.dur)
					.attr('r', 0)
					.attr('cy', __svg__.h / 2)
					.style('fill', '#FFF')
					.each('end', checkWHEEL);
					
				chart.append('text')
					.attr('class', 'above axis-label')
					.attr('x', 0)
					.attr('y', __svg__.h / 2)
					.style('opacity', 0)
					.text('above')
				.transition()
					.duration(__animation__.dur / 2)
					.ease('elastic-in')
					//.delay(pointdelay + __animation__.dur * 3.5 + waitforit)
					.delay(__animation__.dur)
					.attr('y', __svg__.h / 2 - 11)
					.style('opacity', 1);

				chart.append('text')
					.attr('class', 'below axis-label')
					.attr('x', __svg__.w)
					.attr('y', __svg__.h / 2)
					.style('text-anchor', 'end')
					.style('opacity', 0)
					.text('below')
				.transition()
					.duration(__animation__.dur / 2)
					.ease('elastic-in')
					//.delay(pointdelay + __animation__.dur * 3.5 + waitforit)
					.delay(__animation__.dur)
					.attr('y', __svg__.h / 2 + 30)
					.style('opacity', 1);*/
			}, piedelay);

			//setTimeout(checkWHEEL, bardelay);

		} else { // THIS IS FOR THE UPDATE
			force.stop();
			
			d3.selectAll('.arc').classed('highlight', false);
			d3.selectAll('.arc')
			.each(function (d) { 
				if (stepdata.highlight.v.indexOf(d.data.n) !== -1) {
					return d3.select(this).classed('highlight', true);
				} else {
					return d3.select(this).classed('complementary', true);
				}
			});


			var origin = d3.select('.arc.highlight');

			var rands = new Array();
			if (fromBelow < threshold) {
				var diff = threshold - fromBelow;
				for (var n = 0; n < diff; n++) {
					var random = Math.round(Math.random() * fromAbove);
					if (rands.indexOf(random) == -1) {
						rands[n] = random;
					} else {
						var random = Math.round(Math.random() * fromAbove);
						rands[n] = random;
					}
				}

				d3.selectAll('.persona.above')
					.each(function (d, i) {
						if (rands.indexOf(i) !== -1) {
							d.type = 'below';
							d3.select(this)
								.moveToFront()
								.classed('above', false)
								.classed('below', true);
							
							d3.select(this.firstChild)
							.transition()
								.duration(__animation__.dur / 2)
								.delay(function (d, i) { return i * __animation__.pers; })
								.style('fill', function (d) {
									if (d.type == 'below') return highlightcolor;
									return null;
								})
								.style('stroke', function (d) {
									if (d.type == 'below') return highlightcolor;
									return null;
								});
							if (stepdata.units.t == 'bubble') return addHELLOLABEL(d3.select(this));
						}
					})

			} else if (fromBelow > threshold) {
				var diff = fromBelow - threshold;
				for (var n = 0; n < diff; n++) {
					var random = Math.round(Math.random() * fromBelow);
					if (rands.indexOf(random) == -1) {
						rands[n] = random;
					} else {
						var random = Math.round(Math.random() * fromBelow);
						rands[n] = random;
					}
				}

				d3.selectAll('.persona.below')
					.each(function (d, i) {
						var topcolor = d3.select('.persona.above > circle').style('fill');
						console.log(topcolor)
						if (rands.indexOf(i) !== -1) {
							d.type = 'above';
							d3.select(this)
								.moveToFront()
								.classed('below', false)
								.classed('above', true);
							
							d3.select(this.firstChild)
							.transition()
								.duration(__animation__.dur / 2)
								.delay(function (d, i) { return i * __animation__.pers; })
								.style('fill', topcolor)
								.style('stroke', topcolor);
							if (stepdata.units.t == 'bubble') return addHELLOLABEL(d3.select(this));
						}
					});
			}

			if (stepdata.units.l == 'force') {
				setTimeout(function () {
					force.start();
					return checkWHEEL();
				}, __animation__.dur);
				return setTimeout(function () {
					return d3.selectAll('.speech-bubble')
						.remove();
				}, __animation__.dur * 4);
			} else if (stepdata.units.l == 'grid') {
				setTimeout(function () {
					var diff = fromBelow - threshold;
					updateUNITS(stepdata, fromAbove, fromBelow, threshold);
					return checkWHEEL();
				}, __animation__.dur);
			}

		}

	} else if (['line', 'area'].indexOf(stepdata.from) !== - 1){

		var population = d3.max(yscale.domain());

		var hp = stepdata.highlight.v;
		hp = hp.map(function (d) {
			return formatDate.parse(d).getTime();
		});

		var datum = stepdata.data.filter(function (d) { 
				return hp.indexOf(d.n.getTime()) !== -1;
			})[0],
			threshold = Math.round(datum.v);

		// AND PUT THE FOLLOWING CODE IN THERE
		if (displayed == 0) { // FIRST DRAW THE UNITS
			// RESET THE NUMBER OF NODES
			nodes.length = 0;

			d3.selectAll('.point')
				.each(function (d) { 
					if (stepdata.highlight.v.indexOf(d.v[0]) !== -1) {
						d3.selectAll(this.childNodes).classed('highlight', true);
						return d3.select(this).classed('highlight', true);
					}
				});

			var origin = d3.select('.point.highlight');
			var pointdelay = (d3.selectAll('.point.highlight')[0].length - 1) * __animation__.pers;


			d3.selectAll('.point.highlight')
				.each(function (d, i) {
					// DRAW THE COMPLEMENTARY VALUE
					var bottom = yscale(datum.v);
					var ishighlighted = d3.select(this).classed('highlight');

					d3.select(this).insert('line', 'circle')
						.datum(datum)
						.attr('class', 'complementary')
						.classed('highlight', ishighlighted)
						.attr('x1', 0)
						.attr('y1', __svg__.pt)
						.attr('x2', 0)
						.attr('y2', __svg__.pt)
						.style('stroke', '#FFF')
						.style('stroke-width', 4)
					.transition()
						.duration(__animation__.dur / 2)
						.delay(i * __animation__.pers)
						.attr('y2', bottom);

					// REDUCE OPACITY OF IRRELEVANT BARS
					if (!ishighlighted) {
						d3.select(this)
							.transition()
							.duration(pointdelay + __animation__.dur)
							.style('opacity', 0.5);
					}

				});

			// MOVE ALL THE HIGHLIGHTED BARS TO THE FRONT
			d3.selectAll('.point.highlight').moveToFront();
			// UPDATE THE DELAY
			pointdelay += __animation__.dur * 1.25

			chart
				.selectAll('*:not(.highlight)')
				.transition()
				.duration(__animation__.dur / 2)
				.delay(pointdelay)
				.style('opacity', 0);

			d3.selectAll('.point.highlight')
				.transition()
				.duration(__animation__.dur / 2)
				.delay(pointdelay)
				.attr('transform', function () {
					var r = d3.select(this).select('circle').attr('r');
					return 'translate(' + [r, 0] + ')';
				});

			pointdelay += __animation__.dur / 2;

			// ANIMATE THE DOTS
			if (stepdata.units.l == 'force') setFORCE(stepdata);

			if (descrbie_units) {
				pointdelay += addINITIALUNITBELOW(stepdata, datum, pointdelay, highlightcolor);
				pointdelay += addINITIALUNITABOVE(stepdata, datum, pointdelay, highlightcolor);
				population -= 2;
			}

			d3.selectAll('.highlight line')
				.transition()
				.delay(pointdelay)
				.each('end', function (d) {
					var count = threshold;
					if (d3.select(this).classed('complementary') && threshold < population - threshold) count = population;
					if (!d3.select(this).classed('complementary') && threshold > population - threshold) count = population;

					if (d3.select(this).classed('complementary')) {
						d3.select(this)
							.transition()
							.duration(function () {
								if (displayed == 0) { // CHECK IF THE STAT PERSONA ARE DISPLAYED
									return __animation__.pers * count;
								} else {
									return __animation__.dur;
								}
							})
							.attr('y1', function (d) { 
								return yscale(d.v);
							});
					} else {
						d3.select(this)
							.transition()
							.duration(function () {
								if (displayed == 0) { // CHECK IF THE STAT PERSONA ARE DISPLAYED
									return __animation__.pers * count;
								} else {
									return __animation__.dur;
								}
							})
							.attr('y2', function (d) { 
								return yscale(datum.v);
							});
					}

				});

			pointdelay += addUNITS(stepdata, population, datum, pointdelay, highlightcolor);

			setTimeout(function () {
				
				var circleradius = d3.select('.point.highlight > circle').attr('r');

				chart.append('line')
					.attr('x1', circleradius)
					.attr('y1', yscale(datum.v))
					.attr('x2', circleradius)
					.attr('y2', yscale(datum.v))
					.style('stroke', highlightcolor)
				.transition()
					.duration(__animation__.dur)
					.attr('x1', 0)
					.attr('y1', __svg__.h / 2)
					.attr('x2', __svg__.w)
					.attr('y2', __svg__.h / 2)
					.style('stroke', '#FFF');

				d3.select('.point.highlight > circle')
					.transition()
					.duration(__animation__.dur)
					.attr('r', 0)
					.attr('cy', __svg__.h / 2)
					.style('fill', '#FFF')
					.each('end', checkWHEEL);
					
				chart.append('text')
					.attr('class', 'above axis-label')
					.attr('x', 0)
					.attr('y', __svg__.h / 2)
					.style('opacity', 0)
					.text('above')
				.transition()
					.duration(__animation__.dur / 2)
					.ease('elastic-in')
					//.delay(pointdelay + __animation__.dur * 3.5 + waitforit)
					.delay(__animation__.dur)
					.attr('y', __svg__.h / 2 - 11)
					.style('opacity', 1);

				chart.append('text')
					.attr('class', 'below axis-label')
					.attr('x', __svg__.w)
					.attr('y', __svg__.h / 2)
					.style('text-anchor', 'end')
					.style('opacity', 0)
					.text('below')
				.transition()
					.duration(__animation__.dur / 2)
					.ease('elastic-in')
					//.delay(pointdelay + __animation__.dur * 3.5 + waitforit)
					.delay(__animation__.dur)
					.attr('y', __svg__.h / 2 + 30)
					.style('opacity', 1);
			}, pointdelay);
		} else { // THIS IS FOR THE UPDATE
			force.stop();
			
			d3.selectAll('.highlight').classed('highlight', false);
			d3.selectAll('.point')
				.each(function (d) {
					if (stepdata.highlight.v.indexOf(d.n) !== -1) d3.select(this).classed('highlight', true);
				});

			var rands = new Array();
			if (fromBelow < threshold) {
				var diff = threshold - fromBelow;
				for (var n = 0; n < diff; n++) {
					var random = Math.round(Math.random() * fromAbove);
					if (rands.indexOf(random) == -1) {
						rands[n] = random;
					} else {
						var random = Math.round(Math.random() * fromAbove);
						rands[n] = random;
					}
				}

				d3.selectAll('.persona.above')
					.each(function (d, i) {
						if (rands.indexOf(i) !== -1) {
							d.type = 'below';
							d3.select(this)
								.moveToFront()
								.classed('above', false)
								.classed('below', true);
							
							d3.select(this.firstChild)
							.transition()
								.duration(__animation__.dur / 2)
								.delay(function (d, i) { return i * __animation__.pers; })
								.style('fill', function (d) {
									if (d.type == 'below') return highlightcolor;
									return null;
								})
								.style('stroke', function (d) {
									if (d.type == 'below') return highlightcolor;
									return null;
								});
							if (stepdata.units.t == 'bubble') return addHELLOLABEL(d3.select(this));
						}
					})

			} else if (fromBelow > threshold) {
				var diff = fromBelow - threshold;
				for (var n = 0; n < diff; n++) {
					var random = Math.round(Math.random() * fromBelow);
					if (rands.indexOf(random) == -1) {
						rands[n] = random;
					} else {
						var random = Math.round(Math.random() * fromBelow);
						rands[n] = random;
					}
				}

				d3.selectAll('.persona.below')
					.each(function (d, i) {
						var topcolor = d3.select('.persona.above').style('fill');
						if (rands.indexOf(i) !== -1) {
							d.type = 'above';
							d3.select(this)
								.moveToFront()
								.classed('below', false)
								.classed('above', true);
							
							d3.select(this.firstChild)
							.transition()
								.duration(__animation__.dur / 2)
								.delay(function (d, i) { return i * __animation__.pers; })
								.style('fill', topcolor)
								.style('stroke', topcolor);
							if (stepdata.units.t == 'bubble') return addHELLOLABEL(d3.select(this));
						}
					});
			}

			if (stepdata.units.l == 'force') {
				setTimeout(function () {
					force.start();
					return checkWHEEL();
				}, __animation__.dur);
				return setTimeout(function () {
					return d3.selectAll('.speech-bubble')
						.remove();
				}, __animation__.dur * 4);
			} else if (stepdata.units.l == 'grid') {
				setTimeout(function () {
					var diff = fromBelow - threshold;
					updateUNITS(stepdata, fromAbove, fromBelow, threshold);
					return checkWHEEL();
				}, __animation__.dur);
			}
		}	
	}
}

function addINITIALUNITBELOW (stepdata, datum, delay, color) {

	if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
		centers = [ 
			{ type: 'above', x: __svg__.w / 2, y: __svg__.h / 4, fixed: true }, 
			{ type: 'below', x: __svg__.w / 2, y: __svg__.h * 3 / 4, fixed: true } 
			];
	} else if (stepdata.from == 'pie') {
		var slice = d3.select('.arc.highlight'),
			slice_datum = slice.datum(),
			path = slice.select('path');
		
		var radius = Math.min(__svg__.w - __svg__.pl - __svg__.pr, __svg__.h - __svg__.pt - __svg__.pb) / 2,
			offset = d3.transform(path.attr('transform')).translate;

		var angleRadian = angle(slice_datum) * (Math.PI/180),
			cartesian_x = (radius + 100) * Math.cos(angleRadian),
			cartesian_y = (radius + 100) * Math.sin(angleRadian);

		centers = [ 
			{ type: 'above', x: -cartesian_x - offset[0], y: -cartesian_y - offset[1], fixed: true }, 
			{ type: 'below', x: cartesian_x + offset[0], y: cartesian_y + offset[1], fixed: true } 
		];
	}

	var j = 0, above = 0, below = 0, threshold = Math.round(datum.v);
	var svg = d3.select('#svg-container > svg'),
		chart = d3.select('g.chart');
	var timeout = __animation__.dur * 2;

	var shapeoffset = 1;
	if (stepdata.units.t == 'isotype') shapeoffset = 40;

	var originnode = d3.selectAll('.highlight')[0][0],
		bbox = originnode.getBBox(),
		originwidth = bbox.width;

	force.stop();
	setTimeout(function () {
		//node = { type: 'below', shape: stepdata.units.t, x: xscale.rangeBand() / 2, y: yscale(datum.v) + shapeoffset }; //, idx: index };

		if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
			node = { type: 'below', shape: stepdata.units.t, x: 15, y: yscale(datum.v) + shapeoffset }; 
		} else if (stepdata.from == 'pie') {
			node = { type: 'below', shape: stepdata.units.t, x: 0, y: 0 }; // BECAUSE THE g.chart IS ALREADY TRANSLATED TO THE CENTER
		}

		//var unit = chart.insert('g', '.highlight')
		var unit = chart.append('g')
			.data([node])
			.attr('class', function (d) { return 'persona animated first ' + d.type })
			.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')'; });

		if (stepdata.units.t == 'bubble') {
			unit.append('circle')
				.attr('r', unitradius)
				.style('fill', function (d) {
					if (d.type == 'below') return color;
					return null;
				})
				.style('stroke', function (d) {
					if (d.type == 'below') return color;
					return null;
				});
		} else if (stepdata.units.t == 'isotype') {
			unit.append('path')
				.attr('transform', function (d) {
					if (d.type == 'above') return 'translate(' + [-originwidth / 2 - 15, 35] + ') scale(0.1)';
					if (d.type == 'below') return 'translate(' + [-originwidth / 2 - 15, -45] + ') scale(0.1)';
				})
				.attr('d', 'M9.598,36.451L7.983,55.566H0l1.613-2.178l1.694-23.471c0,0-3.307-0.723-3.307-3.709C0,23.225,0,13.628,0,8.95 c0-3.79,1.613-4.354,3.951-4.354c1.773,0,2.983,0,2.983,0c0-2.257-0.645-2.822-0.645-5.726c0-3.71,1.533-4.436,3.71-4.436 s3.711,0.726,3.711,4.436c0,2.904-0.646,3.468-0.646,5.726c0,0,1.211,0,2.983,0C18.39,4.595,20,5.16,20,8.95 c0,4.679,0,14.275,0,17.259c0,2.986-3.308,3.709-3.308,3.709l1.697,23.471L20,55.566h-7.982l-1.616-19.115H9.598z')
				.style('fill', function (d) {
					if (d.type == 'below') return color;
					return null;
				})
				.style('stroke', function (d) {
					if (d.type == 'below') return color;
					return null;
				})
				.style('opacity', 0.25)
			.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 1)
				.attr('transform', 'translate(' + [-10, -30] + ') scale(1)');
		}

		if (stepdata.units.l == 'grid') {
			var maxline = 25;
			
			var xshapesize = unitradius * 3,
				yshapesize = unitradius * 3;
			if (stepdata.units.t == 'isotype') { xshapesize = 30; yshapesize = 70; }

			unit.transition()
				.duration(__animation__.dur / 2)
				.attr('transform', function (d) {
					/*if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 - 2 * yshapesize] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + 2 * yshapesize] + ')';*/
					/*if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.pt / 2] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + __svg__.pt / 2] + ')';*/
					if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - xshapesize / 2, __svg__.pt / 2 + 3 * yshapesize] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - xshapesize / 2, __svg__.h / 2 + __svg__.pt / 2] + ')';
				});

			unit.transition()
				.duration(__animation__.dur / 2)
				.delay(timeout * 2)
				.attr('transform', function (d) {
					if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.pt / 2] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + __svg__.pt / 2] + ')';
				});
		}

		setTimeout(function () {
			return addHELLOLABEL(unit);
		}, __animation__.dur / 2);

		nodes.push(node);
		force.start();
		
		j++;
	}, delay);
	return timeout;
}


function addINITIALUNITABOVE (stepdata, datum, delay, color) {
		
	if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
		centers = [ 
			{ type: 'above', x: __svg__.w / 2, y: __svg__.h / 4, fixed: true }, 
			{ type: 'below', x: __svg__.w / 2, y: __svg__.h * 3 / 4, fixed: true } 
			];
	} else if (stepdata.from == 'pie') {
		var slice = d3.select('.arc.highlight'),
			slice_datum = slice.datum(),
			path = slice.select('path');
		
		var radius = Math.min(__svg__.w - __svg__.pl - __svg__.pr, __svg__.h - __svg__.pt - __svg__.pb) / 2,
			offset = d3.transform(path.attr('transform')).translate;

		var angleRadian = angle(slice_datum) * (Math.PI/180),
			cartesian_x = (radius + 100) * Math.cos(angleRadian),
			cartesian_y = (radius + 100) * Math.sin(angleRadian);

		centers = [ 
			{ type: 'above', x: -cartesian_x - offset[0], y: -cartesian_y - offset[1], fixed: true }, 
			{ type: 'below', x: cartesian_x + offset[0], y: cartesian_y + offset[1], fixed: true } 
		];
	}

	var j = 0, above = 0, below = 0, threshold = Math.round(datum.v);
	var svg = d3.select('#svg-container > svg'),
		chart = d3.select('g.chart');
	var timeout = __animation__.dur * 2;

	var shapeoffset = 1;
	if (stepdata.units.t == 'isotype') shapeoffset = 40;

	var originnode = d3.selectAll('.highlight')[0][0],
		bbox = originnode.getBBox(),
		originwidth = bbox.width;

	force.stop();
	setTimeout(function () {
		//node = { type: 'above', shape: stepdata.units.t, x: xscale.rangeBand() / 2, y: yscale(datum.v) - shapeoffset }; //, idx: index };
		//node = { type: 'above', shape: stepdata.units.t, x: 15, y: yscale(datum.v) - shapeoffset }; 

		if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
			node = { type: 'above', shape: stepdata.units.t, x: 15, y: yscale(datum.v) - shapeoffset }; 
		} else if (stepdata.from == 'pie') {
			node = { type: 'above', shape: stepdata.units.t, x: 0, y: 0 }; // BECAUSE THE g.chart IS ALREADY TRANSLATED TO THE CENTER
		}

		//var unit = chart.insert('g', '.highlight')
		var unit = chart.append('g')
			.data([node])
			.attr('class', function (d) { return 'persona animated first ' + d.type })
			.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')'; });

		if (stepdata.units.t == 'bubble') {
			unit.append('circle')
				.attr('r', unitradius)
				.style('fill', function (d) {
					if (d.type == 'below') return color;
					return null;
				})
				.style('stroke', function (d) {
					if (d.type == 'below') return color;
					return null;
				});
		} else if (stepdata.units.t == 'isotype') {
			unit.append('path')
				.attr('transform', function (d) {
					if (d.type == 'above') return 'translate(' + [-originwidth / 2 - 15, 35] + ') scale(0.1)';
					if (d.type == 'below') return 'translate(' + [-originwidth / 2 - 15, -45] + ') scale(0.1)';
				})
				.attr('d', 'M9.598,36.451L7.983,55.566H0l1.613-2.178l1.694-23.471c0,0-3.307-0.723-3.307-3.709C0,23.225,0,13.628,0,8.95 c0-3.79,1.613-4.354,3.951-4.354c1.773,0,2.983,0,2.983,0c0-2.257-0.645-2.822-0.645-5.726c0-3.71,1.533-4.436,3.71-4.436 s3.711,0.726,3.711,4.436c0,2.904-0.646,3.468-0.646,5.726c0,0,1.211,0,2.983,0C18.39,4.595,20,5.16,20,8.95 c0,4.679,0,14.275,0,17.259c0,2.986-3.308,3.709-3.308,3.709l1.697,23.471L20,55.566h-7.982l-1.616-19.115H9.598z')
				.style('fill', function (d) {
					if (d.type == 'below') return color;
					return null;
				})
				.style('stroke', function (d) {
					if (d.type == 'below') return color;
					return null;
				})
				.style('opacity', 0.25)
			.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 1)
				.attr('transform', 'translate(' + [-10, -30] + ') scale(1)');
		}

		if (stepdata.units.l == 'grid') {
			var maxline = 25;
			
			var xshapesize = unitradius * 3,
				yshapesize = unitradius * 3;
			if (stepdata.units.t == 'isotype') { xshapesize = 30; yshapesize = 70; }				

			unit.transition()
				.duration(__animation__.dur / 2)
				.attr('transform', function (d) {
					/*if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 - 2 * yshapesize] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + 2 * yshapesize] + ')';*/
					/*if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.pt / 2] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + __svg__.pt / 2] + ')';*/
					if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - xshapesize / 2, __svg__.pt / 2 + 3 * yshapesize] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - xshapesize / 2, __svg__.h / 2 + __svg__.pt / 2] + ')';
				});

			unit.transition()
				.duration(__animation__.dur / 2)
				.delay(timeout)
				.attr('transform', function (d) {
					if (d.type == 'above') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.pt / 2] + ')';
					if (d.type == 'below') return 'translate(' + [__svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + __svg__.pt / 2] + ')';
				});
		}

		setTimeout(function () {
			return addHELLOLABEL(unit);
		}, __animation__.dur / 2);

		nodes.push(node);
		force.start();
		
		j++;
	}, delay);
	return timeout;
}


function addUNITS (stepdata, n, datum, delay, color) {
	
	/*centers = [ 
		{ type: 'above', x: __svg__.w / 2, y: __svg__.h / 4, fixed: true }, 
		{ type: 'below', x: __svg__.w / 2, y: __svg__.h * 3 / 4, fixed: true } 
		];*/

	if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
		centers = [ 
			{ type: 'above', x: __svg__.w / 2, y: __svg__.h / 4, fixed: true }, 
			{ type: 'below', x: __svg__.w / 2, y: __svg__.h * 3 / 4, fixed: true } 
			];
	} else if (stepdata.from == 'pie') {

		var slice = d3.select('.arc.highlight'),
			slice_datum = slice.datum(),
			path = slice.select('path');
		
		var radius = Math.min(__svg__.w - __svg__.pl - __svg__.pr, __svg__.h - __svg__.pt - __svg__.pb) / 2,
			offset = d3.transform(path.attr('transform')).translate;

		var angleRadian = angle(slice_datum) * (Math.PI/180),
			cartesian_x = radius * Math.cos(angleRadian),
			cartesian_y = radius * Math.sin(angleRadian);

		centers = [ 
			{ type: 'above', x: -cartesian_x - offset[0], y: -cartesian_y - offset[1], fixed: true }, 
			{ type: 'below', x: cartesian_x + offset[0], y: cartesian_y + offset[1], fixed: true } 
		];
	}

	var j = 0, above = 0, below = 0;

	if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
		var threshold = Math.round(datum.v);
	} else if (stepdata.from == 'pie') {
		var sum = d3.sum(stepdata.data, function (d) { return d.v; });

		var proportionscale = d3.scale.linear()
			.domain([0, sum])
			.range([0, 100]);

		var datum = stepdata.data.filter(function (d) { return stepdata.highlight.v.indexOf(d.n) !== -1; })[0],
			threshold = Math.round(proportionscale(datum.v));
	}

	var svg = d3.select('#svg-container > svg'),
		chart = d3.select('g.chart');

	var shapeoffset = 1;
	if (stepdata.units.t == 'isotype') shapeoffset = 40;

	//n -= 2; // BECAUSE WE HAVE THE INITIAL TWO WITH THE LABELS
	var maxline = 25, acount = 0, bcount = 0, aline = 0, bline = 0;
	if (descrbie_units) { acount = 1; above = 1; bcount = 1; below = 1; }

	var originnode = d3.selectAll('.highlight')[0][0],
		bbox = originnode.getBBox(),
		//originwidth = bbox.width;
		originwidth = 20;

	force.stop();
	setTimeout(function () {
		
		d3.selectAll('.speech-bubble').remove();
		
		unitize = setInterval(function () {  
			if (j < n) {
				if (above == n - (threshold - 1)) {
					var type = 'below';
					//node = { type: type, shape: stepdata.units.t, x: xscale.rangeBand() / 2, y: yscale(datum.v) + shapeoffset }; //, idx: index };
					//node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) + shapeoffset }; 

					if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
						node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) + shapeoffset }; 
					} else if (stepdata.from == 'pie') {
						var slice = d3.select('.arc.highlight'),
							slice_datum = slice.datum().data;
						node = { type: type, shape: stepdata.units.t, x: 0, y: 0, fill: slice_datum.fill }; // BECAUSE THE g.chart IS ALREADY TRANSLATED TO THE CENTER
					}

					below ++;
				} else if (below == (threshold - 1)) {
					var type = 'above';
					//node = { type: type, shape: stepdata.units.t, x: xscale.rangeBand() / 2, y: yscale(datum.v) - shapeoffset }; //, idx: index };
					//node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) - shapeoffset };

					if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
						node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) - shapeoffset }; 
					} else if (stepdata.from == 'pie') {
						var slice = d3.select('.arc.highlight'),
							slice_datum = slice.datum().data;
						node = { type: type, shape: stepdata.units.t, x: 0, y: 0, fill: slice_datum.fill }; // BECAUSE THE g.chart IS ALREADY TRANSLATED TO THE CENTER
					}

					above ++;
				} else {
					var type = ['above', 'below'][Math.round(Math.random())];
				
					if (type == 'below') {
						//node = { type: type, shape: stepdata.units.t, x: xscale.rangeBand() / 2, y: yscale(datum.v) + shapeoffset }; //, idx: index };
						//node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) + shapeoffset };

						if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
							node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) + shapeoffset }; 
						} else if (stepdata.from == 'pie') {
							var slice = d3.select('.arc.highlight'),
								slice_datum = slice.datum().data;
							node = { type: type, shape: stepdata.units.t, x: 0, y: 0, fill: slice_datum.fill }; // BECAUSE THE g.chart IS ALREADY TRANSLATED TO THE CENTER
						}
						
						below ++;
					} else {
						//node = { type: type, shape: stepdata.units.t, x: xscale.rangeBand() / 2, y: yscale(datum.v) - shapeoffset }; //, idx: index };
						//node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) - shapeoffset };

						if (['bar', 'line', 'area'].indexOf(stepdata.from) !== -1) {
							node = { type: type, shape: stepdata.units.t, x: originwidth / 2, y: yscale(datum.v) + shapeoffset }; 
						} else if (stepdata.from == 'pie') {
							var slice = d3.select('.arc.highlight'),
								slice_datum = slice.datum().data;
							node = { type: type, shape: stepdata.units.t, x: 0, y: 0, fill: slice_datum.fill }; // BECAUSE THE g.chart IS ALREADY TRANSLATED TO THE CENTER
						}

						above ++;
					}
				}



				//var unit = chart.insert('g', '.highlight')
				var unit = chart.append('g')
					.data([node])
					.attr('class', function (d) { return 'persona animated ' + d.type })
					.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')'; });

				if (stepdata.units.t == 'bubble') {
					unit.append('circle')
						.attr('r', unitradius)
						.style('fill', function (d) {
							if (d.type == 'below') return color;
							if (d.fill) return d.fill;
							return null;
						})
						.style('stroke', function (d) {
							if (d.type == 'below') return color;
							if (d.fill) return d.fill;
							return null;
						});
				} else if (stepdata.units.t == 'isotype') {
					unit.append('path')
						.attr('transform', function (d) {
							if (d.type == 'above') return 'translate(' + [-2.5, 35] + ') scale(0.25)';
							if (d.type == 'below') return 'translate(' + [-2.5, -45] + ') scale(0.25)';
						})
						.attr('d', 'M9.598,36.451L7.983,55.566H0l1.613-2.178l1.694-23.471c0,0-3.307-0.723-3.307-3.709C0,23.225,0,13.628,0,8.95 c0-3.79,1.613-4.354,3.951-4.354c1.773,0,2.983,0,2.983,0c0-2.257-0.645-2.822-0.645-5.726c0-3.71,1.533-4.436,3.71-4.436 s3.711,0.726,3.711,4.436c0,2.904-0.646,3.468-0.646,5.726c0,0,1.211,0,2.983,0C18.39,4.595,20,5.16,20,8.95 c0,4.679,0,14.275,0,17.259c0,2.986-3.308,3.709-3.308,3.709l1.697,23.471L20,55.566h-7.982l-1.616-19.115H9.598z')
						.style('fill', function (d) {
							if (d.type == 'below') return color;
							return null;
						})
						.style('stroke', function (d) {
							if (d.type == 'below') return color;
							return null;
						})
						.style('opacity', 0.25)
					.transition()
						.duration(__animation__.dur / 2)
						.style('opacity', 1)
						.attr('transform', 'translate(' + [-10, -30] + ') scale(1)');
				}

				if (stepdata.units.l == 'grid') {
					
					
					var xshapesize = unitradius * 3,
						yshapesize = unitradius * 3;
					if (stepdata.units.t == 'isotype') { xshapesize = 30; yshapesize = 70; }

					unit.transition()
						.duration(__animation__.dur / 2)
						.attr('transform', function (d) {
							/*if (d.type == 'above') return 'translate(' + [acount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 - aline * yshapesize] + ')';
							if (d.type == 'below') return 'translate(' + [bcount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + bline * yshapesize] + ')';*/
							if (d.type == 'above') return 'translate(' + [acount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.pt / 2 + aline * yshapesize] + ')';
							if (d.type == 'below') return 'translate(' + [bcount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + __svg__.pt / 2 + bline * yshapesize] + ')';
						});

					if (type == 'above') acount ++;
					if (type == 'above' && above % maxline == 0) { aline ++; acount = 0; };

					if (type == 'below') bcount ++;
					if (type == 'below' && below % maxline == 0) { bline ++; bcount = 0; }
				}

				nodes.push(node);
				force.start();
				
				j++;
			} else {
				clearInterval(this);
				// HIDE THE ANIMATION FEEDBACK
				d3.select('.animation-feedback-container')
					.classed('hide', true);
			}
		}, __animation__.pers);
	}, delay);
	descrbie_units = false; // NEED TO SET THIS HERE FOR POSITIONNING OF DOTS

	if (stepdata.from == 'pie') {
		setTimeout(function () {
			var afactor = 1, bfactor = 1;

			centers.forEach(function (d) {
				if (d.type == 'below' && d.x < 0) bfactor = -1;
				if (d.type == 'above' && d.x < 0) afactor = -1;
			})

			force.stop();
			centers = [ 
				{ type: 'above', x: __svg__.w / 4 * afactor, y: 0, fixed: true }, 
				{ type: 'below', x: __svg__.w / 4 * bfactor, y: 0, fixed: true } 
			];
			force.start();
		}, n * __animation__.pers * 1.5);
	}

	return __animation__.pers * n;
}

function updateUNITS (stepdata, a, b, t) {
	var above = 0, acount = 0, aline = 0,
		below = 0, bcount = 0, bline = 0,
		maxline = 25;

	var diff = b - t;

	// IF DIFF IS NEGATIVE THEN THE NEW COMMERS ARRIVE FROM THE TOP

	d3.selectAll('.persona')
		.each(function (d, i) {
			var type = d.type,
				unit = d3.select(this),
				delay = 0;

			var xshapesize = unitradius * 3,
				yshapesize = unitradius * 3;
			if (stepdata.units.t == 'isotype') { xshapesize = 30; yshapesize = 70; }

			if (diff < 0) { // UNITS MOVE DOWN
				if (type == 'above') delay = above * __animation__.pers + Math.abs(diff) * __animation__.pers;
				if (type == 'below') delay = below * __animation__.pers - b * __animation__.pers;
			} else if (diff > 0) { // UNITS MOVE UP
				if (type == 'above') delay = above * __animation__.pers - a * __animation__.pers;
				if (type == 'below') delay = below * __animation__.pers + Math.abs(diff) * __animation__.pers;
			}

			if (delay <= 0) delay = 0;

			unit.transition()
				.duration(__animation__.dur / 2)
				.delay(delay)
				.attr('transform', function () {
					/*if (d.type == 'above') return 'translate(' + [acount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 - aline * yshapesize] + ')';
					if (d.type == 'below') return 'translate(' + [bcount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + bline * yshapesize] + ')';*/
					
					if (type == 'above') return 'translate(' + [acount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.pt / 2 + aline * yshapesize] + ')';
					if (type == 'below') return 'translate(' + [bcount * xshapesize + __svg__.w / 2 - (maxline * xshapesize) / 2, __svg__.h / 2 + __svg__.pt / 2 + bline * yshapesize] + ')';
				});

			if (type == 'above') { acount ++; above ++; }
			if (type == 'above' && above !== 0 && above % maxline == 0) { aline ++; acount = 0; }
			
			if (type == 'below') { bcount ++; below ++ }
			if (type == 'below' && below !== 0 && below % maxline == 0) { bline ++; bcount = 0; }
			
		})

	/*setTimeout(function () {
		// HIDE THE ANIMATION FEEDBACK
		return d3.select('.animation-feedback-container')
			.classed('hide', true);
	}, (a + b) * __animation__.pers);*/
}


function clearPersona () {
	/*d3.selectAll('.point').transition()
		.duration(slowTransitionDuration)
		.ease(Math.sqrt)
		.attr('r', unitradius / 2);*/
	d3.selectAll('.bar').transition()
		.duration(__animation__.dur)
		.ease(Math.sqrt)
		.attr('height', function (d) { return __svg__.h - __svg__.pb - yscale(d.v); })
		.attr('y', function (d) { return yscale(d.v); });

	//return d3.selectAll('.persona').remove();
}

function addHELLOLABEL (unit) {
	var svg = d3.select('#svg-container > svg'),
		chart = d3.select('g.chart'),
		datum = unit.datum();

	/*mark.append('rect')
		.attr('width', 0)
		.attr('height', 0)
		.attr('x', 0)
		.attr('y', -50)
		.style('fill', '#333');*/
	var bw = 100, bh = 25, pw = 10, ph = 10;

	var speech = unit.append('g')
		.attr('class', 'speech-bubble')
		.attr('transform', function () {
			if (datum.shape == 'bubble') return 'translate(' + [0, -unitradius] + ')';
			if (datum.shape == 'isotype') return 'translate(' + [0, -30] + ')';
		});

		//.attr('d', 'M' + [0, 0] + ' L' + [bw, 0] + ' L' + [bw, bh] + ' L' + [bw / 2 + pw / 2, bh] + ' L' + [bw / 2, bh + ph] + ' L' + [bw / 2 - pw / 2, bh] + ' L' + [0, bh] + ' Z')
	/*speech.append('path')
		.attr('d', 'M' + [0, 0] + ' L' + [pw + bw, 0] + ' L' + [pw + bw, bh] + ' L' + [pw, bh] + ' L' + [pw, ph] + ' Z')
		.style('fill', '#333');*/

	speech.append('foreignObject')
		.attr('class', 'speech-bubble')
		.attr('width', bw)
		.attr('height', bh)
		.attr('x', pw * 2)
		.attr('y', 0)
	.append('xhtml:body')
		.style('background-color', 'transparent')
		//.style('border', '1px solid #000')
	.append('div')
		.style('color', '#FFF')
		.html(function () {
			if (datum.shape == 'bubble') return ' John Doe is ' + datum.type;
			if (datum.shape == 'isotype') return '= 1 person ' + datum.type
		});

}
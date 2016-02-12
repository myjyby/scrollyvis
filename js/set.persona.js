
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

	//force.stop();


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
				//.delay(function (d, i) { return piedelay - i * __animation__.pers; })
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
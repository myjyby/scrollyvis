function drawPERSONA (stepdata) {
	var svg = d3.select('#svg-container > svg');

	if (!d3.select('.chart.units')[0][0]) {
		var chart = svg.append('g')
			.datum({ type: 'unit' })
			.attr('class', 'units chart');
	} else {
		var chart = d3.select('.chart.units');
	}

	// CLEAR ALL HIGHLIGHTS
	d3.selectAll('.highlight').classed('highlight', false);

	var displayed = d3.selectAll('.persona')[0].length;

	// CLEAR PREVIOUS POPULATIONS
	clearInterval(unitize);

	// DISPLAY THE ANIMATION FEEDBACK
	d3.select('.animation-feedback-container')
		.classed('hide', false)
		.attr('transform', function () {
			var section = d3.select('.section.selected'),
				cx = section.attr('cx'),
				cy = section.attr('cy');
			return 'translate (' + [cx - 7.5 / 2, cy - 7.5 / 2] + ')';
		});


	// HERE WE DO NOT CHECK FOR CHART TYPE BECAUSE UNITS ARE ALWAYS CATEGORICAL
	if (stepdata.action == 'draw') {
	//if (displayed == 0) {
		// GET NUMBER OF CATEGORIES
		var categories = stepdata.data.map(function (d) {
			return d.n;
		});
		categories = categories.getUnique();
		var totalcount = stepdata.data.map(function (d) {
			return d.v;
		});
		totalcount = d3.sum(totalcount);

		var timer = 0;

		if (stepdata.units.l == 'grid') {
			// FIRST SET ONE FOR EACH CATEGORY
			var ncat = stepdata.data.length;
			var ow, oh, r = 20 / 30;
			ow = Math.floor((__svg__.w - __svg__.pl / 2 - __svg__.pr / 2) / ncat);
			if (ow > (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2) / 2) ow = (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2) / 2;
			oh = ow / r;

			var oxoffset = (__svg__.w - ncat * ow) / 2,
				oyoffset = (__svg__.h - oh) / 2;

			var w, h;
			h = Math.floor(Math.sqrt((((__svg__.w - __svg__.pl / 2 - __svg__.pr / 2) * (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2)) / totalcount) / r));
			w = h * r;

			var nrow = Math.floor((__svg__.w - __svg__.pl / 2 - __svg__.pr / 2) / w),
				row = 0;

			var unitsdata = new Array();

			var u = nrow * w,
				ncol = totalcount / nrow;
			if (Math.round(ncol) < ncol) {
				ncol = Math.round(ncol) + 1;
			} else {
				ncol = Math.round(ncol);
			}
			
			// CHECK IF THERE IS A LAST INCOMPLETE LINE SO IT DOES NOT FLOW OUT OF VIEW
			th = (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2) / ncol;
			if (th < h) {
				h = Math.floor(th);
				w = h * r;
			}

			var xoffset = (__svg__.w - nrow * w) / 2,
				yoffset = (__svg__.h - ncol * h) / 2;
			
			var unitcount = -1;
			stepdata.data.forEach(function (d, i) {
				for (var j = 0; j < d.v; j ++) {
					var x, y;
					unitcount ++;
					if (unitcount !== 0 && unitcount % nrow == 0) row ++;
					unitsdata.push({ v: j, x: (xoffset + (unitcount - row * nrow) * w), y: yoffset + row * h, n: d.n, t: i, idx: unitcount });
				};
			});

			var predata = unitsdata.filter(function (d) {
				return d.v == 0;
			});
			var postdata = unitsdata.filter(function (d) {
				return d.v !== 0;
			});
			

			var persona = chart.selectAll('.persona')
				.data(predata, function (d) { return d.idx; });

			persona.enter()
				/*.append('g')
			.attr('class', 'persona animated')
				.attr('transform', function (d, i) { 
					if (d.v == 0) return 'translate(' + [oxoffset + ow * d.t, oyoffset - 50] + ')'; 
					return 'translate(' + [d.x, d.y] + ')';
				})	
				.style('opacity', 0)*/
			.append('use')
				.attr('class', 'persona animated')
				.attr('xlink:href', 'img/isotype_symbol.svg#persona')
				.attr('transform', function (d) {
					if (d.v == 0) return 'translate(' + [oxoffset + ow * d.t, oyoffset - 50] + ')scale(' + (ow / 20) + ')';
					return 'translate(' + [d.x, d.y] + ')scale(' + (w / 20) + ')';
				})
				.style('opacity', 0)
				.style('fill', function (d) { 
					if (stepdata.highlight) {
						if (stepdata.highlight.v.indexOf(d.n) !== -1) return d.fill = stepdata.highlight.c;
						if (stepdata.color) return d.fill = stepdata.color;
					}
					if (stepdata.color) return d.fill = stepdata.color;
					return d.fill = __color(d.n); 
				})
				.style('stroke', function (d) { return d.fill })
				.style('stroke-width', function (d) {
					var s = d3.transform(d3.select(this).attr('transform')).scale;
					return 1 / s[0];
				})
				.each(function (d, i) {
					var label = chart.append('g')
						.attr('class', 'unit-label')
						.attr('transform', 'translate(' + [oxoffset + ow * d.t, oyoffset - 50] + ')');

					label.append('line')
						.attr('x1', ow / 2)
						.attr('x2', ow / 2)
						.attr('y1', oh)
						.attr('y2', oh)
						.style('stroke', styling.c)
					.transition()
						.duration(__animation__.dur / 2)
						.delay(i * __animation__.del)
						.attr('y2', oh + 50);

					return label.append('foreignObject')
						.attr('width', ow)
						.attr('height', 50)
						.attr('y', oh + 50)
					.append('xhtml:body')
						.style('color', styling.c)
						.html(stepdata.units.lbl + ' ' + d.n);
				});

			persona.transition()
				.duration(__animation__.dur)
				.delay(function (d, i) { return d.t * __animation__.pers; })
				.style('opacity', 1);


			timer += predata.length * __animation__.pers + __animation__.dur * 3;

			setTimeout(function () {
				// THEN CRANK IT UP

				d3.selectAll('.unit-label')
					.transition()
					.duration(__animation__.dur / 2)
					.style('opacity', 0)
					.each('end', function () { return d3.select(this).remove(); });

				d3.selectAll('.persona').transition()
					.duration(__animation__.dur)
					.delay(function (d, i) { return d.t * __animation__.del; })
					.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')scale(' + (w / 20) + ')'; })
					.each('end', function (d) {
						return d3.select(this)
							.on('mouseover', function (d) {
								return drawINFOBUBBLE(this, stepdata.units.lbl + ' ' + d.n);
							})
							.on('mousemove', function (d) {
								return updateINFOBUBBLE(this);
							})
							.on('mouseout', function (d) {
								return clearINFOBUBBLE(this);
							})
					})

			}, timer);

			timer += __animation__.dur;

			var increments = new Array();
			while (postdata.length) {
				increments.push(postdata.splice(0,250));
			}

			increments.forEach(function (newunits, i) {
		
				setTimeout(function () {

					var newpersona = chart.selectAll('.persona')
						.data(newunits, function (d) { return d.idx; });

					return newpersona.enter()
					.append('use')
						//.datum(postdata[totalunits], function (d) { return d.idx; })
						.attr('class', 'persona animated')
						.attr('xlink:href', 'img/isotype_symbol.svg#persona')
						.attr('transform', function (d) {
							if (d.v == 0) return 'translate(' + [oxoffset + ow * d.t, oyoffset - 50] + ')scale(' + (ow / 20) + ')';
							return 'translate(' + [d.x, d.y] + ')scale(' + (w / 20) + ')';
						})
						.style('opacity', 0)
						.style('fill', function (d) {
							/*if (stepdata.color) return d.fill = stepdata.color;
							return d.fill = __color(d.n); */
							if (stepdata.highlight) {
								if (stepdata.highlight.v.indexOf(d.n) !== -1) return d.fill = stepdata.highlight.c;
								if (stepdata.color) return d.fill = stepdata.color;
							}
							if (stepdata.color) return d.fill = stepdata.color;
							return d.fill = __color(d.n);
						})
						.style('stroke', function (d) { return d.fill })
						.style('stroke-width', function (d) {
							var s = d3.transform(d3.select(this).attr('transform')).scale;
							if (1 / s[0] > 1) return 1; 
							return 1 / s[0];
						})
						.on('mouseover', function (d) {
							return drawINFOBUBBLE(this, stepdata.units.lbl + ' ' + d.n);
						})
						.on('mousemove', function (d) {
							return updateINFOBUBBLE(this);
						})
						.on('mouseout', function (d) {
							return clearINFOBUBBLE(this);
						})
					.transition()
						.duration(__animation__.pers)
						.delay(function (d, i) { return i; })
						.style('opacity', 1);

				}, 250 * i + timer);

			});

			return setTimeout(function () {
				return checkWHEEL();
			}, 250 * increments.length + timer);

		}
	} else { // IF UNITS ARE ALREADY DRAWN THEN UPDATE THE CHART
		// FIRST SET THE NEW SIZE AND COLOR
		// GET NUMBER OF CATEGORIES
		var categories = stepdata.data.map(function (d) {
			return d.n;
		});
		categories = categories.getUnique();
		var totalcount = stepdata.data.map(function (d) {
			return d.v;
		});
		totalcount = d3.sum(totalcount);

		var timer = 0;

		// CLEAR ALL MOUSEOVERS FOR THE TRANSITION
		d3.selectAll('use.persona')
			.on('mouseover', null)
			.on('mouseout', null);

		if (stepdata.units.l == 'grid') {
			// FIRST SET ONE FOR EACH CATEGORY
			var ncat = stepdata.data.length;
			var ow, oh, r = 20 / 30;
			ow = Math.floor((__svg__.w - __svg__.pl / 2 - __svg__.pr / 2) / ncat);
			if (ow > (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2) / 2) ow = (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2) / 2;
			oh = ow / r;

			var oxoffset = (__svg__.w - ncat * ow) / 2,
				oyoffset = (__svg__.h - oh) / 2;

			var w, h;
			h = Math.floor(Math.sqrt((((__svg__.w - __svg__.pl / 2 - __svg__.pr / 2) * (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2)) / totalcount) / r));
			w = h * r;

			var nrow = Math.floor((__svg__.w - __svg__.pl / 2 - __svg__.pr / 2) / w),
				row = 0;

			var unitsdata = new Array();

			var u = nrow * w,
				ncol = totalcount / nrow;
			if (Math.round(ncol) < ncol) {
				ncol = Math.round(ncol) + 1;
			} else {
				ncol = Math.round(ncol);
			}
			
			// CHECK IF THERE IS A LAST INCOMPLETE LINE SO IT DOES NOT FLOW OUT OF VIEW
			th = (__svg__.h - __svg__.pt / 2 - __svg__.pb / 2) / ncol;
			if (th < h) {
				h = Math.floor(th);
				w = h * r;
			}

			var xoffset = (__svg__.w - nrow * w) / 2,
				yoffset = (__svg__.h - ncol * h) / 2;
			

			var unitcount = -1;
			stepdata.data.forEach(function (d, i) {
				for (var j = 0; j < d.v; j ++) {
					var x, y;
					unitcount ++;
					if (unitcount !== 0 && unitcount % nrow == 0) row ++;
					unitsdata.push({ v: j, x: (xoffset + (unitcount - row * nrow) * w), y: yoffset + row * h, n: d.n, t: i, idx: unitcount });
				};
			});

			//console.log(unitsdata)

			var personadata = new Array();
			d3.selectAll('.persona').each(function (d) {
				personadata.push(d.idx);
			});

			var leftdata = unitsdata.filter(function (d) {
				return personadata.indexOf(d.idx) == -1;
			});

			var increments = new Array();
			while (leftdata.length) {
				increments.push(leftdata.splice(0,250));
			}

			var nodes = chart.selectAll('.persona')
				.data(unitsdata, function (d) { return d.idx; });


			if (increments.length > 0) {

				nodes.transition()
					.duration(1)
					.delay(function (d, i) { return d.idx * 1; })
					.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')scale(' + (w / 20) + ')'; })
					.style('fill', function (d) {
						/*if (stepdata.color) return d.fill = stepdata.color;
						return d.fill = __color(d.n); */
						if (stepdata.highlight && stepdata.distribution == 'ordered') {
							if (stepdata.highlight.v.indexOf(d.n) !== -1) return d.fill = stepdata.highlight.c;
							if (stepdata.color) return d.fill = stepdata.color;
						}
						if (stepdata.color) return d.fill = stepdata.color;
						return d.fill = __color(d.n); 
					})
					.style('stroke', function (d) { return d.fill; });

				setTimeout(function () {
					increments.forEach(function (newunits, i) {
					
						setTimeout(function () {

							var newpersona = chart.selectAll('.persona')
								.data(newunits, function (d) { return d.idx; });

							return newpersona.enter()
							.append('use')
								//.datum(postdata[totalunits], function (d) { return d.idx; })
								.attr('class', 'persona animated')
								.attr('xlink:href', 'img/isotype_symbol.svg#persona')
								.attr('transform', function (d) {
									if (d.v == 0) return 'translate(' + [oxoffset + ow * d.t, oyoffset - 50] + ')scale(' + (ow / 20) + ')';
									return 'translate(' + [d.x, d.y] + ')scale(' + (w / 20) + ')';
								})
								.style('opacity', 0)
								.style('fill', function (d) {
									if (stepdata.color) return d.fill = stepdata.color;
									return d.fill = __color(d.n); 
								})
								.style('stroke', function (d) { return d.fill })
								.style('stroke-width', function (d) {
									var s = d3.transform(d3.select(this).attr('transform')).scale;
									if (1 / s[0] > 1) return 1; 
									return 1 / s[0];
								})
							.transition()
								.duration(__animation__.pers)
								.delay(function (d, i) { return i; })
								.style('opacity', 1);

						}, 250 * i + timer);

					});
				}, personadata.length);

				if (stepdata.highlight) {
					setTimeout(function () {

						var highlights = stepdata.highlight;
						values = stepdata.data.filter(function (d) {
							return highlights.v.indexOf(d.n) !== -1;
						});
						othervalue = stepdata.data.filter(function (d) {
							return highlights.v.indexOf(d.n) == -1;
						}).map(function (d) {
							return d.n;
						});

						values.forEach(function (d) {
							var cat = d.n.replace(/ /g, '').toLowerCase();

							var subset = d3.selectAll('.persona').randomSubset(d.v);
							subset.classed(cat, true)
							.transition()
								.duration(__animation__.dur)
								.style('fill', function (d) { return d.fill = highlights.c; })
								.style('stroke', function (d) { return d.fill; })
								.style('opacity', 1)
								.each('end', function (c) {
									return c.n = d.n.toLowerCase();
								});

							d3.selectAll('.persona:not(.' + cat + ')')
								.each(function (c) {
									return c.n = othervalue[0].toLowerCase();
								})
						});

						d3.selectAll('.persona')
							.on('mouseover', function (d) {
								return drawINFOBUBBLE(this, stepdata.units.lbl + ' ' + d.n);
							})
							.on('mousemove', function (d) {
								return updateINFOBUBBLE(this);
							})
							.on('mouseout', function (d) {
								return clearINFOBUBBLE(this);
							});

						return checkWHEEL();
					}, totalcount + __animation__.dur / 2);
				}
			
			} else {
				nodes.transition()
					.duration(__animation__.dur)
					.delay(function (d, i) { return d.idx * __animation__.del; })
					.attr('transform', function (d) { return 'translate(' + [d.x, d.y] + ')scale(' + (w / 20) + ')'; })
					.style('fill', function (d) {
						if (stepdata.highlight) {
							if (stepdata.highlight.v.indexOf(d.n) !== -1) return d.fill = stepdata.highlight.c;
							if (stepdata.color) return d.fill = stepdata.color;
						}
						if (stepdata.color) return d.fill = stepdata.color;
						return d.fill = __color(d.n); 
					})
					.style('stroke', function (d) { return d.fill; })
					.style('stroke-width', function () { return 1 / (w / 20); })
					.each('end', function (d) {
						d3.select(this)
							.on('mouseover', function (d) {
								return drawINFOBUBBLE(this, stepdata.units.lbl + ' ' + d.n);
							})
							.on('mousemove', function (d) {
								return updateINFOBUBBLE(this);
							})
							.on('mouseout', function (d) {
								return clearINFOBUBBLE(this);
							});
						return checkWHEEL();
					});

				nodes.exit()
					.remove();
			}

		}
	}
	
	return; // END HERE FOR NOW
}
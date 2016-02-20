function getTEXTPOSITION (x, y) {
	var svgBBox = d3.select('#svg-container > svg').node().getBoundingClientRect(),
		pos_x = svgBBox.left,
		pos_y = svgBBox.top,
		w = svgBBox.width,
		h = svgBBox.height;

	return [pos_x + w * x / 100, pos_y + h * y / 100];
}

function setTEXT (stepdata, step) {
	var txt = stepdata.text;

	if (!txt) return null;

	// CHECK IF ALL VALUES ARE PRESENT
	if (!txt.x) txt.x = 0;
	if (!txt.y) txt.y = 0;
	if (!txt.w) txt.w = 100;
	if (!txt.s) txt.s = 'fast';
	// CHECK IF VALUES ARE INCORRECT
	if (txt.x >= 100) x = 100;
	if (txt.y >= 100) y = 100;
	if (txt.w >= 100) txt.w = 100;

	txt.idx = step;

	var body = d3.select('body');

	var divs = body.selectAll('.parallax-text')
		.data([txt], function (d) { return d.idx; });

	divs.enter()
		.append('div')
		.attr('class', function (d) { 
			if (d.c) return 'parallax-text ' + d.c;
			return 'parallax-text';
		})
		.style('left', function (d) {
			var position = getTEXTPOSITION(d.x, d.y),
				abs = getSCREENVALUES(),
				percent = position[0] * 100 / abs[0];

			return percent + '%';
		})
		.style('width', function (d) {
			var position = getTEXTPOSITION(d.x, d.y),
				percent = d.w / 100,
				svgRight = d3.select('#svg-container > svg').node().getBoundingClientRect().right,
				width = __svg__.w * percent,
				abs = getSCREENVALUES();

			if (position[0] + width >= svgRight) width = svgRight - position[0];
			return width + 'px';
		})
		.html(function (d) { 
			var bg = d3.rgb(styling.tbg);
			if (d.c) return '<p style="color: ' + styling.c + '">' + d.p + '</p>';
			return '<p style="color: ' + styling.t + '"><span class="white-bg" style="background-color: rgba(' + [bg.r, bg.g, bg.b, .9] + ')">' + d.p + '</span></p>'; 
		});
	
	divs.transition()
		.duration(1)
		.each('end', function (d) {
			return d3.select(this)
			.classed(d.s, true)
			.style('top', function (d) {
				var position = getTEXTPOSITION(d.x, d.y);
				d.scrolltop = position[1];
				d.top = position[1];
				return d.top + 'px';
			});
		});

	if (stepdata.action == 'narrate') {

		return setTimeout(function () {
			return checkWHEEL();
		}, __animation__.dur);

	}
}
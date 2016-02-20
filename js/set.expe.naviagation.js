var styling;
var storieslength = 0;

function setBUTTONS (topics) {
	var container = d3.select('#btn-container');
	storieslength = topics.length;
	// WE NEED TO CREATE ALL THE BUTTONS ON PAGE LOAD
	// AND THEN WE ONLY DISPLAY THEM AT THE APPROPRIATE MOMENT
	var buttons = container.selectAll('.btn-display')
		.data(topics);

	buttons.enter()
		.append('div')
		.attr('class', 'text-center btn-display');
	
	buttons.append('button')
		.attr('class', 'btn btn-default')
		.html('<i class="fa fa-play push-play"></i>')
	.on('mouseup', function (d) {
		styling = { c: d.color, h: d.highlight, t: d.text, tbg: d.textbg};
		//console.log(d)
		if (d.colorscale) __color.range(d.colorscale);
		sequence = d.story.v;

		setTimeout(function () {
			return d3.select('#title-container')
				.style('top', 0)
			.select('h1')
				.style('color', styling.c)
				.html(d.title);
		}, __animation__.dur);

		var stepdata = d.story.v[sequenceId];
		
		if (stepdata.background) {

			d3.select('body')
				.append('div')
				.attr('class', 'slide-bg')
				.style('top', '0%')
				.style('left', '-100%')
				.style('background-color', stepdata.background)
			.transition()
				.duration(__animation__.dur)
				.ease('cubic-out')
				.style('top', '0%')
				.style('left', '0%')
				.each('end',function (d) {
					var node = this;
					return d3.selectAll('.slide-bg').filter(function () { return node !== this; }).remove();
				});

		}

		clearBUTTONS();
		return resetSVG();
	});

	buttons.append('h2')
		.html(function (d) { return d.title; });

	buttons.append('button')
		.attr('class', 'btn btn-default donate hide')
		.html('Donate')
		.on('mouseup', function () {

		});

	buttons.classed('hide', function (d, i) {
		if (i <= topicN) return false;
		return true;
	}).classed('col-md-' + (12 / (topicN + 1)), true);

	return;
}

function displayBUTTONS () {

	d3.select(document).on('wheel', null);
	d3.select(document).on('keyup', null);

	// CLEAR THE BACKGROUND
	d3.selectAll('.slide-bg')
		.transition()
		.duration(__animation__.dur)
		.style('left', '100%');
	//.each('end', function () { return d3.select(this).remove(); });

	var text = d3.selectAll('div.parallax-text');

	text.style('top', function (d) {
			var abs = getSCREENVALUES();
			d.scrolltop += -abs[1];
			return d.scrolltop + 'px';
		});

	d3.select('#title-container')
		.style('top', '-90px');

	return setTimeout(function (){

		clearSVG();

		buttons = d3.selectAll('.btn-display');

		buttons.classed('hide', function (d, i) {
				if (i == topicN || topicN >= storieslength) return false;
				return true;
			})
		.each(function () {
			var node = d3.select(this);			
			if (topicN < storieslength) return node.classed('col-md-12');
			return node.classed('col-md-' + (12 / (storieslength)), true);
		})
		.select('.btn.btn-default')
			.html(function (d, i) { 
				if (i < topicN) return '<i class="fa fa-refresh push-refresh"></i>'; 
				return '<i class="fa fa-play push-play"></i>'; 
			});

		buttons.select('.donate')
			.classed('hide', function () {
				if (topicN >= storieslength) return false;
				return true;
			});

		return d3.select('#btn-container').classed('hide', false);

	}, __animation__.dur);
}

/*
	if (topicN == 0) {
		container.append('div')
			.attr('class', 'col-md-4 col-md-offset-4 text-center')
		.append('button')
			.attr('class', 'btn btn-default')
			.html('START')
		.on('mouseup', function () {
			// SET TITLE
			//console.log(title)
			d3.select('#title-container')
				.style('top', 0)
			.select('h1')
				.style('color', styling.c)
				.html(title);

			if (stepdata.background) {

				d3.select('body')
					.append('div')
					.attr('class', 'slide-bg')
					.style('top', '0%')
					.style('left', '-100%')
					.style('background-color', stepdata.background)
				.transition()
					.duration(__animation__.dur)
					.ease('cubic-out')
					.style('top', '0%')
					.style('left', '0%')
					.each('end',function (d) {
						var node = this;
						return d3.selectAll('.slide-bg').filter(function () { return node !== this; }).remove();
					});

			}

			clearBUTTONS();
			return resetSVG();
		});
	} else if (topicN > 0 && topicN < story.story.length) {
		container.append('div')
			.attr('class', 'col-md-3 col-md-offset-3 text-center')
		.append('button')
			.attr('class', 'btn btn-default')
			.html('SEE AGAIN')
		.on('mouseup', function () {
			topicN -= 1;
			sequence = story.story[topicN].v;
			sequenceId = 0;

			// SET TITLE
			d3.select('#title-container')
				.style('top', 0)
			.select('h1')
				.html(title);

			if (sequence[sequenceId].background) {

				d3.select('body')
					.append('div')
					.attr('class', 'slide-bg')
					.style('top', '0%')
					.style('left', '-100%')
					.style('background-color', sequence[sequenceId].background)
				.transition()
					.duration(__animation__.dur)
					.ease('cubic-out')
					.style('top', '0%')
					.style('left', '0%')
					.each('end',function (d) {
						var node = this;
						return d3.selectAll('.slide-bg').filter(function () { return node !== this; }).remove();
					});

			}

			clearBUTTONS();
			return resetSVG();
		});

		container.append('div')
			.attr('class', 'col-md-3 text-center')
		.append('button')
			.attr('class', 'btn btn-default')
			.html('SEE NEXT')
		.on('mouseup', function () {

			sequence = story.story[topicN].v;
			sequenceId = 0;

			// SET TITLE
			d3.select('#title-container')
				.style('top', 0)
			.select('h1')
				.html(title);

			if (sequence[sequenceId].background) {

				d3.select('body')
					.append('div')
					.attr('class', 'slide-bg')
					.style('top', '0%')
					.style('left', '-100%')
					.style('background-color', sequence[sequenceId].background)
				.transition()
					.duration(__animation__.dur)
					.ease('cubic-out')
					.style('top', '0%')
					.style('left', '0%')
					.each('end',function (d) {
						var node = this;
						return d3.selectAll('.slide-bg').filter(function () { return node !== this; }).remove();
					});

			}

			clearBUTTONS();
			return resetSVG();
		});
	}

}*/

function clearBUTTONS () {
	return d3.select('#btn-container').classed('hide', true);
}
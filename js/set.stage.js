var drawDISPATCH = { bar: drawBAR, pie: drawPIE, line: drawLINE, area: drawAREA, scatter: drawSCATTER, map: drawMAP, unit: dispatchPERSONA },
	updateDISPATCH = { bar: updateBAR, pie: updatePIE, line: updateLINE, area: updateAREA, scatter: updateSCATTER, map: updateMAP, unit: dispatchPERSONA },
	highlightDISPATCH = { bar: highlightBAR, pie: highlightPIE, line: highlightLINEDISPATCH, area: highlightAREA, map: highlightMAP };

var sequenceId = 0,
	wheeldata = new Array();

// KEYPRESS INFO
var UP = 38;
var DOWN = 40;
var ENTER = 13;

var getKey = function(e) {
	if(window.event) { return e.keyCode; }	// IE
	else if(e.which) { return e.which; }	// Netscape/Firefox/Opera
};

function clearSVG () {
	d3.selectAll('#svg-container > svg').remove();
	d3.selectAll('#si-cue > svg').html('');
	return d3.selectAll('.parallax-text').remove();
}

function resetSVG () {
	clearSVG();
	setSVG();
	setTimeout(function () {
		return drawSI();
	}, __animation__.dur);
	setTEXT(sequence[sequenceId], sequenceId);
	if (sequence[sequenceId].action == 'draw') return drawDISPATCH[sequence[sequenceId].chart](sequence[sequenceId]);
}

function clearSTAGE (dir, charttype) {
	var chart = d3.select('g.chart');

	if (charttype !== 'unit') {
		chart.transition()
			.duration(__animation__.dur / 2)
			.ease('cubic-in')
			.attr('transform', function (d) {
				if (['bar', 'line', 'area', 'map'].indexOf(d.type) !== - 1) {
					return 'translate(' + [0, __svg__.pt * dir] + ')';
				} else if (d.type == 'pie') {
					return 'translate(' + [__svg__.w / 2, __svg__.h / 2 + __svg__.pt * dir] + ') scale(1)';
				} else if (d.type == 'map') {
					return 'translate(' + [__svg__.w / 4, __svg__.h / 4 + __svg__.pt * dir] + ') scale(.5)';
				}
			})
			.style('opacity', 0)
			.each('end',function () { return d3.select(this).remove(); });
	} else {
		cancelAnimationFrame(webGLanimation);
		renderer = null;
		humanContainer = null;
		humantexture = null;
		animateWebGL = null;
		stage = null;
		humans.length = 0;
		ticker.stop();
		d3.selectAll('canvas')
			.transition()
			.duration(__animation__.dur / 2)
			.style('top', function (d) {
				return __svg__.pt * dir + 'px';
			})
			.style('opacity', 0)
			.each('end',function () { return d3.select(this).remove(); });
		chart.remove();
	}

	return d3.selectAll('#svg-container clipPath').remove();
}

function setSTAGE () {
	//console.log(d3.event)

	d3.event.preventDefault();
	if (d3.event.type == 'wheel' || d3.event.type == 'DOMMouseScroll') wheeldata.push(d3.event.wheelDeltaY || d3.event.detail);
	if (d3.event.type == 'keyup') {
		if (d3.event.code == 'ArrowDown' || d3.event.code == 'ArrowRight' || d3.event.keyIdentifier == 'Down' || d3.event.keyIdentifier == 'Right') { wheeldata = [-1,-1,-1,-1,-1]; }
		if (d3.event.code == 'ArrowUp' || d3.event.code == 'ArrowLeft' || d3.event.keyIdentifier == 'Up' || d3.event.keyIdentifier == 'Left') { wheeldata = [1,1,1,1,1]; }
	}

	var originId = sequenceId;
	//clearTimeout(timeoutvar);

	// STOP ALL ONGOING ANIMATIONS
	d3.selectAll('*').transition();
	clearINFOBUBBLE();
	
	var dir = 0;
	if (wheeldata.length == 5) {

		if (d3.mean(wheeldata) < 0) {
			if (sequenceId < sequence.length - 1) {
				sequenceId += 1;
				dir = -1;
			} else {
				//sequenceId = sequence.length - 1;
				//sequenceId += 1;
				dir = -1;
				clearSTAGE(dir);
				
				topicN += 1;
				//sequence = story[topicN];
				sequenceId = 0;

				//return setTimeout(function (){
					//clearSVG();
					wheeldata.length = 0;
					//return setBUTTONS(sequence[sequenceId]);
					//return setBUTTONS(story.story[topicN].v[sequenceId]);
					return displayBUTTONS();
					//return checkWHEEL();
				//}, __animation__.dur);
			}
		}
		if (d3.mean(wheeldata) > 0) {
			if (sequenceId > 0) {
				sequenceId -= 1;
				dir = 1;
				while (sequence[sequenceId].chart == 'unit') sequenceId -= 1;
			} else {
				sequenceId = 0;
				dir = 0;
				setTimeout(function (){
					return checkWHEEL();
				}, __animation__.dur);
			}
		}
		wheeldata.length = 0;

		// HIDE THE SUGGESTED INTERACTIVITY
		if (sequenceId == 0) {
			d3.select('.si-scroll')
				.classed('hide', false)
				.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 1);
			d3.select('.plot')
				.classed('hide', true);
				/*.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 0)
				.each('end', function () {
					return d3.select(this).classed('hide', true);
				});*/
			d3.selectAll('.plot .section')
				.classed('selected', function (d, i) {
					if (i == sequenceId) return true;
					return false;
				})
				.style('fill', function (d, i) {
					if (i == sequenceId) return styling.h;
					return styling.c;
				});
		} else {
			d3.select('.si-scroll')
				.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 0)
				.each('end', function () {
					return d3.select(this).classed('hide', true);
				});
			d3.select('.plot')
				//.classed('hide', false)
				.transition()
				.duration(__animation__.dur / 2)
				.style('opacity', 1)
				.each('end', function () {
					return d3.select(this).classed('hide', false);
				});
			d3.selectAll('.plot .section')
				.classed('selected', function (d, i) {
					if (i == sequenceId) return true;
					return false;
				})
				.style('fill', function (d, i) {
					if (i == sequenceId) return styling.h;
					return styling.c;
				});
		}

		var text = d3.selectAll('div.parallax-text');

		text.transition()
			.duration(1)
			.style('top', function (d) {
				var abs = getSCREENVALUES();
				if (d.idx !== sequenceId) {
					// NEED TO CHANGE THIS
					var difId = originId - sequenceId;
					d.scrolltop += abs[1] * difId;
					//d.scrolltop = dir * sequenceId * abs[1];
					return d.scrolltop + 'px';
				}
				d.scrolltop = d.top;
				return d.top + 'px';
			});
		

		// DISPLAY THE ANIMATION FEEDBACK
		d3.select('.animation-feedback-container')
			.classed('hide', false)
			.attr('transform', function () {
				var section = d3.select('.section.selected'),
					cx = section.attr('cx'),
					cy = section.attr('cy');
				return 'translate (' + [cx - 7.5 / 2, cy - 7.5 / 2] + ')';
			});

		d3.select(document).on('wheel',null);
		d3.select(document).on('DOMMouseScroll',null);
		d3.select(document).on('keyup', null);

		var step = sequence[sequenceId],
			prev = 0, next = sequence.length - 1;
		if (sequenceId > 0) prev = sequenceId - 1;
		if (sequenceId < sequence.length) next = sequenceId + 1;
		var prevstep = sequence[prev],
			nextstep = sequence[next];

		// 1: DETERMINE WHETHER TO CLEAR THE CANVAS BEFORE MOVING ON
		if (dir == -1 && prevstep.chart !== step.chart || dir == -1 && prevstep.chart == step.chart && step.action == 'draw' || dir == 1 && step.chart !== nextstep.chart || dir == 1 && step.chart == nextstep.chart && nextstep.action == 'draw') {
			if (step.chart !== 'unit' || step.chart == 'unit' && !step.from) clearSTAGE(dir, prevstep.chart); 
		};
		// 2: CHECK FOR THE DIRECTION OF THE SCROLL
		// 2.1: THE SCROLL IS GOING UP (SO MOVING BACK IN THE STORY)

		if (step.background) {

			d3.select('body')
				.append('div')
				.attr('class', 'slide-bg')
				.style('top', -dir * 100 + '%')
				.style('left', '0%')
				.style('background-color', step.background)
			.transition()
				.duration(__animation__.dur)
				.ease('cubic-out')
				.style('top', '0%')
				.each('end',function (d) {
					var node = this;
					return d3.selectAll('.slide-bg').filter(function () { return node !== this; }).remove();
				});

		}

		if (dir == 1) {



			// 2.1.1: MOVING BACK UP THE CHART IS SUPPOSED TO HIGHLIGHT, BUT IS NOT YET DRAWN
			if (step.chart !== nextstep.chart || step.chart == nextstep.chart && nextstep.action == 'draw') { 
				return setTimeout(function () {
					if (step.action == 'draw') return drawDISPATCH[step.chart](step);
					return checkWHEEL();					
				}, __animation__.dur / 2);

			// 2.1.2: MOVING BACK UP THE CHART IS DRAWN AND NEEDS TO BE HIGHLIGHTED
			} else if (step.chart == nextstep.chart && nextstep.action == 'update') {

				return updateDISPATCH[step.chart](step, true); // TRUE IS FOR RESET

			// 2.1.3: MOVING BACK UP THE CHART IS SUPPOSED TO DRAW, BUT IT IS ALREADY DRAWN
			} else if (step.chart == nextstep.chart) { 
				
				return updateDISPATCH[step.chart](step);
			}

		// 2.2: THE SCROLL IS GOING DOWN (SO MOVING FORWARD IN THE STORY)
		} else if (dir == -1) {

			if (step.action == 'draw') {
				
				// WAIT FOR THE CANVAS / STAGE TO BE CLEARED
				return setTimeout(function () {
					setTEXT(step, sequenceId);
					return drawDISPATCH[step.chart](step);
				}, __animation__.dur / 2);

			} else if (step.action == 'update') { 

				setTEXT(step, sequenceId);
				return updateDISPATCH[step.chart](step, true);

			} else if (step.action == 'highlight') {
			
				setTEXT(step, sequenceId);
				//if (step.highlight) return highlightDISPATCH[step.chart](step.data, step.highlight);
				return highlightDISPATCH[step.chart](step);

			} else if (step.action == 'narrate') {
				
				setTEXT(step, sequenceId);

			} else if (step.action == 'humanize') {
				
				return drawPERSONA(step);
			
			}
		}
	}
}
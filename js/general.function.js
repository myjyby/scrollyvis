var __svg__ = { w: 900, h: 600, pt: 100, pr: 100, pb: 100, pl: 100 };
var __animation__ = { dur: 1000, del: 10, pers: 50 };
var __transitioning = false;
var __highlight_color = 'dodgerblue';

function checkWHEEL () {
	// HIDE THE ANIMATION FEEDBACK
	d3.select('.animation-feedback-container')
		.classed('hide', true);
	d3.select(document).on('wheel', function () {
		if (d3.event.wheelDeltaY == 0) {
			return d3.select(document).on('wheel', setSTAGE);
		};
	});
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

function angle(d) {
	var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
	return a;
};

function convertRADIAL (x, y) {
	var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
		theta = Math.atan(y / x);
	return [r, theta];
}

function getCHARTTYPE () {
	return d3.select('g.chart').datum().type;
}

function drawSI () {
	var svg = d3.select('#si-cue > svg');
	var w = 75, lw = 300, h = 75, s = 2, r = d3.min([lw, h]) / 2 - s * 2,
		color = '#273a40';

	svg.attr('width', lw)
		.attr('height', w);

	var group = svg.append('g')
		.attr('class', 'si-scroll');
	group.append('circle')
		.attr('r', r)
		.attr('cx', lw / 2)
		.attr('cy', h / 2)
		.style('stroke', color)
		.style('stroke-width', s)
		.style('fill', 'transparent');

	// DRAW THE CUT OUT FOR THE MOUSEWHEEL
	var clip = svg.append('mask')
		.attr('id', 'mousewheel');
	clip.append('rect')
		.attr('width', lw)
		.attr('height', h)
		.attr('x', 0)
		.attr('y', 0)
		.style('stroke', 'none')
		.style('fill', '#FFF');
	clip.append('circle')
		.attr('class', 'wheel')
		.attr('r', 4)
		.attr('cx', lw / 2)
		.attr('cy', h / 2 - 2)
		.style('stroke', '#000')
		.style('stroke-width', s)
		.style('fill', 'none');

	clip.append('line')
		.attr('x1', lw / 2)
		.attr('y1', 0)
		.attr('x2', lw / 2)
		.attr('y2', h / 2 - 6)
		.style('stroke', '#000')
		.style('stroke-width', s)
		.style('fill', 'none');
	// DRAW THE MOUSE
	group.append('rect')
		.attr('width', 20)
		.attr('x', lw / 2 - 10)
		.attr('rx', 10)
		.attr('height', 30)
		.attr('y', h / 2 - 15)
		.attr('ry', 10)
		.attr('mask', 'url(#mousewheel)')
		.style('fill', color);

	//var sl = sequence.map(function (d, i) { return i; }),
	var sp = lw / sequence.length,
		sr = 5;
	var plot = svg.append('g')
		.attr('class', 'plot hide')
		.style('opacity', 0);
	sections = plot.selectAll('.section')
		.data(sequence);
	sections.enter()
		.append('circle')
		.attr('class', function (d, i) {
			if (i == sequenceId) return 'section selected';
			return 'section';
		})
		.attr('r', function (d) {
			if (d.chart == 'unit') return sr / 2;
			return sr;
		})
		.attr('cx', function (d, i) { return i * sp + sp / 2; })
		.attr('cy', h / 2);

	plot.append('g')
		.attr('class', 'animation-feedback-container hide')
		.attr('transform', 'translate(' + [sp / 2 - 7.5 / 2, h / 2 - 7.5 / 2] + ')')
	.append('path')
		.attr('class', 'animation-feedback')
		.attr('d', 'M11.25,3.75c0,4.143-3.357,7.5-7.5,7.5 s-7.5-3.357-7.5-7.5s3.357-7.5,7.5-7.5')
		.attr('stroke-linecap', 'round')
		.style('fill', 'none')
		//.style('stroke', '#FFF')
		.style('stroke', function () {
			var section = d3.select('.section.selected'),
				color = section.style('fill');
			return color;
		})
		.style('stroke-width', 2);

}

function getSCREENVALUES () {
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	return [x, y];
}

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
var sw = window,
	sd = document,
	se = sd.documentElement,
	sg = sd.getElementsByTagName('body')[0],
	sx = sw.innerWidth || se.clientWidth || sg.clientWidth,
	sy = sw.innerHeight|| se.clientHeight|| sg.clientHeight;
//alert(x + ' × ' + y);

var __svg__ = { w: sx, h: sy, pt: sy * .22, pr: sx * .22, pb: sy * .22, pl: sx * .22 };
var __animation__ = { dur: 1000, del: 10, pers: 50 };
var __transitioning = false;
var __highlight_color = 'dodgerblue';
var __color = d3.scale.ordinal()
		.range(['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd']);

function checkWHEEL () {
	// HIDE THE ANIMATION FEEDBACK
	d3.select('.animation-feedback-container')
		.classed('hide', true);

	// FOR MOUSEWHEEL
	d3.select(document).on('wheel', function () {
		if (d3.event.wheelDeltaY >= -3 && d3.event.wheelDeltaY <= 3) {
			return d3.select(document).on('wheel', setSTAGE);
		};
	});
	d3.select(document).on('DOMMouseScroll', function () { // FOR FIREFOX
		if (d3.event.detail >= -3 && d3.event.detail <= 3) {
			return d3.select(document).on('DOMMouseScroll', setSTAGE);
		};
	});

	// FOR UP AND DOWN ARROWS
	d3.select(document).on('keyup', setSTAGE);
	
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
	var w = 75, lw = 300, h = 75, s = 2, r = d3.min([lw, h]) / 2 - s * 2;
		//color = '#273a40';

	svg.attr('width', lw)
		.attr('height', w);

	var group = svg.append('g')
		.attr('class', 'si-scroll');
	group.append('circle')
		.attr('r', r)
		.attr('cx', lw / 2)
		.attr('cy', h / 2)
		.style('stroke', styling.c)
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
		.style('fill', styling.c);

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
			//if (d.chart == 'unit') return sr / 2;
			return sr;
		})
		.attr('cx', function (d, i) { return i * sp + sp / 2; })
		.attr('cy', h / 2)
		.style('fill', styling.c);

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
			//var section = d3.select('.section.selected'),
			//	color = section.style('fill');
			//return color;
			return styling.h;
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

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

d3.selection.prototype.randomSubset = function(subsetSize) {
    var subgroups = [],
        subgroup,
        group,
        node;

    for (var j = 0, m = this.length; j < m; j++) {
        subgroups.push(subgroup = []);
        subgroup.parentNode = (group = this[j]).parentNode;
        d3.shuffle(d3.range(group.length)).slice(0,subsetSize).forEach(function(i) {
            subgroup.push(group[i]);                    
        })
     }

     if ({}.__proto__) {
           subgroups.__proto__ = d3.selection.prototype;
     } else {
           for (var property in d3.selection.prototype) {
               subgroups[property] = d3.selection.prototype[property];
           }
     };

     return subgroups;
}
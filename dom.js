'use strict';

var toPositiveInteger = require('es5-ext/lib/Number/to-uint')
  , memoize           = require('memoizee/lib/regular')

  , forEach = Array.prototype.forEach, keys = Object.keys
  , byNum = function (a, b) { return a - b; }
  , getSubsteps;

getSubsteps = memoize(function (element) {
	var map = {}, defaultOrder = -0.01;
	forEach.call(element.querySelectorAll('.substep'), function (el) {
		var order = Number(el.dataset.order);
		if (isNaN(order)) order = (defaultOrder += 0.01);
		else defaultOrder = order;
		if (!map[order]) map[order] = [el];
		else map[order].push(el);
	});
	return keys(map).sort(byNum).map(function (order) { return map[order]; });
});

module.exports = function (deck/*, options*/) {
	var activeSubstep = 0;

	deck.on('activate', function (e) {
		var substep = toPositiveInteger(e.substep);
		getSubsteps(e.slide).forEach(function (els, index) {
			var visible = substep > index;
			els.forEach(function (el) {
				el.classList[visible ? 'add' : 'remove']('active');
				el.classList[visible ? 'remove' : 'add']('inactive');
			});
		});
		activeSubstep = substep;
	});

	deck.on('next', function () {
		var activeSlide = deck.slide();
		if (!getSubsteps(deck.slides[activeSlide])[activeSubstep]) return;
		deck.slide(activeSlide, { substep: activeSubstep + 1 });
		return false;
	});

	deck.on('prev', function () {
		var activeSlide = deck.slide();
		if (!activeSlide) return;
		if (!activeSubstep) {
			--activeSlide;
			deck.slide(activeSlide, {
				substep: getSubsteps(deck.slides[activeSlide]).length
			});
		} else {
			deck.slide(activeSlide, { substep: activeSubstep - 1 });
		}
		return false;
	});
};

'use strict';

var toPositiveInteger = require('es5-ext/lib/Number/to-uint')
  , memoize           = require('memoizee/lib/regular')

  , forEach = Array.prototype.forEach, keys = Object.keys
  , byNum = function (a, b) { return a - b; }
  , actions = Object.create(null)
  , getSubsteps;

actions.display = actions.show = actions.hide = actions.remove =
	actions.mark = true;

getSubsteps = memoize(function (element) {
	var map = {}, defaultOrder = 0;
	forEach.call(element.querySelectorAll('.substep'), function (el) {
		var order = Number(el.dataset.order), action;
		if (isNaN(order)) order = (defaultOrder += 0.01);
		else defaultOrder = order;
		if (!map[order]) map[order] = {};
		action = actions[el.dataset.action] ? el.dataset.action : 'show';
		if (!map[order][action]) map[order][action] = [el];
		else map[order][action].push(el);
	});
	return keys(map).sort(byNum).map(function (order) { return map[order]; });
});

module.exports = function (deck/*, options*/) {
	var activeSubstep = 0;

	deck.on('activate', function (e) {
		var substep = toPositiveInteger(e.substep);
		getSubsteps(e.slide).forEach(function (els, index) {
			var current = substep === index + 1
			  , isAfter = substep > index;
			if (els.show) {
				els.show.forEach(function (el) {
					el.classList[isAfter ? 'add' : 'remove']('active');
					el.classList[isAfter ? 'remove' : 'add']('inactive');
				});
			}
			if (els.hide) {
				els.hide.forEach(function (el) {
					el.classList[isAfter ? 'remove' : 'add']('active');
					el.classList[isAfter ? 'add' : 'remove']('inactive');
				});
			}
			if (els.display) {
				els.display.forEach(function (el) {
					el.classList[isAfter ? 'add' : 'remove']('displayed');
					el.classList[isAfter ? 'remove' : 'add']('removed');
				});
			}
			if (els.remove) {
				els.remove.forEach(function (el) {
					el.classList[isAfter ? 'remove' : 'add']('displayed');
					el.classList[isAfter ? 'add' : 'remove']('removed');
				});
			}
			if (els.mark) {
				els.mark.forEach(function (el) {
					el.classList[current ? 'add' : 'remove']('marked');
					el.classList[current ? 'remove' : 'add']('unmarked');
				});
			}
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

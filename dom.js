'use strict';

var toPositiveInteger = require('es5-ext/number/to-pos-integer')
  , primitiveSet      = require('es5-ext/object/primitive-set')
  , memoize           = require('memoizee/plain')
  , getNormalizer     = require('memoizee/normalizers/get-1')

  , forEach = Array.prototype.forEach, keys = Object.keys, round = Math.round
  , byNum = function (a, b) { return a - b; }
  , actions = primitiveSet('activate', 'deactivate', 'insert', 'remove', 'mark', 'class')
  , getSubsteps;

getSubsteps = memoize(function (element) {
	var map = {}, defaultOrder = 0;
	forEach.call(element.querySelectorAll('.substep'), function (el) {
		var order = Number(el.dataset.order), action, data, names, classOrder;
		if (isNaN(order)) order = (defaultOrder += 0.01);
		else defaultOrder = order;
		if (!map[order]) map[order] = {};
		action = el.dataset.action;
		if (!actions[action]) action = null;
		if (action == null) {
			if (el.nodeName.toLowerCase() === 'mark') action = 'mark';
			else action = 'activate';
		}
		if (action === 'class') {
			if (!el.dataset.names) throw new TypeError('Missing names for class configuration');
			names = el.dataset.names.split(' ');
			classOrder = order;
			names.forEach(function (name) {
				data = { el: el, name: name };
				if (!map[classOrder]) map[classOrder] = {};
				if (!map[classOrder].class) map[classOrder].class = [data];
				else map[order][action].push(data);
				classOrder += 0.001;
				classOrder = round(classOrder * 1000) / 1000;
			});
			return;
		}
		if (!map[order][action]) map[order][action] = [el];
		else map[order][action].push(el);
	});
	return keys(map).sort(byNum).map(function (order) {
		console.log(order);
		return map[order]; });
}, { normalizer: getNormalizer() });

module.exports = function (deck/*, options*/) {
	var activeSubstep = 0;

	deck.on('activate', function (e) {
		var substep = toPositiveInteger(e.substep);
		getSubsteps(e.slide).forEach(function (els, index) {
			var current = substep === index + 1
			  , isAfter = substep > index;
			if (els.activate) {
				els.activate.forEach(function (el) {
					el.classList[isAfter ? 'add' : 'remove']('active');
					el.classList[isAfter ? 'remove' : 'add']('inactive');
				});
			}
			if (els.deactivate) {
				els.deactivate.forEach(function (el) {
					el.classList[isAfter ? 'remove' : 'add']('active');
					el.classList[isAfter ? 'add' : 'remove']('inactive');
				});
			}
			if (els.insert) {
				els.insert.forEach(function (el) {
					el.classList[isAfter ? 'add' : 'remove']('inserted');
					el.classList[isAfter ? 'remove' : 'add']('removed');
				});
			}
			if (els.remove) {
				els.remove.forEach(function (el) {
					el.classList[isAfter ? 'remove' : 'add']('inserted');
					el.classList[isAfter ? 'add' : 'remove']('removed');
				});
			}
			if (els.mark) {
				els.mark.forEach(function (el) {
					el.classList[current ? 'add' : 'remove']('marked');
					el.classList[current ? 'remove' : 'add']('unmarked');
				});
			}
			if (els.class) {
				els.class.forEach(function (data) {
					data.el.classList[current ? 'add' : 'remove'](data.name);
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

# bespoke-substeps
## Substeps for [Bespoke.js](https://github.com/markdalgleish/bespoke.js) presentations

### Similar and initially inspired on [bespoke-bullets](https://github.com/markdalgleish/bespoke-bullets).

Differences:
* Order of display can be customized (so it's not necesarily as in DOM)
* Separated DOM elements can be configured to appear in parallel

### Usage

```javascript
bespoke.plugins.substeps = require('bespoke-substeps');

bespoke.from(selector, {
  substeps: true
});
```

Example HTML configuration
```html
<section class="bespoke-slide">
  <h1>Slide title</h1>
  <ul>
    <li class="substep">First step</li><!-- assigned  order: 0 -->
    <li class="substep">Second step</li><!-- assigned order: 0.01 -->
    <li class="substep" data-order="2">Fourth step (1)</p><!-- assigned  order: 2 -->
    <li class="substep" data-order="1">Third step</p><!-- assigned  order: 1 -->
    <li class="substep" data-order="2">Fourth step (2)</p><!-- assigned  order: 2 -->
	</ul>
</section>
```

### Installation
#### npm

In your presentation path:

	$ npm install bespoke-substeps

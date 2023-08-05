SVG Radar Charts
================

Simple [radar charts](https://en.wikipedia.org/wiki/Radar_chart#See_also) using SVG, specifically for the visualization of climate data.

Notice: This library is still in an early state of development.

### Goals

Core functionality includes:
* Multiple variables
* Multiple series
* Translucent fill areas
* Concentric circles as grid lines

Future plans:
* Spiral series with value as line segment colour
* Displaying series values

Limitations:
* Only one common scale will be permitted

# Progress Log

## 2023-08-05

Struggling with correctly offset-centring SVG gradients in an irregular object. At this point, I think this can only be accomplished by using matrix math to shift and scale the gradient, but that's going to be a significant amount of complexity.

This is a shame, since using radial gradients are useful for illustrating temperature ranges.

Here's what the work-in-progress looks like showing record high and low temperatures, and the monthly averages for min/max/average:

![image](https://github.com/dslik/svg-radar/assets/5757591/a7e6b5d6-4291-4020-b927-b9e49139a0e7)


## 2023-07-28
- Refactored to use classes
- Added support for multiple label styles

![image](https://github.com/dslik/svg-radar/assets/5757591/b7b7539d-aff4-4e2c-913e-0ec74f4ff383)

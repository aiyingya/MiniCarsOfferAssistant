/*
 * charts for WeChat small app v1.0
 *
 * https://github.com/xiaolin3303/wx-charts
 * 2016-11-28
 *
 * Designed and built with all the love of Web
 */

'use strict';

var config = {
    yAxisWidth: 15,
    yAxisSplit: 5,
    xAxisHeight: 6,
    xAxisLineHeight: 15,
    legendHeight: 15,
    yAxisTitleWidth: 15,
    padding: 12,
    columePadding: 0,
    fontSize: 10,
    dataPointShape: ['diamond', 'circle', 'triangle', 'rect'],
    colors: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d', '#f15c80', '#8085e9'],
    pieChartLinePadding: 25,
    pieChartTextPadding: 15,
    xAxisTextPadding: 3,
    titleColor: '#333333',
    titleFontSize: 20,
    subtitleColor: '#999999',
    subtitleFontSize: 15
};

// Object.assign polyfill
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
function assign(target, varArgs) {
    if (target == null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}

var util = {
    toFixed: function toFixed(num, limit) {
        limit = limit || 2;
        if (this.isFloat(num)) {
            num = num.toFixed(limit);
        }
        return num;
    },
    isFloat: function isFloat(num) {
        return num % 1 !== 0;
    },
    isSameSign: function isSameSign(num1, num2) {
        return Math.abs(num1) === num1 && Math.abs(num2) === num2 || Math.abs(num1) !== num1 && Math.abs(num2) !== num2;
    },
    isSameXCoordinateArea: function isSameXCoordinateArea(p1, p2) {
        return this.isSameSign(p1.x, p2.x);
    },
    isCollision: function isCollision(obj1, obj2) {
        obj1.end = {};
        obj1.end.x = obj1.start.x + obj1.width;
        obj1.end.y = obj1.start.y - obj1.height;
        obj2.end = {};
        obj2.end.x = obj2.start.x + obj2.width;
        obj2.end.y = obj2.start.y - obj2.height;
        var flag = obj2.start.x > obj1.end.x || obj2.end.x < obj1.start.x || obj2.end.y > obj1.start.y || obj2.start.y < obj1.end.y;

        return !flag;
    }
};

function findRange(num, type, limit) {
    if (isNaN(num)) {
        throw new Error('[wxCharts] unvalid series data!');
    }
    limit = limit || 10;
    type = type ? type : 'upper';
    var multiple = 1;
    while (limit < 1) {
        limit *= 10;
        multiple *= 10;
    }
    if (type === 'upper') {
        num = Math.ceil(num * multiple);
    } else {
        num = Math.floor(num * multiple);
    }
    while (num % limit !== 0) {
        if (type === 'upper') {
            num++;
        } else {
            num--;
        }
    }

    return num / multiple;
}

function calRotateTranslate(x, y, h) {
    var xv = x;
    var yv = h - y;

    var transX = xv + (h - yv - xv) / Math.sqrt(2);
    transX *= -1;

    var transY = (h - yv) * (Math.sqrt(2) - 1) - (h - yv - xv) / Math.sqrt(2);

    return {
        transX: transX,
        transY: transY
    };
}

function convertCoordinateOrigin(x, y, center) {
    return {
        x: center.x + x,
        y: center.y - y
    };
}

function avoidCollision(obj, target) {
    if (target) {
        // is collision test
        while (util.isCollision(obj, target)) {
            if (obj.start.x > 0) {
                obj.start.y--;
            } else if (obj.start.x < 0) {
                obj.start.y++;
            } else {
                if (obj.start.y > 0) {
                    obj.start.y++;
                } else {
                    obj.start.y--;
                }
            }
        }
    }
    return obj;
}

function fillSeriesColor(series, config) {
    var index = 0;
    return series.map(function (item) {
        if (!item.color) {
            item.color = config.colors[index];
            index = (index + 1) % config.colors.length;
        }
        return item;
    });
}

function getDataRange(minData, maxData) {
    var limit = 0;
    var range = maxData - minData;
    if (range >= 10000) {
        limit = 1000;
    } else if (range >= 1000) {
        limit = 100;
    } else if (range >= 100) {
        limit = 10;
    } else if (range >= 10) {
        limit = 5;
    } else if (range >= 1) {
        limit = 1;
    } else if (range >= 0.1) {
        limit = 0.1;
    } else {
        limit = 0.01;
    }
    return {
        minRange: findRange(minData, 'lower', limit),
        maxRange: findRange(maxData, 'upper', limit)
    };
}

function measureText(text) {
    var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    // wx canvas 未实现measureText方法, 此处自行实现
    text = String(text);
    var text = text.split('');
    var width = 0;
    text.forEach(function (item) {
        if (/[a-zA-Z]/.test(item)) {
            width += 7;
        } else if (/[0-9]/.test(item)) {
            width += 5.5;
        } else if (/\./.test(item)) {
            width += 2.7;
        } else if (/-/.test(item)) {
            width += 3.25;
        } else if (/[\u4e00-\u9fa5]/.test(item)) {
            width += 10;
        } else if (/\(|\)/.test(item)) {
            width += 3.73;
        } else if (/\s/.test(item)) {
            width += 2.5;
        } else if (/%/.test(item)) {
            width += 8;
        } else {
            width += 10;
        }
    });
    return width * fontSize / 10;
}

function dataCombine(series) {
    return series.reduce(function (a, b) {
        return (a.data ? a.data : a).concat(b.data);
    }, []);
}

function findCurrentIndex(currentPoints, xAxisPoints, opts, config) {
    var currentIndex = -1;
    if (isInExactChartArea(currentPoints, opts, config)) {
        xAxisPoints.forEach(function (item, index) {
            if (currentPoints.x > item) {
                currentIndex = index;
            }
        });
    }

    return currentIndex;
}

function isInExactChartArea(currentPoints, opts, config) {
    return currentPoints.x < opts.width - config.padding && currentPoints.x > config.padding + config.yAxisWidth + config.yAxisTitleWidth && currentPoints.y > config.padding && currentPoints.y < opts.height - config.legendHeight - config.xAxisHeight - config.padding;
}

function findPieChartCurrentIndex(currentPoints, pieData) {
    var currentIndex = -1;
    if (isInExactPieChartArea(currentPoints, pieData.center, pieData.radius)) {
        (function () {
            var angle = Math.atan2(pieData.center.y - currentPoints.y, currentPoints.x - pieData.center.x);
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            angle = 2 * Math.PI - angle;
            pieData.series.forEach(function (item, index) {
                if (angle > item._start_) {
                    currentIndex = index;
                }
            });
        })();
    }

    return currentIndex;
}

function isInExactPieChartArea(currentPoints, center, radius) {
    return Math.pow(currentPoints.x - center.x, 2) + Math.pow(currentPoints.y - center.y, 2) <= Math.pow(radius, 2);
}

function splitPoints(points) {
    var newPoints = [];
    var items = [];
    points.forEach(function (item, index) {
        if (item !== null) {
            items.push(item);
        } else {
            if (items.length) {
                newPoints.push(items);
            }
            items = [];
        }
    });
    if (items.length) {
        newPoints.push(items);
    }

    return newPoints;
}

function calLegendData(series, opts, config) {
    if (opts.legend === false) {
        return {
            legendList: [],
            legendHeight: 0
        };
    }
    var padding = 5;
    var marginTop = 8;
    var shapeWidth = 15;
    var legendList = [];
    var widthCount = 0;
    var currentRow = [];
    series.forEach(function (item) {
        var itemWidth = 3 * padding + shapeWidth + measureText(item.name || 'undefinded');
        if (widthCount + itemWidth > opts.width) {
            legendList.push(currentRow);
            widthCount = itemWidth;
            currentRow = [item];
        } else {
            widthCount += itemWidth;
            currentRow.push(item);
        }
    });
    if (currentRow.length) {
        legendList.push(currentRow);
    }

    return {
        legendList: legendList,
        legendHeight: legendList.length * (config.fontSize + marginTop) + padding
    };
}

function calCategoriesData(categories, opts, config) {
    var result = {
        angle: 0,
        xAxisHeight: config.xAxisHeight
    };

    var _getXAxisPoints = getXAxisPoints(categories, opts, config),
        eachSpacing = _getXAxisPoints.eachSpacing;

    // get max length of categories text


    var categoriesTextLenth = categories.map(function (item) {
        return measureText(item);
    });

    var maxTextLength = Math.max.apply(this, categoriesTextLenth);

    if (maxTextLength + 2 * config.xAxisTextPadding > eachSpacing) {
        result.angle = 45 * Math.PI / 180;
        result.xAxisHeight = 2 * config.xAxisTextPadding + maxTextLength * Math.sin(result.angle);
    }

    return result;
}

function getPieDataPoints(series) {
    var process = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    var count = 0;
    var _start_ = 0;
    series.forEach(function (item) {
        item.data = item.data === null ? 0 : item.data;
        count += item.data;
    });
    series.forEach(function (item) {
        item.data = item.data === null ? 0 : item.data;
        item._proportion_ = item.data / count * process;
    });
    series.forEach(function (item) {
        item._start_ = _start_;
        _start_ += 2 * item._proportion_ * Math.PI;
    });

    return series;
}

function getPieTextMaxLength(series) {
    series = getPieDataPoints(series);
    var maxLength = 0;
    series.forEach(function (item) {
        var text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_ * 100) + '%';
        maxLength = Math.max(maxLength, measureText(text));
    });

    return maxLength;
}

function fixColumeData(points, eachSpacing, columnLen, index, config) {
    return points.map(function (item) {
        if (item === null) {
            return null;
        }
        item.width = (eachSpacing - 2 * config.columePadding) / columnLen;
        item.width = Math.min(item.width, 25);
        item.x += (index + 0.5 - columnLen / 2) * item.width;

        return item;
    });
}

function getXAxisPoints(categories, opts, config) {
    var yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;
    var spacingValid = opts.width - 2 * config.padding - yAxisTotalWidth;
    var eachSpacing = spacingValid / categories.length;

    var xAxisPoints = [];
    var startX = config.padding + yAxisTotalWidth;
    var endX = opts.width - config.padding;
    categories.forEach(function (item, index) {
        xAxisPoints.push(startX + index * eachSpacing);
    });
    xAxisPoints.push(endX);

    return { xAxisPoints: xAxisPoints, startX: startX, endX: endX, eachSpacing: eachSpacing };
}

function getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config) {
    var process = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1;
    var points = [];
    var validHeight = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
  
    data.forEach(function (item, index) {
        if (item === null) {
            points.push(null);
        } else {
            var point = {};
            point.x = xAxisPoints[index] + Math.round(eachSpacing / 2);
            var height = validHeight * (item - minRange) / (maxRange - minRange);
            height *= process;
            point.y = opts.height - config.xAxisHeight - config.legendHeight - Math.round(height) - config.padding ;
            if(point.y < 58) {
              point.y+=20
            }
            points.push(point);
        }
    });

    return points;
}

function getYAxisTextList(series, opts, config) {
    var data = dataCombine(series);
    // remove null from data
    data = data.filter(function (item) {
        return item !== null;
    });
    var minData = Math.min.apply(this, data);
    var maxData = Math.max.apply(this, data);
    if (typeof opts.yAxis.min === 'number') {
        minData = Math.min(opts.yAxis.min, minData);
    }
    if (typeof opts.yAxis.max === 'number') {
        maxData = Math.max(opts.yAxis.max, maxData);
    }

    // fix issue https://github.com/xiaolin3303/wx-charts/issues/9
    if (minData === maxData) {
        var rangeSpan = maxData || 1;
        minData -= rangeSpan;
        maxData += rangeSpan;
    }

    var dataRange = getDataRange(minData, maxData);
    var minRange = dataRange.minRange;
    var maxRange = dataRange.maxRange;

    var range = [];
    var eachRange = (maxRange - minRange) / config.yAxisSplit;

    for (var i = 0; i <= config.yAxisSplit; i++) {
        range.push(minRange + eachRange * i);
    }
    return range.reverse();
}

function calYAxisData(series, opts, config) {

    var ranges = getYAxisTextList(series, opts, config);
    
    var yAxisWidth = config.yAxisWidth;
    var rangesFormat = ranges.map(function (item) {
        item = util.toFixed(item, 2);
        item = opts.yAxis.format ? opts.yAxis.format(Number(item)) : item;
        yAxisWidth = Math.max(yAxisWidth, measureText(item) + 5);
        return item;
    });
    if (opts.yAxis.disabled === true) {
        yAxisWidth = 0;
    }

    return { rangesFormat: rangesFormat, ranges: ranges, yAxisWidth: yAxisWidth };
}

function drawPointShape(points, color, shape, context) {
    context.beginPath();
    context.setStrokeStyle("#ffffff");
    context.setLineWidth(1);
    context.setFillStyle(color);

    if (shape === 'diamond') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x, item.y - 4.5);
                context.lineTo(item.x - 4.5, item.y);
                context.lineTo(item.x, item.y + 4.5);
                context.lineTo(item.x + 4.5, item.y);
                context.lineTo(item.x, item.y - 4.5);
            }
        });
    } else if (shape === 'circle') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x + 3.5, item.y);
                context.arc(item.x, item.y, 4, 0, 2 * Math.PI, false);
            }
        });
    } else if (shape === 'rect') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x - 3.5, item.y - 3.5);
                context.rect(item.x - 3.5, item.y - 3.5, 7, 7);
            }
        });
    } else if (shape === 'triangle') {
        points.forEach(function (item, index) {
            if (item !== null) {
                context.moveTo(item.x, item.y - 4.5);
                context.lineTo(item.x - 4.5, item.y + 4.5);
                context.lineTo(item.x + 4.5, item.y + 4.5);
                context.lineTo(item.x, item.y - 4.5);
            }
        });
    }
    context.closePath();
    context.fill();
    context.stroke();
}

function drawRingTitle(opts, config, context) {
    var titlefontSize = opts.title.fontSize || config.titleFontSize;
    var subtitlefontSize = opts.subtitle.fontSize || config.subtitleFontSize;
    var title = opts.title.name || '';
    var subtitle = opts.subtitle.name || '';
    var titleFontColor = opts.title.color || config.titleColor;
    var subtitleFontColor = opts.subtitle.color || config.subtitleColor;
    var titleHeight = title ? titlefontSize : 0;
    var subtitleHeight = subtitle ? subtitlefontSize : 0;
    var margin = 5;
    if (subtitle) {
        var textWidth = measureText(subtitle, subtitlefontSize);
        var startX = (opts.width - textWidth) / 2;
        var startY = (opts.height - config.legendHeight + subtitlefontSize) / 2;
        if (title) {
            startY -= (titleHeight + margin) / 2;
        }
        context.beginPath();
        context.setFontSize(subtitlefontSize);
        context.setFillStyle(subtitleFontColor);
        context.fillText(subtitle, startX, startY);
        context.stroke();
        context.closePath();
    }
    if (title) {
        var _textWidth = measureText(title, titlefontSize);
        var _startX = (opts.width - _textWidth) / 2;
        var _startY = (opts.height - config.legendHeight + titlefontSize) / 2;
        if (subtitle) {
            _startY += (subtitleHeight + margin) / 2;
        }
        context.beginPath();
        context.setFontSize(titlefontSize);
        context.setFillStyle(titleFontColor);
        context.fillText(title, _startX, _startY);
        context.stroke();
        context.closePath();
    }
}

function drawPointText(points, series, config, context) {
    // 绘制数据文案
    var data = series.data;

    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle('#666666');
    points.forEach(function (item, index) {
        if (item !== null) {
            var formatVal = series.format ? series.format(data[index]) : data[index];
            context.fillText(formatVal, item.x - measureText(formatVal) / 2, item.y - 2);
        }
    });
    context.closePath();
    context.stroke();
}

function drawPieText(series, opts, config, context, radius, center) {
    var lineRadius = radius + config.pieChartLinePadding;
    var textRadius = lineRadius + config.pieChartTextPadding;
    var textObjectCollection = [];
    var lastTextObject = null;

    var seriesConvert = series.map(function (item) {
        var arc = 2 * Math.PI - (item._start_ + 2 * Math.PI * item._proportion_ / 2);
        var text = item.format ? item.format(+item._proportion_.toFixed(2)) : util.toFixed(item._proportion_ * 100) + '%';
        var color = item.color;
        return { arc: arc, text: text, color: color };
    });
    seriesConvert.forEach(function (item) {
        // line end
        var orginX1 = Math.cos(item.arc) * lineRadius;
        var orginY1 = Math.sin(item.arc) * lineRadius;

        // line start
        var orginX2 = Math.cos(item.arc) * radius;
        var orginY2 = Math.sin(item.arc) * radius;

        // text start
        var orginX3 = orginX1 >= 0 ? orginX1 + config.pieChartTextPadding : orginX1 - config.pieChartTextPadding;
        var orginY3 = orginY1;

        var textWidth = measureText(item.text);
        var startY = orginY3;

        if (lastTextObject && util.isSameXCoordinateArea(lastTextObject.start, { x: orginX3 })) {
            if (orginX3 > 0) {
                startY = Math.min(orginY3, lastTextObject.start.y);
            } else if (orginX1 < 0) {
                startY = Math.max(orginY3, lastTextObject.start.y);
            } else {
                if (orginY3 > 0) {
                    startY = Math.max(orginY3, lastTextObject.start.y);
                } else {
                    startY = Math.min(orginY3, lastTextObject.start.y);
                }
            }
        }

        if (orginX3 < 0) {
            orginX3 -= textWidth;
        }

        var textObject = {
            lineStart: {
                x: orginX2,
                y: orginY2
            },
            lineEnd: {
                x: orginX1,
                y: orginY1
            },
            start: {
                x: orginX3,
                y: startY
            },
            width: textWidth,
            height: config.fontSize,
            text: item.text,
            color: item.color
        };

        lastTextObject = avoidCollision(textObject, lastTextObject);
        textObjectCollection.push(lastTextObject);
    });

    textObjectCollection.forEach(function (item) {
        var lineStartPoistion = convertCoordinateOrigin(item.lineStart.x, item.lineStart.y, center);
        var lineEndPoistion = convertCoordinateOrigin(item.lineEnd.x, item.lineEnd.y, center);
        var textPosition = convertCoordinateOrigin(item.start.x, item.start.y, center);
        context.setLineWidth(1);
        context.setFontSize(config.fontSize);
        context.beginPath();
        context.setStrokeStyle(item.color);
        context.setFillStyle(item.color);
        context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
        var curveStartX = item.start.x < 0 ? textPosition.x + item.width : textPosition.x;
        var textStartX = item.start.x < 0 ? textPosition.x - 5 : textPosition.x + 5;
        context.quadraticCurveTo(lineEndPoistion.x, lineEndPoistion.y, curveStartX, textPosition.y);
        context.moveTo(lineStartPoistion.x, lineStartPoistion.y);
        context.stroke();
        context.closePath();
        context.beginPath();
        context.moveTo(textPosition.x + item.width, textPosition.y);
        context.arc(curveStartX, textPosition.y, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.beginPath();
        context.setFillStyle('#666666');
        context.fillText(item.text, textStartX, textPosition.y + 3);
        context.closePath();
        context.stroke();

        context.closePath();
    });
}

function drawYAxisTitle(title, opts, config, context) {
  
    var startX = config.xAxisHeight + (opts.height - config.xAxisHeight - measureText(title)) / 2;
    context.save();
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle(opts.yAxis.titleFontColor || '#333333');
    context.translate(0, opts.height);
    context.rotate(-90 * Math.PI / 180);
    context.fillText(title, startX, config.padding + 0.5 * config.fontSize);
    context.stroke();
    context.closePath();
    context.restore();
  
}
function drawYAxisDividingLine(categories, opts, config, context) {
    var _getXAxisPoints4 = getXAxisPoints(categories, opts, config),
        xAxisPoints = _getXAxisPoints4.xAxisPoints,
        startX = _getXAxisPoints4.startX,
        endX = _getXAxisPoints4.endX,
        eachSpacing = _getXAxisPoints4.eachSpacing;
  
    var lineWidth = opts.width - 2 * config.padding - config.yAxisWidth - config.yAxisTitleWidth;
    
    var moveX = lineWidth*0.3 + config.yAxisWidth;
    var startY = 0;
    var endY = opts.height - config.padding - config.xAxisHeight -1;
  
    context.beginPath();
    context.rect(moveX+config.padding, startY , lineWidth*0.4, endY);
    context.setFillStyle('#e2eaf7');
    context.closePath();
    context.fill();
    categories.forEach(function (item, index) {
//      var i = (index+1);
//      if(index < (categories.length -1)) {
//        context.beginPath();
//        context.setStrokeStyle("#f85e5e");
//        context.setLineWidth(1);
//        context.moveTo((moveX*i+config.padding), startY);
//        context.lineTo((moveX*i+config.padding), endY);
//        context.closePath();
//        context.stroke();
//      }
//      
      // 对X轴列表做抽稀处理
      var validWidth = opts.width - 2 * config.padding - config.yAxisWidth - config.yAxisTitleWidth;
      var maxXAxisListLength = Math.min(categories.length, Math.ceil(validWidth / config.fontSize / 1.5));
      var ratio = Math.ceil(categories.length / maxXAxisListLength);

      categories = categories.map(function (item, index) {
          return index % ratio !== 0 ? '' : item;
      });

      if (config._xAxisTextAngle_ === 0) {
          context.beginPath();
          context.setFontSize(config.fontSize);
          categories.forEach(function (item, index) {
              var offset = eachSpacing / 2 - measureText(item) / 2;
              if(item.indexOf('适宜') != '-1') {
                context.setFillStyle("#427ddb");
              }else {
                context.setFillStyle("#a5a5a5");
              }
              context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
          });
          context.closePath();
          context.stroke();
      } else {
          categories.forEach(function (item, index) {
              context.save();
              context.beginPath();
              context.setFontSize(config.fontSize);
              context.setFillStyle(opts.xAxis.fontColor || '#666666');
              var textWidth = measureText(item);
              var offset = eachSpacing / 2 - textWidth;

              var _calRotateTranslate = calRotateTranslate(xAxisPoints[index] + eachSpacing / 2, startY + config.fontSize / 2 + 5, opts.height),
                  transX = _calRotateTranslate.transX,
                  transY = _calRotateTranslate.transY;

              context.rotate(-1 * config._xAxisTextAngle_);
              context.translate(transX, transY);
              context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
              context.closePath();
              context.stroke();
              context.restore();
          });
      }
    });
}
function drawYAxisCoordLine(series, opts, config, context) {
    
    var _calYAxisData4 = calYAxisData(series, opts, config),
        rangesFormat = _calYAxisData4.rangesFormat;
    var yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;

    var spacingValid = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    var eachSpacing = Math.floor(spacingValid / config.yAxisSplit);
    var startX = config.padding + yAxisTotalWidth;
    var endX = opts.width - config.padding;
    var startY = config.padding;
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;

    var points = [];
    for (var i = 0; i < config.yAxisSplit; i++) {
        points.push(config.padding + eachSpacing * i);
    }
  
    context.beginPath();
    context.setStrokeStyle(opts.xAxis.gridColor || "#cccccc");
    context.setLineWidth(1);
    context.moveTo(startX, 4);
    context.lineTo(startX, endY);
    context.closePath();
    context.stroke();
  
    context.beginPath();
    context.setStrokeStyle(opts.yAxis.gridColor || "#cccccc");
    context.setLineWidth(1);
    points.forEach(function (item, index) {
        context.moveTo(startX-4, item);
        context.lineTo(startX, item);
    });
    context.closePath();
    context.stroke();
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle(opts.yAxis.fontColor || '#666666');
    rangesFormat.splice((rangesFormat.length-1),1)
    rangesFormat.forEach(function (item, index) {
        var pos = points[index] ? points[index] : endY;
        context.fillText(item, (config.padding + config.yAxisTitleWidth), pos + config.fontSize / 2 -1);
    });
    context.closePath();
    context.stroke();

    if (opts.yAxis.title) {
        drawYAxisTitle(opts.yAxis.title, opts, config, context);
    }
}
function drawXAxisHint(categories, opts, config, context) {

    var _getXAxisPoints4 = getXAxisPoints(categories, opts, config),
        xAxisPoints = _getXAxisPoints4.xAxisPoints,
        startX = _getXAxisPoints4.startX,
        endX = _getXAxisPoints4.endX,
        eachSpacing = _getXAxisPoints4.eachSpacing;

    var startY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    var endY = startY + config.xAxisLineHeight;
    
    var validWidth = opts.width - 2 * config.padding - config.yAxisWidth - config.yAxisTitleWidth;
    var maxXAxisListLength = Math.min(categories.length, Math.ceil(validWidth / config.fontSize / 1.5));
    var ratio = Math.ceil(categories.length / maxXAxisListLength);
    
    categories.forEach(function (item, index) {
        var offset = eachSpacing / 2 - measureText(item) / 2 + 23;
        if(opts.extra.index === index) {
          console.log(index)
          context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
          context.beginPath();
          context.setStrokeStyle("red");
          // 设置填充颜色
          context.setFillStyle("red"); 
          // 绘制圆形区域
          context.arc(xAxisPoints[index] + offset, startY, 1, 0, 2 * Math.PI, false);
          context.setLineWidth(1);
          context.moveTo(xAxisPoints[index] + offset, startY);
          context.lineTo(xAxisPoints[index] + offset+10, startY-40);

          context.moveTo(xAxisPoints[index] + offset+10, startY-40);
          context.lineTo(xAxisPoints[index] + offset+20, startY-40);
          context.fillText(opts.extra.hint, xAxisPoints[index] + offset+25, startY-37);
          context.closePath();
          context.stroke();
        }
    });
}
function drawColumnDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    
  
    var _calYAxisData = calYAxisData(series, opts, config),
        ranges = _calYAxisData.ranges;

    var _getXAxisPoints = getXAxisPoints(opts.categories, opts, config),
        xAxisPoints = _getXAxisPoints.xAxisPoints,
        eachSpacing = _getXAxisPoints.eachSpacing;

    var minRange = ranges.pop();
    var maxRange = ranges.shift();
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config);
       
        // 绘制柱状数据图
        context.beginPath();
        context.setStrokeStyle("#5274bc");
        context.setFillStyle(eachSeries.color);
      
        points.forEach(function (item, index) {
            if (item !== null) {
                var startX = item.x - item.width / 2 + 1;
                var height = opts.height - item.y - config.padding - config.xAxisHeight - config.legendHeight;
                context.moveTo(startX, item.y);
                context.rect(startX, item.y, item.width - 2, height);
            }
        });
        context.closePath();
        context.fill();
        context.stroke();
    });
    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config);
        if (opts.dataLabel !== false && process === 1) {
            drawPointText(points, eachSeries, config, context);
        }
    });

    return xAxisPoints;
}

function drawAreaDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

    var _calYAxisData2 = calYAxisData(series, opts, config),
        ranges = _calYAxisData2.ranges;

    var _getXAxisPoints2 = getXAxisPoints(opts.categories, opts, config),
        xAxisPoints = _getXAxisPoints2.xAxisPoints,
        eachSpacing = _getXAxisPoints2.eachSpacing;

    var minRange = ranges.pop();
    var maxRange = ranges.shift();
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;

    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);

        var splitPointList = splitPoints(points);

        splitPointList.forEach(function (points) {
            // 绘制区域数据
            context.beginPath();
            context.setStrokeStyle(eachSeries.color);
            context.setFillStyle(eachSeries.color);
            context.setGlobalAlpha(0.6);
            context.setLineWidth(1);
            if (points.length > 1) {
                var firstPoint = points[0];
                var lastPoint = points[points.length - 1];

                context.moveTo(firstPoint.x, firstPoint.y);
                points.forEach(function (item, index) {
                    if (index > 0) {
                        context.lineTo(item.x, item.y);
                    }
                });

                context.lineTo(lastPoint.x, endY);
                context.lineTo(firstPoint.x, endY);
                context.lineTo(firstPoint.x, firstPoint.y);
            } else {
                var item = points[0];
                context.moveTo(item.x - eachSpacing / 2, item.y);
                context.lineTo(item.x + eachSpacing / 2, item.y);
                context.lineTo(item.x + eachSpacing / 2, endY);
                context.lineTo(item.x - eachSpacing / 2, endY);
                context.moveTo(item.x - eachSpacing / 2, item.y);
            }
            context.closePath();
            context.fill();
            context.setGlobalAlpha(1);
        });

        if (opts.dataPointShape !== false) {
            var shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function (eachSeries, seriesIndex) {
            var data = eachSeries.data;
            var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }

    return xAxisPoints;
}

function drawLineDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

    var _calYAxisData3 = calYAxisData(series, opts, config),
        ranges = _calYAxisData3.ranges;

    var _getXAxisPoints3 = getXAxisPoints(opts.categories, opts, config),
        xAxisPoints = _getXAxisPoints3.xAxisPoints,
        eachSpacing = _getXAxisPoints3.eachSpacing;

    var minRange = ranges.pop();
    var maxRange = ranges.shift();

    series.forEach(function (eachSeries, seriesIndex) {
        var data = eachSeries.data;
        var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        var splitPointList = splitPoints(points);

        splitPointList.forEach(function (points, index) {
            context.beginPath();
            context.setStrokeStyle(eachSeries.color);
            context.setLineWidth(2);
            if (points.length === 1) {
                context.moveTo(points[0].x, points[0].y);
                context.arc(points[0].x, points[0].y, 1, 0, 2 * Math.PI);
            } else {
                context.moveTo(points[0].x, points[0].y);
                points.forEach(function (item, index) {
                    if (index > 0) {
                        context.lineTo(item.x, item.y);
                    }
                });
                context.moveTo(points[0].x, points[0].y);
            }
            context.closePath();
            context.stroke();
        });

        if (opts.dataPointShape !== false) {
            var shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
            drawPointShape(points, eachSeries.color, shape, context);
        }
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function (eachSeries, seriesIndex) {
            var data = eachSeries.data;
            var points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }

    return xAxisPoints;
}

function drawXAxis(categories, opts, config, context) {
    var _getXAxisPoints4 = getXAxisPoints(categories, opts, config),
        xAxisPoints = _getXAxisPoints4.xAxisPoints,
        startX = _getXAxisPoints4.startX,
        endX = _getXAxisPoints4.endX,
        eachSpacing = _getXAxisPoints4.eachSpacing;

    var startY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    var endY = startY + config.xAxisLineHeight;

    context.beginPath();
    context.setStrokeStyle(opts.xAxis.gridColor || "#cccccc");
    context.setLineWidth(1);
    context.moveTo(startX, startY);
    context.lineTo(endX, startY);
    if (opts.xAxis.disableGrid !== true) {
        if (opts.xAxis.type === 'calibration') {
            xAxisPoints.forEach(function (item, index) {
                if (index > 0) {
                    context.moveTo(item - eachSpacing / 2, startY);
                    context.lineTo(item - eachSpacing / 2, startY + 4);
                }
            });
        } else {
            xAxisPoints.forEach(function (item, index) {
                context.moveTo(item, startY);
                context.lineTo(item, endY);
            });
        }
    }
    context.closePath();
    context.stroke();
    // 对X轴列表做抽稀处理
    var validWidth = opts.width - 2 * config.padding - config.yAxisWidth - config.yAxisTitleWidth;
    var maxXAxisListLength = Math.min(categories.length, Math.ceil(validWidth / config.fontSize / 1.5));
    var ratio = Math.ceil(categories.length / maxXAxisListLength);

    categories = categories.map(function (item, index) {
        return index % ratio !== 0 ? '' : item;
    });

    if (config._xAxisTextAngle_ === 0) {
        context.beginPath();
        context.setFontSize(config.fontSize);
        context.setFillStyle(opts.xAxis.fontColor || '#666666');
        categories.forEach(function (item, index) {
            var offset = eachSpacing / 2 - measureText(item) / 2;
            context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
        });
        context.closePath();
        context.stroke();
    } else {
        categories.forEach(function (item, index) {
            context.save();
            context.beginPath();
            context.setFontSize(config.fontSize);
            context.setFillStyle(opts.xAxis.fontColor || '#666666');
            var textWidth = measureText(item);
            var offset = eachSpacing / 2 - textWidth;

            var _calRotateTranslate = calRotateTranslate(xAxisPoints[index] + eachSpacing / 2, startY + config.fontSize / 2 + 5, opts.height),
                transX = _calRotateTranslate.transX,
                transY = _calRotateTranslate.transY;

            context.rotate(-1 * config._xAxisTextAngle_);
            context.translate(transX, transY);
            context.fillText(item, xAxisPoints[index] + offset, startY + config.fontSize + 5);
            context.closePath();
            context.stroke();
            context.restore();
        });
    }
}

function drawYAxis(series, opts, config, context) {
    if (opts.yAxis.disabled === true) {
        return;
    }

    var _calYAxisData4 = calYAxisData(series, opts, config),
        rangesFormat = _calYAxisData4.rangesFormat;

    var yAxisTotalWidth = config.yAxisWidth + config.yAxisTitleWidth;

    var spacingValid = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    var eachSpacing = Math.floor(spacingValid / config.yAxisSplit);
    var startX = config.padding + yAxisTotalWidth;
    var endX = opts.width - config.padding;
    var startY = config.padding;
    var endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;

    var points = [];
    for (var i = 0; i < config.yAxisSplit; i++) {
        points.push(config.padding + eachSpacing * i);
    }

    context.beginPath();
    context.setStrokeStyle(opts.yAxis.gridColor || "#cccccc");
    context.setLineWidth(1);
    points.forEach(function (item, index) {
        context.moveTo(startX, item);
        context.lineTo(endX, item);
    });
    context.closePath();
    context.stroke();
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle(opts.yAxis.fontColor || '#666666');
    rangesFormat.forEach(function (item, index) {
        var pos = points[index] ? points[index] : endY;
        context.fillText(item, config.padding + config.yAxisTitleWidth, pos + config.fontSize / 2);
    });
    context.closePath();
    context.stroke();

    if (opts.yAxis.title) {
        drawYAxisTitle(opts.yAxis.title, opts, config, context);
    }
}

function drawLegend(series, opts, config, context) {
    if (!opts.legend) {
        return;
    }
    // each legend shape width 15px
    // the spacing between shape and text in each legend is the `padding`
    // each legend spacing is the `padding`
    // legend margin top `config.padding`

    var _calLegendData = calLegendData(series, opts, config),
        legendList = _calLegendData.legendList,
        legendHeight = _calLegendData.legendHeight;

    var padding = 5;
    var marginTop = 8;
    var shapeWidth = 15;
    legendList.forEach(function (itemList, listIndex) {
        var width = 0;
        itemList.forEach(function (item) {
            item.name = item.name || 'undefined';
            width += 3 * padding + measureText(item.name) + shapeWidth;
        });
        var startX = (opts.width - width) / 2 + padding;
        var startY = opts.height - config.padding - config.legendHeight + listIndex * (config.fontSize + marginTop) + padding + marginTop;

        context.setFontSize(config.fontSize);
        itemList.forEach(function (item) {
            switch (opts.type) {
                case 'line':
                    context.beginPath();
                    context.setLineWidth(1);
                    context.setStrokeStyle(item.color);
                    context.moveTo(startX - 2, startY + 5);
                    context.lineTo(startX + 17, startY + 5);
                    context.stroke();
                    context.closePath();
                    context.beginPath();
                    context.setLineWidth(1);
                    context.setStrokeStyle('#ffffff');
                    context.setFillStyle(item.color);
                    context.moveTo(startX + 7.5, startY + 5);
                    context.arc(startX + 7.5, startY + 5, 4, 0, 2 * Math.PI);
                    context.fill();
                    context.stroke();
                    context.closePath();
                    break;
                case 'pie':
                case 'ring':
                    context.beginPath();
                    context.setFillStyle(item.color);
                    context.moveTo(startX + 7.5, startY + 5);
                    context.arc(startX + 7.5, startY + 5, 7, 0, 2 * Math.PI);
                    context.closePath();
                    context.fill();
                    break;
                default:
                    context.beginPath();
                    context.setFillStyle(item.color);
                    context.moveTo(startX, startY);
                    context.rect(startX, startY, 15, 10);
                    context.closePath();
                    context.fill();
            }
            startX += padding + shapeWidth;
            context.beginPath();
            context.setFillStyle('#333333');
            context.fillText(item.name, startX, startY + 9);
            context.closePath();
            context.stroke();
            startX += measureText(item.name) + 2 * padding;
        });
    });
}
function drawPieDataPoints(series, opts, config, context) {
    var process = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

    series = getPieDataPoints(series, process);
    var centerPosition = {
        x: opts.width / 2,
        y: (opts.height - config.legendHeight) / 2
    };
    var radius = Math.min(centerPosition.x - config.pieChartLinePadding - config.pieChartTextPadding - config._pieTextMaxLength_, centerPosition.y - config.pieChartLinePadding - config.pieChartTextPadding);
    if (opts.dataLabel) {
        radius -= 10;
    } else {
        radius -= 2 * config.padding;
    }
    series.forEach(function (eachSeries) {
        context.beginPath();
        context.setLineWidth(2);
        context.setStrokeStyle('#ffffff');
        context.setFillStyle(eachSeries.color);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius, eachSeries._start_, eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI);
        context.closePath();
        context.fill();
        if (opts.disablePieStroke !== true) {
            context.stroke();
        }
    });

    if (opts.type === 'ring') {
        var innerPieWidth = radius * 0.6;
        if (typeof opts.extra.ringWidth === 'number' && opts.extra.ringWidth > 0) {
            innerPieWidth = Math.max(0, radius - opts.extra.ringWidth);
        }
        context.beginPath();
        context.setFillStyle('#ffffff');
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, innerPieWidth, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }

    if (opts.dataLabel !== false && process === 1) {
        drawPieText(series, opts, config, context, radius, centerPosition);
    }

    if (process === 1 && opts.type === 'ring') {
        drawRingTitle(opts, config, context);
    }

    return {
        center: centerPosition,
        radius: radius,
        series: series
    };
}

function drawCanvas(opts, context) {
    context.draw();
}

var Timing = {
    easeIn: function easeIn(pos) {
        return Math.pow(pos, 3);
    },

    easeOut: function easeOut(pos) {
        return Math.pow(pos - 1, 3) + 1;
    },

    easeInOut: function easeInOut(pos) {
        if ((pos /= 0.5) < 1) {
            return 0.5 * Math.pow(pos, 3);
        } else {
            return 0.5 * (Math.pow(pos - 2, 3) + 2);
        }
    },

    linear: function linear(pos) {
        return pos;
    }
};

function Animation(opts) {
    this.isStop = false;
    opts.duration = typeof opts.duration === 'undefined' ? 1000 : opts.duration;
    opts.timing = opts.timing || 'linear';

    var delay = 17;

    var createAnimationFrame = function createAnimationFrame() {
        if (typeof requestAnimationFrame !== 'undefined') {
            return requestAnimationFrame;
        } else if (typeof setTimeout !== 'undefined') {
            return function (step, delay) {
                setTimeout(function () {
                    var timeStamp = +new Date();
                    step(timeStamp);
                }, delay);
            };
        } else {
            return function (step) {
                step(null);
            };
        }
    };
    var animationFrame = createAnimationFrame();
    var startTimeStamp = null;
    var _step = function step(timestamp) {
        if (timestamp === null || this.isStop === true) {
            opts.onProcess && opts.onProcess(1);
            opts.onAnimationFinish && opts.onAnimationFinish();
            return;
        }
        if (startTimeStamp === null) {
            startTimeStamp = timestamp;
        }
        if (timestamp - startTimeStamp < opts.duration) {
            var process = (timestamp - startTimeStamp) / opts.duration;
            var timingFunction = Timing[opts.timing];
            process = timingFunction(process);
            opts.onProcess && opts.onProcess(process);
            animationFrame(_step, delay);
        } else {
            opts.onProcess && opts.onProcess(1);
            opts.onAnimationFinish && opts.onAnimationFinish();
        }
    };
    _step = _step.bind(this);

    animationFrame(_step, delay);
}

// stop animation immediately
// and tigger onAnimationFinish
Animation.prototype.stop = function () {
    this.isStop = true;
};

function drawCharts(type, opts, config, context) {
    var _this = this;

    var series = opts.series;
    var categories = opts.categories;
    series = fillSeriesColor(series, config);

    var _calLegendData = calLegendData(series, opts, config),
        legendHeight = _calLegendData.legendHeight;

    config.legendHeight = legendHeight;

    var _calYAxisData = calYAxisData(series, opts, config),
        yAxisWidth = _calYAxisData.yAxisWidth;

    config.yAxisWidth = yAxisWidth + 20;
    if (categories && categories.length) {
        var _calCategoriesData = calCategoriesData(categories, opts, config),
            xAxisHeight = _calCategoriesData.xAxisHeight,
            angle = _calCategoriesData.angle;

        config.xAxisHeight = xAxisHeight;
        config._xAxisTextAngle_ = angle;
    }
    if (type === 'pie' || type === 'ring') {
        config._pieTextMaxLength_ = opts.dataLabel === false ? 0 : getPieTextMaxLength(series);
    }

    var duration = opts.animation ? 1000 : 0;
    this.animationInstance && this.animationInstance.stop();
    switch (type) {
        case 'line':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: function onProcess(process) {
                    drawYAxis(series, opts, config, context);
                    drawXAxis(categories, opts, config, context);
                    _this.chartData.xAxisPoints = drawLineDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'column':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: function onProcess(process) {
                    drawYAxis(series, opts, config, context);
                    drawXAxis(categories, opts, config, context);
                    drawYAxisCoordLine(series, opts, config, context);
                    //drawYAxisDividingLine(opts.extra.area, opts, config, context)
                    _this.chartData.xAxisPoints = drawColumnDataPoints(series, opts, config, context, process);
                    drawXAxisHint(categories, opts, config, context);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'area':
            this.animationInstance = new Animation({
                timing: 'easeIn',
                duration: duration,
                onProcess: function onProcess(process) {
                    drawYAxis(series, opts, config, context);
                    drawXAxis(categories, opts, config, context);
                    _this.chartData.xAxisPoints = drawAreaDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
        case 'ring':
        case 'pie':
            this.animationInstance = new Animation({
                timing: 'easeInOut',
                duration: duration,
                onProcess: function onProcess(process) {
                    _this.chartData.pieData = drawPieDataPoints(series, opts, config, context, process);
                    drawLegend(opts.series, opts, config, context);
                    drawCanvas(opts, context);
                },
                onAnimationFinish: function onAnimationFinish() {
                    _this.event.trigger('renderComplete');
                }
            });
            break;
    }
}

// simple event implement

function Event() {
	this.events = {};
}

Event.prototype.addEventListener = function (type, listener) {
	this.events[type] = this.events[type] || [];
	this.events[type].push(listener);
};

Event.prototype.trigger = function () {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var type = args[0];
	var params = args.slice(1);
	if (!!this.events[type]) {
		this.events[type].forEach(function (listener) {
			try {
				listener.apply(null, params);
			} catch (e) {
				console.error(e);
			}
		});
	}
};

var Charts = function Charts(opts) {
    opts.title = opts.title || {};
    opts.subtitle = opts.subtitle || {};
    opts.yAxis = opts.yAxis || {};
    opts.xAxis = opts.xAxis || {};
    opts.extra = opts.extra || {};
    opts.legend = opts.legend === false ? false : true;
    opts.animation = opts.animation === false ? false : true;
    var config$$1 = assign({}, config);
    config$$1.yAxisTitleWidth = opts.yAxis.disabled !== true && opts.yAxis.title ? config$$1.yAxisTitleWidth : 0;
    config$$1.pieChartLinePadding = opts.dataLabel === false ? 0 : config$$1.pieChartLinePadding;
    config$$1.pieChartTextPadding = opts.dataLabel === false ? 0 : config$$1.pieChartTextPadding;

    this.opts = opts;
    this.config = config$$1;
    this.context = wx.createCanvasContext(opts.canvasId);
    // store calcuated chart data
    // such as chart point coordinate
    this.chartData = {};
    this.event = new Event();
    drawCharts.call(this, opts.type, opts, config$$1, this.context);
};

Charts.prototype.updateData = function () {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.opts.series = data.series || this.opts.series;
    this.opts.categories = data.categories || this.opts.categories;
    drawCharts.call(this, this.opts.type, this.opts, this.config, this.context);
};

Charts.prototype.stopAnimation = function () {
    this.animationInstance && this.animationInstance.stop();
};

Charts.prototype.addEventListener = function (type, listener) {
    this.event.addEventListener(type, listener);
};

Charts.prototype.getCurrentDataIndex = function (e) {
    if (e.touches && e.touches.length) {
        var _e$touches$ = e.touches[0],
            x = _e$touches$.x,
            y = _e$touches$.y;

        if (this.opts.type === 'pie' || this.opts.type === 'ring') {
            return findPieChartCurrentIndex({ x: x, y: y }, this.chartData.pieData);
        } else {
            return findCurrentIndex({ x: x, y: y }, this.chartData.xAxisPoints, this.opts, this.config);
        }
    }
    return -1;
};

module.exports = Charts;

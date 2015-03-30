(function(moduleName, factory) {
    "use strict"
    if (typeof module == "object" && typeof module.exports == "object") {
        module.exports = factory(window)
    } else {
        window[moduleName] = factory(window)
    }

})('cEffect', function(window, undefined) {

var _ARR   = []
var _SPACE = ' '
var EFFECT_TYPES = {shake: true, flash: true, tada: true, swing: true, wobble: true, 
	pulse: true, flip: true, flipInX: true, flipOutX: true, flipInY: true, flipOutY: true, 
	fadeIn: true, fadeInUp: true, fadeInDown: true, fadeInLeft: true, fadeInRight: true, 
	fadeOut: true, fadeOutUp: true, fadeOutDown: true, fadeOutLeft: true, fadeOutRight: true, 
	bounce: true, bounceIn: true, bounceOut: true }

var head  = document.getElementsByTagName('head')[0]
function testCssLoaded () {
	var tester = head.insertBefore(document.createElement('div'), head.firstChild)
	tester.id = 'js_ceffect_existed'

	var loaded = window.getComputedStyle ?
		document.defaultView.getComputedStyle(tester, null).getPropertyValue('height') == '42px' :
		tester.currentStyle['height'] == '42px'

	head.removeChild(tester)
	if (loaded) {
		testCssLoaded = function () { return true }
	}	
	return loaded
}

function animationend () {
	var style = document.documentElement.style
	var _animationend = 
		style.WebkitAnimation !== undefined ? 'webkitAnimationEnd' :
		style.webkitAnimation !== undefined ? 'webkitAnimationEnd' :
		style.MozAnimation    !== undefined ? 'animationend'       :
		style.OAnimation      !== undefined ? 'OAnimationEnd'      :
		style.msAnimation     !== undefined ? 'msAnimationEnd'     :
		style.animation       !== undefined ? 'animationend'       : false

	return (animationend = function () { return _animationend })()
}

var map = _ARR.map ?
	function (arr, iterator) { return _ARR.concat(arr).map(iterator) }:
	function (arr, iterator) { 
		arr = _ARR.concat(arr)
		for(var i=0, len=arr.length, rs=[]; i<len; i++) 
			rs.push( iterator(arr[i], i, arr) )
		return rs
	}

var trim = _SPACE.trim ?
	function (str) { return str.trim() }:
	function (str) { return str.replace(/^\s+|\s+$/g, '') }

var addClass, removeClass
if (document.documentElement.classList) {
	addClass    = function (el, classNames) { 
		map(classNames, function (className) {el.classList.add(className)}) 
	}
	removeClass = function (el, classNames) { 
		map(classNames, function (className) {el.classList.remove(className)}) 
	}
} else {
	addClass    = function (el, classNames) {
		var oClassName = _SPACE + el.className.replace(/\s+/, _SPACE) + _SPACE
		oClassName = oClassName + map(classNames, function (className) {
			return !~oClassName.indexOf(_SPACE + className + _SPACE) ? className : ''
		}).join(_SPACE)
		el.className = trim(oClassName)
	}
	removeClass = function (el, classNames) {
		var oClassName = _SPACE + el.className.replace(/\s+/, _SPACE) + _SPACE
		map(classNames, function (className) {
			oClassName = oClassName.replace(_SPACE + className + _SPACE, _SPACE)
		})
		el.className = trim(oClassName)
	}
}

function cEffect (node, effectType, duration, callback) {
	var timer, css

	if (!testCssLoaded()) {
		throw "css file is not loaded"
	}

	if (typeof duration === 'function') {
		callback = duration
		duration = undefined
	}	

	if ( animationend() === false ) {
		callback && callback.call(node)
		return
	}

	duration   = Math.min(Math.max((duration/100|0)*100, 200), 2000)
	effectType = EFFECT_TYPES[effectType] ? effectType : 'shake'

	css = [ 'animated', 'ani-duration-'+duration, 'ani-'+effectType ]
	
	function animationendFn () {
		clearTimeout(timer)
		node.removeEventListener(animationend(), animationendFn)
		removeClass(node, css)
		callback && callback.call(node)
	}

	node.addEventListener(animationend(), animationendFn)
	addClass(node, css)
	timer = setTimeout(animationendFn, duration + 50)
}

if (jQuery) {
	$.fn.cEffect = function () {
		var arg = $.makeArray(arguments)
		return this.each(function () {
			cEffect.apply( undefined, [this].concat(arg) )
		});
	}
}
return cEffect

})
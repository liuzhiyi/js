"use strict";

(function(){
	var _toString = Object.prototype.toString,
		NULL_TYPE = 'Null',
		UNDEFINED_TYPE = 'Undefined',
		BOOLEAN_TYPE = 'Boolean',
		NUMBER_TYPE = 'Number',
		STRING_TYPE = 'String',
		OBJECT_TYPE = 'Object',
		FUNCTION_CLASS = '[object Function]',
		BOOLEAN_CLASS = '[object Boolean]',
		NUMBER_CLASS = '[object Number]',
		STRING_CLASS = '[object String]',
		ARRAY_CLASS = '[object Array]',
		DATE_CLASS = '[object Date]';

	function extend(destination, source) {
		for (var property in source)
		  destination[property] = source[property];
		return destination;
	}

	function isFunction(object) {
		return _toString.call(object) === FUNCTION_CLASS;
	}

	function toArray(src) {
		var length = src.length || 0, results = new Array(length);
		while (length--) results[length] = src[length];
		return results;
	}

	function clone(object) {
		extend({}, object);
	}

	function isString(object) {
		return _toString.call(object) === STRING_CLASS;
	}

	function isArray(object) {
		return _toString.call(object) === ARRAY_CLASS;
	}

	function isDate(object) {
		return _toString.call(object) === DATE_CLASS;
	}

	function isBoolean(object) {
		return _toString.call(object) === BOOLEAN_CLASS;
	} 

	function isNumber(object) {
		return _toString(object).call(object) === NUMBER_CLASS;
	}

	function isUndefined(object) {
		return typeof object === 'undefined';
	}

	extend(Object, {
		extend: extend,
		isFunction: isFunction,
		toArray: toArray
	});
})();

Object.extend(Function.prototype, {
	argumentNames: function() {
		var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
		  .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
		  .replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	 }
});

var Class = (function(){
	var IS_DONTENUM_BUGGY = (function(){
		var p;
		for(p in {toString: 1}) {
			if (p === 'toString') return false;
		}

		return true;
	})();

	function subclass() {};
	function create() {
		var parent = null, properties = Object.toArray(arguments);
		if (Object.isFunction(properties[0])) {
			parent = properties.shift();
		}

		function baseCalss() {
			this.init.apply(this, arguments);
		}

		Object.extend(baseCalss, {addMethods: addMethods});
		baseCalss.superclass = parent;
		baseCalss.subclasses = [];

		if (parent) {
			subclass.prototype = parent.prototype;
			baseCalss.prototype = new subclass();
			parent.subclasses.push(baseCalss);
		}

		for (var i=0, length = properties.length; i < length; i++)
			baseCalss.addMethods(properties[i]);

		if (!baseCalss.prototype.init){
			baseCalss.prototype.init = function(){};
		}

		baseCalss.prototype.constructor = baseCalss;
		
		return baseCalss;
	}

	function addMethods(source) {
		var parent = this.superclass && this.superclass.prototype;

		if (IS_DONTENUM_BUGGY) {
			if (source.toString != Object.prototype.toString)
				source.push('toString');
			if (source.valueOf != Object.prototype.valueOf) {
				source.push('valueOf');
			}
		}

		for (var i in source) {
			var value = source[i];
			if (parent && Object.isFunction(value) &&
				value.argumentNames()[0] === '$super') {
				var func = value;
				value = function() {
					var args = Object.toArray(arguments),
  							_this = this;

					var parentFun = function() {
						var m = parent[i];
						m.apply(_this, arguments);
					}
					args.unshift(parentFun);
					return func.apply(this, args);
				}
			}

			this.prototype[i] = value;
		}
		return this;
	}

	return {create:create};
})();


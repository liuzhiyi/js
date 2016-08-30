"use strict";

var observe = Class.create(
{
	object:null,

	events:{},

	addEvent: function(name, func) {
		if (Object.isFunction(func)) {
			if (Object.isUndefended(this.events[name])) {
				this.events[name] = [];
			}

			this.events[name].push(func);
		}
	},

	removeEevent: function(name, func) {
		if (Object.isArray(this.events[name])) {
			for (var i=0; i<this.events[name].length; i++) {
				if (this.events[name][i] == func) {
					for(j=i+1; j<this.events[name].length; i++, j++) {
						this.events[name][i] = this.events[name][j];
					}
					this.events[j].pop();
					break;
				}
			}
		}
	},

	dispatchEvent: function() {
		var args = Object.toArray(arguments), name = '';
		if (Object.isString(args[0])) {

			name = args.shift();
			if (Object.isArray(this.events[name])) {
				for (var i=0; i<this.events[name].length; i++) {
					this.events[name][i].call(this.object, args);
				}
			}
		}		
	}
}
);
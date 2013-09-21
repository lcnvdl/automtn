/**
 * Automtn.js
 *
 * @date        2013-09-21
 * @author     	Luciano Rasente
 * @link        https://github.com/lcnvdl/automtn
 * @copyright   Copyright(c) 2013 Luciano Rasente
 * @licence     MIT Licensed
 */
 
 /**
  * @module automtn
  */

 //
 //	Requeriments
 //

 if (typeof String.prototype.replaceAll === 'undefined') {

    String.prototype.replaceAll = function (search, newstring) {
        var text = this;

        while (text.toString().indexOf(search) !== -1)
            text = text.toString().replace(search, newstring);

        return text;
    };
}

if (typeof Array.prototype.getKey === 'undefined') {
    Array.prototype.getKey = function () {
        for (var prop in this)
            if (this.propertyIsEnumerable(prop))
                return prop;
    };
}

//
//	jQuery Plugin
//

(function ($) {
	
	/**
	 *	Appends a string into the element.
	 *
	 *	@method appendStr
	 *	@param {String} text Text.
	 *	@chained
	 */
    $.fn.appendStr = function(text) {
        var e = $(this);
        e.html(e.html()+text);
        return e;        
    },

	/**
	 *	Automates an element.
	 *
     *  @method automtn
	 *	@param {Object}     [options] Data.
	 *	@param {String}	    [options.action="init"] Action to execute. Values: `init`, `fetch`, `fill`.
	 *	@param {String}	    [options.fetch] Url for json data. It can't be null.
	 *  @param {Boolean}	[options.onlyvalue="false"] Parse only strings.
	 *	@param {String}     [options.mode=Automtn.mode.Overwrite] Write mode. Action when inserts data into element.
	 *	@param {String}	    [options.method="POST"] Ajax method. Values: `POST`, `GET`.
	 *	@param {Boolean}    [options.external=false] If you have cross-domain problems. 
	 *	@param {String}     [options.fill="self"] Element selector to fill with data. Use `self` or `#elementId`.
	 *	@param {String}     [options.events] Events to start data fetching. Values: `now`, `document-ready` or `#elementId-eventName`. Example: `options.events="#myModal-show"; // Bootstrap modal`.
	 *	@param {String}     [options.subscript] Handler executed to subscript the element in a custom event. 
	 *	@param {String}	    [options.filltype] Sets the filltype (if you don't want the fill from the container element). Values: `div`, `table`, `ul`, etc.
	 *	@param {String}	    [options.tpl="{value}"] Template. You can use inside: `{key}`, `{value}`. Example: `options.tpl="<span id='span-{key}'>{value}</span>"`.
     *  @param {String}     [options.parsechild="auto"] Parse childs of received data. Values: `auto`, `no`, `yes`.
	 *	@param {String}		[options.parsemode="none"] Post-parses the content. Values: `none`, `kv-as-values`, `kv-as-array`.
	 *	@param {String}	    [options.loadstart] Event.
	 *	@param {String}	    [options.loadsuccess] Event.
	 *	@param {String}	    [options.loaderror] Event.
	 *	@param {String}	    [options.loadfinish] Event.
	 *	@chained
	 */
    $.fn.automtn = function (options) {

        //  Set e as a jQuery element
        
        var e;

        if (this instanceof $) {
            e = this;
        }
        else {
            e = $(this);
        }
        
        //  Validation

        if (e.length == 0) {
            throw "Automtn element is null because your jQuery selector matches with 0 elements.";
        }

        //  Actions

        var action = String(options.action || 'init').toLowerCase();

        var _id = e.attr("id");

        if (typeof _id === 'undefined' || _id == "") {
            _id = "auto-" + (Automtn.id++);
            e.attr("id", _id);
        }

        //  Init

        if (action == 'init') {
        
            //  Don't init two times
        
            if (e.data("init"))
                return e;

            e.data("init", true);
            
            //  Apply custom options to defaults

            options = $.extend({}, Automtn.defaults, options || {});
            
            //  Read settings

            var gen = function (name) {
                var value = e.data(name) || options[name];
                                
                e.data(name, typeof value === 'undefined' ? "" : value);

                return value;
            };

            var url = gen("fetch");
            if(!url || url == "") {
                throw "You cant fetch data from a null url.";
            }
            
            $.each([
                "external", "key", "method", "mode", "onlyvalue", 
                "parsechild", "parsemode", "tpl", "value",
                
                "loadstart", "loadfinish", "loadsuccess", "loaderror" ], 
                function(k, v) {
                    gen(v);
                });
            
            var fill = gen("fill");
            var events = gen("events");
            var subscript = gen("subscript");
            var filltype = gen("filltype");

            if (typeof subscript !== 'undefined' && subscript != "") {
                eval(subscript);
            }

            if(fill != "") {
                var fillElement;

                if(fill.toLowerCase() == "self") {
                    fillElement = e;
                }
                else {
                    fillElement = $(fill);

                    if(fillElement.length == 0) {
                        e.data("init", false);

                        return e;
                    }
                }

                e.data("element", fillElement);

                if(filltype == "") {
                    var filltype = fillElement[0].tagName.toLowerCase();
                    e.data("filltype", filltype);
                }
            }
            
            if (typeof events !== 'undefined' && events != "") {

                var array = events.split(",");
                var fn = function () { e.automtn({ action: 'fetch' }) };

                for (var i = 0; i < array.length; i++) {

                    var val = array[i].trim();

                    if (val == "document-ready") {
                        $(document).ready(function () {
                            fn();
                        });
                    }
                    else if (val == "now") {
                        fn();
                    }
                    else {
                        var keyval = val.split("-");

                        var key = $(keyval[0]);

                        if (key.length > 0) {
                            key.on(keyval[1], function () {
                                fn();
                            });
                        }
                    }
                }

            }

        }
        else if (e.data("init")) {

            //  Fill

            if(action == 'fill') {

                var data = options.data || {};
                var filltype = e.data("filltype");
                var mode = e.data("mode");

                Automtn.fill(e, data, filltype, mode);

                e.trigger('onfill');

            }
            else {

                //  Fetch
            
                var req = e.data("request");
                var fetch = e.data("fetch");
                var external = (String(e.data("external")) == "true");

                var beforefill = e.data("beforefill");
                var startload = e.data("loadstart");
                var finishload = e.data("loadfinish");
                var loaderror = e.data("loaderror");
                var loadsuccess = e.data("loadsuccess");
				var method = e.data("method");

                var data = {};

                if(req) {
                    req.abort();
                }

                try {

                    e.trigger('onloadstart', [e]);

					Automtn.call(this, startload, e);
                } catch(ex) {
                    
                }
                
                var ajaxOpts = {
		            type: method,
		            url: fetch,
		            data: data,
                    context: e,
                    success: function (result) {
                        try {
                            this.trigger('beforefill', [result]);
                            Automtn.call(this, beforefill, result);

                            this.automtn({ action: 'fill', data: result });

                            this.trigger('onloadsuccess', [this]);
                            Automtn.call(this, loadsuccess);
                        }
                        catch (ex) {
                            this.trigger('onloaderror', [this]);
                            Automtn.call(this, loaderror, ex);
                        }
                        finally {

                            Automtn.call(this, finishload);
                            this.trigger('onloadfinish', [this, true, result]);
                        }
		            },
		            error: function (xhr, algo, thrownError) {
		                var error = [algo, thrownError, xhr];

                        this.trigger('onloaderror', [this]);
                        this.trigger('onloadfinish', [this, false, error]);
						
		                Automtn.call(this, loaderror, { error: algo, result: error });
						Automtn.call(this, finishload);
		            },
		            async: true
		        };
                
                if(external) {
                    ajaxOpts.dataType = 'jsonp';
                    //ajaxOpts.crossDomain = true;
                }
                else {
                    ajaxOpts.dataType = 'json';
                    ajaxOpts.contentType = 'application/json; charset=utf-8';
                }
                
                var req = $.ajax(ajaxOpts);

                e.data("request", req);
            }

        }

        return e;
    };
	
	
	//
	//	Auto-initializer.
	//

	$(document).ready(function () {
		$("[data-fetch]").each(function () {
			var e = $(this);       

			e.automtn({ action: 'init' });
		});
	});

})(jQuery || $);

//
//	Helper
//

var Automtn = {

    id: 1,
    
    defaults: {
        
        action: "init",
        fetch: "",
        fill: "self",
        filltype: "",
        events: "document-ready",
        method: "POST",
        mode: "overwrite",
        external: false,
		onlyvalue: false,
        parsechild: "auto",
        parsemode: "none",
        tpl: "{value}",
        key: null,
        value: null,
        
        beforefill: null,
        loadstart: null,
        loadfinish: null,
        loaderror: null,
        loadsuccess: null,
        subscript: null
    },
	
	mode: {
		Overwrite: "overwrite",
		Append: "append"
	},
	
	parsers: {
		None: "none",
		KvAsValues: "kv-as-values",
		KvAsArray: "kv-as-array"
	},
    
    /**
     *  Gets/sets an option value.
     */
    get: function(e, key, val) {
        if(typeof val == 'undefined')
            return e.data(key);
        else
            return e.data(key, val);
    },

	toDict: function (data, key, val) {
	    var result = {};

	    for (var i = 0; i < data.length; i++) {
	        var cur = data[i];

	        if (typeof cur === 'object') {
	            result[key ? cur[key] : i] = val ? cur[val] : cur;

	        }
	        else {
	            result[i] = cur;
	        }
	    }

	    return result;
	},
	
	each: function (e, data, fn) {

	    var key = Automtn.get(e, "key");
	    var val = Automtn.get(e, "value");
	    var parsemode = Automtn.get(e, "parsemode");

	    var resul;

	    //  If not ignore dicts

	    if (String(Automtn.get(e, 'onlyvalue')).toLowerCase() == "false") {

            //  Converts "Array Data" to "Dictionary Data"
	        if ($.isArray(data)) {

	            data = Automtn.toDict(data, key, val);

	        }

	        resul = data;
	    }
	    else {
	        //  If ignore dicts

		    if ($.isArray(data)) {

		        resul = Automtn.toDict(data, key, val);

		    }
		    else {
		        resul = {};

		        $.each(data, function (key, value) {
		            if (typeof value === 'string' || typeof value === 'number') {
		                resul[key] = value;
		            }
		        });

		    }
			
	    }

	    if (parsemode == "kv-as-values") {
	        var i = 0;
	        var nresul = {};

	        $.each(resul, function (key, value) {
	            nresul[i++] = key;
	            nresul[i++] = value;
	        });

	        resul = nresul;
	    }
	    else if (parsemode == "kv-as-array") {
	        var i = 0;
	        var nresul = {};

	        $.each(resul, function (key, value) {
	            nresul[i++] = [key, value];
	        });

	        resul = nresul;
	    }

	    $.each(resul, fn);
	},

    fill: function (e, data, method, mode) {
        var fillData;
        var mode = mode || Automtn.mode.Overwrite;

        if (typeof data == 'string') {
            fillData = {
                "?": data
            };
        }
        else {
            fillData = data;
        }

        var parseChild = Automtn.get(e, "parsechild").toLowerCase();
		
        if ((parseChild == "auto" && fillData.length == 1) || parseChild == "yes") {
			fillData = fillData[fillData.getKey()];
		}
        
        var fillMethod = 
            Automtn._fill[method] || 
            Automtn._fill["div"]

        fillMethod(e, fillData, mode);
    },
	
	call: function (e, _fn, args) {
		var fn;
		
		if(typeof _fn === 'string') {
		
			if(_fn == '') {
				return null;
			}

			if (_fn.indexOf("function") === 0) {
			    fn = eval(_fn);
			}
            else if(typeof args === 'undefined') 
				fn = new Function(_fn);
			else
				fn = new Function("args", _fn);
		}
		else if(typeof _fn === 'function'){
			fn = _fn;
		}
		else {
			return null;
		}
		
		if(fn) {
			return fn.call(e, args);
		}
		else {
			return null;
		}
	},

    _val: function (e, key, value, _tpl) {
        var tpl = _tpl || Automtn.get(e, "tpl");
        return tpl.replaceAll("{key}", key).replaceAll("{value}", value);
    },

    _fill: {
	
		/**
		 *	List.
		 */
		ol: function(e, data, mode) { return Automtn._fill.ul(e, data, mode); },
		ul: function(e, data, mode) {
			
			if(mode == Automtn.mode.Overwrite) {
				e.html("");
			}

            var tpl = Automtn.get(e, "tpl");
            if (tpl == "{value}") {
                tpl = "<li>{value}</li>";
                Automtn.get(e, "tpl", tpl);
            }

            Automtn.each(e, data, function (key, value) {

                var v = Automtn._val(e, key, value, tpl);
                e.appendStr(v);
                
            });
		},

        /**
         *  Select.
         */
		select: function(e, data, mode) {


		    if (mode == Automtn.mode.Overwrite) {
		        e.html("");
		    }

		    var tpl = Automtn.get(e, "tpl");
		    if (tpl == "{value}") {
		        tpl = "<option value='{key}'>{value}</li>";
		        Automtn.get(e, "tpl", tpl);
		    }

		    Automtn.each(e, data, function (key, value) {

		        var v = Automtn._val(e, key, value, tpl);
		        e.appendStr(v);

		    });
		},
	
		/** 
		 *	Table with and without tbody.
		 */
        table: function (e, data, mode) {
        
            //  Find tbody if exists
        
            var tbody = e.children("tbody");

            //  Parent: tbody if exists. Otherwise will be the table.
            
            var parent = tbody.length > 0 ? tbody : e;
			
            //  Clean parent in overwrite mode
            
			if(mode == Automtn.mode.Overwrite) {
				parent.html("");
			}
            
            //  Template for items

            var tpl = Automtn.get(e, "tpl");
            if (tpl == "{value}") {
                tpl = "<td>{value}</td>";
                Automtn.get(e, "tpl", tpl);
            }
            
            //  Special: template for rows

            var tplRow = Automtn.get(e, "tpl-tr");
            if (typeof tplRow === 'undefined') {
                tplRow = "<tr data-key='{key}'>{value}</td>";
                Automtn.get(e, "tpl-tr", tplRow);
            }
            
            //  Adds items

            Automtn.each(e, data, function (key, value) {

                var tmp = $("<tr>");    //  Temp row

                var array;

                if ($.isArray(value))
                    array = value;
                else
                    array = [value];

                if (String(Automtn.get(e, "showkey")) == "1" ||
                    String(Automtn.get(e, "showkey")) == "true") {

                    $("<td>")
                        .attr("data-key", key)
                        .html(key)
                        .appendTo(tmp);

                }

                for (var i = 0; i < array.length; i++) {

                    var v = Automtn._val(e, key, array[i]);
                    tmp.appendStr(v);

                }

                //  Adds temp content to a new row (based on template tplRow), and appends to parent.
                $(Automtn._val(e, key, tmp.html(), tplRow))
                    .appendTo(parent);

                //  Clean
                tmp.remove();
            });
        },

		/** 
		 *	Div or another.
		 */	
        div: function (e, data, mode) {

            if (typeof data == 'string') {
                data = {
                    "?": data
                };
            }
			
			if(mode == Automtn.mode.Overwrite) {
				e.html("");
			}

            Automtn.each(e, data, function (key, value) {

                var v = Automtn._val(e, key, value);
                e.appendStr(v);

            });
        }
    }
};
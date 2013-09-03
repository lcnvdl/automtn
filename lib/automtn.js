/**
 * Automtn.js
 *
<<<<<<< HEAD
 * @date        2013-08-30
=======
 * @date        2013-09-03
>>>>>>> Update
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
	Array.prototype.getKey = function() {
	  for (var prop in this)
		if (this.propertyIsEnumerable(prop))
		  return prop;
	}
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
	 *	@param {String}     [options.mode=Automtn.mode.Overwrite] Action when inserts data into element.
	 *	@param {String}	    [options.method="POST"] Ajax method. Values: `POST`, `GET`.
	 *	@param {Boolean}    [options.external=false] If you have cross-domain problems. 
	 *	@param {String}     [options.fill="self"] Element selector to fill with data. Use `self` or `#elementId`.
	 *	@param {String}     [options.events] Events to start data fetching. Values: `document-ready` or `#elementId-eventName`. Example: `options.events="#myModal-show"; // Bootstrap modal`.
	 *	@param {String}     [options.subscript] Handler executed to subscript the element in a custom event. 
	 *	@param {String}	    [options.filltype] Sets the filltype (if you don't want the fill from the container element). Values: `div`, `table`, `ul`, etc.
	 *	@param {String}	    [options.tpl="{value}"] Template. You can use inside: `{key}`, `{value}`. Example: `options.tpl="<span id='span-{key}'>{value}</span>"`.
	 *	@param {String}	    [options.loadstart] Event.
	 *	@param {String}	    [options.loadsuccess] Event.
	 *	@param {String}	    [options.loaderror] Event.
	 *	@param {String}	    [options.loadfinish] Event.
	 *	@chained
	 */
    $.fn.automtn = function (options) {
        var e = $(this);

        options = options || {};

        var action = String(options.action || 'init').toLowerCase();

        var _id = e.attr("id");

        if (typeof _id === 'undefined' || _id == "") {
            _id = "auto-" + (Automtn.id++);
            e.attr("id", _id);
        }

        //  Init

        if (action == 'init') {
            e.data("init", true);

            var gen = function (name, _default) {
                var value = options[name] || e.data(name);

                if (typeof value === 'undefined') {
                    e.attr("data-" + name, _default || "");
                    return _default;
                }
                else {
                    return value;
                }
            };

            var url = gen("fetch");
            var onlyvalue = gen("onlyvalue", Automtn.defaults.onlyvalue ? "true" : "false");
            var fill = gen("fill", "self");
            var events = gen("events", "");
            var method = gen("method", Automtn.defaults.method);
            var template = gen("tpl", "{value}");
            var subscript = gen("subscript");
            var filltype = gen("filltype", "");
            var external = gen("external", Automtn.defaults.external ? "true" : "false");
            var mode = gen("mode", Automtn.mode.Overwrite);
			
            var startload = gen("loadstart");
            var finishload = gen("loadfinish");
            var loaderror = gen("loaderror");
            var loadsuccess = gen("loadsuccess");

            if (typeof events !== 'undefined' && events != "") {

                var array = events.split(",");
                var fn = function() {e.automtn({ action: 'fetch' }) };

                for (var i = 0; i < array.length; i++) {

                    var val = array[i].trim();

                    if(val == "document-ready") {
                        $(document).ready(function() {
                            fn();
                        });
                    }
                    else {
                        var keyval = val.split("-");

                        var key = $(keyval[0]);

                        if(key.length > 0) {
                           key.on(keyval[1], function() {
                                fn();
                            });
                        }
                    }
                }

            }

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

        }
        else if (e.data("init")) {

            //  Fill

            if(action == 'fill') {

                var data = options.data || {};
                var filltype = e.data("filltype");
                var mode = e.data("mode");

                Automtn.fill(e, data, filltype, mode);

                e.attr("data-filled", "true");

                e.trigger('onfill');

            }
            else {

                //  Fetch
            
                var req = e.data("request");
                var fetch = e.data("fetch");
                var external = (String(e.data("external")) == "true");

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
                        this.automtn({ action: 'fill', data: result });

		                try {
                            this.trigger('onloadsuccess', [this]);
							Automtn.call(this, loadsuccess);
		                }
		                catch (ex) {
                            this.trigger('onloaderror', [this]);
							Automtn.call(this, loaderror, ex);
		                }

						Automtn.call(this, finishload);

                        this.trigger('onloadfinish', [this, true, result]);
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
                    ajaxOpts.crossDomain = true;
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
        method: "POST",
        external: false,
		onlyvalue: false
    },
	
	mode: {
		Overwrite: "overwrite",
		Append: "append"
	},
	
	each: function(e, data, fn) {
		if(String(e.data('onlyvalue')).toLowerCase() == "false") {
			$.each(data, fn);
		}
		else {
			var resul = {};
		
			$.each(data, function (key, value) {
				if(typeof value === 'string' || typeof value === 'number') {
					resul[key] = value;
				}
			});
			
			$.each(resul, fn);
		}
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
		
		if(fillData.length == 1) {
			fillData = fillData[fillData.getKey()];
		}
        
        var fillMethod = 
            Automtn._fill[method] || 
            Automtn._fill["fill"]

        fillMethod(e, fillData, mode);
    },
	
	call: function (e, _fn, args) {
		var fn;
		
		if(typeof _fn === 'string') {
		
			if(_fn == '') {
				return null;
			}
				
			if(typeof args === 'undefined') 
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
        var tpl = _tpl || e.data("tpl");
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

            var tpl = e.data("tpl");
            if (tpl == "{value}") {
                tpl = "<li>{value}</li>";
                e.data("tpl", tpl);
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

            var tpl = e.data("tpl");
            if (tpl == "{value}") {
                tpl = "<td>{value}</td>";
                e.data("tpl", tpl);
            }
            
            //  Special: template for rows

            var tplRow = e.data("tpl-tr");
            if (typeof tplRow === 'undefined') {
                tplRow = "<tr data-key='{key}'>{value}</td>";
                e.data("tpl-tr", tplRow);
            }
            
            //  Adds items

            Automtn.each(e, data, function (key, value) {

                var tmp = $("<tr>");    //  Temp row

                var array;

                if ($.isArray(value))
                    array = value;
                else
                    array = [value];

                if (e.data("data-showkey") == "1" ||
                    e.data("data-showkey") == "true" ||
                    e.data("data-showkey") === true) {

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
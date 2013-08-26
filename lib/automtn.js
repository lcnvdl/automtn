/**!
 * Automtn v0.1
 * https://github.com/lcnvdl/automtn
 * Copyright(c) 2013 Luciano Rasente
 * MIT Licensed
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
//	Helper
//

var Automtn = {

    id: 1,

    fill: function (e, data, method) {
        var fillData;

        if (typeof data == 'string') {
            fillData = {
                "?": data
            };
        }
        else {
            fillData = data;
        }
		
		/*$.each(fillData, function(k, v) {
			console.log([k,v]);
		});*/
		if(fillData.length == 1) {
			fillData = fillData[fillData.getKey()];
		}

        method = method || "div";

        Automtn._fill[method](e, fillData);
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
        table: function (e, data) {
            var tbody = e.html().toLowerCase().indexOf("tbody") !== -1;

            var parent = tbody ? e.find("tbody") : e;

            var tpl = e.data("tpl");
            if (tpl == "{value}") {
                tpl = "<td>{value}</td>";
                e.data("tpl", tpl);
            }

            var tplRow = e.data("tpl-tr");
            if (typeof tplRow === 'undefined') {
                tplRow = "<tr data-key='{key}'>{value}</td>";
                e.data("tpl-tr", tplRow);
            }

            $.each(data, function (key, value) {

                var tmp = $("<tr>");

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


                $(Automtn._val(e, key, tmp.html(), tplRow))
                    .appendTo(e);

                tmp.remove();
            });
        },

        div: function (e, data) {

            if (typeof data == 'string') {
                data = {
                    "?": data
                };
            }

            $.each(data, function (key, value) {

                var v = Automtn._val(e, key, value);
                e.appendStr(v);

            });
        }
    }
};

//
//	jQuery Plugin
//

(function ($) {

    $.fn.appendStr = function(text) {
        var e = $(this);
        e.html(e.html()+text);
        return e;        
    },

	/**
	 *	Automates an element.
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
            var fill = gen("fill", "self");
            var events = gen("events", "");
            var method = gen("method", "POST");
            var template = gen("tpl", "{value}");
            var subscript = gen("subscript");
            var startload = gen("loadstart");
            var finishload = gen("loadfinish");
            var loaderror = gen("loaderror");
            var loadsuccess = gen("loadsuccess");
            var filltype = gen("filltype", "");

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

                Automtn.fill(e, data, filltype);

                e.attr("data-filled", "true");

                e.trigger('onfill');

            }
            else {

                //  Fetch
            
                var req = e.data("request");
                var fetch = e.data("fetch");

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
                
                var req = $.ajax(
		        {
		            type: method,
		            url: fetch,
		            data: data,
		            //dataType: 'json',
					crossDomain: true,
					dataType: 'jsonp',
		            //contentType: 'application/json; charset=utf-8',
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
		        });

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
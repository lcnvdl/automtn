#Automtn

Automtn is a jQuery plugin for get data (using ajax) and insert data into DOM elements "automatically".

## Features

- Requests ajax data based on events.
- Puts loaded data into a specified DOM element in a smartly and automatically way.
- You can work without touch javascript code.

## Quick Start

### Installation
Include automtn.js

```
<script src="js/automtn.js"></script>
```

### Usage

We have two options:

HTML:

```
//  In this example, we loads a json file into a table when document is ready.

<table 
    data-events="document-ready"
    data-fetch="http://api.openweathermap.org/data/2.5/weather?q=Buenos+Aires,ar"
    >
</table>
```

Or JS:

```
//  In this example, we loads a json file into a table when document is ready.

<script>

    $("#tableData").automtn({
        events: "document-ready",
        fetch: "http://api.openweathermap.org/data/2.5/weather?q=Buenos+Aires,ar"
    });
    
</script>

<table id="tableData">
</table>
```

### Options

<table>
    <thead>
        <th>Option</th>
        <th>Default</th>
        <th>Values</th>
        <th>Description</th>
    </thead>
    
    <tbody>
    
        <tr>
            <td>Fetch</code></td>
            <td><code>Required</code></td>
            <td><code>Url</code></td>
            <td>Url to get json data. It can't be null.</td>
        </tr>
    
        <tr>
            <td>action <code>(only Javascript)</code></td>
            <td><code>init</code></td>
            <td>
                <table>
                    <tr><td><code>Init</code></td>   <td>Inits an element.</td>                  </tr>
                    <tr><td><code>Fetch</code></td>  <td>Requests data from element.</td>        </tr>
                    <tr><td><code>Fill</code></td>   <td>Fills element with requested data.</td> </tr>
                </table>
            </td>
            <td>Action to execute.</td>
        </tr>
        
        <tr>
            <td>external</code></td>
            <td><code>false</code></td>
            <td><code>true</code> or <code>false</code></td>
            <td>Changes the ajax request mode. Use if you have cross-domain problems.</td>
        </tr>
        
        <tr>
            <td>events</code></td>
            <td><code>empty</code></td>
            <td>
                <i>Comma-separated values.</i></br>
                <code>document-ready</code> or <code>#elementId-eventName</code>
            </td>
            <td>
                Events to start data fetching.</br>
                Example: <code>options.events="#myModal-show"; // Bootstrap modal</code>
            </td>
        </tr>
        
        <tr>
            <td>fill</code></td>
            <td><code>self</code></td>
            <td><code>self</code> or <code>#elementId</code></td>
            <td>Element selector for find the elements to fill with data.</td>
        </tr>
        
        <tr>
            <td>filltype</code></td>
            <td><code>empty (automatic)</code></td>
            <td><code>div</code>, <code>table</code>, <code>ul</code>, etc.</td>
            <td>Sets the filltype manually.</td>
        </tr>
        
        <tr>
            <td>method</code></td>
            <td><code>post</code></td>
            <td><code>post</code> or <code>get</code></td>
            <td>Ajax method.</td>
        </tr>
        
        <tr>
            <td>mode</code></td>
            <td><code>overwrite</code></td>
            <td><code>overwrite</code> or <code>append</code></td>
            <td>Action when inserts data into element.</td>
        </tr>
        
        <tr>
            <td>subscript</code></td>
            <td><code>empty</code></td>
            <td><code>Javascript code (String type).</code></td>
            <td>Handler executed to subscript the element in a custom event.</td>
        </tr>
        
        <tr>
            <td>tpl</code></td>
            <td><code>{value}</code></td>
            <td><code>String</code></td>
            <td>
                Template. You can use inside: <code>{key}</code>, <code>{value}</code>. <br/>
                Example: <code>options.tpl="<span id='span-{key}'>{value}</span>"</code>
            </td>
        </tr>
        
        <tr>
            <td>loadstart</code></td>
            <td><code></code></td>
            <td><code></code></td>
            <td></td>
        </tr>
        
        <tr>
            <td>loadsuccess</code></td>
            <td><code></code></td>
            <td><code></code></td>
            <td></td>
        </tr>
        
        <tr>
            <td>loaderror</code></td>
            <td><code></code></td>
            <td><code></code></td>
            <td></td>
        </tr>
        
        <tr>
            <td>loadfinish</code></td>
            <td><code></code></td>
            <td><code></code></td>
            <td></td>
        </tr>
        
    </tbody>
</table>

## Limitations

This works perfectly:

```

{
    "keyOne": "abc",
    "keyTwo": "jkl",
    ...
}

or

{
    "keyOne": ["abc", "def", "ghi"],
    "keyTwo": ["jkl", "mno", "pqr"],
    ...
}

```

But we have problems with:

```

{
    "keyOne": {
        "subKey": ["abc", "def"]
    }
}

or

{
    "keyOne": {
        "subKey": {
            "abc", "def"
        }
    }
}

or much more...

```

This is because Automtn don't works with data recursively (for now).

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

© 2013 Lcnvdl.

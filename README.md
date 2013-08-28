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

## Doc

See [API](https://github.com/lcnvdl/automtn/blob/master/doc/api/index.html).

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

© 2013 Lcnvdl.

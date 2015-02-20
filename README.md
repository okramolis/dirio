# dirio
`dirio` is a node.js module which transforms directory structure to json file and json file to directory structure. It provides simple interface with destination and source arguments. Working with javascript objects instead of json files is also supported.

Install
-------
    $ npm install dirio

Run tests
---------
Go to the root directory of the `dirio` module, make sure dependencies are installed and run the tests.

    $ cd node_modules/dirio
    $ npm install
    $ npm test

Public interface
----------------

### convert([destination,] source, callback)

Transforms `source` to `destination`. At first it detects what the `source` is. Then it performs appropriate action like reading directory structure and storing it to a json file.

__Arguments__
* `source` - May be a path to a directory or path to a json file or javascript object.

* `destination` - A path where the result of the operation should be stored. If not provided, the result will be passed to the `callback` as a javascript object.

* `callback(err[, result])` - The `result` is not passed to the `callback` if the `destination` argument is provided.

Symbolic links are transparent for this method as it uses `fs.stat` internally. See `lconvert` if you need to work with the symbolic links directly.

### lconvert([destination,] source, callback)

This method uses `fs.lstat` internally to work with symbolic links directly. Otherwise it provides the same interface and functionality as the `convert` method.

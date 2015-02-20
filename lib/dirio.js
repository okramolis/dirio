var fs      = require('fs')
  , path    = require('path')
  , assert  = require('assert')
  , stream  = require('stream')
  , async   = require('async')
;

const TYPE_UNKNOWN  = -1
  ,   TYPE_FILE     = 1
  ,   TYPE_FOLDER   = 2
  ,   TYPE_ALIAS    = 3
;

module.exports = {
  TYPE_UNKNOWN  : TYPE_UNKNOWN,
  TYPE_FILE     : TYPE_FILE,
  TYPE_FOLDER   : TYPE_FOLDER,
  TYPE_ALIAS    : TYPE_ALIAS,
  convert       : convert,
  lconvert      : lconvert
};

/**
 * Writes fs structure according to provided source object.
 * @param {String} dest - Path to destination location on file system.
 * @param {Object} source - Description of the structure to be created.
 * @param {Function} callback - Callback that expects only a possible
 *        error.
 */
function _write(dest, source, callback) {
  var itemPath = path.join(dest, source.name);
  // switch according to type of the current root item
  switch(source.type) {
    case TYPE_FILE:
      if (source.data instanceof stream.Readable) {
        // stream data => pipe it to destination stream
        source.data.pipe(fs.createWriteStream(itemPath));
        source.data.on('end', callback);
        return;
      }
      // write data to the file as a string or a buffer
      return fs.writeFile(
        itemPath,
        (typeof source.data === 'undefined' || source.data === null) ? '' : source.data,
        callback
      );
    case TYPE_FOLDER:
      return fs.mkdir(itemPath, _folderWritten.bind(null, itemPath, source, callback));
    case TYPE_ALIAS:
      return fs.symlink(source.orig, itemPath, callback);
    default:
      // ignore unknown type
      return callback();
  }
}

/**
 * Ensures each child of source object may write its data.
 * @param {String} dest - Path of current directory from the child's
 *        point of view.
 * @param {Object} source - Description of the current structure to
 *        be created.
 * @param {Function} callback - Callback that expects only a possible
 *        error.
 * @param {*} err - Possible error passed by caller.
 */
function _folderWritten(dest, source, callback, err) {
  if (err) return callback(err);
  async.each(source.children, _write.bind(null, dest), callback);
}

/**
 * Reads path and builds json-comaptible object representing content
 * of the path.
 * @param {Function} stat - Function of fs module fs.stat or fs.lstat.
 * @param {String} source - Path to source location on file system.
 * @param {Function} callback - Callback that expects a possible error
 *        and the result.
 */
function _read(stat, source, callback) {
  stat(source, _pathStated.bind(null, {}, stat, source, callback));
}

/**
 * Investigates stats of a path and continues according to stats type.
 * Supported types are file, directory, symbolic link.
 * @param {Object} item - Object that is supposed to be updated with
 *        discovered data.
 * @param {Function} stat - Function of fs module fs.stat or fs.lstat.
 * @param {String} stated - The investigated path on file system.
 * @param {Function} callback - Callback that expects a possible error
 *        and the result.
 * @param {*} err - Possible error passed by caller.
 * @param {fs.Stats} stats - Metadata of the path.
 */
function _pathStated(item, stat, stated, callback, err, stats) {
  if (err) return callback(err);

  item.name = path.basename(stated);

  if (stats.isFile()) {
    item.type = TYPE_FILE;
    // TODO set encoding according to the read file content or user preferences
    return fs.readFile(stated, {encoding: 'utf8'}, _fileRead.bind(null, item, callback));
  }
  if (stats.isDirectory()) {
    item.type = TYPE_FOLDER;
    return fs.readdir(stated, _folderRead.bind(null, item, stat, stated, callback));
  }
  if (stats.isSymbolicLink()) {
    item.type = TYPE_ALIAS;
    return fs.readlink(stated, _aliasRead.bind(null, item, callback));
  }
  // not supported type
  item.type = TYPE_UNKNOWN;
  callback(null, item);
}

/**
 * Updates the item with content of the file.
 * @param {Object} item - Object representing investigated file.
 * @param {Function} callback - Callback that expects a possible
 *        error and the item.
 * @param {*} err - Possible error passed by caller.
 * @param {Buffer} file - Content of the file.
 */
function _fileRead(item, callback, err, data) {
  if (err) return callback(err);
  item.data = data;
  callback(null, item);
}

/**
 * Ensures each child of the read directory may provide its data.
 * @param {Object} item - Object that is supposed to be updated with
 *        discovered data.
 * @param {Function} stat - Function of fs module fs.stat or fs.lstat.
 * @param {String} dirpath - Path of the read directory on file system.
 * @param {Function} callback - Callback that expects a possible error
 *        and array of child data.
 * @param {*} err - Possible error passed by caller.
 * @param {String[]} files - List of file names contained in the
 *        directory.
 */
function _folderRead(item, stat, dirpath, callback, err, files) {
  if (err) return callback(err);
  async.map(
    files,
    _readChild.bind(null, stat, dirpath),
    _childrenRead.bind(null, item, callback)
  );
}

/**
 * Ensures the child of the parent directory may provide its data.
 * @param {Function} stat - Function of fs module fs.stat or fs.lstat.
 * @param {String} dirpath - Path of the parent directory on file system.
 * @param {String} name - File name of the child.
 * @param {Function} callback - Callback that expects a possible error
 *        and child data.
 */
function _readChild(stat, dirpath, name, callback) {
  _read(stat, path.join(dirpath, name), callback);
}

/**
 * Updates the item with its children.
 * @param {Object} item - Object representing investigated directory.
 * @param {Function} callback - Callback that expects a possible error
 *        and the item.
 * @param {*} err - Possible error passed by caller.
 * @param {Object[]} children - List of child items of the item.
 */
function _childrenRead(item, callback, err, children) {
  if (err) return callback(err);
  item.children = children;
  callback(null, item);
}

/**
 * Updates the item with path to its original file.
 * @param {Object} item - Object representing investigated symbolic link.
 * @param {Function} callback - Callback that expects a possible error
 *        and the item.
 * @param {*} err - Possible error passed by caller.
 * @param {String} orig - Content of the symbolic link.
 */
function _aliasRead(item, callback, err, orig) {
  if (err) return callback(err);
  item.orig = orig;
  callback(null, item);
}

/**
 * Stores json-compatible object on file system at provided path as
 * a json file.
 * @param {String} dest - File system path of the new file.
 * @param {Object} source - The object to be stored.
 * @param {Function} callback - Callback that expects only a possible error.
 */
function _store(dest, source, callback) {
  fs.writeFile(dest, JSON.stringify(source), callback);
}

/**
 * Reads json file and parses its data.
 * @param {String} source - File system path of the source json file.
 * @param {Function} callback - Callback that expects a possible error
 *        and the result.
 */
function _load(source, callback) {
  fs.readFile(source, {encoding: 'utf8'}, _jsonLoaded.bind(null, callback));
}

/**
 * Parses content of a json file.
 * @param {Function} callback - Callback that expects a possible error
 *        and the result.
 * @param {*} err - Possible error passed by caller.
 * @param {String} data - Content of the file.
 */
function _jsonLoaded(callback, err, data) {
  if (err) return callback(err);
  var parsed;
  try {
    parsed = JSON.parse(data);
  } catch(jerr) {
    return callback(jerr);
  }
  callback(null, parsed);
}

/**
 * Loads json source file and creates fs structure according to the
 * loaded data.
 * This is high level utility. It pipes result of _load to _write.
 * @param {String} dest - Path to destination location on file system.
 * @param {String} source - File system path of the source json file.
 * @param {Function} callback - Callback that expects only a possible
 *        error.
 */
function _load2write(dest, source, callback) {
  _load(source, _pipe.bind(null, _write.bind(null, dest), callback));
}

/**
 * Analyzes fs structure and stores the data in json file.
 * This is high level utility. It pipes result of _read to _store.
 * @param {Function} stat - Function of fs module fs.stat or fs.lstat.
 * @param {String} dest - File system path of the new file.
 * @param {String} source - Path to source location on file system.
 * @param {Function} callback - Callback that expects only a possible
 *        error.
 */
function _read2store(stat, dest, source, callback) {
  _read(stat, source, _pipe.bind(null, _store.bind(null, dest), callback));
}

/**
 * Used to pipe input operation to output operation.
 * @param {Function} out - Output operation.
 * @param {Function} callback - Callback that expects only
 *        a possible error.
 * @param {*} err - Possible error passed by caller.
 * @param {Object} iresult - Result of the input operation.
 */
function _pipe(out, callback, err, iresult) {
  if (err) return callback(err);
  out(iresult, callback);
}

/**
 * Determines whether provided argument has format of path to a json
 * file or not.
 * @param {String} fspath - Investigated file system path or file name.
 * @returns {Boolean} True for json, false otherwise.
 */
function _isJsonPath(fspath) {
  return path.extname(fspath) === '.json';
}

/**
 * Asserts user input and calls appropriate lower level function to
 * complete the desired task.
 * @param {Function} stat - Function of fs module fs.stat or fs.lstat.
 * @param {String} [dest] - Path to destination location on file system.
 * @param {String | Object} source - Path to source location on file system
 *        or object directly provided by user.
 * @param {Function} callback - Callback that expects a possible error
 *        and possible result.
 */
function _handleConvert(stat, dest, source, callback) {
  // "dest" arg is optional
  if (typeof source === 'function') {
    callback = source;
    source = dest;
    dest = null;
  }

  // assert input params
  assert.ok(
    dest === null || typeof dest === 'string',
    'Invalid type of argument "dest", expected "null" or "string", ' +
    'but is "' + (typeof dest) + '"'
  );
  assert.equal(
    typeof(callback),
    'function',
    'Invalid type of argument "callback", expected "function", ' +
    'but is "' + (typeof callback) + '"'
  );

  // perform an action according to "source" and "dest"
  switch(typeof source) {
    case 'string':
      // source is a path
      if (_isJsonPath(source)) {
        // source is meant to be a json file
        if (typeof dest === 'string') {
          // destination is meant to be a directory
          return _load2write(dest, source, callback);
        }
        // destination is meant to be a local object
        return _load(source, callback);
      }
      // source is meant to be a directory
      if (typeof dest === 'string') {
        // destination is meant to be a json file
        return _read2store(stat, dest, source, callback);
      }
      // destination is meant to be a local object
      return _read(stat, source, callback);
    case 'object':
      // source is an object
      if (_isJsonPath(dest)) {
        // destination is meant to be a json file
        return _store(dest, source, callback);
      }
      // destination is meant to be a directory
      return _write(dest, source, callback);
    default:
      // invalid source
      assert.ok(
        false,
        'Invalid type of argument "source", expected "string" or "object", ' +
        'but is "' + (typeof source) + '"'
      );
  }
}

/**
 * This is a public interface method. It adds fs.stat (it does not recognize
 * symbolic links) handler to arguments provided by caller and calls main
 * logic handler.
 * @param {String} [dest] - Path to destination location on file system.
 * @param {String | Object} source - Path to source location on file system
 *        or object directly provided by user.
 * @param {Function} callback - Callback that expects a possible error and
 *        possible result.
 */
function convert() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(fs.stat);
  _handleConvert.apply(null, args);
}

/**
 * This is a public interface method. It adds fs.lstat (it does recognize
 * symbolic links) handler to arguments provided by caller and calls main
 * logic handler.
 * @param {String} [dest] - Path to destination location on file system.
 * @param {String | Object} source - Path to source location on file system
 *        or object directly provided by user.
 * @param {Function} callback - Callback that expects a possible error and
 *        possible result.
 */
function lconvert() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(fs.lstat);
  _handleConvert.apply(null, args);
}

var path    = require('path')
  , fs      = require('fs-extra')
  , chai    = require('chai')
  , dirio   = require('../')
;

const DIR1_NAME       = '1'
  ,   DIR2_NAME       = '2'
  ,   JSON1_NAME      = '1.json'
  ,   JSON2_NAME      = '2.json'
  ,   TEST_PATH       = path.resolve(__dirname, '..', 'test', 'dummies')
  ,   DIR1_PATH       = path.join(TEST_PATH, 'dir', DIR1_NAME)
  ,   DIR2_PATH       = path.join(TEST_PATH, 'dir', DIR2_NAME)
  ,   JSON1_PATH      = path.join(TEST_PATH, 'json', JSON1_NAME)
  ,   JSON2_PATH      = path.join(TEST_PATH, 'json', JSON2_NAME)
  ,   DIR1_FILE       = 'file'
  ,   DIR1_CONTENT    = ''
  ,   DIR1_FOLDER     = 'dir'
  ,   DIR1_ALIAS      = 'alias'
  ,   DIR1_ORIG_A     = DIR1_FOLDER
  ,   DIR1_ORIG_B     = path.join('..', DIR1_FILE)
  ,   DIR2_L0         = 'level0'
  ,   DIR2_L1         = 'level1'
  ,   DIR2_L2         = 'level2'
  ,   DIR2_L3         = 'level3'
  ,   DIR2_FILE       = 'deep_file'
  ,   DIR2_CONTENT    = 'deep content ...'
  ,   DIR2_FOLDER     = 'folder'
  ,   DIR2_ALIAS      = 'linked_level1'
  ,   DIR2_ORIG_A     = path.join('..', DIR2_L0, DIR2_L1)
  ,   DIR2_ORIG_B     = path.join('..', DIR2_L0, DIR2_L1, DIR2_L2)
;

// ensure the first dummy directory with its content
fs.removeSync(DIR1_PATH);
fs.outputFileSync(path.join(DIR1_PATH, DIR1_FILE), DIR1_CONTENT);
fs.mkdirSync(path.join(DIR1_PATH, DIR1_FOLDER));
fs.symlinkSync(DIR1_ORIG_A, path.join(DIR1_PATH, DIR1_ALIAS));

// ensure the first json file
fs.outputJsonSync(JSON1_PATH, {
  name: DIR1_NAME,
  type: dirio.TYPE_FOLDER,
  children: [{
    name: DIR1_FILE,
    type: dirio.TYPE_FILE,
    data: DIR1_CONTENT
  },{
    name: DIR1_FOLDER,
    type: dirio.TYPE_FOLDER,
    children: [{
      name: DIR1_ALIAS,
      type: dirio.TYPE_ALIAS,
      orig: DIR1_ORIG_B
    }]
  }]
});

// ensure the second dummy directory with its content
fs.removeSync(DIR2_PATH);
fs.outputFileSync(path.join(DIR2_PATH, DIR2_L0, DIR2_L1, DIR2_L2, DIR2_L3, DIR2_FILE), DIR2_CONTENT);
fs.mkdirSync(path.join(DIR2_PATH, DIR2_FOLDER));
fs.symlinkSync(DIR2_ORIG_A, path.join(DIR2_PATH, DIR2_FOLDER, DIR2_ALIAS));

// ensure the second json file
fs.outputJsonSync(JSON2_PATH, {
  name: DIR2_NAME,
  type: dirio.TYPE_FOLDER,
  children: [{
    name: DIR2_L0,
    type: dirio.TYPE_FOLDER,
    children: [{
      name: DIR2_L1,
      type: dirio.TYPE_FOLDER,
      children: [{
        name: DIR2_L2,
        type: dirio.TYPE_FOLDER,
        children: [{
          name: DIR2_L3,
          type: dirio.TYPE_FOLDER,
          children: [{
            name: DIR2_FILE,
            type: dirio.TYPE_FILE,
            data: DIR2_CONTENT
          }]
        }]
      }]
    }]
  },{
    name: DIR2_FOLDER,
    type: dirio.TYPE_FOLDER,
    children: [{
      name: DIR2_ALIAS,
      type: dirio.TYPE_ALIAS,
      orig: DIR2_ORIG_B
    }]
  }]
});

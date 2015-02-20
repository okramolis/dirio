var assert  = require('chai').assert
  , expect  = require('chai').expect
  , os      = require('os')
  , fs      = require('fs-extra')
  , path    = require('path')
  , dirio   = require('../')
;

const DIR1_NAME     = '1'
  ,   DIR2_NAME     = '2'
  ,   JSON_EXTNAME  = '.json'
  ,   JSON1_NAME    = '1' + JSON_EXTNAME
  ,   JSON2_NAME    = '2' + JSON_EXTNAME
  ,   TEST_PATH     = path.resolve(__dirname, 'dummies')
  ,   DIR1_PATH     = path.join(TEST_PATH, 'dir', DIR1_NAME)
  ,   DIR2_PATH     = path.join(TEST_PATH, 'dir', DIR2_NAME)
  ,   JSON1_PATH    = path.join(TEST_PATH, 'json', JSON1_NAME)
  ,   JSON2_PATH    = path.join(TEST_PATH, 'json', JSON2_NAME)
  ,   DIR1_FILE     = 'file'
  ,   DIR1_CONTENT  = ''
  ,   DIR1_FOLDER   = 'dir'
  ,   DIR1_ALIAS    = 'alias'
  ,   DIR1_ORIG_A   = DIR1_FOLDER
  ,   DIR1_ORIG_B   = path.join('..', DIR1_FILE)
  ,   DIR2_L0       = 'level0'
  ,   DIR2_L1       = 'level1'
  ,   DIR2_L2       = 'level2'
  ,   DIR2_L3       = 'level3'
  ,   DIR2_FILE     = 'deep_file'
  ,   DIR2_CONTENT  = 'deep content ...'
  ,   DIR2_FOLDER   = 'folder'
  ,   DIR2_ALIAS    = 'linked_level1'
  ,   DIR2_ORIG_A   = path.join('..', DIR2_L0, DIR2_L1)
  ,   DIR2_ORIG_B   = path.join('..', DIR2_L0, DIR2_L1, DIR2_L2)
  ,   TMP_DIR       = path.join(os.tmpdir(), getRandStr())
;


before(function() {
  console.log('  Creating temporary directory %s\n', TMP_DIR);
  fs.mkdirSync(TMP_DIR);
});

after(function() {
  console.log('  Cleaning up ...\n');
  fs.removeSync(TMP_DIR);
});

describe('dirio', function() {

  describe('.TYPE_UNKNOWN', function() {

    it('should be defined', function() {
      assert.isDefined(dirio.TYPE_UNKNOWN, 'missing definition of "unknown type" constant');
    });

    it('should be unique', function() {
      assert.notEqual(dirio.TYPE_UNKNOWN, dirio.TYPE_FILE, '"unknown type" must not be equal to "file type"');
      assert.notEqual(dirio.TYPE_UNKNOWN, dirio.TYPE_FOLDER, '"unknown type" must not be equal to "directory type"');
      assert.notEqual(dirio.TYPE_UNKNOWN, dirio.TYPE_ALIAS, '"unknown type" must not be equal to "symbolic link type"');
    });

  });

  describe('.TYPE_FILE', function() {

    it('should be defined', function() {
      assert.isDefined(dirio.TYPE_FILE, 'missing definition of "file type" constant');
    });

    it('should be unique', function() {
      assert.notEqual(dirio.TYPE_FILE, dirio.TYPE_UNKNOWN, '"file type" must not be equal to "unknown type"');
      assert.notEqual(dirio.TYPE_FILE, dirio.TYPE_FOLDER, '"file type" must not be equal to "directory type"');
      assert.notEqual(dirio.TYPE_FILE, dirio.TYPE_ALIAS, '"file type" must not be equal to "symbolic link type"');
    });

  });

  describe('.TYPE_FOLDER', function() {

    it('should be defined', function() {
      assert.isDefined(dirio.TYPE_FOLDER, 'missing definition of "directory type" constant');
    });

    it('should be unique', function() {
      assert.notEqual(dirio.TYPE_FOLDER, dirio.TYPE_UNKNOWN, '"folder type" must not be equal to "unknown type"');
      assert.notEqual(dirio.TYPE_FOLDER, dirio.TYPE_FILE, '"folder type" must not be equal to "file type"');
      assert.notEqual(dirio.TYPE_FOLDER, dirio.TYPE_ALIAS, '"folder type" must not be equal to "symbolic link type"');
    });

  });

  describe('.TYPE_ALIAS', function() {

    it('should be defined', function() {
      assert.isDefined(dirio.TYPE_ALIAS,  'missing definition of "symbolic link type" constant');
    });

    it('should be unique', function() {
      assert.notEqual(dirio.TYPE_ALIAS, dirio.TYPE_UNKNOWN, '"alias type" must not be equal to "unknown type"');
      assert.notEqual(dirio.TYPE_ALIAS, dirio.TYPE_FILE, '"alias type" must not be equal to "file type"');
      assert.notEqual(dirio.TYPE_ALIAS, dirio.TYPE_FOLDER, '"alias type" must not be equal to "directory type"');
    });

  });

  describe('.convert()', function() {

    const TMP_DIR_LOCAL = path.join(TMP_DIR, getRandStr());

    before(function() {
      fs.mkdirSync(TMP_DIR_LOCAL);
    });

    it('should provide javascript object representing structure of the source directory 1', function(done) {
      dirio.convert(DIR1_PATH, function(err, o) {
        expect(err).to.not.exist();

        expect(o).to.have.property('name', DIR1_NAME);

        expect(o).to.have.property('type', dirio.TYPE_FOLDER);

        expect(o).to.have.property('children')
        .that.have.deep.members([{
          name: DIR1_FILE,
          type: dirio.TYPE_FILE,
          data: DIR1_CONTENT
        },{
          name: DIR1_FOLDER,
          type: dirio.TYPE_FOLDER,
          children: []
        },{
          name: DIR1_ALIAS,
          type: dirio.TYPE_FOLDER,
          children: []
        }]);

        done();
      });
    });

    it('should provide javascript object representing structure of the source directory 2', function(done) {
      dirio.convert(DIR2_PATH, function(err, o) {
        expect(err).to.not.exist();

        expect(o).to.have.property('name', DIR2_NAME);

        expect(o).to.have.property('type', dirio.TYPE_FOLDER);

        expect(o).to.have.property('children')
        .that.have.deep.members([{
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
        }]);

        done();
      });
    });

    it('should write JSON file representing structure of the source directory 1', function(done) {
      var tmp = path.join(TMP_DIR_LOCAL, getRandStr() + JSON_EXTNAME);

      dirio.convert(tmp, DIR1_PATH, function(err) {
        expect(err).to.not.exist();

        fs.readFile(tmp, {encoding: 'utf8'}, function(err, json) {
          if (err) return done(err);

          var o;
          try {
            o = JSON.parse(json);
          } catch(err) {
            return done(err);
          }

          expect(o).to.have.property('name', DIR1_NAME);

          expect(o).to.have.property('type', dirio.TYPE_FOLDER);

          expect(o).to.have.property('children')
          .that.have.deep.members([{
            name: DIR1_FILE,
            type: dirio.TYPE_FILE,
            data: DIR1_CONTENT
          },{
            name: DIR1_FOLDER,
            type: dirio.TYPE_FOLDER,
            children: []
          },{
            name: DIR1_ALIAS,
            type: dirio.TYPE_FOLDER,
            children: []
          }]);

          done();
        });
      });
    });

    it('should write JSON file representing structure of the source directory 2', function(done) {
      var tmp = path.join(TMP_DIR_LOCAL, getRandStr() + JSON_EXTNAME);

      dirio.convert(tmp, DIR2_PATH, function(err) {
        expect(err).to.not.exist();

        fs.readFile(tmp, {encoding: 'utf8'}, function(err, json) {
          if (err) return done(err);

          var o;
          try {
            o = JSON.parse(json);
          } catch(err) {
            return done(err);
          }

          expect(o).to.have.property('name', DIR2_NAME);

          expect(o).to.have.property('type', dirio.TYPE_FOLDER);

          expect(o).to.have.property('children')
          .that.have.deep.members([{
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
          }]);

          done();
        });
      });
    });

    it('should write directory structure according to the source object 1', function(done) {
      const TMP_DIRX = DIR1_NAME + '_' + getRandStr();

      var src = {
        name: TMP_DIRX,
        type: dirio.TYPE_FOLDER,
        children: [{
          name: DIR1_FILE,
          type: dirio.TYPE_FILE,
          data: DIR1_CONTENT
        },{
          name: DIR1_FOLDER,
          type: dirio.TYPE_FOLDER,
          children: []
        },{
          name: DIR1_ALIAS,
          type: dirio.TYPE_ALIAS,
          orig: DIR1_ORIG_A
        }]
      };

      dirio.convert(TMP_DIR_LOCAL, src, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([TMP_DIRX]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, TMP_DIRX)))
        .to.have.members([DIR1_FILE, DIR1_FOLDER, DIR1_ALIAS]);

        const TMP_FILE = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR1_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR1_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR1_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([]);

        const TMP_ALIAS = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR1_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR1_ORIG_A);

        done();
      });
    });

    it('should write directory structure according to the source object 2', function(done) {
      const TMP_DIRX = DIR2_NAME + '_' + getRandStr();

      var src = {
        name: TMP_DIRX,
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
            orig: DIR2_ORIG_A
          }]
        }]
      };

      dirio.convert(TMP_DIR_LOCAL, src, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([TMP_DIRX]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, TMP_DIRX)))
        .to.have.members([DIR2_FOLDER, DIR2_L0]);

        const TMP_L0 = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR2_L0);
        expect(fs.lstatSync(TMP_L0))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L0))
        .to.have.members([DIR2_L1]);

        const TMP_L1 = path.join(TMP_L0, DIR2_L1);
        expect(fs.lstatSync(TMP_L1))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L1))
        .to.have.members([DIR2_L2]);

        const TMP_L2 = path.join(TMP_L1, DIR2_L2);
        expect(fs.lstatSync(TMP_L2))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L2))
        .to.have.members([DIR2_L3]);

        const TMP_L3 = path.join(TMP_L2, DIR2_L3);
        expect(fs.lstatSync(TMP_L3))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L3))
        .to.have.members([DIR2_FILE]);

        const TMP_FILE = path.join(TMP_L3, DIR2_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR2_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR2_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([DIR2_ALIAS]);

        const TMP_ALIAS = path.join(TMP_FOLDER, DIR2_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR2_ORIG_A);

        done();
      });
    });

    it('should write directory structure according to the source JSON file 1', function(done) {
      dirio.convert(TMP_DIR_LOCAL, JSON1_PATH, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([DIR1_NAME]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, DIR1_NAME)))
        .to.have.members([DIR1_FILE, DIR1_FOLDER]);

        const TMP_FILE = path.join(TMP_DIR_LOCAL, DIR1_NAME, DIR1_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR1_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, DIR1_NAME, DIR1_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([DIR1_ALIAS]);

        const TMP_ALIAS = path.join(TMP_FOLDER, DIR1_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR1_ORIG_B);

        done();
      });
    });

    it('should write directory structure according to the source JSON file 2', function(done) {
      dirio.convert(TMP_DIR_LOCAL, JSON2_PATH, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([DIR2_NAME]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, DIR2_NAME)))
        .to.have.members([DIR2_FOLDER, DIR2_L0]);

        const TMP_L0 = path.join(TMP_DIR_LOCAL, DIR2_NAME, DIR2_L0);
        expect(fs.lstatSync(TMP_L0))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L0))
        .to.have.members([DIR2_L1]);

        const TMP_L1 = path.join(TMP_L0, DIR2_L1);
        expect(fs.lstatSync(TMP_L1))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L1))
        .to.have.members([DIR2_L2]);

        const TMP_L2 = path.join(TMP_L1, DIR2_L2);
        expect(fs.lstatSync(TMP_L2))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L2))
        .to.have.members([DIR2_L3]);

        const TMP_L3 = path.join(TMP_L2, DIR2_L3);
        expect(fs.lstatSync(TMP_L3))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L3))
        .to.have.members([DIR2_FILE]);

        const TMP_FILE = path.join(TMP_L3, DIR2_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR2_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, DIR2_NAME, DIR2_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([DIR2_ALIAS]);

        const TMP_ALIAS = path.join(TMP_FOLDER, DIR2_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR2_ORIG_B);

        done();
      });
    });

  });

  describe('.lconvert()', function() {

    const TMP_DIR_LOCAL = path.join(TMP_DIR, getRandStr());

    before(function() {
      fs.mkdirSync(TMP_DIR_LOCAL);
    });

    it('should provide javascript object representing structure of the source directory 1', function(done) {
      dirio.lconvert(DIR1_PATH, function(err, o) {
        expect(err).to.not.exist();

        expect(o).to.have.property('name', DIR1_NAME);

        expect(o).to.have.property('type', dirio.TYPE_FOLDER);

        expect(o).to.have.property('children')
        .that.have.deep.members([{
          name: DIR1_FILE,
          type: dirio.TYPE_FILE,
          data: DIR1_CONTENT
        },{
          name: DIR1_FOLDER,
          type: dirio.TYPE_FOLDER,
          children: []
        },{
          name: DIR1_ALIAS,
          type: dirio.TYPE_ALIAS,
          orig: DIR1_ORIG_A
        }]);

        done();
      });
    });

    it('should provide javascript object representing structure of the source directory 2', function(done) {
      dirio.lconvert(DIR2_PATH, function(err, o) {
        expect(err).to.not.exist();

        expect(o).to.have.property('name', DIR2_NAME);

        expect(o).to.have.property('type', dirio.TYPE_FOLDER);

        expect(o).to.have.property('children')
        .that.have.deep.members([{
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
            orig: DIR2_ORIG_A
          }]
        }]);

        done();
      });
    });

    it('should write JSON file representing structure of the source directory 1', function(done) {
      var tmp = path.join(TMP_DIR_LOCAL, getRandStr() + JSON_EXTNAME);

      dirio.lconvert(tmp, DIR1_PATH, function(err) {
        expect(err).to.not.exist();

        fs.readFile(tmp, {encoding: 'utf8'}, function(err, json) {
          if (err) return done(err);

          var o;
          try {
            o = JSON.parse(json);
          } catch(err) {
            return done(err);
          }

          expect(o).to.have.property('name', DIR1_NAME);

          expect(o).to.have.property('type', dirio.TYPE_FOLDER);

          expect(o).to.have.property('children')
          .that.have.deep.members([{
            name: DIR1_FILE,
            type: dirio.TYPE_FILE,
            data: DIR1_CONTENT
          },{
            name: DIR1_FOLDER,
            type: dirio.TYPE_FOLDER,
            children: []
          },{
            name: DIR1_ALIAS,
            type: dirio.TYPE_ALIAS,
            orig: DIR1_ORIG_A
          }]);

          done();
        });
      });
    });

    it('should write JSON file representing structure of the source directory 2', function(done) {
      var tmp = path.join(TMP_DIR_LOCAL, getRandStr() + JSON_EXTNAME);

      dirio.lconvert(tmp, DIR2_PATH, function(err) {
        expect(err).to.not.exist();

        fs.readFile(tmp, {encoding: 'utf8'}, function(err, json) {
          if (err) return done(err);

          var o;
          try {
            o = JSON.parse(json);
          } catch(err) {
            return done(err);
          }

          expect(o).to.have.property('name', DIR2_NAME);

          expect(o).to.have.property('type', dirio.TYPE_FOLDER);

          expect(o).to.have.property('children')
          .that.have.deep.members([{
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
              orig: DIR2_ORIG_A
            }]
          }]);

          done();
        });
      });
    });

    it('should write directory structure according to the source object 1', function(done) {
      const TMP_DIRX = DIR1_NAME + '_' + getRandStr();

      var src = {
        name: TMP_DIRX,
        type: dirio.TYPE_FOLDER,
        children: [{
          name: DIR1_FILE,
          type: dirio.TYPE_FILE,
          data: DIR1_CONTENT
        },{
          name: DIR1_FOLDER,
          type: dirio.TYPE_FOLDER,
          children: []
        },{
          name: DIR1_ALIAS,
          type: dirio.TYPE_ALIAS,
          orig: DIR1_ORIG_A
        }]
      };

      dirio.lconvert(TMP_DIR_LOCAL, src, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([TMP_DIRX]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, TMP_DIRX)))
        .to.have.members([DIR1_FILE, DIR1_FOLDER, DIR1_ALIAS]);

        const TMP_FILE = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR1_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR1_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR1_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([]);

        const TMP_ALIAS = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR1_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR1_ORIG_A);

        done();
      });
    });

    it('should write directory structure according to the source object 2', function(done) {
      const TMP_DIRX = DIR2_NAME + '_' + getRandStr();

      var src = {
        name: TMP_DIRX,
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
            orig: DIR2_ORIG_A
          }]
        }]
      };

      dirio.lconvert(TMP_DIR_LOCAL, src, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([TMP_DIRX]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, TMP_DIRX)))
        .to.have.members([DIR2_FOLDER, DIR2_L0]);

        const TMP_L0 = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR2_L0);
        expect(fs.lstatSync(TMP_L0))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L0))
        .to.have.members([DIR2_L1]);

        const TMP_L1 = path.join(TMP_L0, DIR2_L1);
        expect(fs.lstatSync(TMP_L1))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L1))
        .to.have.members([DIR2_L2]);

        const TMP_L2 = path.join(TMP_L1, DIR2_L2);
        expect(fs.lstatSync(TMP_L2))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L2))
        .to.have.members([DIR2_L3]);

        const TMP_L3 = path.join(TMP_L2, DIR2_L3);
        expect(fs.lstatSync(TMP_L3))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L3))
        .to.have.members([DIR2_FILE]);

        const TMP_FILE = path.join(TMP_L3, DIR2_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR2_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, TMP_DIRX, DIR2_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([DIR2_ALIAS]);

        const TMP_ALIAS = path.join(TMP_FOLDER, DIR2_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR2_ORIG_A);

        done();
      });
    });

    it('should write directory structure according to the source JSON file 1', function(done) {
      dirio.lconvert(TMP_DIR_LOCAL, JSON1_PATH, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([DIR1_NAME]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, DIR1_NAME)))
        .to.have.members([DIR1_FILE, DIR1_FOLDER]);

        const TMP_FILE = path.join(TMP_DIR_LOCAL, DIR1_NAME, DIR1_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR1_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, DIR1_NAME, DIR1_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([DIR1_ALIAS]);

        const TMP_ALIAS = path.join(TMP_FOLDER, DIR1_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR1_ORIG_B);

        done();
      });
    });

    it('should write directory structure according to the source JSON file 2', function(done) {
      dirio.lconvert(TMP_DIR_LOCAL, JSON2_PATH, function(err) {
        expect(err).to.not.exist();

        expect(fs.readdirSync(TMP_DIR_LOCAL))
        .to.include.members([DIR2_NAME]);

        expect(fs.readdirSync(path.join(TMP_DIR_LOCAL, DIR2_NAME)))
        .to.have.members([DIR2_FOLDER, DIR2_L0]);

        const TMP_L0 = path.join(TMP_DIR_LOCAL, DIR2_NAME, DIR2_L0);
        expect(fs.lstatSync(TMP_L0))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L0))
        .to.have.members([DIR2_L1]);

        const TMP_L1 = path.join(TMP_L0, DIR2_L1);
        expect(fs.lstatSync(TMP_L1))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L1))
        .to.have.members([DIR2_L2]);

        const TMP_L2 = path.join(TMP_L1, DIR2_L2);
        expect(fs.lstatSync(TMP_L2))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L2))
        .to.have.members([DIR2_L3]);

        const TMP_L3 = path.join(TMP_L2, DIR2_L3);
        expect(fs.lstatSync(TMP_L3))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_L3))
        .to.have.members([DIR2_FILE]);

        const TMP_FILE = path.join(TMP_L3, DIR2_FILE);
        expect(fs.lstatSync(TMP_FILE))
        .to.satisfy(isFile);
        expect(fs.readFileSync(TMP_FILE, {encoding: 'utf8'}))
        .to.equal(DIR2_CONTENT);

        const TMP_FOLDER = path.join(TMP_DIR_LOCAL, DIR2_NAME, DIR2_FOLDER);
        expect(fs.lstatSync(TMP_FOLDER))
        .to.satisfy(isDirectory);
        expect(fs.readdirSync(TMP_FOLDER))
        .to.have.members([DIR2_ALIAS]);

        const TMP_ALIAS = path.join(TMP_FOLDER, DIR2_ALIAS);
        expect(fs.lstatSync(TMP_ALIAS))
        .to.satisfy(isSymbolicLink);
        expect(fs.readlinkSync(TMP_ALIAS))
        .to.equal(DIR2_ORIG_B);

        done();
      });
    });

  });

});

function getRandStr() {
  return String(Math.random()).slice(2);
}

function isFile(stats) {
  return stats.isFile();
}

function isDirectory(stats) {
  return stats.isDirectory();
}

function isSymbolicLink(stats) {
  return stats.isSymbolicLink();
}

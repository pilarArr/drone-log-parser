'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logCAM2JSON = exports.log2var = exports.txt2var = exports.log2JSON = exports.txt2JSON = exports.logObject2JSON = exports.txtObject2JSON = undefined;

var _lineReader = require('line-reader');

var _lineReader2 = _interopRequireDefault(_lineReader);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var txt2var = function txt2var(myLogPath, callback) {
  var myLogVar = {};

  function parseDataLog(dataLine) {
    var removeBrakets = dataLine.substr(1).slice(0, -1);
    var splitItems = removeBrakets.split(', ');

    var resultObject = {};
    splitItems.forEach(function (keyValue) {
      var splitKeyValue = keyValue.split(' : ');
      var itemKey = splitKeyValue[0];
      var itemData = splitKeyValue[1];
      if (Number.isNaN(Number(itemData))) {
        resultObject[itemKey] = itemData;
      } else {
        resultObject[itemKey] = Number(itemData);
      }
    });
    return resultObject;
  }

  function parseLine(textLine) {
    var lineArr = textLine.split(' ');
    var finalLineArr = lineArr.slice(0, 3);
    finalLineArr.push(lineArr.slice(3).join(' '));
    finalLineArr[1] = finalLineArr[1].slice(0, -1);

    var timeStamp = finalLineArr.slice(0, 2).join(' ');
    var dataName = finalLineArr[2];
    var dataLog = finalLineArr[3];
    var isPropertyDefined = Object.prototype.hasOwnProperty.call(myLogVar, dataName);

    if (!isPropertyDefined) {
      myLogVar[dataName] = [];
    }

    var lastIndexInDataArray = myLogVar[dataName].length;

    var dataLogObject = parseDataLog(dataLog);
    dataLogObject.TimeLog = timeStamp;
    myLogVar[dataName][lastIndexInDataArray] = dataLogObject;
  }

  if (!_fs2.default.existsSync(myLogPath)) {
    throw new Error('File does not exist');
  }

  _lineReader2.default.eachLine(myLogPath, function (line, last) {
    // eslint-disable-line
    parseLine(line);
    if (last) {
      callback(myLogVar);
    }
  });
};

var log2var = function log2var(myLogPath, callback) {
  var myLogVar = {};

  function parseFMT(lineArray) {
    var isFMTDefined = Object.prototype.hasOwnProperty.call(myLogVar, 'FMT');
    if (isFMTDefined) {
      myLogVar.FMT.push({});
    } else {
      myLogVar.FMT = [];
      myLogVar.FMT.push({});
    }
    var columns = ['Type', 'Length', 'Name', 'Format', 'Columns'];
    for (var i = 1; i < lineArray.length; i += 1) {
      if (i < 5) {
        myLogVar.FMT[myLogVar.FMT.length - 1][columns[i - 1]] = lineArray[i];
      } else if (i === 5) {
        myLogVar.FMT[myLogVar.FMT.length - 1][columns[i - 1]] = [];
        var mycols = lineArray[i].split(',');
        for (var j = 0; j < mycols.length; j += 1) {
          myLogVar.FMT[myLogVar.FMT.length - 1][columns[i - 1]].push(mycols[j]);
        }
      }
    }
  }

  function parseMSG(lineArray) {
    // Check if object exists and create one if it doesnt
    var dataName = lineArray[0];
    var isPropertyDefined = Object.prototype.hasOwnProperty.call(myLogVar, dataName);
    if (isPropertyDefined) {
      myLogVar[dataName].push({});
    } else {
      myLogVar[dataName] = [];
      myLogVar[dataName].push({});
    }

    // Search for the FMT value to get columns
    // TODO try to make this bisection search after a merge-sort of the FMT
    // array by name to make the search faster.
    var columns = [];
    var numberOfFMTMessages = myLogVar.FMT.length;
    for (var i = 0; i < numberOfFMTMessages; i += 1) {
      if (myLogVar.FMT[i].Name === dataName) {
        columns = myLogVar.FMT[i].Columns;
        break;
      }
    }
    // Parse the columns

    for (var _i = 1; _i < lineArray.length; _i += 1) {
      var lastIndexInDataArray = myLogVar[dataName].length - 1;
      var columnName = columns[_i - 1];
      if (Number.isNaN(Number(lineArray[_i]))) {
        myLogVar[dataName][lastIndexInDataArray][columnName] = lineArray[_i];
      } else {
        myLogVar[dataName][lastIndexInDataArray][columnName] = Number(lineArray[_i]);
      }
    }
  }

  _lineReader2.default.eachLine(myLogPath, function (line) {
    // eslint-disable-line
    var lineArr = line.split(', ');

    if (lineArr[0] === 'FMT') {
      parseFMT(lineArr);
    } else {
      // console.log('FMT END');
      return false;
    }
  });

  _lineReader2.default.eachLine(myLogPath, function (line, last) {
    var lineArr = line.split(', ');

    if (lineArr[0] !== 'FMT') {
      parseMSG(lineArr);
    }
    if (last) {
      // console.log('LOG END');
      callback(myLogVar);
    }
  });
};

var log2JSON = function log2JSON(myLogPath) {
  var myJSONPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : myLogPath + '.json';

  log2var(myLogPath, function (myLogVar) {
    // check for json extension
    var myFinalPath = myJSONPath;
    var myExtension = myFinalPath.slice(-5);
    if (myExtension !== '.json') {
      myFinalPath = myJSONPath + '.json';
    }
    if (myFinalPath.length === 5) {
      myFinalPath = myLogPath + '.json';
    }

    // add numbers if path exists. do not overwrite or delete
    var copy = 1;
    while (_fs2.default.existsSync(myFinalPath)) {
      myFinalPath = myFinalPath.slice(0, -5) + copy + myFinalPath.slice(-5);
      copy += 1;
    }
    _fs2.default.appendFileSync(myFinalPath, JSON.stringify(myLogVar));
  });
};

var txt2JSON = function txt2JSON(myLogPath) {
  var myJSONPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : myLogPath + '.json';

  txt2var(myLogPath, function (myLogVar) {
    // check for json extension
    var myFinalPath = myJSONPath;
    var myExtension = myFinalPath.slice(-5);
    if (myExtension !== '.json') {
      myFinalPath = myJSONPath + '.json';
    }
    if (myFinalPath.length === 5) {
      myFinalPath = myLogPath + '.json';
    }

    // add numbers if path exists. do not overwrite or delete
    var copy = 1;
    while (_fs2.default.existsSync(myFinalPath)) {
      myFinalPath = myFinalPath.slice(0, -5) + copy + myFinalPath.slice(-5);
      copy += 1;
    }
    _fs2.default.appendFileSync(myFinalPath, JSON.stringify(myLogVar));
  });
};

var logObject2JSON = function logObject2JSON(object2Extract, myLogPath, myJSONPath) {
  var myLogVar = {};
  myLogVar[object2Extract] = [];

  var logMetaData = [];

  if (!_fs2.default.existsSync(myLogPath)) {
    throw new Error('Log File Does not Exist');
  }

  var myColumnMetadata = [];

  function findMyMetadata() {
    // Search for the FMT value to get columns
    // TODO try to make this bisection search after a merge-sort of the FMT
    // array by name to make the search faster.
    var numberOfFMTMessages = logMetaData.length;
    for (var i = 0; i < numberOfFMTMessages; i += 1) {
      if (logMetaData[i].Name === object2Extract) {
        myColumnMetadata = logMetaData[i].Columns;
        break;
      }
    }
  }

  function parseFMT(lineArray) {
    logMetaData.push({
      Type: lineArray[1],
      Length: lineArray[2],
      Name: lineArray[3],
      Format: lineArray[4],
      Columns: lineArray[5].split(',')
    });
  }

  function parseMSG(lineArray) {
    // Check if object exists and create one if it doesnt
    // Parse the column
    var lastIndexInDataArray = myLogVar[object2Extract].length - 1;
    for (var i = 1; i < lineArray.length; i += 1) {
      var columnName = myColumnMetadata[i - 1];
      if (Number.isNaN(Number(lineArray[i]))) {
        myLogVar[object2Extract][lastIndexInDataArray][columnName] = lineArray[i];
      } else {
        myLogVar[object2Extract][lastIndexInDataArray][columnName] = Number(lineArray[i]);
      }
    }
  }

  _lineReader2.default.eachLine(myLogPath, function (line, last) {
    // eslint-disable-line
    var lineArr = line.split(', ');

    if (lineArr[0] === 'FMT') {
      parseFMT(lineArr);
    }if (last) {
      findMyMetadata();
    }
  });

  _lineReader2.default.eachLine(myLogPath, function (line, last) {
    var lineArr = line.split(', ');

    if (lineArr[0] === object2Extract) {
      parseMSG(lineArr);
    }
    if (last) {
      if (_fs2.default.existsSync(myJSONPath)) {
        _fs2.default.unlinkSync(myJSONPath);
      }
      _fs2.default.appendFileSync(myJSONPath, JSON.stringify(myLogVar));
    }
  });
};

var logCAM2JSON = function logCAM2JSON(object2Extract, myLogPath, myJSONPath) {
  var myLogVar = {};
  myLogVar.CAM = [];

  if (!_fs2.default.existsSync(myLogPath)) {
    throw new Error('Log File Does not Exist');
  }

  function parseCAM(lineArray) {
    // Check if object exists and create one if it doesnt
    // Parse the column

    myLogVar.CAM.push({
      TimeUS: Number(lineArray[1]),
      GPSTime: Number(lineArray[2]),
      GPSWeek: Number(lineArray[3]),
      Lat: Number(lineArray[4]),
      Lng: Number(lineArray[5]),
      Alt: Number(lineArray[6]),
      RelAlt: Number(lineArray[7]),
      GPSAlt: Number(lineArray[8]),
      Roll: Number(lineArray[9]),
      Pitch: Number(lineArray[10]),
      Yaw: Number(lineArray[11])
    });
  }

  _lineReader2.default.eachLine(myLogPath, function (line, last) {
    var lineArr = line.split(', ');

    if (lineArr[0] === 'CAM') {
      parseCAM(lineArr);
    }
    if (last) {
      if (_fs2.default.existsSync(myJSONPath)) {
        _fs2.default.unlinkSync(myJSONPath);
      }
      _fs2.default.appendFileSync(myJSONPath, JSON.stringify(myLogVar));
    }
  });
};

var txtObject2JSON = function txtObject2JSON(object2Extract, myLogPath, myJSONPath) {
  var myLogVar = {};
  myLogVar[object2Extract] = [];

  if (!_fs2.default.existsSync(myLogPath)) {
    throw new Error('Log File Does not Exist');
  }

  function parseDataLog(dataLine) {
    var removeBrakets = dataLine.substr(1).slice(0, -1);
    var splitItems = removeBrakets.split(', ');

    var resultObject = {};
    splitItems.forEach(function (keyValue) {
      var splitKeyValue = keyValue.split(' : ');
      var itemKey = splitKeyValue[0];
      var itemData = splitKeyValue[1];
      if (Number.isNaN(Number(itemData))) {
        resultObject[itemKey] = itemData;
      } else {
        resultObject[itemKey] = Number(itemData);
      }
    });
    return resultObject;
  }

  function parseLine(textLine) {
    var lineArr = textLine.split(' ');
    var finalLineArr = lineArr.slice(0, 3);
    finalLineArr.push(lineArr.slice(3).join(' '));
    finalLineArr[1] = finalLineArr[1].slice(0, -1);

    var timeStamp = finalLineArr.slice(0, 2).join(' ');
    var dataName = finalLineArr[2];
    var dataLog = finalLineArr[3];

    if (dataName === object2Extract) {
      var lastIndexInDataArray = myLogVar[object2Extract].length;

      var dataLogObject = parseDataLog(dataLog);
      dataLogObject.TimeLog = timeStamp;
      myLogVar[dataName][lastIndexInDataArray] = dataLogObject;
    }
  }

  _lineReader2.default.eachLine(myLogPath, function (line, last) {
    parseLine(line);
    if (last) {
      if (_fs2.default.existsSync(myJSONPath)) {
        _fs2.default.unlinkSync(myJSONPath);
      }
      _fs2.default.appendFileSync(myJSONPath, JSON.stringify(myLogVar));
    }
  });
};

exports.txtObject2JSON = txtObject2JSON;
exports.logObject2JSON = logObject2JSON;
exports.txt2JSON = txt2JSON;
exports.log2JSON = log2JSON;
exports.txt2var = txt2var;
exports.log2var = log2var;
exports.logCAM2JSON = logCAM2JSON;
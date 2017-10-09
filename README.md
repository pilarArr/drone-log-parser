# drone-log-parser

```
npm install drone-log-parser
```

This is a package that attempts to convert the logs of different drones to a more readable JSON object. Currently only supports APM `.log` files.

It offers 2 functions:

- `log2var`: it takes in the path for the log and returns a object variable after parsing

    ``` javascript
    import {log2var} from 'drone-log-parser';

    log2var(myLogPath, (result) => {
        console.log(result);
        // result is the object variable created
        // now you can work with it as you wish
    });

    ```

- `log2JSON`: it takes in the path for the log and the path where you want to put the JSON file. If no JSON path is found it saves the `.json` file in the same path as the log with a `.json` extension. Warning, this file are usually very big. If the file already exists, a number is appended to the name of the file.

    ``` javascript
    import {log2var} from 'drone-log-parser';

    log2JSON(myLogPath, myJSONPath);
    ```

This would be a sample `.log` file:

```
FMT, 128, 89, FMT, BBnNZ, Type,Length,Name,Format,Columns
FMT, 129, 31, PARM, QNf, TimeUS,Name,Value
FMT, 130, 50, GPS, QBIHBcLLeeEefB, TimeUS,Status,GMS,GWk,NSats,HDop,Lat,Lng,RAlt,Alt,Spd,GCrs,VZ,U
FMT, 131, 50, GPS2, QBIHBcLLeeEefB, TimeUS,Status,GMS,GWk,NSats,HDop,Lat,Lng,RAlt,Alt,Spd,GCrs,VZ,U
FMT, 194, 19, GPA, QCCCC, TimeUS,VDop,HAcc,VAcc,SAcc
...
PARM, 2018601318, SYSID_THISMAV, 1
PARM, 2018601327, SYSID_MYGCS, 253
PARM, 2018601337, CLI_ENABLED, 0
...
PIDR, 2170611144, -13.475, -12.12663, 0, -6.892358, 0, 0
PIDP, 2170611148, -0.5099478, -0.3088386, 0, -0.08426516, 0, 0
PIDY, 2170611152, 0, 0, 0, 0, 0, 0
PIDS, 2170611156, 0, 0, 0, 0, 0, 0
EKF1, 2170611174, 5.67, -0.62, 330.99, 0.3472643, 0.01834141, -0.0005736348, 0, 0, 0.2265548, 0.29, -0.57, 0.21
...
```

And the variable is an object, where each key has the name of the message and consists of an array of all the messages with that header. The JSON function creates a JSON with the same structure as the variable.

```javascript
{
  "FMT": [
    {
      "Type": 128,
      "Length": 89,
      "Name": "FMT",
      "Format": "BBnNZ",
      "Columns": ["Type","Length","Name","Format","Columns"]
    },
    {
      "Type": 129,
      "Length": 31,
      "Name": "PARAM",
      "Format": "QNf",
      "Columns": ["TimeUS","Name","Value"]
    },
    ...
  ],
  "PARAM": [
    {
      "TimeUS": 2018601318,
      "Name": "SYSID_THISMAV",
      "Value": 1
    },
    {
      "TimeUS": 2018601327,
      "Name": "SYSID_MYGCS",
      "Value": 253
    },
    {
      "TimeUS": 2018601337,
      "Name": "CLI_ENABLED",
      "Value": 0
    },
    ...
  ],
  ...
  "PIDR": [...],
  "PIDP": [...],
  "PIDY": [...],
  "EKF1": [...],
  ...
}
```

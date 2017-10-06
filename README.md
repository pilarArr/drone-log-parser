# drone-log-parser

This is a package that attempts to convert the logs of different drones to a
more readable JSON object.

Currently only supports APM .log files.

It offers 2 functions:

- `log2var`: it takes in the path for the log and returns a object variable after parsing

    ``` javascript
    import {log2var} from 'drone-log-parser';

    log2var(myLogPath, (result) => {
        console.log(result);
        // result is the object variable created
        //now you can work with it as you wish
    });

    ```

- `log2JSON`: it takes in the path for the log and the path where you want to put the JSON file. If no JSON path is found it saves the `.json` file in the same path as the log with a `.json` extension. Warning, this file are usually very big.

    ``` javascript
    import {log2var} from 'drone-log-parser';

    log2JSON(myLogPath, myJSONPath);
    ```

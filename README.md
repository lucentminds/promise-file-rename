# promise-file-rename
NodeJs module that renames one or more files with promise flow control.

## Installation

Install by npm.

```shell
npm install git+https://github.com/lucentminds/promise-file-rename.git
```

### Useage:

```js
var rename = require( 'promise-file-rename' );

rename( '/path/to/file.txt', 'new-file-name.txt' )
.then(function( cNewPath ){

    console.log( 'Success!' );

});
```

## Examples

Rename one file.

```js
rename( '/path/to/file.txt', 'new-file-name.txt' )
.then(function( cNewPath ){

    console.log( 'Success!' );

});
```

Rename multiple files.

```js
rename( [
    '/path/to/file.txt',
    '/another/path/to/file.txt'
], 'new-file-name.txt' )
.then(function( aNewPaths ){

    /** 
    * Now both files have been renamed to "new-file-name.txt" in their
    * respective directories.
    */
    console.log( 'Success!' );

});
```
var rename = require( '../promise-file-rename' );

rename( './test/text2.txt', 'text1.txt' )
.then(function( cPath ){
    console.log( cPath );

    return rename( './test/text1.txt', 'text2.txt' );
})
.then(function( cPath ){
    console.log( cPath );

    return rename( './test/test2', 'test1' );
})
.then(function( cPath ){
    console.log( cPath );

    return rename( './test/test1', 'test2' );
})
.then(function( cPath ){
    console.log( cPath );
}).done();
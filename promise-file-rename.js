/**
 * 02-04-2017
 * NodeJs module that renames one or more files with promise flow control.
 * ~~ Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jshint undef: true, unused: true */
/* jslint node: true */

var fs = require( 'fs' );
var path = require( 'path' );
var Q = require( 'q' );
var fse = require( 'fs-extra' );
var resolvePath = require( 'promise-resolve-path' );
var copy = module.exports = function( aSrc, cNewName ){ // jshint ignore:line
    var deferred = Q.defer();
    var cSrcType = typeof aSrc;

    switch( true ) {
    case ( cSrcType === 'string' ):
        aSrc = [aSrc];
        break;

    case Array.isArray( aSrc ):
        break;

    default:
        deferred.reject( 'Invalid source path argument: '.concat( aSrc ) );
        return deferred.promise;

    }// /switch()

    // Resolve source paths and verify their existance.
    resolvePath( aSrc, true )
    .then(function( aSources ){
        var i, l, aPromises = [];
        var cSrc;

        // Loop over each source.
        for( i = 0, l = aSources.length; i < l; i++ ) {
            cSrc = aSources[ i ];
            aPromises.push( renameOnePath( cSrc, cNewName ) );

        }// /for()
        
        // Either wait for all paths to be copied or reject one.
       return Q.all( aPromises );
       
    })
    .then(function( aRenamed ){
        if( cSrcType === 'string' )  {
            deferred.resolve( aRenamed[0] );
        }
        else {
            deferred.resolve( aRenamed );
        }
    })
    .fail(function( err ){
       deferred.reject( err );
    }).done();

    return deferred.promise;
};// /copy()

var renameOnePath = function( cPathSrc, cNewName ) {
    var deferred = Q.defer();
    
    // Either wait for all paths to be evaluated or reject one.
    determinePathType( cPathSrc )
    .then( function( cType ){
        var cPathDir, cPathNew;

        switch( cType ) {
        case 'file':            
        case 'directory':
            cPathDir = path.dirname( cPathSrc );
            cPathNew = path.join( cPathDir, cNewName );
            break;
            
        default:
            throw new Error( ''.concat( 'Invalid file type "".' ) );
        }// /switch()

        return cPathNew;
    },

    // One rejected.
    function( err ){
        throw new Error( err );
    } )

    .then(function( cPathNew ){

        if( cPathSrc === cPathNew ) {
            return deferred.resolve( cPathNew );
        }

        fse.move( cPathSrc, cPathNew, {}, function( err ) {
            if (err) {
                return deferred.reject( err );
            }

            deferred.resolve( cPathNew );

        });

    })
    .fail(function( err ){
        deferred.reject( err );
    }).done();

    return deferred.promise;
};// /renameOnePath()

var determinePathType = function( cPath ) {
    var deferred = Q.defer();

    fs.stat( cPath, function ( err, stats ) {
        if ( err ) {

            if( err.code === 'ENOENT') {
                // This isn't really an error. The path just doesn't exist.
                deferred.resolve( 'ENOENT' );
            }
            return deferred.reject( err );
        }

        switch( true ){
        case stats.isFile():
            deferred.resolve( 'file' );
            break;

        case stats.isDirectory():
            deferred.resolve( 'directory' );
            break;
            
        default:
            deferred.resolve( 'unknown' );

        }// /switch()
    });

    return deferred.promise;
};// /determinePathType()
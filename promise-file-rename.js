/**
 * 02-04-2017
 * NodeJs module that renames one or more files with promise flow control.
 * ~~ Scott Johnson
 */


/** List jshint ignore directives here. **/
/* jshint undef: true, unused: true */
/* jslint node: true */
/* jslint esversion: 8 */

const fs = require( 'fs' );
const path = require( 'path' );
const fse = require( 'fs-extra' );
const resolvePath = require( 'promise-resolve-path' );
const rename = function( aSrc, cNewName ){ // jshint ignore:line
   return new Promise(function( resolve, reject ){
      var cSrcType = typeof aSrc;

      switch( true ) {
      case ( cSrcType === 'string' ):
         aSrc = [aSrc];
         break;

      case Array.isArray( aSrc ):
         break;

      default:
         return reject( 'Invalid source path argument: '.concat( aSrc ) );
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
         return Promise.all( aPromises );
      })
      .then(function( aRenamed ){
         if( cSrcType === 'string' )  {
            resolve( aRenamed[0] );
         }
         else {
            resolve( aRenamed );
         }
      })
      .catch(function( err ){
         reject( err );
      });
   });
};// /rename()

var renameOnePath = function( cPathSrc, cNewName ) {
   return new Promise(function( resolve, reject ){      
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
            return resolve( cPathNew );
         }

         fse.move( cPathSrc, cPathNew, {}, function( err ) {
            if (err) {
               return reject( err );
            }

            resolve( cPathNew );
         });

      })
      .catch(function( err ){
         reject( err );
      });
   });
};// /renameOnePath()

var determinePathType = function( cPath ) {
   return new Promise(function( resolve, reject ){
      fs.stat( cPath, function ( err, stats ) {
         if ( err ) {

            if( err.code === 'ENOENT') {
               // This isn't really an error. The path just doesn't exist.
               resolve( 'ENOENT' );
            }
            return reject( err );
         }

         switch( true ){
         case stats.isFile():
            resolve( 'file' );
            break;

         case stats.isDirectory():
            resolve( 'directory' );
            break;
               
         default:
            resolve( 'unknown' );

         }// /switch()
      });
   });
};// /determinePathType()

module.exports = rename;
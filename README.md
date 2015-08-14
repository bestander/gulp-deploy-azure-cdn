# gulp-deploy-azure-cdn

A Gulp plugin for for uploading files to Azure Blob Storage.
Wraps a vanilla node package [https://github.com/bestander/grunt-azure-cdn-deploy](https://github.com/bestander/grunt-azure-cdn-deploy).
It is perfect for deploying compiled assets to Microsoft Azure CDN as a last step in a Continuous Integration setup.

## Features

- Ability to execute a "dry run" of deployment. The logging will indicate all files that will be deleted or uploaded but no actual changes to the blob storage will be done
- Ability to gzip content and set a proper content encoding. If gzipped file becomes larger than original then only the original file will be uploaded
- Ability to recursively remove files in a path of Azure Blob Storage
- Ability to control number of concurrent files to be uploaded to avoid network congestion
- [Grunt](https://github.com/bestander/grunt-azure-cdn-deploy) and [gulp](https://github.com/bestander/gulp-deploy-azure-cdn) plugins available

## Installing

```
npm install gulp-deploy-azure-cdn
```


## Using

### Deploying a set of files to a path in blob storage

```javascript
var deployCdn = require('gulp-deploy-azure-cdn');
var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('upload-app-to-azure', function () {
    return gulp.src(['*.js','*.json'], {
        base: 'node_modules/deploy-azure-cdn' // optional, the base directory in which the file is located. The relative path of file to this directory is used as the destination path
    }).pipe(deployCdn({
        containerName: 'test', // container name in blob
        serviceOptions: ['blobstoragename', '/OwQ/MyLongSecretStringFromAzureConfigPanel'], // custom arguments to azure.createBlobService
        folder: '1.2.35-b27', // path within container
        zip: true, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
        deleteExistingBlobs: true, // true means recursively deleting anything under folder
        concurrentUploadThreads: 10, // number of concurrent uploads, choose best for your network condition
        metadata: {
            cacheControl: 'public, max-age=31530000', // cache in browser
            cacheControlHeader: 'public, max-age=31530000' // cache in azure CDN. As this data does not change, we set it to 1 year
        },
        testRun: false // test run - means no blobs will be actually deleted or uploaded, see log messages for details
    })).on('error', gutil.log);
});
```

### Parameters
- `gulp.src {base}` - use standard gulp configurations to skip some folders from relative file paths ([example](http://stackoverflow.com/questions/21224252/looking-for-way-to-copy-files-in-gulp-and-rename-based-on-parent-directory))
- `deployCdn function argument` - azure cdn and upload configs
  - `serviceOptions`: [] - custom arguments to azure.createBlobService, or you can use Azure SDK environment variables AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY
  - `containerName`: null -  container name, required
  - `containerOptions`: {publicAccessLevel: "blob"} - container options
  - `folder`: '', // path within container. Default is root directory of container
  - `deleteExistingBlobs`: true, // set it to false to skip recursive deleting blobs in folder
  - `concurrentUploadThreads` : 10, // number of concurrent uploads, choose best for your network condition
  - `zip`: false, // true if want to gzip the files before uploading. File will be zipped only if compressed file is smaller than original
  - `metadata`: {cacheControl: 'public, max-age=31556926'} // metadata for each uploaded file
  - `testRun`: false, // set to true if you just want to check connectivity and see deployment logs. No blobs will be removed or uplaoded.





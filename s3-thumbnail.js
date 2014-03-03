/* 
 * s3-thumbnail.js
 * 
 * AWS S3 image thumbnail module.
 * 
 * version: 0.0.1
 * create date: 2014-2-13
 * update date: 2014-2-13
 */

var util	= require('util'), 
		path	= require('path'), 
		aws		= require('aws-sdk'),
		tb		= require(path.join(__dirname, 'lib/image-thumbnail-buffer/thumbnail-buffer.js'));

// aws init
aws.config.loadFromPath(path.join(__dirname, 'awsconfig.json'));
var s3 = new aws.S3();

/* 
 * Create S3 image thumbnail.
 * 
 * Parameters: 
 *	image - (Object) S3 image object
 *		Bucket - (String) image bucket
 *		Key	- (String) image key
 *	thumb - (Object) S3 thumbnail object
 *		Bucket - (String) thumbnail bucket
 *		Key - (String) thumbnail key
 *	options - (Object) thumbnail options
 *		width - (Number) thumbnail width
 *		height - (Number) thumbnail height
 *		crop - (String) crop method, 'Center' or 'North'
 * 
 * Callback:
 *	callback - (Function) function(e) {}
 *		err - (Object) error object, set to null if succeed
 *		data - (Object) extra data
 *			imageETag - (String) image etag
 *			thumbETag - (String) thumbnail etag
 *			thumbType - (String) thumbnail mime type
 */
function create(image, thumb, options, callback) {
	s3.getObject(image, function(err, imageData) {
		if (err) {
			callback(err, null);
			return;
		}
		
		var data = {};
		data.imageETag = imageData.ETag;
		tb.create(imageData.Body, options, function(err, buf, info) {
			if (err) {
				callback(err, null);
				return;
			}

			data.thumbType = mime.lookup(info.format);
			thumb.Body					= buf;
			thumb.ContentType		= data.thumbType;
			s3.putObject(thumb, function(err, thumbData) {
				if (err) {
					callback(err, null);
					return;
				}

				data.thumbETag = thumbData.ETag;
				callback(null, data);
			});		// s3.putObject
		});		// tb.create
	});		// s3.getObject
}

exports.create = create;


import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { NewBadRequestException } from 'src/exceptions/new_bad_request.exception';

export class AWSS3Utility {
  static config: ConfigService = new ConfigService();

  static async uploadFile(file) {
    let s3: any = new AWS.S3({
      accessKeyId: AWSS3Utility.config.get('AWS_ACCESS_KEY'),
      secretAccessKey: AWSS3Utility.config.get('AWS_SECRET_ACCESS_KEY'),
      region: AWSS3Utility.config.get('AWS_S3_REGION'),
    });

    // console.log({ file });

    return await AWSS3Utility.s3_upload(
      s3,
      file.buffer,
      AWSS3Utility.config.get('AWS_S3_BUCKET'),
      // originalname + Date.now() + extension,
      AWSS3Utility.getFileName(file.originalname),
      file.mimetype,
    );
  }

  static async s3_upload(s3, file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      // ContentDisposition: 'inline',
      // CreateBucketConfiguration: {
      //   LocationConstraint: 'eu-west-3',
      // },
    };

    try {
      let s3Response = await s3.upload(params).promise();
      return { 'image-url': s3Response.Location };
    } catch (e) {
      console.log('--error in uploading image');
      console.log(e);
      throw new NewBadRequestException('UPLOAD_IMAGE_ERROR');
    }
  }

  private static getFileName(originalname) {
    let splitReturn = originalname.split('.');

    originalname = splitReturn[0];
    let extension = '';
    if (splitReturn[1]) {
      extension = '.' + splitReturn[1];
    }
    return originalname + Date.now() + extension;
  }
}

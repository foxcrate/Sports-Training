import { Injectable, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AppService {
  // constructor(private config: ConfigService) {}
  // s3 = new AWS.S3({
  //   accessKeyId: this.config.get('AWS_ACCESS_KEY'),
  //   secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
  //   region: 'eu-west-3',
  //   // signatureVersion: 'v4',
  // });
  getHello(): string {
    return 'Hello World!';
  }

  // async uploadFile(file) {
  //   console.log('accessKeyId:', this.config.get('AWS_ACCESS_KEY'));
  //   console.log(file);
  //   const { originalname } = file;

  //   return await this.s3_upload(
  //     file.buffer,
  //     this.config.get('AWS_S3_BUCKET'),
  //     originalname,
  //     file.mimetype,
  //   );
  // }

  // async s3_upload(file, bucket, name, mimetype) {
  //   const params = {
  //     Bucket: bucket,
  //     Key: String(name),
  //     Body: file,
  //     ACL: 'public-read',
  //     ContentType: mimetype,
  //     ContentDisposition: 'inline',
  //     CreateBucketConfiguration: {
  //       LocationConstraint: 'ap-south-1',
  //     },
  //   };

  //   try {
  //     let s3Response = await this.s3.upload(params).promise();
  //     return s3Response;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}

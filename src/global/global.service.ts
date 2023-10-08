import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as AWS from 'aws-sdk';

@Injectable()
export class GlobalService {
  constructor(
    private config: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async uploadFile(file) {
    let s3 = new AWS.S3({
      accessKeyId: this.config.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      region: this.config.get('AWS_S3_REGION'),
    });

    // console.log({ file });

    return await this.s3_upload(
      s3,
      file.buffer,
      this.config.get('AWS_S3_BUCKET'),
      // originalname + Date.now() + extension,
      this.getFileName(file.originalname),
      file.mimetype,
    );
  }

  async s3_upload(s3, file, bucket, name, mimetype) {
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
      // throw new NewBadRequestException('UPLOAD_IMAGE_ERROR');
      throw new InternalServerErrorException(
        // this.globalService.getError('en', 'UPLOAD_IMAGE_ERROR'),
        this.i18n.t(`errors.UPLOAD_IMAGE_ERROR`, { lang: I18nContext.current().lang }),
      );
    }
  }

  async verifyPassword(password, hash): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private getFileName(originalname) {
    let splitReturn = originalname.split('.');

    originalname = splitReturn[0];
    let extension = '';
    if (splitReturn[1]) {
      extension = '.' + splitReturn[1];
    }
    return originalname + Date.now() + extension;
  }
}

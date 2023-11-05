import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import * as AWS from 'aws-sdk';
import * as admin from 'firebase-admin';

@Injectable()
export class GlobalService {
  weekDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

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
      throw new InternalServerErrorException(
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

  async sendNotification(token: string, title: string, body: string): Promise<string> {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.log(`error in sending notification: ${error}`);

      // throw new Error(`Failed to send notification`);
      throw new InternalServerErrorException(
        this.i18n.t(`errors.SENDING_NOTIFICATION_ERROR`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  isTimeAvailable(startTime, endTime, targetTime) {
    // Create Date objects for the start, end, and target times
    let start = new Date(startTime);
    start = new Date(
      `2000-01-01 ${start.toLocaleTimeString('en-US', { hour12: false })}`,
    );

    let end = new Date(endTime);
    end = new Date(`2000-01-01 ${end.toLocaleTimeString('en-US', { hour12: false })}`);

    let target = new Date(targetTime);

    target = new Date(
      `2000-01-01 ${target.toLocaleTimeString('en-US', { hour12: false })}`,
    );

    // Check if the target time is between the start and end times
    return !(target >= start && target < end);
  }

  getDayName(dayNumber: number): string {
    return this.weekDays[dayNumber];
  }

  timeTo24(timeStr: string): string {
    let theTime = timeStr;
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      theTime = this.timeFrom12To24(timeStr);
      return theTime;
    } else {
      return theTime;
    }
  }

  timeFrom12To24(timeStr): string {
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  }

  getLocalTime(dateTime: Date): string {
    let hours = (dateTime.getHours() < 10 ? '0' : '') + dateTime.getHours();
    let minutes = (dateTime.getMinutes() < 10 ? '0' : '') + dateTime.getMinutes();
    return `${hours}:${minutes}`;
  }

  getGlobalTime(dateTime: Date): string {
    let hoursNumber = dateTime.getHours() - Number(this.config.get('GMT'));
    let hours = (hoursNumber < 10 ? '0' : '') + hoursNumber;
    let minutes = (dateTime.getMinutes() < 10 ? '0' : '') + dateTime.getMinutes();
    return `${hours}:${minutes}`;
  }

  getLocalDateTime(dateTime: Date): string {
    let dateObj = new Date(dateTime);
    let dateString = `${dateObj.getFullYear()}-${
      dateObj.getMonth() + 1
    }-${dateObj.getDate()}`;

    let hours = (dateObj.getHours() < 10 ? '0' : '') + dateObj.getHours();
    let minutes = (dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes();
    let seconds = (dateObj.getSeconds() < 10 ? '0' : '') + dateObj.getSeconds();
    let milliSeconds =
      (dateObj.getMilliseconds() < 10 ? '0' : '') + dateObj.getMilliseconds();

    return `${dateString} ${hours}:${minutes}:${seconds}.${milliSeconds}`;
  }

  getDate(dateTime: Date): string {
    let dateObj = dateTime;

    let year = (dateObj.getFullYear() < 10 ? '0' : '') + dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1 < 10 ? '0' : '') + (dateObj.getMonth() + 1);
    let day = (dateObj.getDate() < 10 ? '0' : '') + dateObj.getDate();

    // return dateTime.locale(I18nContext.current().lang).format('YYYY-MM-DD');
    return `${year}-${month}-${day}`;
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

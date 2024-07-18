import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';
import * as AWS from 'aws-sdk';
import admin from 'firebase-admin';
import { Prisma } from '@prisma/client';
import { GlobalRepository } from './global.repository';
import { GlobalReturnDTO } from './dtos/global-return.dto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

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
    private globalRepository: GlobalRepository,
    private readonly i18n: I18nService,
  ) {}

  // async uploadFile2(file) {
  //   let s3 = new AWS.S3({
  //     accessKeyId: this.config.get('AWS_ACCESS_KEY'),
  //     secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
  //     region: this.config.get('AWS_S3_REGION'),
  //   });

  //   // console.log({ file });

  //   return await this.s3_upload(
  //     s3,
  //     file.buffer,
  //     this.config.get('AWS_S3_BUCKET'),
  //     // originalname + Date.now() + extension,
  //     this.getFileName(file.originalname),
  //     file.mimetype,
  //   );
  // }

  async uploadFile(file) {
    const randomFilename = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

    const s3Client = new S3Client({
      endpoint: 'https://eu2.contabostorage.com', // Replace with your Contabo endpoint if different
      region: 'EU',
      credentials: {
        accessKeyId: 'd1c8c113cea80b7172d90c12d883e935 ', // Replace with your Contabo Access Key ID
        secretAccessKey: '19175090c7a22e49ef1e153766442a09', // Replace with your Contabo Secret Access Key
      },
      forcePathStyle: true,
    });

    ////////////////////////////////////////////////

    let mimetype = file?.mimetype;
    let extension = mimetype.split('/')[1];

    console.log('mimetype: ', mimetype);
    console.log('extension: ', extension);

    if (extension == 'octet-stream') {
      extension = 'jpeg';
      mimetype = 'image/jpeg';
    }

    const fileName = `${randomFilename()}.${extension}`;

    console.log('randomFilename(): ', randomFilename());

    const params: any = {
      Bucket: 'instaplay-bucket',
      Key: fileName,
      Body: file.buffer,
      ContentType: mimetype,
      ACL: 'public-read-write',
    };
    const command = new PutObjectCommand(params);

    const result = await s3Client.send(command);

    const S3link =
      'https://eu2.contabostorage.com/b491275ac598406eae4d8ebad612c09c:instaplay-test';

    console.log('final file name: ', S3link + fileName);

    return { image_url: S3link + fileName };
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

  async getAllAgeGroups(): Promise<GlobalReturnDTO[]> {
    let allAgeGroups = await this.globalRepository.allAgeGroups();

    return allAgeGroups;
  }

  async getAllRegions(): Promise<GlobalReturnDTO[]> {
    let allRegions = await this.globalRepository.allRegions();

    return allRegions;
  }

  async getAllLevels(): Promise<GlobalReturnDTO[]> {
    let allLevels = await this.globalRepository.allLevels();

    return allLevels;
  }

  async getAllGenders(): Promise<GlobalReturnDTO[]> {
    let allGenders = await this.globalRepository.allGenders();

    return allGenders;
  }

  async getAllFeedbacks(): Promise<GlobalReturnDTO[]> {
    let allFeedbacks = await this.globalRepository.allFeedbacks();

    return allFeedbacks;
  }

  async getAllWeekDays(): Promise<GlobalReturnDTO[]> {
    let allWeekDays = await this.globalRepository.allWeekDays();

    return allWeekDays;
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

  getDayName(dayDate: moment.Moment): string {
    return dayDate.format('dddd');
  }

  getDayNameByNumber(number: number): string {
    for (let index = 0; index < this.weekDays.length; index++) {
      if (index == number) {
        return this.weekDays[index];
      }
    }
  }

  async getIdByWeekDayNumber(weekDayNumber: number): Promise<number> {
    let id = await this.globalRepository.getIdByWeekDayNumber(weekDayNumber);
    return id;
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

  getLocalTime12(dateTime: moment.Moment): string {
    return dateTime.format('hh:mm A');
  }

  getLocalTime24(dateTime: moment.Moment): string {
    return dateTime.format('hh:mm:ss');
  }

  getLocalDateTime(dateTime: Date): string {
    return moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
  }

  getZoneTime24(timezone, timeString: string): string {
    let date = moment().format('YYYY-MM-DD');

    return moment(`${date}T${timeString}`).tz(timezone).format('HH:mm');
  }

  getDate(dateTime: moment.Moment): string {
    // return dateTime.locale(I18nContext.current().lang).format('YYYY-MM-DD');
    return dateTime.format('YYYY-MM-DD');
  }

  checkRepeatedDates(datesArray) {
    let datesArrayElements = datesArray.map((i) => moment(i).format('YYYY-MM-DD'));

    return new Set(datesArrayElements).size !== datesArrayElements.length;
  }

  validatePassedDateTime(date: string, time: string) {
    let sessionDate = moment(date).format('YYYY-MM-DD');
    let sessionTime = time;
    let sessionDateTime = moment(`${sessionDate}T${sessionTime}`);

    if (sessionDateTime <= moment()) {
      throw new BadRequestException(
        this.i18n.t(`errors.PASSED_DATE`, {
          lang: I18nContext.current().lang,
        }),
      );
    }
  }

  preparePrismaSql(sql: string): Prisma.Sql {
    return Prisma.sql([sql]);
  }

  safeParse(value) {
    try {
      const parsedValue = JSON.parse(value);
      return parsedValue;
    } catch (error) {
      return value;
    }
  }

  isValidDateFormat(dateString: string, format: string = 'YYYY-MM-DD'): boolean {
    return moment(dateString, format, true).isValid();
  }

  // jsonToKeyValueString(jsonData) {
  //   const keyValuePairs = [];

  //   for (const key in jsonData) {
  //     if (jsonData.hasOwnProperty(key)) {

  //       const value = jsonData[key];
  //       keyValuePairs.push(`${key} = ${JSON.stringify(value)}`);
  //     }
  //   }

  //   return keyValuePairs.join(',');
  // }

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

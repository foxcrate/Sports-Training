import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalService {
  errors = new Map();
  enErrors = new Map();
  arErrors = new Map();

  getError(language, errorCode) {
    this.errors.set('en', this.enErrors);
    this.errors.set('ar', this.arErrors);

    this.enErrors
      .set('REPEATED_EMAIL', 'Email already exist')
      .set('REPEATED_MOBILE_NUMBER', 'Mobile number already exist')
      .set('WRONG_CREDENTIALS', 'Wrong credentials')
      .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
      .set('JWT_ERROR', 'Invalid bearer token')
      .set('UNAUTHORIZED', 'You are not authorized')
      .set('UPLOAD_IMAGE_ERROR', 'Error in uploading image')
      .set('RECORD_NOT_FOUND', 'Record not found')
      .set('ACCOUNT_ALREADY_ACTIVATED', 'Account already activated')
      .set('PROFILE_EXISTED', 'Profile already exist')
      .set('REPEATED_REGION', 'Region already exist')
      .set('REPEATED_SPORT', 'Sport already exist')
      .set('NOT_EXISTED_SPORT', 'Sport not exist')
      .set('SERVER_ERROR', 'Server problem, it will be fixed soon');

    this.arErrors
      .set('REPEATED_EMAIL', 'الإيميل مسجل مسبقا')
      .set('REPEATED_MOBILE_NUMBER', 'رقم الموبيل مسجل مسبقا')
      .set('WRONG_CREDENTIALS', 'معلومات الحساب غير صحيحة')
      .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
      .set('JWT_ERROR', 'Invalid bearer token')
      .set('UNAUTHORIZED', 'أنت لا تملك الصلاحيات الكافية')
      .set('UPLOAD_IMAGE_ERROR', 'خطأ في رفع الصورة')
      .set('ACCOUNT_ALREADY_ACTIVATED', 'الحساب مفعل بالفعل')
      .set('PROFILE_EXISTED', 'الحساب موجود بالفعل')
      .set('REPEATED_REGION', 'المنطقة مسجلة بالفعل')
      .set('REPEATED_SPORT', 'الرياضة مسجلة بالفعل')
      .set('NOT_EXISTED_SPORT', 'هذة الرياضة غير متوفرة')
      .set('SERVER_ERROR', 'حدث مشكلة في السيرفر، سوف تحل قريبا');

    return this.errors.get(language ? language : 'en').get(errorCode);
  }
}

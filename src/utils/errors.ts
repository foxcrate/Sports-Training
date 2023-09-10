let errors = new Map();
let enErrors = new Map();
let arErrors = new Map();

errors.set('en', enErrors);
errors.set('ar', arErrors);

enErrors
  .set('WELCOME', 'Welcome')
  .set('REPEATED_EMAIL', 'Email already exist')
  .set('REPEATED_NAME', 'Name already exist')
  .set('REPEATED_MOBILE_NUMBER', 'Mobile number already exist')
  .set('EMAIL_NOT_FOUND', 'Email not found')
  .set('MOBILE_NUMBER_NOT_FOUND', 'Mobile number not found')
  .set('WRONG_PASSWORD', 'Password not correct')
  .set('MISSING_EMAIL', 'No email is provided')
  .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
  .set('JWT_ERROR', 'Invalid bearer token')
  .set('WRONG_JWT_ERROR', 'wrong bearer token')
  .set('SERVER_ERROR', 'Server problem, will be fixed soon');

arErrors
  .set('WELCOME', 'مرحبا')
  .set('REPEATED_EMAIL', 'الإيميل مسجل مسبقا')
  .set('REPEATED_NAME', 'الإسم مستخدم مسبقا')
  .set('REPEATED_MOBILE_NUMBER', 'رقم الموبيل مسجل مسبقا')
  .set('EMAIL_NOT_FOUND', 'الايميل غير موجود')
  .set('MOBILE_NUMBER_NOT_FOUND', 'رقم الموبيل غير موجود')
  .set('WRONG_PASSWORD', 'كلم المرور غير صحيحة')
  .set('MISSING_EMAIL', 'لا يوجد بريد إلكتورني')
  .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
  .set('JWT_ERROR', 'Invalid bearer token')
  .set('WRONG_JWT_ERROR', 'wrong bearer token')
  .set('SERVER_ERROR', 'حدث مشكلة في السيرفر، سوف تحل قريبا');

export default errors;

/*

Map(2) {
  'en' => Map(12) {
    'WELCOME' => 'Welcome',
    'REPEATED_EMAIL' => 'Email already exist',
    'REPEATED_NAME' => 'Name already exist',
    'REPEATED_MOBILE_NUMBER' => 'Mobile number already exist',
    'EMAIL_NOT_FOUND' => 'Email not found',
    'MOBILE_NUMBER_NOT_FOUND' => 'Mobile number not found',
    'WRONG_PASSWORD' => 'Password not correct',
    'MISSING_EMAIL' => 'No email is provided',
    'NO_BEARER_TOKEN' => 'Authorization Bearer token should be provided',
    'JWT_ERROR' => 'Invalid bearer token',
    'WRONG_JWT_ERROR' => 'wrong bearer token',
    'SERVER_ERROR' => 'Server problem, will be fixed soon'
  },
  'ar' => Map(12) {
    'WELCOME' => 'مرحبا',
    'REPEATED_EMAIL' => 'الإيميل مسجل مسبقا',
    'REPEATED_NAME' => 'الإسم مستخدم مسبقا',
    'REPEATED_MOBILE_NUMBER' => 'رقم الموبيل مسجل مسبقا',
    'EMAIL_NOT_FOUND' => 'الايميل غير موجود',
    'MOBILE_NUMBER_NOT_FOUND' => 'رقم الموبيل غير موجود',
    'WRONG_PASSWORD' => 'كلم المرور غير صحيحة',
    'MISSING_EMAIL' => 'لا يوجد بريد إلكتورني',
    'NO_BEARER_TOKEN' => 'Authorization Bearer token should be provided',
    'JWT_ERROR' => 'Invalid bearer token',
    'WRONG_JWT_ERROR' => 'wrong bearer token',
    'SERVER_ERROR' => 'حدث مشكلة في السيرفر، سوف تحل قريبا'
  }
}


*/

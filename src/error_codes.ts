let errors = new Map();
let enErrors = new Map();
let arErrors = new Map();

errors.set('en', enErrors);
errors.set('ar', arErrors);

enErrors
  .set('WELCOME', 'Welcome')
  .set('REPEATED_EMAIL', 'Email already exist')
  .set('REPEATED_NAME', 'Name already exist')
  .set('PROFILE_EXISTED', 'Profile already exist')
  .set('REPEATED_MOBILE_NUMBER', 'Mobile number already exist')
  .set('REPEATED_REGION', 'This Region already exist')
  .set('REPEATED_SPORT', 'This Sport already exist')
  .set('EMAIL_NOT_FOUND', 'Email not found')
  .set('MOBILE_NUMBER_NOT_FOUND', 'Mobile number not found')
  .set('RECORD_NOT_FOUND', 'Record not found')
  .set('CHILD_ACCOUNT_NOT_EXIST', 'Child account not exist')
  .set('NOT_EXISTED_SPORT', "Sport doesn't exist")
  .set('WRONG_PASSWORD', 'Password not correct')
  .set('WRONG_CREDENTIALS', 'Wrong credentials')
  .set('MISSING_EMAIL', 'No email is provided')
  .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
  .set('JWT_ERROR', 'Invalid bearer token')
  .set('WRONG_JWT_ERROR', 'wrong bearer token')
  .set('ACCOUNT_ALREADY_ACTIVATED', 'The account is already activated')
  .set('UNAUTHENTICATED', 'You are not authenticated')
  .set('UNAUTHORIZED', 'You are not authorized')
  .set('UPLOAD_IMAGE_ERROR', 'Error in uploading image')
  .set('SERVER_ERROR', 'Server problem, it will be fixed soon');

arErrors
  .set('WELCOME', 'مرحبا')
  .set('REPEATED_EMAIL', 'الإيميل مسجل مسبقا')
  .set('REPEATED_NAME', 'الإسم مستخدم مسبقا')
  .set('PROFILE_EXISTED', 'الحساب مسجل بالفعل')
  .set('REPEATED_MOBILE_NUMBER', 'رقم الموبيل مسجل مسبقا')
  .set('REPEATED_REGION', 'هذة المنطقة مسجلة مسبقا')
  .set('REPEATED_SPORT', 'هذة الرياضة مسجلة مسبقا')
  .set('EMAIL_NOT_FOUND', 'الايميل غير موجود')
  .set('MOBILE_NUMBER_NOT_FOUND', 'رقم الموبيل غير موجود')
  .set('RECORD_NOT_FOUND', 'هذا التسجيل غير موجود')
  .set('CHILD_ACCOUNT_NOT_EXIST', 'حساب الطفل ليس موجود')
  .set('NOT_EXISTED_SPORT', 'رياضة غير موجودة')
  .set('WRONG_PASSWORD', 'كلمة المرور غير صحيحة')
  .set('WRONG_CREDENTIALS', 'معلومات الحساب غير صحيحة')
  .set('MISSING_EMAIL', 'لا يوجد بريد إلكتورني')
  .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
  .set('JWT_ERROR', 'Invalid bearer token')
  .set('WRONG_JWT_ERROR', 'wrong bearer token')
  .set('ACCOUNT_ALREADY_ACTIVATED', 'تم تفعيل الحساب بالفعل')
  .set('UNAUTHORIZED', 'أنت لا تملك الصلاحيات الكافية')
  .set('UPLOAD_IMAGE_ERROR', 'خطأ في رفع الصورة')
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

let errors = new Map();
let enErrors = new Map();
let arErrors = new Map();

errors.set('en', enErrors);
errors.set('ar', arErrors);

enErrors
  .set('REPEATED_EMAIL', 'Email already exist')
  .set('REPEATED_MOBILE_NUMBER', 'Mobile number already exist')
  .set('WRONG_CREDENTIALS', 'Wrong credentials')
  .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
  .set('JWT_ERROR', 'Invalid bearer token')
  .set('UNAUTHORIZED', 'You are not authorized')
  .set('SERVER_ERROR', 'Server problem, will be fixed soon');
// .set('WELCOME', 'Welcome')
// .set('REPEATED_NAME', 'Name already exist')
// .set('EMAIL_NOT_FOUND', 'Email not found')
// .set('MOBILE_NUMBER_NOT_FOUND', 'Mobile number not found')
// .set('CHILD_ACCOUNT_NOT_EXIST', 'Child account not exist')
// .set('WRONG_PASSWORD', 'Password not correct')
// .set('MISSING_EMAIL', 'No email is provided')
// .set('WRONG_JWT_ERROR', 'wrong bearer token')
// .set('ACCOUNT_ALREADY_ACTIVATED', 'The account is already activated')
// .set('UNAUTHENTICATED', 'You are not authenticated')

arErrors
  .set('REPEATED_EMAIL', 'الإيميل مسجل مسبقا')
  .set('REPEATED_MOBILE_NUMBER', 'رقم الموبيل مسجل مسبقا')
  .set('WRONG_CREDENTIALS', 'معلومات الحساب غير صحيحة')
  .set('NO_BEARER_TOKEN', 'Authorization Bearer token should be provided')
  .set('JWT_ERROR', 'Invalid bearer token')
  .set('UNAUTHORIZED', 'أنت لا تملك الصلاحيات الكافية')
  .set('SERVER_ERROR', 'حدث مشكلة في السيرفر، سوف تحل قريبا');
// .set('WELCOME', 'مرحبا')
// .set('REPEATED_NAME', 'الإسم مستخدم مسبقا')
// .set('EMAIL_NOT_FOUND', 'الايميل غير موجود')
// .set('MOBILE_NUMBER_NOT_FOUND', 'رقم الموبيل غير موجود')
// .set('CHILD_ACCOUNT_NOT_EXIST', 'حساب الطفل ليس موجود')
// .set('WRONG_PASSWORD', 'كلم المرور غير صحيحة')
// .set('MISSING_EMAIL', 'لا يوجد بريد إلكتورني')
// .set('WRONG_JWT_ERROR', 'wrong bearer token')
// .set('ACCOUNT_ALREADY_ACTIVATED', 'تم تفعيل الحساب بالفعل')
// .set('UNAUTHENTICATED', 'You are not authenticated')

export default errors;

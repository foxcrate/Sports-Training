export class FacebookReturnDataSerializer {
  static serialize(data) {
    return {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      profilePicture: data.picture.data.url,
    };
  }
}

export class AppleReturnDataSerializer {
  static serialize(data) {
    return {
      name: data.name,
      email: data.email,
    };
  }
}

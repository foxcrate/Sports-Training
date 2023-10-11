export interface IAuthToken {
  id: number;
  authType: string;
  tokenType: 'normal' | 'refresh';
}

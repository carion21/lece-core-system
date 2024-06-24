export class Consts {
  static APP_NAME: string = 'LECE-CORE-SYSTEM';
  static APP_VERSION: string = '1.0.0';
  static APP_DESCRIPTION: string = 'LECE Core System';
  static PORT_SYSTEM: number = 3535;

  static DEFAULT_MSG_UNAUTHORIZED: string =
    'You do not have permission to perform this operation';

  static ROOT_PROFILE: string = 'root';
  static ADMIN_PROFILE: string = 'admin';

  static DEFAULT_PROFILES: object[] = [
    {
      label: 'Root',
      value: 'root',
    },
    {
      label: 'Admin',
      value: 'admin',
    },
  ];

  static DEFAULT_USERS: any[] = [
    {
      lastname: 'root',
      firstname: 'lece',
      email: 'root@lece.com',
      phone: '00000000',
      username: 'root@lece.com',
      // password: '',
    },
    {
      lastname: 'admin',
      firstname: 'lece',
      email: 'admin@lece.com',
      phone: '00000000',
      username: 'admin@lece.com',
      // password: '',
    },
  ];
}

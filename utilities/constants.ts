export class Consts {
  static APP_NAME: string = 'LECE-CORE-SYSTEM';
  static APP_VERSION: string = '1.0.0';
  static APP_DESCRIPTION: string = 'LECE Core System';
  static PORT_SYSTEM: number = 3535;

  static DEFAULT_MSG_UNAUTHORIZED: string =
    'You do not have permission to perform this operation';

  // IN DAYS
  static DEFAULT_DURATION: number = 1;

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
      phone: '00000000'
      // password: '',
    },
    {
      lastname: 'admin',
      firstname: 'lece',
      email: 'admin@lece.com',
      phone: '00000000'
      // password: '',
    },
  ];

  static ROLES: object = {
    root: [
      'change_password',
      'admin_create',
      'admin_update',
      'admin_find_all',
      'admin_find_one',
      'admin_change_status',
      'stat_find_all'
    ],
    admin: [
      'stat_find_all',
      'admin_find_one',
      'author_create',
      'author_update',
      'author_find_all',
      'author_find_one',
      'author_change_status',
      'genre_create',
      'genre_update',
      'genre_find_all',
      'genre_find_one',
      'genre_change_status',
      'book_create',
      'book_update',
      'book_find_all',
      'book_find_one',
      'book_change_status',
      'subscriber_find_all',
      'subscriber_find_one',
      'message_find_all',
      'message_find_one',
      'message_read_one',
      'book_submission_find_all',
      'book_submission_find_one',
      'book_submission_view_one',
    ]
  };
}

import * as randomstring from 'randomstring';
import * as moment from 'moment';
import { Consts } from './constants';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as slug from 'slug';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

const generateUuid = () => {
  return uuidv4();
};

const getSlug = (text: string) => {
  return slug(text, {
    lower: true,
    locale: 'fr',
  });
};

const generateNumberCodeSpecial = () => {
  return randomstring.generate({
    length: 4,
    charset: '1234567890',
  });
};

const generatePassword = () => {
  return randomstring.generate({
    length: 8,
    // charset: 'alphanumeric',
    charset: 'alphanumeric',
  });
};

const generateCode = (keyword: string) => {
  const now = moment();
  const suffix =
    now.format('YYMMDDHH_mmss').substring(2) +
    '_' +
    generateNumberCodeSpecial();
  return keyword + '' + suffix;
};

const genProfileCode = () => {
  return generateCode('PRF');
};

const genUserCode = () => {
  return generateCode('USR');
};

const genAuthorCode = () => {
  return generateCode('AUT');
}

const genBookCode = () => {
  return generateCode('BOK');
}

const genGenreCode = () => {
  return generateCode('GEN');
}

const genNewsletterCode = () => {
  return generateCode('NWS');
}

const genSubscriberCode = () => {
  return generateCode('SUB');
}

const genMessageCode = () => {
  return generateCode('MSG');
}

const applyRbac = (userAuthenticated: object, permission: string) => {
  if (
    Consts.ROLES[userAuthenticated['profile']['value']].indexOf(permission) ===
    -1
  ) {
    throw new UnauthorizedException(Consts.DEFAULT_MSG_UNAUTHORIZED);
  }
};

const getUiAvatar = (user: object) => {
  const configService = new ConfigService();
  let uname = user['lastname'] + ' ' + user['firstname'];
  // get all words and concatenate with +
  uname = uname.replace(/\s/g, '+');
  return (
    configService.get('UI_AVATAR_URL') + uname + '&background=ff8000&color=fff'
  );
};



export {
  generateUuid,
  getSlug,
  generatePassword,
  genProfileCode,
  genUserCode,
  genAuthorCode,
  genBookCode,
  genGenreCode,
  genNewsletterCode,
  genSubscriberCode,
  genMessageCode,
  applyRbac,
  getUiAvatar,
};

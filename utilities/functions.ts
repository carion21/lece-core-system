import * as randomstring from 'randomstring';
import * as moment from 'moment';
import { Consts } from './constants';
import axios from 'axios';
import * as slug from 'slug';

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

const genContactCode = () => {
  return generateCode('CON');
}


export {
  getSlug,
  generatePassword,
  genProfileCode,
  genUserCode,
  genAuthorCode,
  genBookCode,
  genGenreCode,
  genNewsletterCode,
  genContactCode,
};

const errors = {
  general: {
    defaultSettingNotFound: {
      status: 400,
      code: 'setting_not_found',
      message: 'Default settings not found'
    },
    notFound: {
      status: 404,
      code: 'not_found',
      message: 'Not found'
    },
    internal_server: {
      status: 500,
      code: 'internal_server',
      message: 'Internal server error'
    },
    contactSupport: {
      status: 400,
      code: 'contact_support',
      message: 'Contact support'
    },
    invalidRequest: {
      status: 400,
      code: 'invalid_request',
      message: 'Invalid request parameters'
    },
    emailNotFound: {
      status: 404,
      code: 'email_not_found',
      message: 'Email not found'
    }
  },
  authorization: {
    unauthorized: {
      status: 401,
      code: 'unauthorized',
      message: 'Trying to access unauthorized resource'
    },
    invalideCredentials: {
      status: 401,
      code: 'invalid_credentials',
      message: 'Invalide credentials'
    }
  },
  user: {
    invalideCredentials: {
      status: 401,
      code: 'invalid_credentials',
      message: 'Wrong username or password'
    },
    deleted: {
      status: 400,
      code: 'user_deleted',
      message: 'User is deleted'
    },
    userNotExist: {
      status: 400,
      code: 'user_not_exist',
      message: 'User is not exist'
    },
    userExist: {
      status: 400,
      code: 'user_exist',
      message: 'User is already exist'
    },
    verificationPending: {
      status: 401,
      code: 'email_verification_pending',
      message: 'Email verification pending'
    },
    emailAlreadyExist: {
      status: 400,
      code: 'email_exist',
      message: 'Email address is already exist'
    },
    phoneAlreadyExist: {
      status: 400,
      code: 'phone_exist',
      message: 'Phone number is already exist'
    },
    wrongPassword: {
      status: 400,
      code: 'invalid_credentials',
      message: 'Wrong password'
    },
    newPasswordWrong: {
      status: 400,
      code: 'invalid_credentials',
      message: 'New password should not same as old'
    }
  },
  repoAccess: {
    alreadyAccessGiven: {
      status: 400,
      code: 'invalid_credentials',
      message: 'You already gave permission to this account'
    },
    blockAccount: {
      status: 400,
      code: 'invalid_credentials',
      message: 'You have blocked this account for this repository'
    }
  },
  dataset: {
    alreadyExists: {
      status: 400,
      code: 'already_exists',
      message: 'Already exists'
    },
    notAdded: {
      status: 404,
      code: 'not_added',
      message: 'Something went wrong while adding files'
    },
    invalidFileType: {
      status: 400,
      code: 'invalid_file_type',
      message: 'Invalid file type'
    }
  },
  accessLevel: {
    alreadyAccessGiven: {
      status: 400,
      code: 'invalid_credentials',
      message: 'You already gave permission to this account'
    },
    blockAccount: {
      status: 400,
      code: 'invalid_credentials',
      message: 'You have blocked this account for this repository'
    }
  }
}

const modelCategories = {
  image: [
    'alcohol',
    'kid',
    'marijuana',
    'morbid',
    'narcotics',
    'naughty',
    'none',
    'porn',
    'prescription',
    'sexy',
    'tobacco',
    'weapon'
  ],
  text: [
    'animal-abuse',
    'child-abuse',
    'dehumanization',
    'drugs',
    'explicit',
    'racism',
    'self-harm',
    'sex discrimination-homophobia',
    'sexism',
    'sexual-harassment',
    'sexually-explicit',
    'suicide',
    'violence'
  ]
}


const users = [
  {
    isSeed: true,
    firstName: 'aaaa',
    lastName: 'aaaa',
    userType: 'INDIVIDUAL',
    userName: 'aaaa',
    email: 'aaaa@virtuousai.com',
    password: 'Yp6#ZW2L',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'bbbb',
    lastName: 'bbbb',
    userType: 'INDIVIDUAL',
    userName: 'bbbb',
    email: 'bbbb@virtuousai.com',
    password: 'k48t2!US',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'cccc',
    lastName: 'cccc',
    userType: 'INDIVIDUAL',
    userName: 'cccc',
    email: 'cccc@virtuousai.com',
    password: 'Y!jQE6!4',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'dddd',
    lastName: 'dddd',
    userType: 'INDIVIDUAL',
    userName: 'dddd',
    email: 'dddd@virtuousai.com',
    password: '@hJ8DdC2',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'eeee',
    lastName: 'eeee',
    userType: 'INDIVIDUAL',
    userName: 'eeee',
    email: 'eeee@virtuousai.com',
    password: '!q@y1oGD',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'ffff',
    lastName: 'ffff',
    userType: 'INDIVIDUAL',
    userName: 'ffff',
    email: 'ffff@virtuousai.com',
    password: 'J@K%1HFe',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'gggg',
    lastName: 'gggg',
    userType: 'INDIVIDUAL',
    userName: 'gggg',
    email: 'gggg@virtuousai.com',
    password: 'MJu5l4@Q',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'hhhh',
    lastName: 'hhhh',
    userType: 'INDIVIDUAL',
    userName: 'hhhh',
    email: 'hhhh@virtuousai.com',
    password: 'InQ%10KE',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'iiii',
    lastName: 'iiii',
    userType: 'INDIVIDUAL',
    userName: 'iiii',
    email: 'iiii@virtuousai.com',
    password: '9@ZNb%o4',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'jjjj',
    lastName: 'jjjj',
    userType: 'INDIVIDUAL',
    userName: 'jjjj',
    email: 'jjjj@virtuousai.com',
    password: 'y1dN#1uk',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'kkkk',
    lastName: 'kkkk',
    userType: 'INDIVIDUAL',
    userName: 'kkkk',
    email: 'kkkk@virtuousai.com',
    password: '4hT5B@qr',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'llll',
    lastName: 'llll',
    userType: 'INDIVIDUAL',
    userName: 'llll',
    email: 'llll@virtuousai.com',
    password: '09i7Y@I0',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'mmmm',
    lastName: 'mmmm',
    userType: 'INDIVIDUAL',
    userName: 'mmmm',
    email: 'mmmm@virtuousai.com',
    password: 'IL1w#Us9',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'nnnn',
    lastName: 'nnnn',
    userType: 'INDIVIDUAL',
    userName: 'nnnn',
    email: 'nnnn@virtuousai.com',
    password: 'WmxpI%!3',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'oooo',
    lastName: 'oooo',
    userType: 'INDIVIDUAL',
    userName: 'oooo',
    email: 'oooo@virtuousai.com',
    password: 'UVz8#4mg',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'pppp',
    lastName: 'pppp',
    userType: 'INDIVIDUAL',
    userName: 'pppp',
    email: 'pppp@virtuousai.com',
    password: '5@Q!SkJd',
    emailVerified: true,

  },
  {
    isSeed: true,
    firstName: 'qqqq',
    lastName: 'qqqq',
    userType: 'INDIVIDUAL',
    userName: 'qqqq',
    email: 'qqqq@virtuousai.com',
    password: 'i60#RzA$',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'rrrr',
    lastName: 'rrrr',
    userType: 'INDIVIDUAL',
    userName: 'rrrr',
    email: 'rrrr@virtuousai.com',
    password: 'oq@J60F6',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'ssss',
    lastName: 'ssss',
    userType: 'INDIVIDUAL',
    userName: 'ssss',
    email: 'ssss@virtuousai.com',
    password: 'W!B6Tk%x',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'tttt',
    lastName: 'tttt',
    userType: 'INDIVIDUAL',
    userName: 'tttt',
    email: 'tttt@virtuousai.com',
    password: 'b1@bL7DL',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'uuuu',
    lastName: 'uuuu',
    userType: 'INDIVIDUAL',
    userName: 'uuuu',
    email: 'uuuu@virtuousai.com',
    password: 'rQG49@Ep',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'vvvv',
    lastName: 'vvvv',
    userType: 'INDIVIDUAL',
    userName: 'vvvv',
    email: 'vvvv@virtuousai.com',
    password: '$Vq6N1Nn',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'wwww',
    lastName: 'wwww',
    userType: 'INDIVIDUAL',
    userName: 'wwww',
    email: 'wwww@virtuousai.com',
    password: 'zH6@QQ9m',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'xxxx',
    lastName: 'xxxx',
    userType: 'INDIVIDUAL',
    userName: 'xxxx',
    email: 'xxxx@virtuousai.com',
    password: '9X53I%hi',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'yyyy',
    lastName: 'yyyy',
    userType: 'INDIVIDUAL',
    userName: 'yyyy',
    email: 'yyyy@virtuousai.com',
    password: 'W5BsI@U0',
    emailVerified: true,
  },
  {
    isSeed: true,
    firstName: 'zzzz',
    lastName: 'zzzz',
    userType: 'INDIVIDUAL',
    userName: 'zzzz',
    email: 'zzzz@virtuousai.com',
    password: 'R7oY4!PV',
    emailVerified: true,
  }
]
module.exports = {
  errors,
  modelCategories,
  users
}

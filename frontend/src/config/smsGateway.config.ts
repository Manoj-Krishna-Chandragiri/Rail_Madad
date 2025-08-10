export const SMS_GATEWAY_CONFIG = {
  LOCAL: {
    url: '/sms',
    token: '0829198d-ca2f-4b3f-9e5a-00ea8c2c88ce'
  },
  CLOUD: {
    url: '/sms',
    token: 'cZeanvbdQy-Jk4Qyq1S3p7:APA91bGiRWrgXObyzGGPNJsy5UmB6SARhv7NtWovplGYNCZFrF_cB52PdKH-GJITgK5unzvHQPblFYxHbq4Ze4ZNhUq0v3wWZqoJ_fsE3AAWC9oqd7_cJck'
  },
  // Let the backend handle which service to use
  ACTIVE_SERVICE: 'LOCAL'
} as const;

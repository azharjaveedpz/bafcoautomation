export const loginData = {
  booking: {
    valid: {
      username: process.env.BOOKING_USERNAME!,
      password: process.env.BOOKING_PASSWORD!
    },
    invalid: {
      username: 'wrong@test.com',
      password: 'wrong123'
    }
  },
  export: {
    username: process.env.EXPORT_USERNAME!,
    password: process.env.EXPORT_PASSWORD!
  },
  sf: {
    username: process.env.SF_USERNAME!,
    password: process.env.SF_PASSWORD!
  }
};

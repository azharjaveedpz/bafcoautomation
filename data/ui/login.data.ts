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
  si: {
    username: process.env.SI_USERNAME!,
    password: process.env.SI_PASSWORD!
  }
};

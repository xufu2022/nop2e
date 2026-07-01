import { faker } from '@faker-js/faker';

export const fakeUser = () => ({
  firstName: faker.person.firstName(),
  lastName:  faker.person.lastName(),
  email:     faker.internet.email({ provider: `${Date.now()}.test` }),
  password:  'Password123!',
});

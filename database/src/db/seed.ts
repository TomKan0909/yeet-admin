import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { transaction } from './db';

dotenv.config();

async function seedDatabase() {
  await transaction(async (client) => {
    // Generate and insert fake users
    const numUsers = 50;
    const users = [];

    for (let i = 0; i < numUsers; i++) {
      const user = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        balance: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
      };

      const result = await client.query(
        'INSERT INTO users (username, email, balance) VALUES ($1, $2, $3) RETURNING id',
        [user.username, user.email, user.balance]
      );

      users.push({ ...user, id: result.rows[0].id });
    }

    // Generate and insert fake transactions
    const numTransactions = 200;
    const transactionTypes = ['credit', 'debit'] as const;

    for (let i = 0; i < numTransactions; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = faker.number.float({
        min: 1,
        max: 1000,
        fractionDigits: 2,
      });
      const description = faker.finance.transactionDescription();

      await client.query(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [user.id, type, amount, description]
      );
    }
  });

  console.log('Database seeded successfully!');
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

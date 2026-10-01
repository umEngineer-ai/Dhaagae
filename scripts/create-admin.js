#!/usr/bin/env node
/**
 * DHAAGAÉ — Secure Admin Setup Script
 *
 * Creates the initial admin account without hardcoding passwords.
 * Run once after database migration.
 *
 * Usage:
 *   ADMIN_EMAIL="your@email.com" ADMIN_PASSWORD="StrongPass123!" ADMIN_NAME="Admin Name" node scripts/create-admin.js
 *
 * Or interactively:
 *   node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n🌸 DHAAGAÉ — Admin Account Setup\n');

  // Read from env vars first, then fall back to interactive prompts
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  let name = process.env.ADMIN_NAME;

  if (!email) {
    email = await prompt('Admin email: ');
  }
  if (!name) {
    name = await prompt('Admin full name: ');
  }
  if (!password) {
    password = await prompt('Admin password (min 8 chars): ');
  }

  // Validate inputs
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address.');
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }
  if (!name || name.trim().length < 2) {
    console.error('❌ Name must be at least 2 characters.');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, role: true },
  });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log(`⚠️  Admin account already exists for ${normalizedEmail}. No changes made.`);
      process.exit(0);
    }

    // Upgrade existing customer to admin
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Upgraded ${normalizedEmail} to ADMIN role.`);
    process.exit(0);
  }

  // Create new admin
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const admin = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'DHAAGAÉ Platform Administrator',
        },
      },
    },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('\n✅ Admin account created successfully!');
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log('\n⚠️  Keep your admin credentials secure. Never commit them to version control.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error creating admin:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

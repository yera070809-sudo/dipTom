require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@imhere.com' },
        update: {},
        create: {
            email: 'admin@imhere.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    });

    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@imhere.com' },
        update: {},
        create: {
            email: 'teacher@imhere.com',
            name: 'John Teacher',
            password: teacherPassword,
            role: 'TEACHER',
        },
    });

    const group = await prisma.group.upsert({
        where: { name: 'CS-2025' },
        update: {},
        create: {
            name: 'CS-2025',
        },
    });

    const subject = await prisma.subject.upsert({
        where: { code: 'CS101' },
        update: {},
        create: {
            name: 'Introduction to Computer Science',
            code: 'CS101',
            teachers: {
                connect: { id: teacher.id },
            },
        },
    });

    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@imhere.com' },
        update: {},
        create: {
            email: 'student@imhere.com',
            name: 'Alex Student',
            password: studentPassword,
            role: 'STUDENT',
            groupId: group.id,
        },
    });

    console.log({ admin, teacher, student, group, subject });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

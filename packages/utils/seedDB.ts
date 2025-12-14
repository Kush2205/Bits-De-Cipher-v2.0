import prisma from "@repo/db/client";
import bcrypt from 'bcrypt';

const seedQuestions = async () => {
    const questions = [
        {
            index: 0,
            text: "What is the capital of France?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731225/ckyvduhbhbsom7ocn82m.png",
            correctAnswer: "paris",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "It's known as the City of Light",
            hint2Text: "The Eiffel Tower is located here",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 1,
            text: "What is 2 + 2?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731262/wop4q4uo4aryltrza7el.png",
            correctAnswer: "4",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "It's less than 5",
            hint2Text: "It's an even number",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 2,
            text: "Who wrote 'Romeo and Juliet'?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1743691566/frzu0n52xnwjqbznrgaj.png",
            correctAnswer: "shakespeare",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "Famous English playwright",
            hint2Text: "Also wrote Hamlet",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 3,
            text: "What is the largest planet?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731206/eywkdxvxereghq3khw7z.png",
            correctAnswer: "jupiter",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "It's a gas giant",
            hint2Text: "Named after a Roman god",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 4,
            text: "What color is the sky?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731254/pz7klab0ga5akrnpcpf2.png",
            correctAnswer: "blue",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "Same color as the ocean",
            hint2Text: "It's a primary color",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 5,
            text: "How many continents are there?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731193/z7qucc49zmxpyxanqbms.png",
            correctAnswer: "7",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "More than 5, less than 10",
            hint2Text: "It's a lucky number",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 6,
            text: "What is the speed of light?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731253/cgqlgfbi60lmijqhmdrj.png",
            correctAnswer: "299792458",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "Approximately 300 million m/s",
            hint2Text: "Often represented as 'c' in equations",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 7,
            text: "What year did World War II end?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731198/tuwlg01cupaj1qakmd9y.png",
            correctAnswer: "1945",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "Mid 1940s",
            hint2Text: "Five years before 1950",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 8,
            text: "What is the smallest prime number?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731212/iqhykaljul1y37i4xk56.png",
            correctAnswer: "2",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "It's the only even prime",
            hint2Text: "Less than 3",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        },
        {
            index: 9,
            text: "What is H2O?",
            imageUrl: "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731216/oamepxa9507ppsdpru3c.png",
            correctAnswer: "water",
            originalPoints: 100,
            currentPoints: 100,
            minPoints: 20,
            decayPercent: 0.03,
            hint1Text: "Essential for life",
            hint2Text: "You drink it every day",
            hint1Penalty: 0.1375,
            hint2Penalty: 0.284,
            hint1UnlockSec: 30,
            hint2UnlockSec: 60
        }
    ];

    console.log("Seeding questions...");
    for (const question of questions) {
        await prisma.question.upsert({
            where: { index: question.index },
            update: question,
            create: question
        });
    }
    console.log(` Created/Updated ${questions.length} questions`);
}

const seedUsers = async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    console.log("Seeding users...");
    for (let i = 1; i <= 10; i++) {
        await prisma.user.upsert({
            where: { email: `user${i}@example.com` },
            update: {},
            create: {
                name: `User ${i}`,
                email: `user${i}@example.com`,
                passwordHash: hashedPassword,
            }
        });
    }
    console.log(" Created/Updated 10 users");
}

const seedDB = async () => {
    console.log("Seeding database...");
    await seedQuestions();
    await seedUsers();
    console.log("Database seeded successfully.");
}

seedDB().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});

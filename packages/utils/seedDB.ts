import prisma from "@repo/db/client";
import bcrypt from 'bcrypt';

const clearDatabase = async () => {
    console.log("Clearing existing data...");
    
    await prisma.userQuestionAnswer.deleteMany({});
    await prisma.userHintsData.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.hint.deleteMany({});
    await prisma.question.deleteMany({});
    console.log("Database cleared.");
}

const seedQuestions = async () => {
    const imgUrl = [
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731225/ckyvduhbhbsom7ocn82m.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731262/wop4q4uo4aryltrza7el.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1743691566/frzu0n52xnwjqbznrgaj.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731206/eywkdxvxereghq3khw7z.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731254/pz7klab0ga5akrnpcpf2.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731193/z7qucc49zmxpyxanqbms.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731253/cgqlgfbi60lmijqhmdrj.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731198/tuwlg01cupaj1qakmd9y.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731212/iqhykaljul1y37i4xk56.png",
        "https://res.cloudinary.com/dmhd5ujgw/image/upload/v1739731216/oamepxa9507ppsdpru3c.png"
    ];

    console.log("Seeding questions...");
    
    
    for (let index = 0; index < imgUrl.length; index++) {
        await prisma.question.create({
            data: {
                name: `Question ${index + 1}`,
                imageUrl: imgUrl[index],
                points: 500,
                maxPoints: 500,
                hints: {
                    create: [
                        {
                            hintText: `This is hint 1 for question ${index + 1}`,
                            name: `Hint 1`
                        },
                        {
                            hintText: `This is hint 2 for question ${index + 1}`,
                            name: `Hint 2`
                        }
                    ]
                }
            }
        });
    }
    console.log(`Created ${imgUrl.length} questions with hints.`);
}

const seedUsers = async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const questions = await prisma.question.findMany();
    console.log("Seeding users...");
    
    for (let i = 1; i <= 10; i++) {
        await prisma.user.create({
            data: {
                email: `user${i}@example.com`,
                name: `User ${i}`,
                passwordHash: hashedPassword,
                hintsData: {
                    createMany: {
                        data: questions.map(q => ({
                            questionId: q.id
                        }))
                    }
                }
            }
        });
    }
    console.log("Created 10 users");
}

const seedDB = async () => {
    console.log("Starting database seeding...");
    await clearDatabase();
    await seedQuestions();
    await seedUsers();
    console.log("Database seeded successfully!");
}

seedDB().catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
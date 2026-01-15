import dotenv from "dotenv";
dotenv.config();
console.log(process.env.DATABASE_URL); 
import prisma from "@repo/db/client";
import bcrypt from 'bcrypt';

// const clearDatabase = async () => {
//     console.log("Clearing existing data...");
    
//     await prisma.userQuestionAnswer.deleteMany({});
//     await prisma.userHintsData.deleteMany({});
//     await prisma.user.deleteMany({});
//     await prisma.hint.deleteMany({});
//     await prisma.question.deleteMany({});
//     console.log("Database cleared.");
// }

const seedQuestions = async () => {
    const imgUrl = [
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501915/question-1_i0okas.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501924/question-2_bmu4qx.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501040/Screenshot_272_gxqaml.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501073/Screenshot_275_mydqkp.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768500966/Screenshot_266_xi51zs.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768500817/Screenshot_263_nqtetb.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768500957/Screenshot_265_eksjag.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501053/Screenshot_273_dxh2v8.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768500991/Screenshot_268_e1tqqg.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501016/Screenshot_270_vq9ttk.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501029/Screenshot_271_gteh0d.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501005/Screenshot_269_btzrra.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768500877/Screenshot_264_jphsf8.png",
        "https://res.cloudinary.com/drfwbriwh/image/upload/v1768501063/Screenshot_274_oqjgcy.png",
    ];


    console.log("Seeding questions...");
    
    const hints = [
        [
            { number: 1, hintText: "Hint 1 for question 1" },
            { number: 2, hintText: "Hint 2 for question 1" }
        ],
        [
            { number: 1, hintText: "Hint 1 for question 2" },
            { number: 2, hintText: "Hint 2 for question 2" }
        ],
        [
            { number: 1, hintText: "Water flows from top of pyramid" },
            { number: 2, hintText: "Also a reptile" }
        ],
        [
            { number: 1, hintText: "MA211" },
            { number: 2, hintText: "Multiply Matrix" }
        ],
        [
            { number: 1, hintText: "Look beyond movement and perspective to what fix direction" },
            { number: 2, hintText: "Light obeys a rule older than maps or camera" }
        ],
        [
            { number: 1, hintText: "Language of spies" },
            { number: 2, hintText: "Replace '/' with spaces" }
        ],
        [
            { number: 1, hintText: "Order emerges when chaos is given shape" },
            { number: 2, hintText: "Height matters more than direction" }
        ],
        [
            { number: 1, hintText: "120 is 5!" },
            { number: 2, hintText: "A week has 5 days" }
        ],
        [
            { number: 1, hintText: "A-10 , F-15" },
            { number: 2, hintText: "Base 16" }
        ],
        [
            { number: 1, hintText: "Co-ordinates" },
            { number: 2, hintText: "Factory" }
        ],
        [
            { number: 1, hintText: "Split in pairs and reduce" },
            { number: 2, hintText: "75 = L" }
        ],
        [
            { number: 1, hintText: "Look from a diff dimension" },
            { number: 2, hintText: "Mirror the images" }
        ],
        [
            { number: 1, hintText: "Before the heist, all control lives in silence" },
            { number: 2, hintText: "Lester's planning ground matters only before action" }
        ],
        [
            { number: 1, hintText: "Before the heist, all control lives in silence" },
            { number: 2, hintText: "Lester's planning ground matters only before action" }
        ],
        [
            { number: 1, hintText: "Hint 15-1" },
            { number: 2, hintText: "Hint 15-2" }
        ]
    ];

    const points : number[] = [300, 300, 500, 500, 600, 700, 800, 1000, 1200, 1400 , 1600 , 1800, 2200,2500];

    const correctAnswers = [
        "ANSWER_1",
        "ANSWER_2",
        "python",
        "shreya upadhyay",
        "longitude",
        "harish hirani",
        "rgipt",
        "friday",
        "charles Babbage",
        "kota",
        "folder",
        "sinner and saint",
        "darnell bros garment factory",
        " "
    ];


    
    
    for (let index = 0; index < imgUrl.length; index++) {
        await prisma.question.create({
            data: {
                name: `Question ${index + 1}`,
                imageUrl: imgUrl[index],
                points: points[index]!,
                correctAnswer: correctAnswers[index]!.toLowerCase(),
                maxPoints: points[index]!,
                hints: {
                    create: [
                        {
                            hintText: hints[index]![0]!.hintText,
                            number: 1
                        },
                        {
                            hintText: hints[index]![1]!.hintText,
                            number: 2
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
    //await clearDatabase();
    await seedQuestions();
    //await seedUsers();
    console.log("Database seeded successfully!");
}

seedDB().catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
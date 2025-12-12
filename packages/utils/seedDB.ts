import prisma from "@repo/db/client";


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

    imgUrl.forEach(async (url, index) => {
        await prisma.question.create({
            data: {
                id : index + 1,
                name: `Question ${index + 1}`,
                imageUrl: url,
                points: 500,
                maxPoints: 500,
            }
        })
    })

}

const seedUsers = async () => {
    for (let i = 1; i <= 100; i++) {
        await prisma.user.create({
            data: {
                name: `User ${i + 1}`,
                email: `user ${i + 1}@gmail.com`,
                password: `password${i + 1}`,
                role: "USER",
            }
        })
    }

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


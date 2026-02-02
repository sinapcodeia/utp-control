
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const compliance = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                acceptedTerms: true,
                acceptedAt: true,
            },
        });
        console.log("Compliance data fetched successfully");
        console.log(compliance.length, "users found");
    } catch (e: any) {
        console.error("ERROR FETCHING COMPLIANCE:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

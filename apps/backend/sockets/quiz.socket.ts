import { Server, Socket } from "socket.io";
import HTTPServer from "http";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware";
import * as quizService from "../services/quiz.service";

class QuizSocket {

    public io: Server;
    private jwtSecret: string = process.env.JWT_SECRET || "secret";
    private userId: string | null = null;

    constructor(server: HTTPServer.Server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        this.io.use((socket, next) => socketAuthMiddleware(socket, next));

    }

    public initializeSockets() {
        this.io.on("connection", (socket) => {
            console.log(`New client connected: ${socket.id}`);
            this.userId = socket.data.userId;

            socket.on("joinQuiz", async () => {
                const userStats = await quizService.getUserStats(this.userId!);
                if (!userStats) {
                    socket.emit("error", { message: "User not found" });
                    return;
                }
                this.sendInitialData(socket, userStats);
            });

            

        })
    }

    private async sendInitialData(socket: Socket, userStats: any) {
        const { currentQuestionIndex, totalPoints } = userStats;
        const currQuestionData = quizService.getQuestionByIndex(currentQuestionIndex);
            //@ts-ignore
        const leaderBoardData = await quizService.getTopLeaderboard();
        socket.emit("initialData", {
            currentQuestion: currQuestionData,
            currUserPoints: totalPoints,
            leaderBoardData: leaderBoardData,
        });

    }

    private async fetchAndEmitLeaderboardData(socket: Socket) {
        //@ts-ignore
        const leaderBoardData = await quizService.getTopLeaderboard();
        socket.emit("leaderboardData", leaderBoardData);
    }

    private async parseQuestionPoints(questionData: any , userId: string) {
        if (!questionData) return 0;
    }
    

}    
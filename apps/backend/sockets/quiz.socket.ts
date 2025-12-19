import { Server, Socket } from "socket.io";
import HTTPServer from "http";
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware";
import * as quizService from "../services/quiz.service";



export class QuizSocket {

    public io: Server;
    private jwtSecret: string = process.env.JWT_SECRET || "secret";
    
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
            
            const userId = socket.data.userId;

            socket.on("joinQuiz", async () => {
                
                const userStats = await quizService.getUserStats(userId!);
                if (!userStats) {
                    socket.emit("error", { message: "User not found" });
                    return;
                }
                console.log(userStats);
                this.sendInitialData(socket, userStats);
            });

            socket.on("getHint", async (data: { questionId: number, hintNumber: number }) => {
                await this.handleHintUsage(socket, userId!, data.questionId, data.hintNumber);
            });

            

        })
    }

    private async sendInitialData(socket: Socket, userStats: any) {
        const { currentQuestionIndex, totalPoints } = userStats;
        const currQuestionData = await quizService.fetchQuestionDetailsByIndex(currentQuestionIndex+1);
        const leaderBoardData = await quizService.fetchLeaderboardData(10);
        socket.emit("initialData", {
            currentQuestion: currQuestionData,
            currUserPoints: totalPoints,
            leaderBoardData: leaderBoardData,
        });

    }

    private async fetchAndEmitLeaderboardData(socket: Socket) {
        const leaderBoardData = await quizService.fetchLeaderboardData(10);
        socket.emit("leaderboardData", leaderBoardData);
    }

    private async parseQuestionPoints(questionData: any , userId: string) {
        if (!questionData) return 0;
        const hintsData = await quizService.getUserHintsData(userId, questionData.id);
        const questionPoints = quizService.calculateAwardedPoints(questionData.points, hintsData!);
        return questionPoints;
    }

    private async handleHintUsage(socket: Socket, userId: string, questionId: number, hintNumber: number) {
        const hintData = await quizService.getHints(userId, questionId, hintNumber);
        const questionData = await quizService.fetchQuestionDetailsByIndex(questionId);
        const updatedPoints = await this.parseQuestionPoints(questionData, userId);
        socket.emit("hintData", { hintNumber, hintText: hintData });
        socket.emit("updatedPoints", updatedPoints);
    }
    

}
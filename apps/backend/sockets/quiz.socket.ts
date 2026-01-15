import { Server, Socket } from "socket.io";
import HTTPServer from "http";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware";
import * as quizService from "../services/quiz.service";
import { hasContestEnded } from "../config/contest.config";

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
        this.io.on("connection", async (socket) => {
            console.log(`New client connected: ${socket.id}`);
            this.userId = socket.data.userId;
            
            // Send contest info on connection
            const contestInfo = quizService.getContestInfo();
            socket.emit("contestInfo", contestInfo);
            
            //@ts-ignore
            const leaderboardData = await quizService.getTopLeaderboard();
            this.io.emit("leaderboardData", leaderboardData);
            
            socket.on("joinQuiz", async () => {
                // Check if contest has ended
                if (hasContestEnded()) {
                    socket.emit("contestEnded", { 
                        message: "Contest has ended. No more submissions are allowed." 
                    });
                    return;
                }
                
                const userStats = await quizService.getUserStats(this.userId!);
                if (!userStats) {
                    socket.emit("error", { message: "User not found" });
                    return;
                }
                
                // Check if userStats indicates contest ended
                if ('contestEnded' in userStats && userStats.contestEnded) {
                    socket.emit("contestEnded", { 
                        message: userStats.message || "Contest has ended" 
                    });
                    return;
                }
                
                this.sendInitialData(socket, userStats);
                // Broadcast updated leaderboard to ALL connected clients when a user joins
                this.broadcastLeaderboardUpdate();
            }); 
            
        })
    }

    private async broadcastLeaderboardUpdate() {
        //@ts-ignore
        const leaderBoardData = await quizService.getTopLeaderboard();
        this.io.emit("leaderboardData", leaderBoardData);
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